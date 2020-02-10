'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

//Conexión Base de Datos
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/mean_social', { useNewUrlParser: true})
    .then(() => {
        console.log("Conexión realizada correctamente.")
        //Crear Servidor
        app.listen(port, () => {
            console.log("Servidor coriendo en http://localhost:3800");
        });
    })
    .catch(err => console.log(err));