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



process.on('SIGINT', () => { console.log("Bye bye!"); process.exit(); });

//this is where we will store all the players in the client,
// which is connected to the server
var player_lst = [];

// A player “class”, which will be stored inside player list 
var Player = function (startX, startY, startAngle) {
  var x = startX
  var y = startY
  var angle = startAngle
}

//onNewplayer function is called whenever a server gets a message “new_player” from the client
function onNewplayer (data) {
	//form a new player object 
	var newPlayer = new Player(data.x, data.y, data.angle);
	console.log("created new player with id " + this.id);
	player_lst.push(newPlayer); 

}

// listen for a connection request from any client
io.sockets.on('connection', function(socket){
	console.log("socket connected"); 
	//Listen to the message “new_player’ from the client
	socket.on("new_player", onNewplayer);
});