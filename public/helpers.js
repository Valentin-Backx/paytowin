var helpers = {
	moveTowards : function(current,target,maxDelta)
	{
		if(Math.abs(target-current)<=maxDelta)
		{
			return target;
		}
		return current+Math.sign(target-current) * maxDelta;
	},
	clamp : function(current,min,max)
	{
		if(current < min)
		{
			return min;
		}
		if(current>max)
		{
			return max;
		}
		return current;
	}

}