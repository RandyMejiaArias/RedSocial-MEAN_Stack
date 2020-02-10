'use strict'

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var MessageSchema = Schema({
    emmiter: { type: Schema.ObjectId, ref: 'User'},
    receiver: { type: Schema.ObjectId, ref: 'User'},
    text: String,
    created_at: String
});

module.exports = mongoose.model('Message', MessageSchema);