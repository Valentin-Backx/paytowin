function movetoPointer (displayObject, speed, pointer, maxTime) {
		
		/*
		var bound_limit = 40;
		var upper_bound = bound_limit;
		var bottom_bound = game.world.height - bound_limit;
		var left_bound = bound_limit;
		var right_bound = game.world.width - bound_limit; 
		var play_bound = true; 
		
        if (speed === undefined) { speed = 60; }
        pointer = pointer;
        if (maxTime === undefined) { maxTime = 0; }
		
		*/
        var angle = angleToPointer(displayObject, pointer);

        if (maxTime > 0)
        {
            //  We know how many pixels we need to move, but how fast?
            speed = distanceToPointer(displayObject, pointer) / (maxTime / 1000);
        }
		
		/*
		if (displayObject.body.y < upper_bound || displayObject.body.y > bottom_bound) {
			if (!(game.input.worldY > upper_bound && game.input.worldY < bottom_bound)) {
				displayObject.body.velocity.y = 0;
			} else {
				displayObject.body.velocity.x = Math.cos(angle) * speed;
				displayObject.body.velocity.y = Math.sin(angle) * speed;
			}
		} else if (displayObject.body.x < left_bound || displayObject.body.x > right_bound) {
			if (!(game.input.worldX > left_bound && game.input.worldX < right_bound)) {
				displayObject.body.velocity.x = 0;
			} else {
				displayObject.body.velocity.x = Math.cos(angle) * speed;
				displayObject.body.velocity.y = Math.sin(angle) * speed;
			}
		}
		*/
		displayObject.body.velocity.x = Math.cos(angle) * speed;
		displayObject.body.velocity.y = Math.sin(angle) * speed;

        return angle;

}

function distanceToPointer (displayObject, pointer, world) {


        if (world === undefined) { world = false; }

        var dx = (world) ? displayObject.world.x - pointer.worldX : displayObject.x - pointer.worldX;
        var dy = (world) ? displayObject.world.y - pointer.worldY : displayObject.y - pointer.worldY;

        return Math.sqrt(dx * dx + dy * dy);

}

function angleToPointer (displayObject, pointer, world) {

        
        if (world === undefined) { world = false; }

        if (world)
        {
            return Math.atan2(pointer.worldY - displayObject.world.y, pointer.worldX - displayObject.world.x);
        }
        else
        {
            return Math.atan2(pointer.worldY - displayObject.y, pointer.worldX - displayObject.x);
        }

}


function Player(data)
{
	this.scaleBase = 2;
	
	this.airControlFactor = 0.5;
	
	this.sprite = game.add.sprite(data.x,data.y,'adventurer')
	
	this.sprite.scale.set(this.scaleBase)

	this.sprite.animations.add('walk',[8,9,10,11,12,13,14,15],10,true);

	this.sprite.animations.add('idle',[0,1,2,3],6,true);

	this.sprite.animations.add('jump',[16,17,18,19,20,21,22,23],16,false);

	this.sprite.animations.play('idle')



	game.physics.p2.enable(this.sprite);
	
	this.sprite.body.setRectangle(50,64,0,5,0);

	this.sprite.body.setCollisionGroup(game.playerCollisionGroup)
	this.sprite.body.collides(game.tilesCollisionGroup,this.hitPlatform,this);
	this.sprite.body.fixedRotation = true;
	//this.sprite.body.debug = true;
	this.grounded = false;
	this.jumpReleased = false;
	//this.sprite.body.setMaterial(spriteMaterial);

	
	//console.log(this.sprite.getAnimation('jump')._anims)
}

Player.prototype = 
{
	inputReceived : function(data)
	{
		if(!data.up)
		{
			this.jumpReleased = true;
		}
		if(data.up&&this.grounded&&this.jumpReleased)
		{

			this.jumpReleased = this.grounded = false;
			this.sprite.body.velocity.y = -650
			this.sprite.animations.play('jump');
		}
		if(data.down)
		{
			this.sprite.body.velocity.y = 300
		}
		if(data.left)
		{
			this.sprite.body.velocity.x = -400 * (this.grounded?1:this.airControlFactor)
			this.sprite.scale.x = -1 * this.scaleBase
			if(this.grounded)
			{
				this.sprite.animations.play('walk')
			}
		}
		if(data.right)
		{
			this.sprite.body.velocity.x = 400 * (this.grounded?1:this.airControlFactor)
			this.sprite.scale.x = 1 * this.scaleBase
			if(this.grounded)
			{
				this.sprite.animations.play('walk')
			}
		}
		if(this.grounded&&!(data.right||data.left||data.up)&&this.sprite.animations.currentAnim.name!='idle')
		{
			this.sprite.animations.play('idle')
		}
	},
	hitPlatform : function()
	{
		this.grounded = true;
	}
}