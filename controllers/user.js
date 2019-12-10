"use strict"

//módulos
var bcrypt = require("bcrypt-nodejs");
var fs = require("fs");
var path = require("path");

//modelos
var User = require("../models/user");

//servicio jwt (token)
var jwt = require("../services/jwt");


//métodos
function pruebas(req,res){
	res.status(200).send({
		message: "Probando el controlador de usuario y la acción pruebas",
		user:req.user
	});
}

function saveUser(req,res){
	//Crear objeto usuario
	var user = new User();

	// Recoger parámetros petición
	var params = req.body;	
		//console.log(params);
	
	if(params.password && params.name && params.surname && params.email){
		user.name = params.name;
		user.surname = params.surname;
		user.email = params.email;
		user.role = "ROLE_USER",
		user.image = null;
		console.log(params);
		//Buscar duplicado en la bd
		User.findOne({ email:user.email.toLowerCase()}, (err,issetUser) => {
			if(err){
				res.status(500).send({ message: "Error al comprobar el usuario"});
			}else{
				//si no existe un usuario con ese email se almacena y si 
				//existe se manda mensaje de que ya existe
				if(!issetUser){

					//Cifrar contraseña
					bcrypt.hash(params.password,null,null,function(err,hash){
						user.password = hash;
						console.log(user.password);
						//Guardar usuario en bd
						user.save((err, userStored) => {
							if(err){
								res.status(500).send({ message: "Error al guardar el usuario"});
							}else{
								if(!userStored){
									res.status(404).send({ message: "No se ha registrado el usuario"});
								}else{
									res.status(200).send({ user: userStored,
									message: "Enhorabuena, has conseguido almacenar el User en la db" });
								}
							}
						});
					});
				}else{
					res.status(200).send({
						message: "El usuario ya existe y no puede registrarse"
					});
				}
			}
		})
	}else{
		res.status(200).send({
			message: "Introduce los datos correctos para poder registrar al usuario"
		})
	}
}

function login(req,res){

	var params = req.body;
	console.log("params: ",params);
	console.log("params.password: ",params.pass);
	//var email = params.email;
	var password = params.password;

	User.findOne({email : params.email.toLowerCase()}, (err,user) => {
		if(err){
			res.status(500).send({ message: "Error al comprobar email"});
		}else{
			
			if(user){

				console.log(user);
				bcrypt.compare(password,user.password, (err,check) => {					
					if(check){
						//comprobar y generar token
						if(params.gettoken){
							//devolver token jwt
							res.status(200).send({
								token: jwt.createToken(user)
							});
						}else{
							//eliminamos el hash del password por seguridad
							user.password = "";
							res.status(200).send({ user });
						}
						//res.status(200).send({ user })		
					}else{
						res.status(200).send({
							//message: "El usuario no ha podido loguearse"
							message: "errorPass"
						});
					}
				});

			}else{
				
				res.status(200).send({
					//message: "No existe ese email en la bd"
					message: "errorEmail"
				});				
			}

		}	
	})
	/*
	res.status(200).send({
		message: "Método de login"
	});
	*/
}

function updateUser(req,res){	
	var userId = req.params.id;
	var update = req.body;
	//eliminamos la prop password para que no lo actualice, ya que lo recogemos de localStorage
	//y al almacenarlo en localstorage lo hemos seteado a vacío por seguridad y si no lo 
	//eliminamos se actualiza a vacío.
	delete update["password"];
	//console.log(update);return;

	if(userId != req.user.sub){
		return status(500).send({ message: "No tienes permiso para actualizar el usuario"});
	}
	//el parámetro { new: true } permite mostrar el dato ya actualizado
	User.findByIdAndUpdate(userId, update,{new:true},(err,userUpdated) =>  {
		if(err){
			res.status(500).send({
				message: "Error al actualizar usuario"
			});
		}else{
			if(!userUpdated){
				res.status(404).send({ message: "No se ha podido actualizar el usuario"});
			}else{
				res.status(200).send({user: userUpdated});
			}
		}
	})
	/*
	res.status(200).send({
		message: "Actualizar usuario"
	});
	*/	
}

function uploadImage(req,res){
		var userId = req.params.id;
		var file_name = "No subido...";

		if(req.files){
			var file_path = req.files.image.path;
			var file_split = file_path.split('/'); //en windows es '\\'
			var file_name = file_split[2];
			var ext_split = file_name.split("\.");
			var file_ext = ext_split[1];

			if(file_ext ==  "png" || file_ext == "jpg"  || file_ext == "jpeg" 
				|| file_ext == "gif"){

				if(userId != req.user.sub){
					return status(500).send({ message: "No tienes permiso para actualizar el usuario"});
				}

				User.findByIdAndUpdate(userId, { image: file_name },{new:true},(err,userUpdated) =>  {
					if(err){
						res.status(500).send({
							message: "Error al actualizar usuario"
						});
					}else{
						if(!userUpdated){
							res.status(404).send({ message: "No se ha podido actualizar el usuario"});
						}else{
							res.status(200).send({user: userUpdated, image: file_name});
						}
					}
				})
			}else{
				fs.unlink(file_path, (err,) =>{
					if(err){
						res.status(200).send({ message: "Extensión no válida y archivo no eliminado"});
					}else{
						res.status(200).send({ message: "Extensión no válida"});
					}
				})
				
			}

		}else{
			res.status(200).send({
				message: "No se han subido archivos"
			});
		}
	}

	function getImageFile(req,res){

		var imageFile= req.params.imageFile;
		var path_file = "./uploads/users/"+imageFile;

		fs.exists(path_file, function(exists){
			if(exists){
				res.sendFile(path.resolve(path_file));
			}else{
				res.status(404).send({message: "La imagen no existe"});		
			}
		});
	}

	function getKeepers(req,res){
		User.find({role: "ROLE_ADMIN"}).exec((err,users) => {
			if(err){
				res.status(500).send({ message: "Error en la petición" });
			}else{
				if(!users){
					res.status(404).send({ message: "No hay cuidadores"});					
				}else{
					res.status(200).send({ users });
				}
			}
		});
	}

module.exports = {
	pruebas,
	saveUser,
	login,
	updateUser,
	uploadImage,
	getImageFile,
	getKeepers
};
