var express = require('express')
var unique = require('node-uuid')
//var p2 = require('p2');

//var physicsPlayer = require('./physics/playermovement.js');

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


var food_lst = []

//needed for physics update 
var startTime = (new Date).getTime();
var lastTime;
var timeStep= 1/70; 
var Player = require('./PlayerServer');

//the physics world in the server. This is where all the physics happens. 
//we set gravity to 0 since we are just following mouse pointers.
/*var world = new p2.World({
  gravity : [0,0]
});*/

//create a game class to store basic game data
var game_setup = function() {
	//The constant number of foods in the game
	this.food_num = 100; 
	//food object list
	this.food_pickup = [];
	//game size height
	this.canvas_height = 4000;
	//game size width
	this.canvas_width = 4000; 
}

// createa a new game instance
var game_instance = new game_setup();



var foodpickup = function (max_x, max_y, type, id) {
	this.x = getRndInteger(10, max_x - 10) ;
	this.y = getRndInteger(10, max_y - 10);
	this.type = type; 
	this.id = id; 
	this.powerup; 
}

//We call physics handler 60fps. The physics is calculated here. 
setInterval(heartbeat, 1000/60);



//Steps the physics world. 
/*function physics_hanlder() {
	var currentTime = (new Date).getTime();
	timeElapsed = currentTime - startTime;
	var dt = lastTime ? (timeElapsed - lastTime) / 1000 : 0;
    dt = Math.min(1 / 10, dt);
    world.step(timeStep);
}
*/
function update_bodies_network()
{
	for (var i = player_lst.length - 1; i >= 0; i--) {
		player_lst[i].broadcastBody();
	}
}

function heartbeat () {
	//physics stepping. We moved this into heartbeat
	//physics_hanlder();
	update_bodies_network();
}




// when a new player connects, we make a new instance of the player object,
// and send a new player message to the client. 
function onNewplayer (data) {

	var newPlayer = new Player(data.x, data.y,this,data);
	
	//create an instance of player body 
	/*playerBody = new p2.Body ({
		mass: 0,
		position: [0,0],
		fixedRotation: true
	});*/
	
	console.log("created new player with id " + this.id);
	newPlayer.id = this.id;

	this.emit('create_player', {
		x:data.x,
		y:data.y,
		health:newPlayer.health
	});
	
	//information to be sent to all clients except sender
	var current_info = {
		id: newPlayer.id, 
		x: newPlayer.position[0],
		y: newPlayer.position[1],
		health:newPlayer.health
	}; 
	
	//send to the new player about everyone who is already connected. 	
	for (i = 0; i < player_lst.length; i++) {
		existingPlayer = player_lst[i];
		var player_info = {
			id: existingPlayer.id,
			x: existingPlayer.position[0],
			y: existingPlayer.position[1],
			health: existingPlayer.health
		};
		console.log("pushing other players ");
		//send message to the sender-client only
		this.emit("new_enemyPlayer", player_info);
	}
	
	//Tell the client to make foods that are exisiting
	for (j = 0; j < game_instance.food_pickup.length; j++) {
		var food_pick = game_instance.food_pickup[j];
		this.emit('item_update', food_pick); 
	}

	//send message to every connected client except the sender
	this.broadcast.emit('new_enemyPlayer', current_info);
	
	player_lst.push(newPlayer); 
}



function onPlayerCollision (data) {
	var movePlayer = find_playerid(this.id); 
	var enemyPlayer = find_playerid(data.id); 
	
	
	if (movePlayer.dead || enemyPlayer.dead)
		return
	
	if (!movePlayer || !enemyPlayer)
		return

	
	if (movePlayer.size == enemyPlayer)
		return
	//the main player size is less than the enemy size
	else if (movePlayer.size < enemyPlayer.size) {
		var gained_size = movePlayer.size / 2;
		enemyPlayer.size += gained_size; 
		this.emit("killed");
		//provide the new size the enemy will become
		this.broadcast.emit('remove_player', {id: this.id});
		this.broadcast.to(data.id).emit("gained", {new_size: enemyPlayer.size}); 
		playerKilled(movePlayer);
	} else {
		var gained_size = enemyPlayer.size / 2;
		movePlayer.size += gained_size;
		this.emit('remove_player', {id: enemyPlayer.id}); 
		this.emit("gained", {new_size: movePlayer.size}); 
		this.broadcast.to(data.id).emit("killed"); 
		//send to everyone except sender.
		this.broadcast.emit('remove_player', {id: enemyPlayer.id});
		playerKilled(enemyPlayer);
	}
	
	console.log("someone ate someone!!!");
}

function find_food (id) {
	for (var i = 0; i < game_instance.food_pickup.length; i++) {
		if (game_instance.food_pickup[i].id == id) {
			return game_instance.food_pickup[i]; 
		}
	}
	
	return false;
}

function onitemPicked (data) {
	var movePlayer = find_playerid(this.id); 

	var object = find_food(data.id);	
	if (!object) {
		console.log("could not find object");
		return;
	}
	
	//increase player size
	movePlayer.size += 3; 
	//broadcast the new size
	this.emit("gained", {new_size: movePlayer.size}); 
	
	game_instance.food_pickup.splice(game_instance.food_pickup.indexOf(object), 1);
	

	io.emit('itemremove', object); 
	this.emit('item_picked');
}

function playerKilled (player) {
	player.dead = true; 
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

//call when a client disconnects and tell the clients except sender to remove the disconnected player
function onClientdisconnect() {
	console.log('disconnect'); 

	var removePlayer = find_playerid(this.id); 
		
	if (removePlayer) {
		player_lst.splice(player_lst.indexOf(removePlayer), 1);
	}
	
	console.log("removing player " + this.id);
	
	//send message to every connected client except the sender
	this.broadcast.emit('remove_player', {id: this.id});
	
}

function onBodyPositionReceived(data)
{
	var player = find_playerid(this.id,this.room);
	player.position = data.position;
	player.velocity = data.velocity;
}

function onPlayerHit(data)
{
	for (var i = data.hit.length - 1; i >= 0; i--) {
		find_playerid(data.hit[i]).damage(data.damage,this.id);
	}
}

// find player by the the unique socket id 
function find_playerid(id) {

	for (var i = 0; i < player_lst.length; i++) {

		if (player_lst[i].id == id) {
			return player_lst[i]; 
		}
	}
	
	return false; 
}

function onPlayerStartAnimation(data)
{
	//send message to every connected client except the sender
	this.broadcast.emit('start_enemy_animation', {id: this.id,data:data});
}

// listen for a connection request from any client
io.sockets.on('connection', function(socket){
	console.log("socket connected"); 
	
	// listen for disconnection; 
	socket.on('disconnect', onClientdisconnect); 
	
	// listen for new player
	socket.on("new_player", onNewplayer);
	//listen for new player inputs. 
	//socket.on("input_fired", onInputFired);
	//listen for player collision
	socket.on("player_collision", onPlayerCollision);

	//listen if player got items 
	socket.on('item_picked', onitemPicked);

	socket.on('body_position_toserver',onBodyPositionReceived);

	socket.on('start_animation',onPlayerStartAnimation);

	socket.on('hit_player',onPlayerHit);
});