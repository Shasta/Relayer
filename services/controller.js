const config = require('../config/config');
const crypto = require('crypto')
const MerkleTree = require('merkletreejs')
const { getLastGBatchHash } = require('../model/GlobalProofBatch/globalProofBatch.controller');
const energyPrice = 0.13;
const ipfs = require("../utils/ipfs");
var _ = require('lodash');

//Manages all the scheduled process
exports.startSchedule = async function () {

    //Create a map with all the info for each hardware
    const [hardwareMap, leaves] = await getHardwareData();

    //Create the merkel tree
    const merkleTree = createMerkleTree(leaves);

    //Store the merkle tree on db and the root on ethereum
        

}

const createMerkleTree = async (dataLeaves) => {

    const leaves = dataLeaves.map(x => sha256(JSON.stringify(x)));
    const tree = new MerkleTree(leaves, sha256);

    const root = tree.getRoot();


}

function sha256(data) {
    // returns Buffer
    return crypto.createHash('sha256').update(data).digest()
  }

const getHardwareData = async () => {

    let hardwareMap = new Map();
    const query = await getLastGBatchHash();
    const ipfsData = await ipfs.get(query);
    const readableIpfsData = JSON.parse(ipfsData[0].content.toString('utf8'));
    let leaves = [];

    for (let key in readableIpfsData.batches) {

        const entry = readableIpfsData.batches[key];
        if (!hardwareMap.has(entry.hardware_id) && key < 3) {

            //Create json data
            const jsonData = {
                metric_base_id: entry.ipfs_batch_proof,
                hardware_id: entry.hardware_id,
                price_watt_hour: energyPrice,
                round_id: 0,
                token_address: '',
                timestamp: Date.now(),

            }
            //Get watts counter
            const metricProof = await ipfs.get(entry.ipfs_batch_proof);
            const redeableMetricProof = JSON.parse(metricProof[0].content.toString('utf8'));
            jsonData.consumption = _.orderBy(redeableMetricProof, ['metrics.timestamp'], ['desc'])[0].metrics.watts_consumed;
            jsonData.token_amount = energyPrice * jsonData.consumption;

            hardwareMap.set(entry.hardware_id, jsonData);
            
            //TODO: upload to ipfs
            const ethHash = await ipfs.add([Buffer.from(JSON.stringify(jsonData))], {onlyHash: true});

            const leaf = {
                id: ethHash[0].hash,
                amount: jsonData.consumption
            };
            leaves.push(leaf);
        }
    }
    return [hardwareMap, leaves];
}