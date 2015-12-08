global={};

global.getContext=function(){ return global.canvas.getContext('2d'); }
global.resetCanvas=function(){ global.canvas.width+=0; }

global.frameDuration=33;
global.animator=new AnimationTimer();

global.input={};

global.input.left=false;
global.input.right=false;

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
	
	global.actor=new Actor({ y:100 });
	
	global.animator.addListener(function()
	{
		//global.p.update();
		if(global.input.left)
		{
			global.actor.moveBy(-6);
		}
		if(global.input.right)
		{
			global.actor.moveBy(6);
		}
		global.actor.update();
		global.resetCanvas();
		global.actor.draw(global.getContext());
	});
	
	global.animator.start();
	
	document.addEventListener('keydown', function(ev)
	{
		if(ev.keyCode=='A'.charCodeAt(0))
		{
			if(!global.input.left && !global.input.right)
			{
				global.actor.addAnimation('running');
				global.actor.animation.setDirection(ActorAnimation.DIRECTION_LEFT);
			}
			global.input.left=true;
		}
		if(ev.keyCode=='D'.charCodeAt(0))
		{
			if(!global.input.left && !global.input.right)
			{
				global.actor.addAnimation('running');
				global.actor.animation.setDirection(ActorAnimation.DIRECTION_RIGHT);
			}
			global.input.right=true;
		}
	});
	document.addEventListener('keyup', function(ev)
	{
		if(ev.keyCode=='A'.charCodeAt(0))
		{
			global.input.left=false;
			if(!global.input.left && !global.input.right)
			{
				global.actor.setAnimation('still');
				global.actor.addAnimation('breathing', 'holding_rifle');
			}
		}
		if(ev.keyCode=='D'.charCodeAt(0))
		{
			global.input.right=false;
			if(!global.input.left && !global.input.right)
			{
				global.actor.setAnimation('still');
				global.actor.addAnimation('breathing', 'holding_rifle');
			}
		}
	});
});
