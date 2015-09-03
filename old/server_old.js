var http = require('http');
var fs = require('fs');
var path = require('path');
var PORT = 6868;

function handleRequest(request, response){
    try {
        //log the request on console
        console.log(request.url);
        if(request.url.startWith("www")){
        	handleRequestFile(request, response)
        }else{
        	
        }
        //Disptach
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
}


//We need a function which handles requests and send response
function handleRequestFile(req, res){
	//res.end('It Works!! Path Hit: ' + req.url);
	console.log("requete en cours")
	 var filePath = req.url;
	  if (filePath == '/') {
	      filePath = 'index.html';
	  }

	  var extname = path.extname(filePath);
	  var contentType = 'text/html';
	  

	  switch (extname) {
	    case '.js':
	        contentType = 'text/javascript';
	        break;
	    case '.css':
	        contentType = 'text/css';
	        break;
	  }

	  fs.exists(filePath, function(exists) {

	    if (exists) {
	        fs.readFile(filePath, function(error, content) {
	            if (error) {
	                res.writeHead(500);
	                res.end();
	            }
	            else {
	                res.writeHead(200, { 'Content-Type': contentType });
	                res.end(content, 'utf-8');
	            }
	        });
	    }
	    else {
	        res.writeHead(404);
	        res.end();
	    }
	  });
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});




