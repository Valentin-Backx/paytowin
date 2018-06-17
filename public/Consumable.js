var consumables = []

function checkOverlap(spriteA, spriteB) {

    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();

    return Phaser.Rectangle.intersects(boundsA, boundsB);

}

function finditembyid (id) {
	
	for (var i = 0; i < consumables.length; i++) {

		if (consumables[i].id == id) {
			return consumables[i]; 
		}
	}
	
	return false; 
}



function getItem(itemType,gid)
{
	var res = {
		"spriteName":"",
		"keyFrame":""
	}
	for (var i = map.tilesets.length - 1; i >= 0; i--) {
		if(map.tilesets[i].firstgid<=gid&&map.tilesets[i].firstgid+map.tilesets[i].total>gid)
		{
			res.spriteName = map.tilesets[i].name;
			res.keyFrame =  gid-map.tilesets[i].firstgid
			break;
		}

	}

	return res;
}

function Consumable(data)
{
	this.type = data.type;
	this.gid = data.gid;
	this.id = data.id;
	this.itemType = getItem(data.type,data.gid);
	this.sprite = game.consumablesGroup.create(
		data.x,
		data.y,
		this.itemType.spriteName,
		this.itemType.keyFrame
		)
	consumables.push(this)

	this.getData = function()
	{
		return {"itemData":{
			"gid":this.gid,
			"type":this.type,
			"id":this.id
		}}
	}
	this.destroy = function()
	{
		this.sprite.destroy();	
	}
}


function itemOverlap()
{
	for (var i = consumables.length - 1; i >= 0; i--) {
		if(checkOverlap(consumables[i].sprite,game.localPlayer.sprite))
		{
			return consumables[i];
		}
	}
}