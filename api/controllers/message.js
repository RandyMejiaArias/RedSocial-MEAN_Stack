'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

//Método de prueba
function prueba(req, res){
    res.status(200).send({
        message: 'Accion de pruebas en el controlador de Messages.'
    });
}

//Método para enviar mensajes entre usuarios
function saveMessage(req, res){
    var params = req.body;

    if(!params.text || !params.receiver)
        return res.status(200).send({message: 'Envia los datos necesarios.'});
    
        var message = new Message();
        message.emitter = req.user.sub;
        message.receiver = params.receiver;
        message.text = params.text;
        message.created_at = moment().unix();

        message.save((err, messageStored) => {
            if(err) return res.status(500).send({message: 'Error en la petición.'});
            if(!messageStored) return res.status(404).send({message: 'Error al enviar el mensaje.'});
            return res.status(200).send({message: messageStored});
        });
}

//Listar mensajes recibidos
function getReceivedMessages(req, res){
    var userId = req.user.sub;
    var page = 1;
    if(req.params.page)
        page = req.params.page;
    var itemsPerPage = 4;

    Message.find({receiver: userId}).populate('emitter', 'name surname _id nick image').paginate(page, itemsPerPage, (err, messages, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición.'});
        if(!messages) return res.status(404).send({message: 'Todavía no has recibido mensajes.'});
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}

//Listar mensajes enviados
function getEmitedMessages(req, res){
    var userId = req.user.sub;
    var page = 1;
    if(req.params.page)
        page = req.params.page;
    var itemsPerPage = 4;

    Message.find({emitter: userId}).populate('emitter receiver', 'name surname _id nick image').paginate(page, itemsPerPage, (err, messages, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición.'});
        if(!messages) return res.status(404).send({message: 'Todavía no has recibido mensajes.'});
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}


module.exports = {
    prueba,
    saveMessage,
    getReceivedMessages,
    getEmitedMessages
}