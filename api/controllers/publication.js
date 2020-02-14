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

    Follow.find({user: req.user.sub}).populate('followed', 'name surname _id nick image').exec((err, follows) =>{
        if(err) return res.status(500).send({message: 'Error al devolver el seguimiento.'});

        var follows_clean =[];
        follows.forEach((follow) =>{
            follows_clean.push(follow.followed);
        });
        Publication.find({user: {"$in" : follows_clean}}).sort('-create_at').populate('user', 'name surname _id nick image').paginate(page, itemsPerPage, (err, publications, total) =>{
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

//Eliminar una publicación
function deletePublication(req, res){
    var publicationId = req.params.id;
    Publication.find({user: req.user.sub, '_id': publicationId}).remove(err => {
        if(err) return res.status(500).send({message: 'Error al borrar la publicación.'});
        return res.status(200).send({publication: 'Publicación eliminada correctamente'});
    });
}

//Subir archivos a la publicación
function uploadImage(req, res){
    var publicationId = req.params.id;
    
    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            Publication.find({'user': req.user.sub, '_id': publicationId}).exec((err, publication) =>{
                if(publication && publication.length > 0){
                    //Actualizar documento del la publicación
                    Publication.findByIdAndUpdate(publicationId, {file: file_name}, {new: true}, (err, publicationUpdated) => {
                        if(err) return res.status(500).send({ message: 'Error en la petición.'});
                        if(!publicationUpdated) return res.status(404).send({ message: 'No se ha podido actualizar la publicación.'});
                        return res.status(200).send({publication: publicationUpdated});
                    });
                }else{
                    return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar la publicación.');
                }
            });
        }else{
            return removeFilesOfUploads(res, file_path, 'Extensión no valida');
        }
    }else{
        return res.status(200).send({message: 'No se ha subido ningún archivo.'});
    }
}

function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err)  => {
        return res.status(200).send({message: message});
    });
}

//Devolver imagen de la publicación
function getImageFile(req, res){
    var image_file = req.params.imageFile;
    var path_file = './uploads/publications/' +image_file;
    fs.exists(path_file, (exists) => {
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else {
            res.status(200).send({message: 'No existe la imagen'});
        }
    });
}

module.exports = {
    prueba,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
}