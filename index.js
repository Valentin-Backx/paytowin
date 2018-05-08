var express = require('express')


var app = express();

//create a server and pass in app as a request handler
var serv = require('http').Server(app); //Server-11

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.static(__dirname+'/public'))
app.use('/bower_components',express.static(__dirname + '/bower_components'))


app.get('/',function(req,res){
	res.render('index');
})

//listen on port 2000
serv.listen(process.env.PORT || 3013);

 // binds the serv object we created to socket.io
var io = require('socket.io')(serv,{});

// listen for a connection request from any client
io.sockets.on('connection', function(socket){
	console.log("socket connected"); 
	//output a unique socket.id 
	console.log(socket.id);
});

process.on('SIGINT', () => { console.log("Bye bye!"); process.exit(); });