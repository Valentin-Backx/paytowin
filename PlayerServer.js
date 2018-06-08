// A player “class”, which will be stored inside player list 
var Player = function (startX, startY,socket,initParams) {
  var x = startX
  var y = startY
  this.speed = 500;
  //We need to intilaize with true.
  this.sendData = true;
  this.dead = false;
  this.socket = socket;

  this.parameters = initParams;

  this.position = [initParams.x,initParams.y]
  if(!this.parameters.health)
  {
  	this.parameters.health=100;
  }
  if(!this.parameters.armor)
  {
  	this.armor = 0
  }
}

Player.prototype = 
{
	broadcastBody : function()
	{
		var player =this;
		this.socket.broadcast.emit("body_update",{
			"velocity":player.velocity,
			"pos":player.position,
			"id":this.id
		})
	}
}

module.exports = Player;