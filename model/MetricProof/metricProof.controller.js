var _ = require('lodash');
var APIError = require('../../server/helpers/APIError');
// Model
var MetricProof = require('./metricProof.model');

const backupMetric = async (req, res, next) => {
    if (!req.metricProof) {
        const invalidMetric = new APIError("Error while validating metric", "400", true)
        return next(invalidMetric);
    }
    const metricInstance = new MetricProof(req.metricProof);
    try {
        await metricInstance.save()
    } catch (rawError) {
        console.error(rawError);
        const dbError = new APIError('Error while saving to DB.')
        return next(dbError);
    }
    res.send({ status: "ok", message: 'backup-saved' })
}

const getMetrics = async () => {

    let result = "";
    try {
        result = await MetricProof.find({ 'consolidated': false });
    } catch (rawError) {
        console.error(rawError);
        const dbError = new APIError('Error while saving to DB.')
        return next(dbError);
    }
    return result;
}

const updateMetricConsolidation = async (metricIds) => {
    try {
        await MetricProof.update({ _id: { '$in': metricIds } }, { "$set": { 'consolidated': true } }, { 'multi': true });
    } catch (rawError) {
        console.error(rawError);
        const dbError = new APIError('Error while saving to DB.')
        return next(dbError);
    }
}

const getLastEntryForEachHardware = async () => {

    let result = [];
    try {
        const hardwares = await MetricProof.distinct("hardware_id");
        for (let key in hardwares) {
            const hardwareData = await MetricProof.find({ 'hardware_id': hardwares[key], 'consolidated': true }).sort({ createdAt: -1 }).limit(1);
            result.push(hardwareData);
        }
    } catch (rawError) {
        console.error(rawError);
        const dbError = new APIError('Error while saving to DB.')
        return next(dbError);
    }
    return result;

}

module.exports = {
    getLastEntryForEachHardware
}