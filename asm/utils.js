function hex(integer) { return integer.toString(16).toUpperCase(); }
function dec(integer) { return Number.parseInt(integer, 16); }
function bytes(str_num)
{
	var str=str_num+'';
	if(str.indexOf('#')=='0') return [str, '#'];
	if(str.indexOf('h')==str.length-1)
	{
		str=str.substring(0, str.length-1);
	}
	else str=hex(str*1);
	
	if(str.length%2!=0) str='0'+str;
	
	var bytes=[];
	for(var i=str.length-1; i>0; i-=2)
	{
		bytes.push(str[i-1]+str[i]);
	}
	return bytes;
}

function parseNum(str)
{
	if(typeof str == typeof 0) return str;
	if(str[str.length-1]=='h')
	{
		return Number.parseInt(str.substring(0, str.length-1), 16);
	}
	return Number.parseInt(str, 10);
}
function limitByte(n)
{
	n%=256;
	if(n<0) n+=256;
	return n;
}

