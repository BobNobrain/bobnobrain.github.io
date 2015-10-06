byId=function(id) { return document.getElementById(id); }
createOutput=function(out)
{
	if(typeof out == typeof '') out=byId(out);
	if(out==null) throw new Error('Output element not found!');
	out.innerHTML='';
	
	return {	
		puts: function(text) { return out.innerHTML+=text; },
		putl: function(text) { return out.innerHTML+=(text?text:'')+'<br />'; },
		clear: function() { out.innerHTML=''; },
		
		element: out
	}
}
createContext=function(id)
{
	var canvas=byId(id);
	canvas.width=canvas.width;
	return canvas.getContext('2d');
}

/*
	** Formatting functions for formulas
*/
function sup(text){ return '<sup>'+text+'</sup>'; } // upper index
function sub(text){ return '<sub>'+text+'</sub>'; } // lower index
function neg(text){ return '<span class="strike-over">'+text+'</span>'; } // negation sign
function brackets(text){ return '<span class="big-brackets">'+text+'</span>'; } // group in big brackets

/*
	** Some classes for graph building
*/

function Vertex(name, x, y)
{
	this.name=name;
	this.x=x; this.y=y;
	this.width=VERTEX_WIDTH; this.height=VERTEX_HEIGHT;
	
	this.neighbours=[];
	this.addNeighbour=function(char, vertex)
	{
		this.neighbours.push({ char: char, vertex: vertex });
	}
	
	this.paint=function(ctx)
	{
		ctx.moveTo(this.x+this.width/2, this.y+this.height/2);
		
		for(var i in this.neighbours)
		{
			var nx=this.neighbours[i].vertex.x+this.neighbours[i].vertex.width/2;
			var ny=this.neighbours[i].vertex.y+this.neighbours[i].vertex.height/2
			ctx.lineTo(nx, ny);
			
			ctx.fillText(this.neighbours[i].char==null?'λ':this.neighbours[i].char, (this.x+nx)/2, (this.y+ny)/2);
		}
		
		ctx.stroke();
		
		ctx.fillText(this.name, this.x, this.y);
	}
}

VERTEX_WIDTH=12; VERTEX_HEIGHT=26;
EDGE_LENGTH=60;

function Structure(start, end)
{
	this.start=start; this.end=end;
	var x=0, y=0;
	
	this.width=this.height=0;
	
	var inners=[];
	
	Object.defineProperty(this, 'x', {
		get: function() { return x; },
		set: function(value)
		{
			var d=value-x;
			x=value;
			for(var i in inners)
			{
				inners[i].x+=d;
			}
		}
	});
	Object.defineProperty(this, 'y', {
		get: function() { return y; },
		set: function(value)
		{
			var d=value-y;
			y=value;
			for(var i in inners)
			{
				inners[i].y+=d;
			}
		}
	});
	
	this.addChild=function(child)
	{
		inners.push(child);
	}
	this.addChildren=function(children)
	{
		for(var x in children) { inners.push(children[x]); }
	}
	
	this.paint=function(ctx)
	{
		ctx.strokeRect(x, y, this.width, this.height);
		
		for(var x in inners)
		{
			inners[x].paint(ctx);
		}
	}
}

function createSimpleLiteral(from, to, transitChar, x, y)
{
	var s=new Structure(from, to);
	from.x=x; from.y=y;
	to.x=x+EDGE_LENGTH+VERTEX_WIDTH; to.y=y;
	from.addNeighbour(transitChar, to);
	
	s.addChild(from); s.addChild(to);
	
	s.x=x; s.y=y;
	s.width=EDGE_LENGTH+VERTEX_WIDTH*2;
	s.height=VERTEX_HEIGHT;
	return s;
}

function createCycle(head, innerStructure, x, y)
{
	innerStructure.x=x;
	innerStructure.y=y+innerStructure.width/2;
	
	head.x=x+innerStructure.width/2
	head.y=y;
	
	var s=new Structure(head, head);
	
	s.addChild(head);
	s.addChild(innerStructure);
	
	head.addNeighbour(null, innerStructure.start);
	innerStructure.end.addNeighbour(null, head);
	
	s.width=innerStructure.width;
	s.height=innerStructure.height+innerStructure.width/2;
	return s;
}

