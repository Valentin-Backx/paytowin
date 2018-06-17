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
  	this.parameters.armor = 0
  }
  this.armor = this.parameters.armor;
  this.health = this.parameters.health;

}

Player.prototype.damage = function(dmg,attacker) {
  dmg-=this.armor;
  dmg = Math.max(0,dmg);

  this.health-=dmg;

  if(this.health<0)
  {
    this.death(attacker);
  }
  this.socket.emit("suffer_damage",{dmgAmount:dmg})
};

Player.prototype.death = function(attacker) {
  this.socket.emit("killed",{enemyId:attacker});
  this.socket.broadcast.emit("player_killed",{killedPlayer:this.id,killerId:attacker});

  setTimeout(this.respawn.bind(this),4000);
};

Player.prototype.respawn = function() {
  this.position = [this.parameters.x,this.parameters.y]
  this.health = this.parameters.health
  this.socket.emit("player_respawn",{position:this.position,health:this.health});
};


Player.prototype.broadcastBody = function()
	{
		var player =this;
		this.socket.broadcast.emit("body_update",{
			"velocity":player.velocity,
			"pos":player.position,
			"id":this.id,
      "scaleXSign":this.scaleXSign
		})
	}

module.exports = Player;