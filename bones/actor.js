function Actor(params)
{
	this.color='#040';
	this.thickness=4;
	this.animation=null;
	
	GameObject.apply(this, arguments);
	
	this.setAnimation=function(name)
	{
		console.log(name);
		if(ActorAnimation.all[name]==undefined) return false;
		this.animation=ActorAnimation.all[name].clone();
		return true;
	}
	this.addAnimation=function(name)
	{
		console.log('.'+name);
		if(ActorAnimation.all[name]==undefined) return false;
		this.animation=this.animation.combineWith(ActorAnimation.all[name]);
		if(arguments.length>1)
		{
			for(var i=1; i<arguments.length; i++)
				this.addAnimation(arguments[i]);
		}
		return true;
	}
	
	this.setAnimation('still');
	
	// testing animations
	//if(!this.addAnimation('running')) console.log(1);
	//this.addAnimation('holding_rifle');
	
	this.draw=function(ctx)
	{
		ctx.lineWidth=this.thickness;
		ctx.strokeStyle=this.color;
		
		ctx.fillStyle=this.color;
		
		this.animation.draw(ctx, this.x, this.y);
	}
	
	this.update=function()
	{
		this.animation.update();
	}
}
