var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
	extended : false
}));
//app.use(express.static('app'));

// Permet de naviguer dans les fichiers du blog (achitechture de base)
app.get("/", function(req, res) {
	var readable = fs.createReadStream("app/index.html");
	readable.pipe(res);
});

// Récupération du contenu dynamique du blog
app.get("/articles/:name", function(req, res) {
	res.sendfile("articles/" + req.params.name + ".json");
});
app.get("/menu/:name", function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	fs.readFile("menu/" + req.params.name + ".json", 'utf8',
			function(err, data) {
				if (err) {
					throw err;
				}
				res.send(JSON.stringify(data));
			});
});
app.get("/media/:name", function(req, res) {
	res.sendfile("media/" + req.params.name);
});

// Enregistrement d'un article
app.post("/saveArticle/:name", function(req, res) {
	var fs = require('fs');
	fs.writeFile("articles/" + req.params.name + ".json", req.body.file,
			function(err) {
				if (err) {
					console.log("pas ok");
					res.writeHead(400, "Problem", {
						'Content-Type' : 'text/plain'
					});
					res.end();
				} else {
					console.log("ok");
					res.writeHead(200, "OK", {
						'Content-Type' : 'text/plain'
					});
					res.end();
				}
			});
});

// Renvoie index.html sinon
app.get("/*", function(req, res) {
	console.log(req.url);
	var exceptions = ["blogElements"];
	var tmp = req.url.split("/");
	var found = false;
	var url = "";
	for(var i=0;i<tmp.length;i++){
		if(tmp[i] === "blogElements"){
			found= true;
		}
		if(found){
			url += tmp[i]+ "/";
		}
	}
	
	if(found){
		url = url.substr(0,url.length -1);
		var readable = fs.createReadStream("app/" + url);
		readable.pipe(res);
	}else
	{
		var readable = fs.createReadStream("app/index.html");
		readable.pipe(res);
	}
	
	
});
app.listen(8001);