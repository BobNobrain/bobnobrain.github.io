function init(ins, outs, schema, initial)
{
	//init(3, 2, '3:3:1', 0);
	inputs=ins; outputs=outs;
	var layers=[ins].concat(schema.split(':').map(function(item){return item*1;})).concat([outs]);
	s=[[1]]; w=[]; deltas=[]; dw=[];

	maxLayerWidth=layers.reduce(function(acc,item)
	{
		return (item>acc)? item : acc;
	}, 0)*5+1;

	for(var i=0; i<ins; i++) s[0].push(initial);

	for(var i=1; i<layers.length; i++)
	{
		var layer=[];
		var layer2=[];
		var inpts=layers[i-1]+1;
		for(var j=0; j<layers[i]; j++)
		{
			var neu=[], neu2=[];
			for(var k=0; k<inpts; k++)
			{
				neu.push(initial);
				neu2.push(0);
			}
			layer.push(neu);
			layer2.push(neu2);
		}
		w.push(layer);
		dw.push(layer2);

		var sitem=[1];
		for(var j=0; j<layers[i]; j++) sitem.push(initial);
		s.push(sitem);

		sitem=[];
		for(var j=0; j<layers[i]; j++) sitem.push(0);
		deltas.push(sitem);
	}
	s[s.length-1].shift();

	return [printW(),printS(),printDeltas()].join('\n');
}

_history=[];
function push()
{
	_history.push({ s:s, w:w, t:_history.length, deltas:deltas, dw:dw });
}
function pop()
{
	var backup=_history.pop();
	s=backup.s; w=backup.w; deltas=backup.deltas; dw=backup.dw;
}

function mul(arr1, arr2)
{
	var summ=0;
	for(var i=0; i<arr1.length; i++){ summ+=arr1[i]*arr2[i]; }
	return summ;
}

function calcDirect(p)
{
	s[0]=[1].concat(train[p].slice(0, w[0][0].length-1));
	for(var layer=0; layer<w.length-1; layer++)
	{
		for(var neu=0; neu<w[layer].length; neu++)
		{
			var h=mul(w[layer][neu], s[layer]);
			s[layer+1][neu+1]=f(h);
		}
	}
	for(var neu=0; neu<w[w.length-1].length; neu++)
	{
		var h=mul(w[layer][neu], s[layer]);
		s[layer+1][neu]=f(h);
	}
	return printS();
}

function calcBack(p)
{
	eps=[];
	for(var i=inputs; i<train[p].length; i++)
	{
		eps[i-inputs]=train[p][i]-s[w.length][i-inputs];
		deltas[w.length-1][i-inputs]=eps[i-inputs];
	}
	for(var layer=w.length-2; layer>=0; layer--)
	{
		for(var i=0; i<deltas[layer].length; i++)
		{
			h=mul(s[layer], w[layer][i]);
			derivative=df(h);
			var summ=0;
			for(var m=0; m<w[layer+1].length; m++)
			{
				summ+=w[layer+1][m][i]*deltas[layer+1][m];
			}
			//console.log(w[layer+1]);
			deltas[layer][i]=derivative*summ;
		}
	}
	return printDeltas();
}

function calcDeltaWs()
{
	for(var layer=0; layer<w.length; layer++)
	{
		for(var neu=0; neu<w[layer].length; neu++)
		{
			for(var i=0; i<w[layer][neu].length; i++)
			{
				dw[layer][neu][i]+=alp*deltas[layer][neu]*s[layer-1+1][i];
			}
		}
	}
	return printDWs();
}

function teach()
{
	for(var layer=0; layer<w.length; layer++)
	{
		for(var neu=0; neu<w[layer].length; neu++)
		{
			for(var i=0; i<w[layer][neu].length; i++)
			{
				w[layer][neu][i]+=dw[layer][neu][i];
				dw[layer][neu][i]=0;
			}
		}
	}
	return printW();
}

function pad(str, minLen)
{
	while(str.length<minLen) str+=' ';
	return str;
}

function printW()
{
	return 'w:\n'+w.map(function(layer,i)
	{
		return 'layer '+(i+1)+': '+layer.map(function(neu,i)
		{
			return pad('#'+(i+1)+': '+neu.join(', '), maxLayerWidth);
		}).join(' | ');
	},'').join('\n');
}
function printDWs()
{
	return 'dw:\n'+dw.map(function(layer,i)
	{
		return 'layer '+(i+1)+': '+layer.map(function(neu,i)
		{
			return pad('#'+(i+1)+': '+neu.join(',  '), maxLayerWidth);
		}).join(' | ');
	},'').join('\n');
}
function printS()
{
	return 's: \n'+s.map(function(layer,i)
	{
		return 'layer '+(i)+': '+layer.join(' ');
	},'').join('\n');
}
function printDeltas()
{
	return 'deltas: \n'+deltas.map(function(layer,i)
	{
		return 'layer '+(i+1)+': '+layer.join(' ');
	},'').join('\n');
}

function D()
{
	return 0.5*(train.reduce(function(acc,item)
	{
		return acc+mul(item.slice(inputs),s[w.length]);
	},0));
}