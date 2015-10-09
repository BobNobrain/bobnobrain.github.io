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
	** Table class represents a table of n*m cells
	** with title for the whole table and for
	** every column and row.
	**
	** .rows and .cols fields store titles for columns and rows
	** .set() and .get() manipulate with cells values
	** .size() sets or returns (as {columns:n, rows:m}) table size
	** .toHTMLString() returns HTML markup of this table with its content
*/
CELL_DEFAULT_VALUE='&mdash;';
function Table(rows, cols, title)
{
	this.title=title;
	
	if(typeof rows == typeof 0)
	{
		this.rows=[];
		for(var i=0; i<rows; i++) this.rows.push('('+i+')');
	}
	else this.rows=rows;
	
	if(typeof cols == typeof 0)
	{
		this.cols=[];
		for(var i=0; i<cols; i++) this.cols.push('('+i+')');
	}
	else this.cols=cols;
	
	var numRows=this.rows.length;
	var numCols=this.cols.length;
	
	var cells=[];
	for(var row=0; row<numRows; row++)
	{
		cells.push([]);
		for(var col=0; col<numCols; col++)
		{
			cells[row].push(CELL_DEFAULT_VALUE);
		}
	}
	
	this.get=function(row, col)
	{
		if(row>=0 && col>=0) return cells[row][col]; // all indicies are positive, return a cell content
		if(row>=0) return cells[row]; // column index is negative, return the whole row
		if(col>=0)
		{ // row index is negative, return the whole column
			var result=[];
			for(var i=0; i<numRows; i++)
			{
				result.push(cells[i][col]);
			}
			return col;
		}
		// both indicies are negative, return all cells
		return cells;
	}
	
	this.set=function(content, row, col)
	{
		if(row>=0 && col>=0) cells[row][col]=content;
		else if(row>=0)
		{
			for(var i=0; i<numCols; i++)
			{
				cells[row][i]=content;
			}
		}
		else if(col>=0)
		{
			for(var i=0; i<numRows; i++)
			{
				cells[i][col]=content;
			}
		}
		else
		{
			for(var row=0; row<numRows; row++)
			{
				for(var col=0; col<numCols; col++)
				{
					cells[row][col]=content;
				}
			}
		}
	}
	
	this.size=function(newRowsCount, newColsCount)
	{
		if(arguments.length<2) return { rows: numRows, columns: numCols };
		
		// rows
		if(newRowsCount>numRows)
		{
			// expand
			for(var row=numRows; row<newRowsCount; row++)
			{
				cells.push([]);
				for(var col=0; col<numCols; col++)
				{
					cells[row].push(CELL_DEFAULT_VALUE);
				}
				
				this.rows.push('('+row+')');
			}
		}
		else
		{
			// contract
			cells.splice(newRowsCount, numRows-newRowsCount);
			this.rows.splice(newRowsCount, numRows-newRowsCount);
		}
		numRows=newRowsCount;
		
		// cols
		if(newColsCount>numCols)
		{
			// expand
			for(var col=numCols; col<newColsCount; col++)
			{
				for(var row=0; row<numRows; row++)
				{
					cells[row].push(CELL_DEFAULT_VALUE);
				}
				this.cols.push('('+col+')');
			}
		}
		else
		{
			// contract
			for(var row=0; row<numRows; row++)
			{
				cells[row].splice(newColsCount, numCols-newColsCount);
			}
			this.cols.splice(newColsCount, numCols-newColsCount);
		}
		numCols=newColsCount;
	}
	
	this.toHTMLString=function()
	{
		var html='<table><caption>'+this.title+'</caption><tbody><tr><th>&mdash;</th>';
		
		// columns captions
		for(var i=0; i<numCols; i++)
		{
			html+='<th>'+this.cols[i]+'</th>';
		}
		html+='</tr>';
		
		for(var row=0; row<numRows; row++)
		{
			html+='<tr><td>'+this.rows[row]+'</td>';
			for(var col=0; col<numCols; col++)
			{
				html+='<td>'+cells[row][col]+'</td>';
			}
			html+='</tr>';
		}
		html+='</tbody></table>'
		return html;
	}
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
		//ctx.moveTo(this.x+this.width/2, this.y+this.height/2);
		
		ctx.strokeStyle='#000';
		ctx.fillStyle='#000';
		ctx.lineWidth=2;
		for(var i in this.neighbours)
		{
			var edge=new Path2D();
			edge.moveTo(this.x+this.width/2, this.y+this.height/2);
			var nx=this.neighbours[i].vertex.x+this.neighbours[i].vertex.width/2;
			var ny=this.neighbours[i].vertex.y+this.neighbours[i].vertex.height/2
			edge.lineTo(nx, ny);
			ctx.stroke(edge);
			
			// drawing arrow
			var n = { 	x: nx-(this.x+this.width /2),
						y: ny-(this.y+this.height/2) };
			n.l=Math.sqrt(n.x*n.x+n.y*n.y);
			n.x/=n.l;
			n.y/=n.l;
			
			var p={ x: -n.y, y: n.x };
			
			var middle={ 	x: (this.x+this.width/2+nx)/2+n.x*ARROW_SIZE/2,
							y: (this.y+this.height/2+ny)/2+n.y*ARROW_SIZE/2 };
			
			var tr=new Path2D();
			tr.moveTo(middle.x, middle.y);
			tr.lineTo(middle.x-ARROW_SIZE*(n.x+p.x), middle.y-ARROW_SIZE*(n.y+p.y));
			tr.lineTo(middle.x-ARROW_SIZE*(n.x-p.x), middle.y-ARROW_SIZE*(n.y-p.y));
			ctx.fillStyle='#000';
			ctx.fill(tr);
			
			
			// drawing text
			middle.x-=n.x*ARROW_SIZE/2;
			middle.y-=n.y*ARROW_SIZE/2;
			
			ctx.fillStyle='#0CF';
			ctx.fillText(	this.neighbours[i].char==null?'λ':this.neighbours[i].char,
							middle.x,
							middle.y);
		}
		
		//ctx.stroke();
		
		var path=new Path2D();
		path.arc(this.x+VERTEX_WIDTH/2, this.y+VERTEX_HEIGHT/2, VERTEX_WIDTH, 0, Math.PI*2, false);
		ctx.fillStyle='#000';
		ctx.fill(path);
		
		//ctx.fillStyle='#fff';
		//ctx.fillText(this.name, this.x+4, this.y+4);
	}
	
	this.paintNames=function(ctx)
	{
		ctx.fillStyle='#fff';
		ctx.fillText(this.name, this.x+1, this.y+6);
	}
}

