var _ = require('lodash');
var APIError =  require('../../server/helpers/APIError');
// Model
var GProofBatch = require('./globalProofBatch.model');

const backupGBatch = async (batch) => {
    
    try {
        const gProofInstance = new GProofBatch(batch);
        const result = await gProofInstance.save();
        return result;
    } catch (rawError) {
        console.error(rawError);
        const dbError = new APIError('Error while saving to DB.')
        return next(dbError);
    }
}

const getLastGBatchHash = async () => {

    const lastGBatch = await GProofBatch.find({},{_id:0, ipfs_global_batch_proof: 1}).sort({createdAt: -1}).limit(1);
    return lastGBatch[0].ipfs_global_batch_proof;
}

module.exports =  {
    getLastGBatchHash
}