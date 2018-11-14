var _ = require('lodash');
var APIError =  require('../../server/helpers/APIError');
// Model
var BillStore = require('./billStore.model');

const backupBillStore = async (batch) => {
    
    try {
        const billStoreInstance = new BillStore(batch);
        const result = await billStoreInstance.save();
        return result;
    } catch (rawError) {
        console.error(rawError);
        const dbError = new APIError('Error while saving to DB.')
        return next(dbError);
    }
}

const getLastBill = async (hardware_id) => {

    try {
        const bill = await BillStore.find({ hardware_id: hardware_id, payed: true }).sort({ createdAt: -1 }).limit(1);
        if (bill.length === 0) {
            return "";
        } 
        return bill[0];

    } catch (rawError) {
        console.error(rawError);
        const dbError = new APIError('Error while saving to DB.')
        return next(dbError);
    }
}

module.exports =  {
    backupBillStore,
    getLastBill
}