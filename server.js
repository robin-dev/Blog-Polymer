var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var path = require('path');
var fs = require('fs');
var querystring = require('querystring');
var pg = require('pg');
var conString = "postgres://postgres:postgres@localhost/blog";


app.get("/", function (req, res) {
	  res.redirect("index.html");
	});
var options = {
		maxAge :10
		};
app.use(express.static(__dirname + '/app'));
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.post('/', function (req, res) {
	  console.log(req.body);
	  res.json(req.body);
	})
	
	app.get("/test/*", function (req, res) {
	  res.redirect("/article/6");
	});

app.post("/writeFile", function(req, res) {
	console.log("writeFile");
	console.log(req.body.file);
	var fs = require('fs');
	fs.writeFile("www/elements/" + req.body.filePath, req.body.file, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("The file was saved!");
	});
})
app.get("/article/*", function (req, res) {
console.log("ici");
	  
		getArticleContent(req.url,function(article,error){
			if(error){
				res.writeHead(404, "Article not found", {'Content-Type': 'text/plain'});
				res.end();
			}else{
				//res.writeHead(200, "OK", {'Content-Type': 'text/plain'});
				res.send(article);
			}
		});
});
app.get("/menu/*", function (req, res) {
	console.log("ici");
		  
			getMenu(req.url,function(article,error){
				if(error){
					res.writeHead(404, "Article not found", {'Content-Type': 'text/plain'});
					res.end();
				}else{
					//res.writeHead(200, "OK", {'Content-Type': 'text/plain'});
					res.send(article);
				}
			});
	});

/*app.get("/aaa", function(req, res) {
	console.log("demande");
	var content
  // First I want to read the file
	var fs = require('fs');
	fs.readFile('www/elements/test.html', function read(err, data) {
	    if (err) {
	        throw err;
	    }
	    content = data;
	    var strings = content;
	    
	    res.send(strings);
	    // Invoke the next step here however you like
	    //console.log(content);   // Put all of the code here (not the best solution)
	});
	
   
})*/


app.post("/saveArticle/*", function (req, res) {
		saveArticleContent(req.url,req.body.content,function(article,error){
			if(error){
				res.writeHead(404, "Article not found", {'Content-Type': 'text/plain'});
				res.end();
			}else{
				res.writeHead(200, "OK", {'Content-Type': 'text/plain'});
				res.end();
			}
		});
});

function getArticleContent(articleURL,callback){
	console.log("url : "+articleURL);
	var articleId = getNumber(articleURL.split("/")[2]);
	console.log("id : "+articleId);
	pg.defaults.poolSize = 10000;
	pg.connect(conString, function(err, client, done) {
	  if (err) {
		return console.error('error fetching client from pool', err);
	  }
	  var query = client.query("SELECT * FROM ArticleContent WHERE article_id=$1" ,[ articleId], function(err, result) {
			if(err) {
			  return console.error('error running query', err);
			}
			console.log("result : "+result.rows[0]);
			if(typeof(result.rows[0]) !== 'undefined' && typeof(result.rows[0].content) !== 'undefined'){
				callback( result.rows[0].content,false);
			}else{
				callback( "",true);
			}
			
			client.end();
		  });
	});
}

function getMenu(articleURL,callback){
	console.log("url : "+articleURL);
	
	//Permet de récupérer le niveau 1 du menu
	var done  = false;
		if(typeof(articleURL.split("/")[2])!== 'undefined'){
			var articleId = getNumber(articleURL.split("/")[2]);
			console.log("id : "+articleId);
			pg.defaults.poolSize = 10000;
			pg.connect(conString, function(err, client, done) {
			  if (err) {
				return console.error('error fetching client from pool', err);
			  }
			  
			  
			  var query = client.query("SELECT Article.id, Article.title,Article.description,Article.image_id FROM Articlelink,Article WHERE Articlelink.parent_id=$1 AND Articlelink.article_id =Article.id" ,[ articleId], function(err, result) {
					if(err) {
					  return console.error('error running query', err);
					}
					console.log("result : "+result.rows);
					if(typeof(result.rows) !== 'undefined'){
						var parents = result.rows;
						fillChildrenMenu(parents, callback);
					}
				  });
			});
	}	
	
	
}


function fillChildrenMenu(parents, callback){
	//Permet de récupérer le niveau 2 du menu
			pg.defaults.poolSize = 10000;
			pg.connect(conString, function(err, client, done) {
			  if (err) {
				return console.error('error fetching client from pool', err);
			  }
			  var tab = [];
			  for(var i=0;i<parents.length;i++){
				  tab.push(parents[i].id);
			  }
			  console.log("avant les enfants" );
			  var query = client.query("SELECT Articlelink.parent_id,Article.id, Article.title,Article.description,Article.image_id FROM Articlelink,Article WHERE Articlelink.parent_id= ANY($1::int[]) AND Articlelink.article_id =Article.id" ,[ tab], function(err, result) {
					if(err) {
					  return console.error('error running query', err);
					}
					if(typeof(result.rows) !== 'undefined'){
						var children = result.rows;
						for(var j=0;j<parents.length;j++){
							if(typeof(parents[j].children) === 'undefined'){
								parents[j].children= [];
							}
							for(var k=0;k<children.length;k++){
								
								console.log("j: " + j);
								console.log("k: " + k);
								
								console.log("children : " + children[k].parent_id);
								console.log("parent : " + parents[j].id);
								if(children[k].parent_id === parents[j].id){
									parents[j].children.push(children[k]);
									console.log("ajouté");
								}
							}
						}
						
					}
					callback( parents,false);
					client.end();
				  });
			});
	
}

function saveArticleContent(articleURL,articleContent,callback){
	console.log("url : "+articleURL);
	var articleId = getNumber(articleURL.split("/")[2]);
	console.log("id : "+articleId);
	pg.defaults.poolSize = 10000;
	pg.connect(conString, function(err, client, done) {
	  if (err) {
		return console.error('error fetching client from pool', err);
	  }
	  console.log("content : "+articleContent);
	  
	  
	  
	  
	  
	  	  var query = client.query("SELECT * FROM ArticleContent WHERE article_id=$1" ,[ articleId], function(err, result) {
			if(err) {
			  return console.error('error running query', err);
			}
				var id = result.rows[0].id;
				if(result.rows.length === 0){
					var query = client.query("INSERT INTO ArticleContent (article_id,content) values ($1 ,$2)" ,[ getNumber(articleId),articleContent], function(err, result) {
						if(err) {
							callback( "",true);
							return console.error('error running query', err);
						}else{
							callback( "",false);
							client.end();
						}		
					});
				}else{
					
					 var query = client.query("UPDATE  ArticleContent SET (article_id,content)  = ($1,$2)  where id = $3" , [getNumber(articleId),articleContent,id],function(err, result) {
							if(err) {
							  return console.error('error running query', err);
							}
							
							client.end();
						});
			
				}
			
			
		  });
	  
	  
	  
	  
	  
	  	  
	  	  
	  	  
	  	  
	  	  
	  	  
	  	  
	  	  
	  	  
	  	  
	  	  
	  	  
	  	  
	  	  
	  	  
	  	  
	  	  
	  	  
	  	  
	  
	  
	  
	  
	  
	 
					
	}); 
}


function getNumber(nb){
	if(typeof nb === 'undefined'){
		return 0;
	}
	if(isNaN(parseInt(nb))){
		return 0
	}
	return parseInt(nb);
}

app.listen(8001)