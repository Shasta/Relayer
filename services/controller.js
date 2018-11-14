const config = require('../config/config');
const MerkleTree = require('merkletreejs')
const { getLastGBatchHash } = require('../model/GlobalProofBatch/globalProofBatch.controller');
const { backupBillStore, getLastBill } = require('../model/BillStore/billStore.controller');
const energyPrice = 0.13;
const ipfs = require("../utils/ipfs");
var _ = require('lodash');
const keccak = require('keccak')

//Manages all the scheduled process
exports.startSchedule = async function () {

    //Create a map with all the info for each hardware
    const [hardwareMap, leaves] = await getHardwareData();
    console.log("Retrieved data from the server");

    //Create the Merkle tree
    const merkleTree = await createMerkleTree(leaves);
    console.log("Created merkle trees");

    //Store the merkle tree on db and the root on ethereum
    await consolidateMerkleTree(hardwareMap, merkleTree, leaves);
    console.log("Finished relayer work")

}

const consolidateMerkleTree = async (hardwareMap, merkleTree) => {

    //Consolidate bills to mongo db
    for (let [k, v] of hardwareMap) {

        v.merkle_root = merkleTree.getRoot().toString('hex');
        const proof = merkleTree.getProof(v.leaf);
        v.leaf = v.leaf.toString('hex');

        const computedProof = proof.map(proof => ({
            data: proof.data.toString('hex'),
            position: proof.position
        }))
        v.proofs = computedProof;

        await backupBillStore(v);

    }
}

const createMerkleTree = async (dataLeaves) => {

    const leaves = dataLeaves.map(x => keccak256(x));
    const tree = new MerkleTree(leaves, keccak256);

    return tree;
}

function keccak256(data) {
    // returns Buffer    
    return keccak('keccak256').update(data).digest();
}

const getHardwareData = async () => {

    let hardwareMap = new Map();
    const query = await getLastGBatchHash();
    const ipfsData = await ipfs.get(query);
    const readableIpfsData = JSON.parse(ipfsData[0].content.toString('utf8'));
    let leaves = [];

    for (let key in readableIpfsData.batches) {

        const entry = readableIpfsData.batches[key];
        if (!hardwareMap.has(entry.hardware_id) && key) {

            //Get last bill hash
            const last_bill = await getLastBill(entry.hardware_id);
            let last_bill_hash = '';

            //Get watts counter for first bill
            const metricProof = await ipfs.get(entry.ipfs_batch_proof);
            const redeableMetricProof = JSON.parse(metricProof[0].content.toString('utf8'));
            let consumption = _.orderBy(redeableMetricProof, ['metrics.timestamp'], ['desc'])[0].metrics.watts_consumed;


            if (last_bill) {
                last_bill_hash = last_bill.ipfs_hash;
                consumption = consumption - last_bill.consumption;
            }

            //Only create a bill if the hardware has consumed or produced
            if (consumption !== 0) {
                const token_amount = energyPrice * consumption;

                //Create bill
                const bill = {
                    metric_base_id: entry.ipfs_batch_proof,
                    hardware_id: entry.hardware_id,
                    price_watt_hour: energyPrice,
                    round_id: 0,
                    token_address: '',
                    timestamp: Date.now(),
                    consumption,
                    token_amount,
                    last_bill: last_bill_hash
                }

                //upload to ipfs
                const ethHash = await ipfs.add([Buffer.from(JSON.stringify(bill))], { onlyHash: true });

                //Create leaf ipfs_hash,consumption
                const leaf = ethHash[0].hash + "," + bill.consumption
                leaves.push(leaf);
                bill.leaf = keccak256(leaf);

                //Add hash to bill
                bill.ipfs_hash = ethHash[0].hash;

                hardwareMap.set(entry.hardware_id, bill);

            }
        }
    }

    //Sort leaves alphabetically
    leaves.sort();

    return [hardwareMap, leaves];
}