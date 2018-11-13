const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const autopopulate = require('mongoose-autopopulate');
const { MetricProof } = require('metrics-mongoose');

var _ = require('lodash');

/* Statics methods of the model */
MetricProof.statics = {};

MetricProof.plugin(autopopulate);
MetricProof.plugin(mongoosePaginate);


/**
 * @typedef MetricProof
 * Export of the MetricProof model, containing the Case schema.
 */

module.exports = mongoose.model('MetricProof', MetricProof);