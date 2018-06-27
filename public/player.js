var Attacks = requirejs(['Attacks'])
var soundManager = requirejs(['SoundManager'])
var HealthBar;

require(['HealthBar'], function (hb) {
    HealthBar=hb
});

function Player(data,local)
{
	this.id = data.id;
	this.scaleBase = 2;
	
	this.airControlFactor = 0.5;

	this.airControlForce= 1000;
	
	this.sprite = game.group.create(data.x,data.y,'adventurer')

	if(data.health)
	{
		this.health = data.health;
	}else
	{
		this.health = 100
	}

	this.initHealth = this.health;
	
	this.sprite.scale.set(this.scaleBase)

	this.sprite.animations.add('walk',[8,9,10,11,12,13],10,true);

	this.sprite.animations.add('idle',[0,1,2,3],6,true);

	this.sprite.animations.add('jump',[16,17,18,19,20,21],16,false);

	this.sprite.animations.add('single_strike',[41,42,43,44,45,46,47],20,false)
	this.sprite.animations.add('double_strike',[48,49,50,51,52,53,54,55,56,57,58],10,false)

	this.sprite.animations.add('fall',[22,23],6,true);

	this.sprite.animations.add('death',[62,63,64,65,66],10,false)

	this.sprite.animations.play('idle');


	if(local)
	{
		this.local=true;
		game.physics.p2.enable(this.sprite);
		
		this.sprite.body.setRectangle(50,64,0,5,0);

		this.sprite.body.setCollisionGroup(game.playerCollisionGroup)
		this.sprite.body.collides(game.tilesCollisionGroup,this.hitPlatform,this);
		this.sprite.body.fixedRotation = true;

		this.canControl=true;

		 this.myHealthBar = new HealthBar(game, {
			 	x: (game.camera.width/4)*3+(game.camera.width/8)-50,
			 	y: 50,
			 	width: game.camera.width/4,
			 	height: 25
		 	});
		  this.myHealthBar.setPercent(100); 
		  this.myHealthBar.setFixedToCamera(true);
	}else
	{
		this.snapshots = [];
		this.sprite.pivot.set(25,19)
		this.interpolationTime = 30;
	}
	//this.sprite.body.debug = true;
	this.grounded = false;
	this.onJumpVelocity=0;
	this.jumpReleased = false;


	this.playerVelocity = 400;
	//this.sprite.body.setMaterial(spriteMaterial);

	//console.log(this.sprite.getAnimation('jump')._anims)

	this.startNewAnim = function(){};
	this.damageFrameReached = function(){};
	this.simple_atk_released=true;
	this.double_atk_released=true;

	this.sprite.z = 1
	game.group.sort()
}

