function ActorAnimation(bodyPoints, direction)
{
	for(var i in ActorAnimation.pointNames)
	{
		if(bodyPoints[ActorAnimation.pointNames[i]]!=undefined)
			if(	typeof bodyPoints[ActorAnimation.pointNames[i]].x == typeof 0 &&
				typeof bodyPoints[ActorAnimation.pointNames[i]].y == typeof 0)
					this[ActorAnimation.pointNames[i]]=bodyPoints[ActorAnimation.pointNames[i]];
	}
	
	this.direction=ActorAnimation.DIRECTION_SAVE;
	if(typeof direction == typeof ActorAnimation.DIRECTION_NONE) this.direction=direction;
	
	this.update=function()
	{
		for(var i in ActorAnimation.pointNames)
		{
			if(typeof this[ActorAnimation.pointNames[i]].update == typeof eval)
				this[ActorAnimation.pointNames[i]].update();
			//else console.log(this[ActorAnimation.pointNames[i]]);
		}
	}
	
	this.setDirection=function(direction)
	{
		// //нельзя сменить направление, если оно не определено
		//if(direction==ActorAnimation.DIRECTION_NONE || this.direction==ActorAnimation.DIRECTION_NONE) return;
		if(direction==ActorAnimation.DIRECTION_SAVE) return false;
		
		console.log(this.direction+' -> '+direction);
		
		if(direction!=this.direction && this.direction.leftOrRight() && direction.leftOrRight())
		{
			// зеркально отражаем по горизонтали
			for(var i in ActorAnimation.pointNames)
			{
				n=ActorAnimation.pointNames[i];
				this[n].x=ActorAnimation.bounds.width-this[n].x;
				
				if(this[n].keyframes!=undefined)
				{
					// кажется, у нас проблемы - this[n] - это AnimatedPoint
					var coords=this[n].keyframes.coords;
					for(var j in coords)
					{
						coords[j].x=ActorAnimation.bounds.width-coords[j].x;
					}
				}
			}
			console.log('mirrored to'+direction);
		}
		this.direction=direction;
	}
	
	this.draw=function(ctx, x, y)
	{
		
		ctx.moveTo(x+this.head.x, y+this.head.y);
		ctx.lineTo(x+this.chest.x, y+this.chest.y);
		ctx.lineTo(x+this.ass.x, y+this.ass.y);
		
		ctx.moveTo(x+this.chest.x, y+this.chest.y);
		ctx.lineTo(x+this.larm.x, y+this.larm.y);
		ctx.lineTo(x+this.lhand.x, y+this.lhand.y);
		
		ctx.moveTo(x+this.chest.x, y+this.chest.y);
		ctx.lineTo(x+this.rarm.x, y+this.rarm.y);
		ctx.lineTo(x+this.rhand.x, y+this.rhand.y);
		
		ctx.moveTo(x+this.ass.x, y+this.ass.y);
		ctx.lineTo(x+this.lleg.x, y+this.lleg.y);
		ctx.lineTo(x+this.lfoot.x, y+this.lfoot.y);
		
		ctx.moveTo(x+this.ass.x, y+this.ass.y);
		ctx.lineTo(x+this.rleg.x, y+this.rleg.y);
		ctx.lineTo(x+this.rfoot.x, y+this.rfoot.y);
		
		ctx.stroke();
		
		ctx.beginPath();
		ctx.arc(x+this.head.x, y+this.head.y, 13, 0, 6.29);
		ctx.fill();
	}
	
	var copy=function(anim)
	{
		var result=new ActorAnimation({});
		for(var i in ActorAnimation.pointNames)
		{
			if(anim.hasOwnProperty(ActorAnimation.pointNames[i]))
			{
				var pt=anim[ActorAnimation.pointNames[i]];
				if(pt.clone==undefined)
				{
					result[ActorAnimation.pointNames[i]].x=pt.x;
					result[ActorAnimation.pointNames[i]].y=pt.y;
				}
				else
				{
					// поймали AnimatedPoint, его нужно скопировать
					result[ActorAnimation.pointNames[i]]=pt.clone();
				}
			}
		}
		result.direction=anim.direction;
		return result;
	}
	
	this.clone=function() { return copy(this); }
	
	this.combineWith=function(anim)
	{
		var result=copy(this);
		var oldDir=result.direction;
		console.log('cmb '+result.direction+' <- '+anim.direction);
		result.setDirection(anim.direction);
		for(var i in ActorAnimation.pointNames)
		{
			if(anim.hasOwnProperty(ActorAnimation.pointNames[i]))
			{
				var pt=anim[ActorAnimation.pointNames[i]];
				if(pt.clone==undefined)
				{
					result[ActorAnimation.pointNames[i]].x=pt.x;
					result[ActorAnimation.pointNames[i]].y=pt.y;
				}
				else
				{
					// поймали AnimatedPoint, его нужно скопировать
					result[ActorAnimation.pointNames[i]]=pt.clone();
				}
			}
		}
		
		return result;
	}
}
ActorAnimation.pointNames=['head', 'chest', 'ass', 'larm', 'lhand', 'rarm', 'rhand', 'lleg', 'lfoot', 'rleg', 'rfoot'];
ActorAnimation.DIRECTION_LEFT={toString:function(){return 'ActorAnimation.DIRECTION_LEFT'}, leftOrRight:function(){return true;}};
ActorAnimation.DIRECTION_RIGHT={toString:function(){return 'ActorAnimation.DIRECTION_RIGHT'}, leftOrRight:function(){return true;}};
ActorAnimation.DIRECTION_NONE={toString:function(){return 'ActorAnimation.DIRECTION_NONE'}, leftOrRight:function(){return false;}};
ActorAnimation.DIRECTION_SAVE={toString:function(){return 'ActorAnimation.DIRECTION_SAVE'}, leftOrRight:function(){return false;}};
ActorAnimation.bounds={ width:60, height:95 };

/*
 * THE ANIMATIONS
 *
 * All the animations that can be applied to actors
*/
ActorAnimation.all={};

ActorAnimation.all.still=new ActorAnimation({

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
}, ActorAnimation.DIRECTION_NONE);

// Эта анимация содержит умалчиваемые значения точек
ActorAnimation.prototype=ActorAnimation.all.still;

ActorAnimation.all.breathing=new ActorAnimation({

	head:new AnimatedPoint({
		coords: [ { x:30, y:15 }, { x:30, y:17 }, { x:30, y:14 }  ],
		times: [ 30, 60, 90 ]
	}),
	
	chest:new AnimatedPoint({
		coords: [ { x:30, y:28 }, { x:30, y:27 }, { x:30, y:29 }  ],
		times: [ 30, 60, 90 ]
	})
}, ActorAnimation.DIRECTION_NONE);

ActorAnimation.all.running=new ActorAnimation({
	
	head:new AnimatedPoint({
		coords: [ { x:35, y:15 }, { x:35, y:17 }, { x:35, y:14 }  ],
		times: [ 5, 15, 20 ]
	}),
	
	chest:new AnimatedPoint({
		coords: [ { x:35, y:28 }, { x:35, y:27 }, { x:35, y:29 }  ],
		times: [ 5, 15, 20 ]
	}),
	
	ass:{ x:32, y:50 },
	
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
	
}, ActorAnimation.DIRECTION_RIGHT);

ActorAnimation.all.holding_rifle=new ActorAnimation({
	larm: { x:24, y:44 },
	lhand: { x:40, y:40 },
	
	rarm: { x:42, y:46 },
	rhand: { x:54, y:40 }
}, ActorAnimation.DIRECTION_RIGHT);
