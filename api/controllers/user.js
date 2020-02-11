'use strict'
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');

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

        //Controlar usuarios duplicados
        User.find({  
            $or: [
                {email: user.email.toLowerCase()},
                {nick: user.nick.toLowerCase()}
            ]}).exec((err, users) => {
                if(err) return res.status(500).send({ message: 'Error en la petición de usuarios.'});
                if(users && users.length >= 1){
                    return res.status(200).send({message: 'El usuario que intenta registrar ya existe.'});
                }
            });

            //Cifra el password y guardar los datos
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

function loginUser(req, res){
    var params = req.body;
    var email = params.email;
    var password = params.password;
    User.findOne({email: email}, (err, user) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(user){
            bcrypt.compare(password, user.password, (err, check) => {
                if(check){
                    if(params.gettoken){
                        //Generar y devolver token
                        return res.status(200).send({
                            token : jwt.createToken(user)
                        });
                    }else{
                        //Eliminar propiedad password del objeto JS
                        user.password = undefinded;
                        //Devolver datos de usuario
                        return res.status(200).send({user});
                    }
                }else{
                    return res.status(404).send({message: 'Par de usuario y contraseña incorrecto'});
                }
            });
        }else{
            return res.status(404).send({message: 'El usuario no se ha podido identificar.'});
        }
    });

}

function pruebas(req, res){
    console.log(req.body);
    res.status(200).send({
        message: 'Accion de pruebas en el controlador de Usuarios'
    });
}

module.exports = {
    saveUser, 
    loginUser,
    pruebas
}