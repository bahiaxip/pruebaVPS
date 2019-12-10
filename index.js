"use strict"

var mongoose = require("mongoose");

var app = require("./app");
var port = process.env.PORT || 3389;

//mongoose.Promise = global.Promise;
/*
mongoose.connect("mongodb://localhost:27017/zoo",{ useNewUrlParser: true})
	.then( () => {			
		console.log("La conexión  a la base de datos zoo se ha realizado correctamente...");

		app.listen(port, () => {
			console.log("el servidor local con Node y Express está corriendo correctamente...");
		});
			 
	})
	.catch(err => console.log(err));
*/
//solución mensaje de error por deprecated en métodos de mongoose useNewUrlParser: true,useFindAndModify:false
mongoose.connect("mongodb://localhost:27017/zoo",{ useNewUrlParser: true,useFindAndModify:false})
	.then( () => {			
		console.log("La conexión  a la base de datos zoo se ha realizado correctamente...");
		app.listen(port, () => {
			console.log("el servidor local con Node y Express está corriendo correctamente...");
		})
	},
		err => { console.log(err)}
	);