function Player(data)
{
	this.id = data.id;
	this.scaleBase = 2;
	
	this.airControlFactor = 0.5;

	this.airControlForce= 1000;
	
	this.sprite = game.add.sprite(data.x,data.y,'adventurer')
	
	this.sprite.scale.set(this.scaleBase)

	this.sprite.animations.add('walk',[8,9,10,11,12,13],10,true);

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
	this.onJumpVelocity=0;
	this.jumpReleased = false;

	this.playerVelocity = 400;
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
			this.onJumpVelocity = this.sprite.body.velocity.y;
			this.sprite.body.velocity.y = -650
			this.sprite.animations.play('jump');
		}
		if(data.down)
		{
			this.sprite.body.velocity.y = 300
		}
		if(data.left)
		{
			this.sprite.scale.x = -1 * this.scaleBase
			if(this.grounded)
			{
				this.sprite.animations.play('walk');
				this.sprite.body.velocity.x = -this.playerVelocity;
			}else
			{
				this.sprite.body.force.x = -this.airControlForce;
				this.sprite.body.velocity.x = helpers.clamp(this.sprite.body.velocity.x,-this.playerVelocity,this.playerVelocity);
			}
		}
		if(data.right)
		{
			this.sprite.scale.x = 1 * this.scaleBase
			if(this.grounded)
			{
				this.sprite.body.velocity.x = this.playerVelocity;
				this.sprite.animations.play('walk')
			}else
			{
				this.sprite.body.force.x =this.airControlForce;
				this.sprite.body.velocity.x = helpers.clamp(this.sprite.body.velocity.x,-this.playerVelocity,this.playerVelocity);
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