'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

//Método de prueba
function prueba(req, res){
    res.status(200).send({
        message: 'Accion de pruebas en el controlador de Publications'
    });
}

//Guardar publicaciones
function savePublication(req, res){
    var params = req.body;
    if(!params.text)
        return res.status(200).send({message: 'Debes enviar un texto.'});
    var publication = new Publication();
    publication.text = params.text;
    publication.file = null;
    publication.user = req.user.sub;
    publication.created_at = moment().unix();

    publication.save((err, publicationStored) =>{
        if(err) return res.status(500).send({message: 'Error al guardar la publicación.'});
        if(!publicationStored) return res.status(404).send({message: 'La publicación no ha sido guardada.'});
        return res.status(200).send({publication: publicationStored});
    });
}

//Listar publicaciones de los usuarios que sigo
function getPublications(req, res){
    var page = 1;
    if(req.params.page)
        page = req.params.page;
    var itemsPerPage = 4;

    Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) =>{
        if(err) return res.status(500).send({message: 'Error al devolver el seguimiento.'});

        var follows_clean =[];
        follows.forEach((follow) =>{
            follows_clean.push(follow.followed);
        });
        Publication.find({user: {"$in" : follows_clean}}).sort('-create_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) =>{
            if(err) return res.status(500).send({message: 'Error al devolver las publicaciones.'});
            if(!publications) return res.status(404).send({message: 'No hay publicaciones'});
            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total/itemsPerPage),
                page: page,
                publications
            });
        });
    });
}

//Devolver una publicación
function getPublication(req, res){
    var publicationId = req.params.id;
    Publication.findById(publicationId, (err, publication) => {
        if(err) return res.status(500).send({message: 'Error al devolver la publicación.'});
        if(!publication) return res.status(404).send({message: 'La publicación no existe.'});
        return res.status(200).send({publication});
    });
}

module.exports = {
    prueba,
    savePublication,
    getPublications,
    getPublication
}