VERTEX_WIDTH=12; VERTEX_HEIGHT=26;
EDGE_LENGTH=100;
FONT_SIZE=16;
ARROW_SIZE=10;

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
		//ctx.strokeRect(x, y, this.width, this.height);
		
		for(var x in inners)
		{
			inners[x].paint(ctx);
		}
	}
	
	this.paintNames=function(ctx)
	{
		for(var x in inners)
		{
			inners[x].paintNames(ctx);
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
	
	head.x=x;//+innerStructure.width/2
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
	var maxh=innerStructures[0].height;
	
	before.addNeighbour(null, innerStructures[0].start);
	innerStructures[0].x=penx; innerStructures[0].y=y;
	penx+=innerStructures[0].width+EDGE_LENGTH;
	for(var i=1; i<innerStructures.length; i++)
	{
		innerStructures[i-1].end.addNeighbour(null, innerStructures[i].start);
		
		innerStructures[i].x=penx; innerStructures[i].y=y;
		penx+=innerStructures[i].width+EDGE_LENGTH;
		
		if(innerStructures[i].height>maxh) maxh=innerStructures[i].height;
	}
	innerStructures[innerStructures.length-1].end.addNeighbour(null, after);
	
	after.x=penx;
	after.y=y;
	
	s.addChild(before); s.addChild(after);
	s.addChildren(innerStructures);
	
	s.width=penx+VERTEX_WIDTH;
	s.height=maxh;
	
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
	var rightEndX=x;
	
	for(var i=0; i<innerStructures.length; i++)
	{
		before.addNeighbour(null, innerStructures[i].start);
		innerStructures[i].end.addNeighbour(null, after);
		
		innerStructures[i].x=penx;
		innerStructures[i].y=peny;
		if(innerStructures[i].width>maxw) maxw=innerStructures[i].width;
		
		if(innerStructures[i].end.x>rightEndX) rightEndX=innerStructures[i].end.x;
		
		peny+=innerStructures[i].height+EDGE_LENGTH;
	}
	
	for(var i=0; i<innerStructures.length; i++)
	{
		// moving right ends of inners as far right as we can
		innerStructures[i].end.x=rightEndX;
	}
	
	after.x=x+2*EDGE_LENGTH+maxw;
	after.y=y;
	
	s.addChild(before); s.addChild(after);
	s.addChildren(innerStructures);
	
	s.width=maxw+2*EDGE_LENGTH+VERTEX_WIDTH; s.height=peny;
	
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
			var pairs=[];
			
			for(var i=0; i<expr.length; i++)
			{
				if(expr[i]=='(')
				{
					var level=1;
					for(var j=i+1; j<expr.length; j++)
					{
						if(expr[j]=='(') level++;
						if(expr[j]==')')
						{
							if(level==1)
							{
								pairs.push({start:i, end:j});
								break;
							}
							else level--;
						}
					}
				}
			}
			
			var wrappingLevels=0;
			for(var i=0; i<pairs.length; i++)
			{
				if(pairs[i].start+pairs[i].end == expr.length-1)
				{
					wrappingLevels++;
				}
				else break;
			}
			
			return expr.substring(wrappingLevels, expr.length-wrappingLevels);
			
			
			/*while(expr[0]=='(' && expr[expr.length-1]==')')
			{
				expr=expr.substring(1, expr.length-1);
			}
			return expr;*/
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
					/*var head=new Vertex(genLetter(), 0, 0);
					start.addNeighbour(null, head);
					//head.addNeighbour('his', inners[0].start);
					//inners[0].end.addNeighbour('ieh', head);
					head.addNeighbour(null, end);
					var cycle=createCycle(head, inners[0], x, y);*/
					
					start.addNeighbour(null, end);
					var cycle=createCycle(start, inners[0], x, y);
					
					var result=new Structure(start, end);
					result.x=x; result.y=y;
					result.height=cycle.height;
					result.width=cycle.width;
					
					//start.x=x; start.y=y;
					end.x=x+result.width;
					end.y=y;
					
					// don't add start cause it's inside cycle
					result.addChildren([end, cycle]);
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
				
				case '+':
					var inners=[];
					for(var i in model.operands)
					{
						inners.push(buildNode(model.operands[i],
						x, y,
						new Vertex(genLetter(), x, y), new Vertex(genLetter(), x, y)));
					}
				return createParallels(inners, start, end, x, y);
			}
		}
		
		var struct=buildNode(model, 10, 10, start, end);
		
		if(byId('graph_auto_size').checked)
		{
			byId('graph_width').value=struct.width+40;
			byId('graph_height').value=struct.height+40;
			byId('resize_graph').onclick();
		}
		
		var g=createContext('graph');
		var penx, peny;
		g.fillStyle='#000';
		g.textBaseline='top';
		g.font=FONT_SIZE+'px bold Consolas, sans-serif';
		g.strokeStyle='#f00';
		
		struct.paint(g);
		struct.paintNames(g);
	}
	
	byId('resize_graph').onclick=function()
	{
		var canvas=byId('graph');
		canvas.width=byId('graph_width').value;
		canvas.height=byId('graph_height').value;
	}
}