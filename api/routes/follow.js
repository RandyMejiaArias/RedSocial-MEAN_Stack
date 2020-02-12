'use strict'

var express = require('express');

var FollowController = require('../controllers/follow');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.get('/prueba-follow', md_auth.ensureAuth, FollowController.prueba);
api.post('/follow', md_auth.ensureAuth, FollowController.saveFollow);
api.delete('/delete/:id', md_auth.ensureAuth, FollowController.deleteFollow);
api.get('/following/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowingUsers);
api.get('/followed/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowedUsers);

module.exports = api;
