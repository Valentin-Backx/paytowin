define(function(){

	function AttackType(hitFrames,hitPosition,power)
	{
		this.hitFrame = hitFrames;
		this.hitPosition = hitPosition;
		this.baseAtkPower = power;
		this.currentHitFrames = new Array(hitFrames.length).fill(false)
	}

	AttackType.prototype.resetAttack = function(first_argument) {
		this.currentHitFrames.fill(false);
		return this;
	};

	AttackType.prototype.burnHit = function(index) {
		if(this.currentHitFrames[index])
		{
			return false;
		}
		this.currentHitFrames[index]=true;
		return true;
	};

	return {
	"attacksFrameInfos": attacksFrameInfos = {
		'single-strike' : 
				new AttackType(
					[2],
					[{
						'x' : 25,
						'y' : -20,
						'w' : 25,
						'h' : 40
					}],
					15
				)
		,
		'double-strike' : 
				new AttackType(
					[4,7],
					[{
					'x' : 30,
					'y' : -20,
					'w' : 25,
					'h' : 40
				},
				{
					'x' : 30,
					'y' : -5,
					'w' : 25,
					'h' : 40
				}
				],
				 3
	 		),
		'punch':
		new AttackType(
			[2],
			[{
				'x' : 130,
				'y' : 30,
				'w' : 90,
				'h' : 20
			}],
			1
		),
		'sonic' : {
			"baseAtkPower" : 2,
			"onAnimFinished" : function()
			{
			}
		}
	}
	}
});
