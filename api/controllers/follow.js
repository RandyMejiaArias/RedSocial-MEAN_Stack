'use stict'

//var path = require('path');
//var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

//Método de prueba
function prueba(req, res){
    res.status(200).send({
        message: 'Accion de pruebas en el controlador de Follows'
    });
}

//Seguir a un usuario
function saveFollow(req, res){
    var params = req.body;
    var follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, followStored) => {
        if(err) return res.status(500).send({message: 'Error al guardar el seguimiento.'});
        if(!followStored) return res.status(404).send({message: 'El seguimiento no se ha guardado.'});
        return res.send(200).send({follow: followStored});
    });
}

module.exports = {
    prueba,
    saveFollow
}