'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//Cargar Rutas


//Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Cors


//Rutas
app.get('/pruebas', (req, res) => {
    res.status(200).send({
        message: 'Acci+on de pruebas en el servidor de NodeJS'
    });
});

//Exportar
module.exports = app;