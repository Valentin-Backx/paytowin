/*require(["phaser.min","socket.io"],function(p,s){
	console.log(p)
	console.log(s)
})*/

define(["socket.io"],function(io){
	var socket; // define a global variable called socket 

	socket = io.connect(); // send a connection request to the server

	//this is just configuring a screen size to fit the game properly
	//to the browser
	canvas_width = window.innerWidth * window.devicePixelRatio; 
	canvas_height = window.innerHeight * window.devicePixelRatio;

	//make a phaser game
	game = new Phaser.Game(canvas_width,canvas_height, Phaser.CANVAS,
	 'gameDiv');

	 var gameProperties = { 
		//this is the actual game size to determine the boundary of 
		//the world
		gameWidth: 4000, 
		gameHeight: 4000,
		game_element : "gameDiv",
		in_game: false
	};

	// this is the main game state
	var main = function(game){
	};

	// add the 
	main.prototype = {
		preload: function() {
			game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
			game.world.setBounds(0, 0, gameProperties.gameWidth, 
			gameProperties.gameHeight, false, false, false, false);
			//I’m using P2JS for physics system. You can choose others if you want
			game.physics.startSystem(Phaser.Physics.P2JS);
			game.physics.p2.setBoundsToWorld(false, false, false, false, false)
			//sets the y gravity to 0. This means players won’t fall down by gravity
			game.physics.p2.gravity.y = 0;
			// turn gravity off
			game.physics.p2.applyGravity = false; 
			game.physics.p2.enableBody(game.physics.p2.walls, false); 
			// turn on collision detection
			game.physics.p2.setImpactEvents(true);

	    },
		//this function is fired once when we load the game
		create: function () {
			game.stage.backgroundColor = 0xE1A193;
			console.log("client started");
			//listen to the “connect” message from the server. The server 
			//automatically emit a “connect” message when the cleint connets.When 
			//the client connects, call onsocketConnected.  
			socket.on("connect", onsocketConnected); 

		},
		update: function () {
			// emit the player input
			
			//move the player when he is in game
			if (gameProperties.in_game) {
				// we're using phaser's mouse pointer to keep track of 
				// user's mouse position
				var pointer = game.input.mousePointer;
				
				// distanceToPointer allows us to measure the distance between the 
				// mouse pointer and the player object
				if (distanceToPointer(player, pointer) <= 50) {
					//The player can move to mouse pointer at a certain speed. 
					//look at player.js on how this is implemented.
					movetoPointer(player, 0, pointer, 100);
				} else {
					movetoPointer(player, 500, pointer);
				}	
			}
		}
	}

	function onsocketConnected () {
		//create a main player object for the connected user to control
		createPlayer();
		gameProperties.in_game = true;
		// send to the server a "new_player" message so that the server knows
		// a new player object has been created
		socket.emit('new_player', {x: 0, y: 0, angle: 0});
	}

	function createPlayer () {
		//uses Phaser’s graphics to draw a circle
		player = game.add.graphics(0, 0);
		player.radius = 100;

		// set a fill and line style
		player.beginFill(0xffd900);
		player.lineStyle(2, 0xffd900, 1);
		player.drawCircle(0, 0, player.radius * 2);
		player.endFill();
		player.anchor.setTo(0.5,0.5);
		player.body_size = player.radius; 

		// draw a shape
		game.physics.p2.enableBody(player, true);
		player.body.addCircle(player.body_size, 0 , 0); 
	}

	// wrap the game states.
	var gameBootstrapper = {
	    init: function(gameContainerElementId){
			game.state.add('main', main);
			game.state.start('main'); 
	    }
	};;

	//call the init function in the wrapper and specifiy the division id 
	gameBootstrapper.init("gameDiv");

})
