var Consumable = function(data)
{
	this.x = data.x;
	this.y = data.y;

	this.type = data.type;
	this.width = data.width;
	this.height = data.height;

	this.respawnTime = 15000;

	this.isSpawned = true;

	this.id = data.id;

	this.gid = data.gid;
}

Consumable.prototype.spawn = function() {
	this.isSpawned=true;
};

Consumable.prototype.getSpawnData = function() {
	return {
				"x":this.x,
				"y":this.y,
				"type":this.type,
				"width":this.width,
				"height":this.height,
				"gid":this.gid,
				"id":this.id
			}
};

Consumable.prototype.canBeUsedBy = function(player) {
	return player.health < player.parameters.health;
};

Consumable.prototype.useItem = function(player) {
	this.isSpawned=false;

	player.heal(10)
	//on part du principe que c'est un soin, TODO: mettre en place l'héritage
	//pour les autres objets
};

var ConsumableManager = function(sockets)
{
	this.sockets = sockets
	this.consumables = []
	this.parseTileMapObjects();
} 

ConsumableManager.prototype.parseTileMapObjects = function() {
	var parsedJson = require('./public/assets/projets_tilemaps.json');

	for (var i = parsedJson["layers"][1].objects.length - 1; i >= 0; i--) {
		this.consumables.push(new Consumable(parsedJson["layers"][1].objects[i]))
	}
};

ConsumableManager.prototype.concatAllConsumables = function() {
	var res = [] 
	for (var i = this.consumables.length - 1; i >= 0; i--) {
		if(this.consumables[i].isSpawned)
		{
			res.push(this.consumables[i].getSpawnData())
		}
	}
	return res;
};

ConsumableManager.prototype.playerOverlapped = function(itemData) {

	for (var i = this.consumables.length - 1; i >= 0; i--) {
		if(this.consumables[i].id==itemData.id)
		{
			if(this.consumables[i].isSpawned)
			{
				//TODO: checker si le joueur peut utiliser le consommable
				//(joueur marche sur un soin alors que déjà full vie)
				
				return this.consumables[i];
			}
		}
	}
	return false;
};

ConsumableManager.prototype.scheduleItemForRespawn = function(item) {
	setTimeout(
		function(){
			this.respawnItem(item.id,item)
		}.bind(this),
		item.respawnTime
	);
};

ConsumableManager.prototype.respawnItem = function(id,item) {
	item.spawn();
	this.sockets.emit("update_consumables",[item.getSpawnData()])
};


ConsumableManager.prototype.updateAllConsumables = function(socket) {
	socket.emit("update_consumables",this.concatAllConsumables())
};

module.exports = ConsumableManager;