// returns the least x coordinate of all available within the 'structures'
function getLeftRim(structures)
{
	var left=null;
	for(var x in structures)
	{
		if(left==null || structures[x].x<left) left=structures[x].x;
	}
	return left;
}
// returns the least y coordinate of all available within the 'structures'
function getTopRim(structures)
{
	var top=null;
	for(var x in structures)
	{
		if(top==null || structures[x].y<top) top=structures[x].y;
	}
	return top;
}
// returns the largest x coordinate of all available within the 'structures'
function getRightRim(structures)
{
	var right=null;
	for(var x in structures)
	{
		if(right==null || structures[x].x>right) right=structures[x].x;
	}
	return right;
}
// returns the largest y coordinate of all available within the 'structures'
function getBottomRim(structures)
{
	var bottom=null;
	for(var x in structures)
	{
		if(bottom==null || structures[x].y>bottom) bottom=structures[x].y;
	}
	return bottom;
}


function createConcatenation(innerStructures, before, after, x, y)
{
	var s=new Structure(before, after);
	s.x=x; s.y=y;
	
	before.x=x; before.y=y;
	
	var penx=x+EDGE_LENGTH;
	
	before.addNeighbour(null, innerStructures[0].start);
	innerStructures[0].x=penx; innerStructures[0].y=y;
	penx+=innerStructures[0].width+EDGE_LENGTH;
	for(var i=1; i<innerStructures.length; i++)
	{
		innerStructures[i-1].end.addNeighbour(null, innerStructures[i].start);
		
		innerStructures[i].x=penx; innerStructures[i].y=y;
		penx+=innerStructures[i].width+EDGE_LENGTH;
	}
	innerStructures[innerStructures.length-1].end.addNeighbour(null, after);
	
	after.x=penx;
	after.y=y;
	
	s.addChild(before); s.addChild(after);
	s.addChildren(innerStructures);
	
	return s;
}

function createParallels(innerStructures, before, after, x, y)
{
	var s=new Structure(before, after);
	s.x=x; s.y=y;
	
	before.x=x; before.y=y;
	
	var penx=x+EDGE_LENGTH;
	var peny=y;
	var maxw=0;
	
	for(var i=0; i<innerStructures.length; i++)
	{
		before.addNeighbour(null, innerStructures[i].start);
		innerStructures[i].end.addNeighbour(null, after);
		
		innerStructures[i].x=penx;
		innerStructures[i].y=peny;
		if(innerStructures[i].width>maxw) maxw=innerStructures[i].width;
		
		peny+=innerStructures[i].height+EDGE_LENGTH;
	}
	
	after.x=x+2*EDGE_LENGTH+maxw;
	after.y=y;
	
	s.addChild(before); s.addChild(after);
	s.addChildren(innerStructures);
	
	return s;
}

