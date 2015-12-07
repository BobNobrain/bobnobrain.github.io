global={};

global.getContext=function(){ return global.canvas.getContext('2d'); }
global.resetCanvas=function(){ global.canvas.width+=0; }

global.frameDuration=33;
global.animator=new AnimationTimer();

window.addEventListener('load', function()
{
	global.canvas=document.getElementById('c');
	
	global.canvas.width=window.innerWidth-6;
	global.canvas.height=window.innerHeight-6;
	
	
	//global.getContext().fillStyle='#000';
	global.p=new AnimatedPoint({
		coords: [ { x:100, y:100 }, { x:100, y:200 }, { x:200, y:200 }, { x:200, y:100 } ],
		times: [ 100, 150, 160, 200 ]
	});
	
	global.actor=new Actor();
	
	global.getContext().strokeStyle='#000';
	global.getContext().lineWidth=3;
	
	global.animator.addListener(function()
	{
		//global.p.update();
		global.actor.update();
		global.resetCanvas();
		global.actor.draw(global.getContext());
	});
	
	global.animator.start();
});

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
}


function Actor()
{
	// body anchor points
	var a=['head', 'chest', 'ass', 'larm', 'lhand', 'rarm', 'rhand', 'lleg', 'lfoot', 'rleg', 'rfoot'];
	
	this.animations={};
	
	this.animations.still={
	
		head:{ x:30, y:15 },
		
		chest:{ x:30, y:28 },
		
		ass:{ x:30, y:50 },
		
		larm:{ x:15, y:45 },
		rarm:{ x:45, y:45 },
		
		lhand:{ x:10, y:65 },
		rhand:{ x:50, y:65 },
		
		lleg:{ x:20, y:75 },
		rleg:{ x:40, y:75 },
		
		lfoot:{ x:20, y:95 },
		rfoot:{ x:40, y:95 }
	};
	
	this.animations.breathing={
	
		head:new AnimatedPoint({
			coords: [ { x:30, y:15 }, { x:30, y:17 }, { x:30, y:14 }  ],
			times: [ 30, 60, 90 ]
		}),
		
		chest:new AnimatedPoint({
			coords: [ { x:30, y:28 }, { x:30, y:27 }, { x:30, y:29 }  ],
			times: [ 30, 60, 90 ]
		}),
		
		ass:{ x:30, y:50 },
		
		larm:{ x:15, y:45 },
		rarm:{ x:45, y:45 },
		
		lhand:{ x:10, y:65 },
		rhand:{ x:50, y:65 },
		
		lleg:{ x:20, y:75 },
		rleg:{ x:40, y:75 },
		
		lfoot:{ x:20, y:95 },
		rfoot:{ x:40, y:95 }
	};
	
	this.animations.running={
		
		head:new AnimatedPoint({
			coords: [ { x:35, y:15 }, { x:35, y:17 }, { x:35, y:14 }  ],
			times: [ 5, 15, 20 ]
		}),
		
		chest:new AnimatedPoint({
			coords: [ { x:35, y:28 }, { x:35, y:27 }, { x:35, y:29 }  ],
			times: [ 5, 15, 20 ]
		}),
		
		ass:{ x:32, y:50 },
		
		larm:{ x:15, y:45 },
		rarm:{ x:45, y:45 },
		
		lhand:{ x:10, y:65 },
		rhand:{ x:50, y:65 },
		
		lleg:new AnimatedPoint({
			coords: [ { x:44, y:68 }, { x:39, y:74 }, { x:22, y:76 }, { x:48, y:62 } ],
			times: [ 5, 10, 20, 25 ]
		}),
		rleg:new AnimatedPoint({
			coords: [ { x:22, y:76 }, { x:48, y:62 }, { x:44, y:68 }, { x:39, y:74 } ],
			times: [ 10, 15, 20, 25 ]
		}),
		
		lfoot:new AnimatedPoint({
			coords: [ { x:42, y:93 }, { x:21, y:95 }, { x:0, y:84 }, { x:54, y:84 } ],
			times: [ 5, 10, 20, 25 ]
		}),
		rfoot:new AnimatedPoint({
			coords: [ { x:0, y:84 }, { x:54, y:84 }, { x:42, y:93 }, { x:21, y:95 } ],
			times: [ 10, 15, 20, 25 ]
		})
		
		//coords: [ { x:44, y:93 }, { x:21, y:95 }, { x:3, y:90 }, { x:40, y:84 } ],foot
		//coords: [ { x:52, y:68 }, { x:39, y:74 }, { x:19, y:76 }, { x:55, y:62 } ],leg
	};
	
	
	this.setAnimation=function(name)
	{
		for(var i in a)
		{
			var pt=this.animations[name][a[i]];
			if((typeof pt.x==typeof 0) && (typeof pt.y==typeof 0)) this[a[i]]=pt;
		}
	}
	
	this.setAnimation('still');
	this.setAnimation('running');
	
	this.draw=function(ctx)
	{
		ctx.lineWidth=4;
		ctx.strokeStyle='#040';
		
		ctx.moveTo(this.head.x, this.head.y);
		ctx.lineTo(this.chest.x, this.chest.y);
		ctx.lineTo(this.ass.x, this.ass.y);
		
		ctx.moveTo(this.chest.x, this.chest.y);
		ctx.lineTo(this.larm.x, this.larm.y);
		ctx.lineTo(this.lhand.x, this.lhand.y);
		
		ctx.moveTo(this.chest.x, this.chest.y);
		ctx.lineTo(this.rarm.x, this.rarm.y);
		ctx.lineTo(this.rhand.x, this.rhand.y);
		
		ctx.moveTo(this.ass.x, this.ass.y);
		ctx.lineTo(this.lleg.x, this.lleg.y);
		ctx.lineTo(this.lfoot.x, this.lfoot.y);
		
		ctx.moveTo(this.ass.x, this.ass.y);
		ctx.lineTo(this.rleg.x, this.rleg.y);
		ctx.lineTo(this.rfoot.x, this.rfoot.y);
		
		ctx.stroke();
		
		ctx.fillStyle='#040';
		ctx.beginPath();
		ctx.arc(this.head.x, this.head.y, 13, 0, 6.29);
		ctx.fill();
	}
	
	this.update=function()
	{
		for(var i in a)
		{
			if(typeof this[a[i]].update == typeof this.update) this[a[i]].update();
		}
	}
}
