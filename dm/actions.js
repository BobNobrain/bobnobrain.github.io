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
createContext=function(id) { return byId(id).getContext('2d'); }

/*
	** Formatting functions for formulas
*/
function sup(text){ return '<sup>'+text+'</sup>'; } // upper index
function sub(text){ return '<sub>'+text+'</sub>'; } // lower index
function neg(text){ return '<span class="strike-over">'+text+'</span>'; } // negation sign
function brackets(text){ return '<span class="big-brackets">'+text+'</span>'; } // group in big brackets

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
				result.operands=expr;
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
		
		g.fillStyle='#ff0000';
		g.textBaseline='top';
		g.font='16px Consolas, sans-serif';
		g.fillText('Мне лень', 10, 10);
		
		var drawNode=function(node)
		{
			switch(node.operator)
			{
				case null:
					// just single node
				break;
			}
		}
	}
}