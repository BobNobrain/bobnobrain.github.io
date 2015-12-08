function Rect(x, y, w, h)
{
	this.x=(x==undefined? 0:x);
	this.y=(y==undefined? 0:y);
	this.width=(w==undefined? 1:w);
	this.height=(h==undefined? 1:h);
}

function GameObject(params)
{
	this.x=0;
	this.y=0;
	this.width=1;
	this.height=1;
	
	this.moveBy=function(dx, dy)
	{
		if(dy==undefined) dy=0;
		this.x+=dx; this.y+=dy;
	}
	this.moveTo=function(nx, ny)
	{
		if(ny==undefined) ny=y;
		this.x=nx; this.y=ny;
	}
	
	this.collisionRect=new Rect(0, 0, 1, 1);
	
	if(typeof params==typeof this)
	{
		for(var x in params)
		{
			if(params.hasOwnProperty(x)) this[x]=params[x];
		}
	}
}