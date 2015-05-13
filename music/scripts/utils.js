//
// This file contains different support functions and objects
//

var listeners=[];
window.onload=function()
{
	for(l in listeners)
		listeners[l]();
	listeners=null;
}
function subscribeOnLoad(callback)
{
	if(listeners==null) callback();
	else listeners.push(callback);
}

function def(val, defval) { return ( (typeof val == typeof defval)? val : defval ); }
function isdef(val) { return val!=undefined; }

function color(r, g, b, a)
{
	if(typeof g != typeof 0)
	{
		return "rgb("+r+", "+r+", "+r+")";
	}
	if(typeof a != typeof 0)
	{
		return "rgb("+r+", "+g+", "+b+")";
	}
	
	if(a>1) a=1;
	else if(a<0) a=0;
	a=a+'';
	a=a.substring(0, 4);
	
	return "rgba("+r+", "+g+", "+b+", "+a+")";
}

function image(src)
{
	var i=new Image();
	i.src=src;
	return i;
}