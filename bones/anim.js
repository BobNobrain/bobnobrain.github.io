function AnimationTimer(frameDuration)
{
	if(frameDuration==undefined || frameDuration<=0) frameDuration=global.frameDuration;
	this.onTick=function()
	{
		for(var x in arguments.callee.listeners)
		{
			arguments.callee.listeners[x]();
		}
	}
	
	this.onTick.listeners=[];
	
	this.start=function()
	{
		return this.intervalID=setInterval(this.onTick, frameDuration);
	}
	this.stop=function()
	{
		clearInterval(this.intervalID);
	}
	
	this.addListener=function(listener) { this.onTick.listeners.push(listener); }
}

AnimatedPoint=function(keyframes)
{
	this.ticks=0;
	this.keyframes=keyframes;
	
	this.limit=this.keyframes.times[this.keyframes.times.length-1];
	this.keyframes.times.unshift(0);
	
	var current=0;
	
	this.x=this.keyframes.coords[0].x; this.y=this.keyframes.coords[0].y;
	
	this.update=function()
	{
		//if(this.ticks==0) console.log('upd');
		
		var next=current+1;
		if(next>=this.keyframes.coords.length) next=0;
		
		var dt=(this.keyframes.times[current+1]-this.keyframes.times[current]);
		//if(dt<0) dt+=this.limit;
		//if(this.ticks-this.keyframes.times[current]<2) console.log('alarm!');
		//console.log(dt);
		
		this.x=	 (this.ticks-this.keyframes.times[current])
				*(this.keyframes.coords[next].x-this.keyframes.coords[current].x)
				/dt
				+this.keyframes.coords[current].x;
		this.y=	 (this.ticks-this.keyframes.times[current])
				*(this.keyframes.coords[next].y-this.keyframes.coords[current].y)
				/dt
				+this.keyframes.coords[current].y;
		
		++this.ticks;
		if(this.ticks>=this.limit) this.ticks=0;
		
		if(this.keyframes.times[next]==this.ticks)
		{
			current=next;
		}
	}
	
	this.reset=function()
	{
		this.ticks=0;
		current=0;
		this.x=this.keyframes.coords[0].x; this.y=this.keyframes.coords[0].y;
	}
	
	this.clone=function()
	{
		var newFrames={ coords:[], times:[] };
		
		for(var i=0; i<this.keyframes.coords.length; ++i)
		{
			newFrames.coords.push({ x:this.keyframes.coords[i].x, y:this.keyframes.coords[i].y });
			newFrames.times.push(this.keyframes.times[i+1]);
		}
		
		var r=new AnimatedPoint(newFrames);
		return r;
	}
}
