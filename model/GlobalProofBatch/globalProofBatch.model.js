const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const autopopulate = require('mongoose-autopopulate');
const { GlobalProofBatch } = require('metrics-mongoose');

var _ = require('lodash');

/* Statics methods of the model */
GlobalProofBatch.statics = {};

GlobalProofBatch.plugin(autopopulate);
GlobalProofBatch.plugin(mongoosePaginate);


/**
 * @typedef GlobalProofBatch
 * Export of the GlobalProofBatch model, containing the Case schema.
 */

module.exports = mongoose.model('GlobalProofBatch', GlobalProofBatch);