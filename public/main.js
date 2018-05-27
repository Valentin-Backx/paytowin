/*require(["phaser.min","socket.io"],function(p,s){
	console.log(p)
	console.log(s)
})*/

define(["socket.io","collide","helpers","player","item",],function(io,collide) {
	var socket; // define a global variable called socket 

	socket = io.connect(); // send a connection request to the server

	//this.socket = socket

	//this is just configuring a screen size to fit the game properly
	//to the browser
	canvas_width = window.innerWidth * window.devicePixelRatio; 
	canvas_height = window.innerHeight * window.devicePixelRatio;

	//make a phaser game
	game = new Phaser.Game(canvas_width,canvas_height, Phaser.CANVAS,'gameDiv');

	//the enemy player list 
	game.enemies = [];

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
	var map;
	var cursors;
	var jumpButton;
	// add the 
	main.prototype = {
		preload: function() {
			console.log("preloading")
			//game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
			
			game.world.setBounds(0, 0, gameProperties.gameWidth,gameProperties.gameHeight, false, false, false, false);
			

			//I’m using P2JS for physics system. You can choose others if you want
			game.physics.startSystem(Phaser.Physics.P2JS);
			game.physics.p2.setBoundsToWorld(false, false, false, false, false)
			//sets the y gravity to 0. This means players won’t fall down by gravity
			game.physics.p2.gravity.y = 1000;

			game.physics.p2.enableBody(game.physics.p2.walls, true); 
			// turn on collision detection
			game.physics.p2.setImpactEvents(true);

			game.physics.p2.world.defaultContactMaterial.friction = 3;
			game.load.tilemap('map','assets/projets_tilemaps.json',null,Phaser.Tilemap.TILED_JSON)
			game.load.image('tileset','assets/tileset.png')

			game.load.spritesheet(
				'adventurer',
				'assets/adventurer-1.2-Sheet.png',
				50,
				37,
				85
			)

			game.tilesCollisionGroup = game.physics.p2.createCollisionGroup();
			game.playerCollisionGroup = game.physics.p2.createCollisionGroup();
	    },
		//this function is fired once when we load the game
		create: function () {
			cursors = game.input.keyboard.createCursorKeys();

			map = game.add.tilemap('map')
			
			map.addTilesetImage('tileset');

			game.mapCollisionlayer = map.createLayer("collision_layer")
			
			//game.mapCollisionlayer.setCollisionGroup(game.tilesCollisionGroup)
			//map.setCollisionBetween(1,12,true,"collision_layer");

			map.setCollisionByExclusion([],true,"collision_layer");

			var tileObjects = game.physics.p2.convertTilemap(map,"collision_layer",)

			  for (var i = 0; i < tileObjects.length; i++) {        
			  	var tileBody = tileObjects[i];        
			  	tileBody.setCollisionGroup(game.tilesCollisionGroup);        
			  	tileBody.collides(game.playerCollisionGroup);    
			  } 

			//listen to the “connect” message from the server. The server 
			//automatically emit a “connect” message when the cleint connets.When 
			//the client connects, call onsocketConnected.  
			if(socket.connected)
			{
				onsocketConnected();
			}else
			{
				socket.on("connect", onsocketConnected); 
			}


			//listen for main player creation
			socket.on("create_player", createPlayer);
			//createPlayer({x: 780, y: 450, angle: 0});
			//listen to new enemy connections
			socket.on("new_enemyPlayer", onNewPlayer);
			//listen to enemy movement 
			socket.on("enemy_move", onEnemyMove);
			
			// when received remove_player, remove the player passed; 
			socket.on('remove_player', onRemovePlayer); 
			//when the player receives the new input
			//socket.on('input_recieved', onInputRecieved);		
			//when the player gets killed
			socket.on('killed', onKilled);

			// check for item removal
			socket.on ('itemremove', onitemremove); 
			// check for item update
			socket.on('item_update', onitemUpdate); 

			socket.on("body_update",onBodyUpdate);

		},
		update: function () {
			// emit the player input
			
			//move the player when he is in game
			if (gameProperties.in_game) {
	
				//we're making a new mouse pointer and sending this input to 
				//the server.
				/*var pointer = game.input.mousePointer;
						
				//Send a new position data to the server 
				socket.emit('input_fired', {
					pointer_x: pointer.x, 
					pointer_y: pointer.y, 
					pointer_worldx: pointer.worldX, 
					pointer_worldy: pointer.worldY, 
				});*/
				if(game.localPlayer)
				{
					//setInterval, ne pas envoyer à chaque frame
					//envoyer données de vitesse des bodies
					socket.emit('body_position_toserver',{
						"position":[
							game.localPlayer.sprite.position.x,
							game.localPlayer.sprite.position.y
						],
						"velocity":{
							"x":game.localPlayer.sprite.body.velocity.x,
							"y":game.localPlayer.sprite.body.velocity.y
						}
					});	
				}
				for (var i = game.enemies.length - 1; i >= 0; i--) {
					game.enemies[i].update();
				}
				

			}

			if(game.localPlayer)
			{
				game.camera.y = game.localPlayer.sprite.y - canvas_height/2;
				game.camera.x = game.localPlayer.sprite.x - canvas_width/2;

				var inputs = {
					"up":cursors.up.isDown,
					"down":cursors.down.isDown,
					"left":cursors.left.isDown,
					"right":cursors.right.isDown
				}
				game.localPlayer.inputReceived(inputs);

			}else
			{
			    if (cursors.up.isDown)
			    {
			        game.camera.y -= 4;
			    }
			    else if (cursors.down.isDown)
			    {
			        game.camera.y += 4;
			    }

			    if (cursors.left.isDown)
			    {
			        game.camera.x -= 4;
			    }
			    else if (cursors.right.isDown)
			    {
			        game.camera.x += 4;
			    }				
			}
		},

		render : function()
		{
			//game.debug.cameraInfo(game.camera,32,32)
			//game.debug.bodyInfo(game.localPlayer.sprite, 32, 32);
        	//game.debug.body(game.localPlayer.sprite);
		}
	}

		// wrap the game states.
	var gameBootstrapper = {
	    init: function(gameContainerElementId){
			game.state.add('main', main);
			game.state.start('main');
			//game.stage.disableVisibilityChange = true
	    }
	};



	function createPlayer (data) {
		console.log("creating my local player")

		game.localPlayer = new Player(data,true);

	}


	//Server will tell us when a new enemy player connects to the server.
	//We create a new enemy in our game.
	function onNewPlayer (data) {
		if(findplayerbyid(data.id))
		{
			console.log("attempting to create an already existing player")
			return;
		}
		//enemy object 
		console.log("creating an enemy")
		//the new parameter, data.size is used as initial circle size
		var new_enemy = new Player(data); 
		game.enemies.push(new_enemy);
	}

	//Server tells us there is a new enemy movement. We find the moved enemy
	//and sync the enemy movement with the server
	function onEnemyMove (data) {
		
		var movePlayer = findplayerbyid (data.id); 
		
		if (!movePlayer) {
			return;
		}
		
		var newPointer = {
			x: data.x,
			y: data.y, 
			worldX: data.x,
			worldY: data.y, 
		}

	}

	//we're receiving the calculated position from the server and changing the player position
	function onInputRecieved (data) {
		
/*		if(!player)
		{
			return ;
		}*/

		if(game.localPlayer)
		{
			game.localPlayer.inputReceived(data);
		}

	}

	function onBodyUpdate(data)
	{
		//console.log(data)
		var player = findplayerbyid(data.id);
		if(!player)
		{
			return;
		}

		if(!data.velocity)
		{
			data.velocity={x:0,y:0}
		}
		player.pushData({
			'position':data.pos,
			'velocity':data.velocity
		})

		//player.sprite.body.x = data.pos[0];
		//player.sprite.body.y = data.pos[1];
	}

	//destroy our player when the server tells us he's dead
	function onKilled (data) {
		player.destroy();
	}

	//This is where we use the socket id. 
	//Search through enemies list to find the right enemy of the id.
	function findplayerbyid (id) {
		for (var i = 0; i < game.enemies.length; i++) {
			if (game.enemies[i].id == id) {
				return game.enemies[i]; 
			}
		}
	}

	function onsocketConnected () {
		console.log("socket connected")

		gameProperties.in_game = true;
		// send to the server a "new_player" message so that the server knows
		// a new player object has been created
		console.log("emitting new player request")
		socket.emit('new_player', {x: 780, y: 450, angle: 0});
	}	

	//call the init function in the wrapper and specifiy the division id 
	gameBootstrapper.init("gameDiv");

	// When the server notifies us of client disconnection, we find the disconnected
	// enemy and remove from our game
	function onRemovePlayer (data) {
		var removePlayer = findplayerbyid(data.id);
		// Player not found
		if (!removePlayer) {
			console.log('Player not found: ', data.id)
			return;
		}
		
		removePlayer.player.destroy();
		game.enemies.splice(game.enemies.indexOf(removePlayer), 1);
	}

	return {

		socket : socket
	}

})
