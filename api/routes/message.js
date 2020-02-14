'use strict'

var express = require('express');

var MessageController = require('../controllers/message');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.get('/prueba-message', md_auth.ensureAuth, MessageController.prueba);
api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);
api.get('/my-messages/:page?', md_auth.ensureAuth, MessageController.getReceivedMessages);
api.get('/messages-sent/:page?', md_auth.ensureAuth, MessageController.getEmitedMessages);

module.exports = api;