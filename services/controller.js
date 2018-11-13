const config = require('../config/config');
const storage = require('node-persist');
const { getLastGBatchHash } = require('../model/GlobalProofBatch/globalProofBatch.controller');
const energyPrice = 0.13;
const ipfs = require("../utils/ipfs");
var _ = require('lodash');

//Manages all the scheduled process
exports.startSchedule = async function () {

    //Create a map with all the info for each hardware
    let hardwareMap = await getHardwareData();

}

const getHardwareData = async () => {

    let hardwareMap = new Map();
    const query = await getLastGBatchHash();
    const ipfsData = await ipfs.get(query);
    const readableIpfsData = JSON.parse(ipfsData[0].content.toString('utf8'));

    for (let key in readableIpfsData.batches) {

        const entry = readableIpfsData.batches[key];
        if (!hardwareMap.has(entry.hardware_id)) {

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
        }
    }
}