Player.prototype = 
{
	inputReceived : function(data)
	{
		if(!this.canControl) //dead
		{
			return;
		}
		if(!data.simple_strike)
		{
			this.simple_atk_released=true;
		}
		if(!data.double_strike)
		{
			this.double_atk_released=true;
		}
		if(!data.up)
		{
			this.jumpReleased = true;
		}
		if(this.attacking)
		{
			this.checkHitFrame();

			if(
				this.currentAnimIsAttack()&&
				game.localPlayer.sprite.animations.currentAnim._frameIndex
				==
				game.localPlayer.sprite.animations.currentAnim.frameTotal-1
			)
			{
				this.attacking = false;
			}
			return;
		}
		if(data.up&&this.grounded&&this.jumpReleased)
		{

			this.jumpReleased = this.grounded = false;
			this.onJumpVelocity = this.sprite.body.velocity.y;
			this.sprite.body.velocity.y = -650
			this.sprite.animations.play('jump');

			this.startNewAnim({'animation_name':'jump'})
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
				this.startNewAnim({'animation_name':'walk'})
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
				this.startNewAnim({'animation_name':'walk'})
			}else
			{
				this.sprite.body.force.x =this.airControlForce;
				this.sprite.body.velocity.x = helpers.clamp(this.sprite.body.velocity.x,-this.playerVelocity,this.playerVelocity);

			}
		}
		if(data.simple_strike&&this.simple_atk_released)
		{
			this.simple_atk_released=false;
			this.sprite.animations.play('single_strike');
			this.startNewAnim({'animation_name':'single_strike'})
			this.attacking = true;
			this.currentAttack={
				"attackObj":attacksFrameInfos["single-strike"].resetAttack()
			};
		}
		if(data.double_strike&&this.double_atk_released)
		{
			this.double_atk_released=false;
			this.sprite.animations.play('double_strike');
			this.startNewAnim({'animation_name':"double_strike"});
			this.attacking=true;
			this.currentAttack={
				"attackObj":attacksFrameInfos["double-strike"].resetAttack()
			};
		}
		if(this.grounded&&!(data.right||data.left||data.up||data.simple_strike||data.double_strike)&&this.sprite.animations.currentAnim.name!='idle')
		{
			this.sprite.animations.play('idle')
			this.startNewAnim({'animation_name':'idle'})
		}

		if(!this.grounded&&!(/*data.right||data.left||data.up||*/data.simple_strike||data.double_strike)&&this.sprite.animations.currentAnim.name!='fall')
		{
			if(this.sprite.animations.currentAnim.name=="jump"&&game.localPlayer.sprite.animations.currentAnim._frameIndex<game.localPlayer.sprite.animations.currentAnim.frameTotal-1)
			{
				return;
			}
			this.sprite.animations.play('fall')
			this.startNewAnim({'animation_name':'fall'})
		}
	},
	hitPlatform : function()
	{
		this.grounded = true;
	},
	pushData : function(data)
	{
		data.time = game.time.now;
		this.snapshots.push(data);

		var index = this.snapshots.length-1;
		for (var i = this.snapshots.length - 1; i >= 0; i--) {
			if(this.snapshots[i].time < game.time.now - this.interpolationTime)
			{
				index = i;
				break;
			}
		}
		//on enleve tous les snapshots antérieurs
		this.snapshots.splice(0,index);

	},
	update : function()
	{
		if(this.snapshots.length>=2)
		{
			var positionTarget = new Phaser.Point(this.snapshots[1].position[0],this.snapshots[1].position[1]);
			var previousPosition = new Phaser.Point(this.snapshots[0].position[0],this.snapshots[0].position[1]);

			var rate =  ((game.time.now-this.interpolationTime) - this.snapshots[0].time) / (this.snapshots[1].time - this.snapshots[0].time);

			var resultingPosition = Phaser.Point.interpolate(previousPosition,positionTarget,rate);
			this.sprite.position = resultingPosition;

			this.sprite.scale.x = Math.sign(this.snapshots[1].scaleXSign)*this.scaleBase

/*			if(resultingPosition.x < previousPosition.x&&resultingPosition.x-previousPosition.x <-1)
			{
				this.sprite.scale.x = -1 * this.scaleBase
			}else if(resultingPosition.x > previousPosition.x&&resultingPosition.x-previousPosition.x > 1)
			{
				this.sprite.scale.x = this.scaleBase
			}*/
		}

/*		if(this.lastReceivedData){
			
			var positionTarget = new Phaser.Point(this.lastReceivedData.position[0],this.lastReceivedData.position[1]);
			
			if(this.previousData)
			{
				//var previousPos = new Phaser.Point(this.previousData.position[0],this.previousData.position[1]);
				/*var velocity = new Phaser.Point(this.lastReceivedData.velocity.x,this.lastReceivedData.velocity.y).getMagnitude();*/

				//var vector = Phaser.Point.subtract(positionTarget,previousPos);

	},
	startAnim : function(animData)
	{
		this.sprite.animations.play(animData.animation_name);
	},
	currentAnimIsAttack : function()
	{
		return ["single_strike","double_strike"].includes(this.sprite.animations.currentAnim.name);
	},
	checkHitFrame : function()
	{
        var atkObj = this.currentAttack.attackObj;
        if(atkObj.hitFrame.includes(this.sprite.animations.currentAnim._frameIndex)/*&&!this.sprite.animations.currentAnim.attackHit*/)
        {   
        	var indexHit = this.sprite.animations.currentAnim._frameIndex
        	if(!atkObj.burnHit(indexHit))
        	{
        		return;
        	}

        	var hitRect = atkObj.hitPosition[atkObj.hitFrame.indexOf(indexHit)]
            
            var r = new Phaser.Rectangle(
                this.sprite.x+this.getSens() * hitRect.x - (this.getSens()<=0?hitRect.w:0),
                this.sprite.y+hitRect.y,
                hitRect.w,hitRect.h
            );

            this.sprite.hit = r;

            //this.sprite.animations.currentAnim.attackHit=true;
            this.damageFrameReached(r,atkObj);
        }	
	},
	getSens : function()
	{
		return Math.sign(this.sprite.scale.x)
	},
	playHitSound : function()
	{
        soundManager.playHitSound();
	},
	damage : function(dmg)
	{
		this.health-=dmg;
		this.health = Math.max(this.health,0)
		this.myHealthBar.setPercent((this.health / this.initHealth)*100)
		console.log("current health: "+this.health)
	},
	heal : function(data)
	{
		this.health+=data.healAmount
		this.health = Math.min(this.health,this.initHealth)
		this.myHealthBar.setPercent((this.health / this.initHealth)*100)
		console.log("current health: "+this.health)


	},
	killed : function(data)
	{
		console.log("killed")
		this.canControl = false;
		this.startNewAnim({'animation_name':'death'})
		this.sprite.animations.play('death')
	},
	reset : function(position,health)
	{
		console.log("respawn "+health)
		//this.sprite.position.set(position[0],position[1])
		this.sprite.body.x = position[0]
		this.sprite.body.y = position[1]

		this.health = health
		this.sprite.animations.play('idle');
		this.startNewAnim({'animation_name':'idle'})
		this.grounded = false;
		this.simple_atk_released=true;
		this.double_atk_released=true;
		this.myHealthBar.setPercent(100)

		if(this.local)
		{
			this.canControl = true;
		}
	}
}