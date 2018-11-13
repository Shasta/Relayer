var _ = require('lodash');
var APIError =  require('../../server/helpers/APIError');
// Model
var HProofBatch = require('./hardwareProofBatch.model');

const backupHBatch = async (batch) => {
    
    try {
        const hProofInstance = new HProofBatch(batch);
        const result = await hProofInstance.save();
        return result;
    } catch (rawError) {
        console.error(rawError);
        const dbError = new APIError('Error while saving to DB.')
        return next(dbError);
    }
}

module.exports =  {
    backupHBatch
}