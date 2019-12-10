"use strict"

var express = require("express");

var bodyParser = require("body-parser");
var path=require("path");
var app = express();

//cargar rutas
var user_routes = require("./routes/user");
var animal_routes = require("./routes/animal");

//middlewares de body-parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


// configurar cabecera y CORS (acceso cruzado entre dominios)

app.use((req,res,next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers","Authorization,X-API-KEY,Origin,X-Requested-With,Content-Type,Accept,Access-Control-Allow-Request-Method");
	res.header("Access-Control-Allow-Methods","GET,POST,OPTIONS,PUT,DELETE");
	res.header("Allow","GET,POST,OPTIONS,PUT,DELETE");
	next();
});

//rutas base
app.use("/", express.static("client",{redirect:false}));
app.use("/api",user_routes);
app.use("/api",animal_routes);
//app.use("/",user_routes);

/*
app.get("/probando", (req,res) => {
	res.status(200).send({message: "Este es el método probando"});
});
*/
app.get("*",function(req,res,next){
	res.sendFile(path.resolve("client/index.html"));
}

module.exports = app;
