"use strict"

var express = require("express");
var AnimalController = require("../controllers/animal");

var api = express.Router();

var md_auth = require("../middlewares/authenticated");
var md_admin = require("../middlewares/is_admin");

var multipart = require("connect-multiparty");
var md_upload = multipart({ uploadDir: "./uploads/animals"});

//api.get("/pruebas-del-controlador",UserController.pruebas);
//protegida con logueo (añadiendo el método de authenticated)
api.get("/pruebas-de-animales",md_auth.ensureAuth,AnimalController.pruebas);
api.post("/animal",[md_auth.ensureAuth,md_admin.isAdmin],AnimalController.saveAnimal);
api.get("/animals",AnimalController.getAnimals);
api.get("/animal/:id",AnimalController.getAnimal);
api.put("/animal/:id",[md_auth.ensureAuth,md_admin.isAdmin], AnimalController.updateAnimal);
api.post("/upload-image-animal/:id",[md_auth.ensureAuth,md_upload,md_admin.isAdmin],AnimalController.uploadImage);
api.get("/get-image-animal/:imageFile",AnimalController.getImageFile);
api.delete("/animal/:id", [md_auth.ensureAuth,md_admin.isAdmin], AnimalController.deleteAnimal);

module.exports = api;