/*
	** Document onLoad callback
	**
	** Initializes everything that can be initialized
	** only after the document has been loaded, including
	** callbacks.
*/
window.onload=function()
{
	byId('sec1_calc_btn').onclick=function()
	{
		// creating output
		var out=createOutput('regexpr_output');
		
		// getting input and generating values
		var code=byId('group').value*1+byId('std_number').value*1;
		out.puts('№'+sub('вар')+' = '+code+', ');
		var n=[0, 0, 0, 0, 0, 0, 0, 0];
		for(var i=0; i<8; i++)
		{
			n[i]=code%2;
			code=Math.floor(code/2);
		}
		
		out.putl('bin(n) = ' + (n.reverse()).join(''));
		n.reverse();
		out.puts('n'+sub('i')+': [');
		var s='';
		for(var i=0; i<8; i++)
		{
			s+=' n'+sub(i)+' = '+n[i]+',';
		}
		s=s.substr(0, s.length-1)+' ]';
		out.putl(s);
		
		// creating regex:
		out.puts('regexpr: ');
		
		var f=function(bit) { return bit==1?'1':'*'; }
		var g=function(bit) { return bit==1?'&middot;':'+'; }
		var not=function(bit) { return 1-bit; }
		var or=function(bit1, bit2) { return bit1==1 || bit2==1; }
		var a='a', b='b', cct='&middot;';
		
		var regex='';
		
		regex+=(brackets( a+sup( f(n[0]) )+g(n[1])+b+sup( f(n[2]) ) )); regex+=(sup( f(not(n[2])) ));
		regex+=(g( or( not(n[1]), n[0] ) ));
		regex+=(brackets( a+cct+b+sup( f(n[3]) ) )); regex+=(sup( f(n[4]) ));
		regex+=( g(n[5]) );
		regex+=(brackets( b+g(n[6])+a+sup( f(n[7]) ) )); regex+=(sup( f( not(n[7]) ) ));
		regex+=( g( not(n[5]) )+b );
		
		out.putl(regex);
		
		// formalizing regex to build a graph
		regex=regex.replace(/\<span class\=\"big\-brackets\"\>/g, '(').replace(/\<\/span\>/g, ')');
		regex=regex.replace(/<sup>1<\/sup>/g, '').replace(/<sup>\*<\/sup>/g, '*').replace(/\&middot\;/g, '.');
		console.log(regex);
		
		byId('reg_expr').value=regex;
	}
	
	byId('sec2_calc_btn').onclick=function()
	{	
		// some help functions to split down the regex by operators '+', '*' and '.'
		var isUnary=function(operator)
		{
			return operator == '*';
		}
		var unwrapExpr=function(expr)
		{
			while(expr[0]=='(' && expr[expr.length-1]==')')
			{
				expr=expr.substring(1, expr.length-1);
			}
			return expr;
		}
		var defineOuterOperator=function(expr)
		{
			// wiping everything inside brackets (as potentially more high-prior operators)
			expr=expr.replace(/\(.*?\)/g, '');
			if(expr.indexOf('+')!=-1)
			{
				// if we've got a '+', it's 100% outer
				return '+';
			}
			else if(expr.indexOf('.')!=-1)
			{
				// nope, but there is a '.' - that's our choose!
				return '.';
			}
			else
			{
				// nope... is it '*'?
				if(expr[expr.length-1]=='*') return '*';
				
				// it may be just wrapped expression
				if(expr[0]=='(') return defineOuterOperator(unwrapExpr(expr));
				
				// seems to be just a literal,
				return null;
			}
		}
		var spdown=function(expr)
		{
			var result={ operator:null, operands:[] };
			
			expr=unwrapExpr(expr);
			result.operator=defineOuterOperator(expr);
			
			if(result.operator==null)
			{
				// literal found, stop recursion
				result.operands=[expr];
				return result;
			}
			
			if(isUnary(result.operator))
			{
				operator=expr[expr.length-1];
				result.operands.push(expr.substr(0, expr.length-1));
			}
			else
			{
				var level=0; // diving deep into the brackets...
				var startIndex=0;
				for(var i=0; i<expr.length; i++)
				{
					if(expr[i]==')') level--;
					if(expr[i]=='(') level++;
					
					if(level>0)
					{
						continue;
					}
					
					if(expr[i]==result.operator)
					{
						result.operands.push(expr.substring(startIndex, i));
						startIndex=i+1;
					}
				}
				result.operands.push(expr.substring(startIndex, expr.length));
			}
			
			for(var x in result.operands)
			{
				// recursion moves deeper...
				result.operands[x]=spdown(result.operands[x]);
			}
			
			return result;
		}
		
		var regex=byId('reg_expr').value;
		
		//try
		//{
			var model=spdown(regex);
		//}
		//catch(e) { console.log(e); }
		
		var g=createContext('graph');
		var penx, peny;
		
		g.fillStyle='#000';
		g.textBaseline='top';
		g.font='16px Consolas, sans-serif';
		g.strokeStyle='#f00';
		//g.fillText('Мне лень', 10, 10);
		
		var _cl=0;
		function genLetter()
		{
			return 'ABCDEFGHIJKLMNOPQRSTUVWXYZБГДЖЗИЛПУФЦЧШЪЫЭЮЯ'[_cl++];
		}
		
		var start=new Vertex('^', 10, 10); var end=new Vertex('$', 0, 0);
		var buildNode=function(model, x, y, start, end)
		{
			console.log(model);
			switch(model.operator)
			{
				case null:
				
				return createSimpleLiteral(start, end, model.operands[0], x, y);
				
				case '*':
					var inners=[];
					for(var i in model.operands)
					{
						inners.push(buildNode(model.operands[i],
						x, y,
						new Vertex(genLetter(), x, y), new Vertex(genLetter(), x, y)));
					}
					var head=new Vertex(genLetter(), 0, 0);
					start.addNeighbour(null, head);
					head.addNeighbour(null, inners[0].start);
					inners[0].end.addNeighbour(null, head);
					head.addNeighbour(null, end);
					var cycle=createCycle(head, inners[0], x, y);
					var result=new Structure(start, end);
					result.addChildren([start, end, cycle]);
					result.x=x; result.y=y;
				return result;
				
				case '.':
					var inners=[];
					for(var i in model.operands)
					{
						inners.push(buildNode(model.operands[i],
						x, y,
						new Vertex(genLetter(), x, y), new Vertex(genLetter(), x, y)));
					}
				return createConcatenation(inners, start, end, x, y);
			}
		}
		
		var struct=buildNode(model, 10, 10, start, end);
		struct.paint(g);
	}
}