'use strict'
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');

function saveUser(req, res){
    var params = req.body;
    var user = new User();
    if(params.name && params.surname && params.nick && params.email && params.password){
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;
        bcrypt.hash(params.password, null, null, (err, hash) => {
            user.password = hash;
            user.save((err, userStored) => {
                if(err) return res.status(500).send({ message: 'Error al guardar el usuario.'});
                if(userStored){
                    res.status(200).send({ user: userStored});
                }else{
                    res.status(404).send({ message: 'No se ha registrado el usuario.'});
                }
            });
        });
    }else{
        res.status(200).send({
            message: 'Llene todos los campos necesarios!'
        });
    }
}

function pruebas(req, res){
    console.log(req.body);
    res.status(200).send({
        message: 'Accion de pruebas en el controlador de Usuarios'
    });
}

module.exports = {
    saveUser, 
    pruebas
}