const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const autopopulate = require('mongoose-autopopulate');
const { HardwareProofBatch } = require('metrics-mongoose');

var _ = require('lodash');

/* Statics methods of the model */
HardwareProofBatch.statics = {};

HardwareProofBatch.plugin(autopopulate);
HardwareProofBatch.plugin(mongoosePaginate);


/**
 * @typedef HardwareProofBatch
 * Export of the HardwareProofBatch model, containing the Case schema.
 */

module.exports = mongoose.model('HardwareProofBatch', HardwareProofBatch);