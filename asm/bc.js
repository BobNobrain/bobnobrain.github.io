// bytecodes functions
// each function returns an array of hex-encoded bytes that represent it

BC={};

BC.mov=function(to, from)
{
	var byte=0;
	switch(to)
	{
		case 'A': byte=dec('78'); break;
		case 'B': byte=dec('40'); break;
		case 'C': byte=dec('48'); break;
		case 'D': byte=dec('50'); break;
		case 'E': byte=dec('58'); break;
		case 'H': byte=dec('60'); break;
		case 'L': byte=dec('68'); break;
		case 'M': byte=dec('70'); break;
		default: throw new Error('-to: incorrect register name!');
	}
	switch(from)
	{
		case 'A': byte+=7; break;
		case 'B': break;
		case 'C': byte+=1; break;
		case 'D': byte+=2; break;
		case 'E': byte+=3; break;
		case 'H': byte+=4; break;
		case 'L': byte+=5; break;
		case 'M': byte+=6; break;
		default: throw new Error('-from: incorrect register name!');
	}
	return [hex(byte)];
}
BC.mvi=function(reg, num)
{
	var byte='N';
	switch(reg)
	{
		case 'A': byte='3E'; break;
		case 'B': byte='06'; break;
		case 'C': byte='0E'; break;
		case 'D': byte='16'; break;
		case 'E': byte='1E'; break;
		case 'H': byte='26'; break;
		case 'L': byte='2E'; break;
		case 'M': byte='36'; break;
		default: throw new Error('-reg: incorrect register name!');
	}
	var result=bytes(num);
	result.unshift(byte);
	return result;
}
BC.lxi=function(rp, d16)
{
	var result=bytes(d16);
	switch(rp)
	{
		case 'BC': result.unshift('01'); break;
		case 'DE': result.unshift('11'); break;
		case 'HL': result.unshift('21'); break;
		case 'SP': result.unshift('31'); break;
		default: throw new Error('-rp: incorrect register pair name!');
	}
	return result;
}

var tmp=[	['add', '80'], ['adc', '88'], ['sub', '90'], ['sbb', '98'],
			['ana', 'A0'], ['xra', 'A8'], ['ora', 'B0'], ['cmp', 'B8'] ];

for(var x in tmp)
{
	BC[tmp[x][0]]=(function(start)
	{
		return function(r)
		{
			var byte=dec(start);
			switch(r)
			{
				case 'A': byte+=7; break;
				case 'B': break;
				case 'C': byte+=1; break;
				case 'D': byte+=2; break;
				case 'E': byte+=3; break;
				case 'H': byte+=4; break;
				case 'L': byte+=5; break;
				case 'M': byte+=6; break;
				default: throw new Error('-r: incorrect register name!');
			}
			return [hex(byte)];
		};
	})(tmp[x][1]);
}

BC.inr=function(r)
{
	var byte='N';
	switch(r)
	{
		case 'A': byte='3C'; break;
		case 'B': byte='04'; break;
		case 'C': byte='0C'; break;
		case 'D': byte='14'; break;
		case 'E': byte='1C'; break;
		case 'H': byte='24'; break;
		case 'L': byte='2C'; break;
		case 'M': byte='34'; break;
		default: throw new Error('-r: incorrect register name!');
	}
	return [byte];
}
BC.dcr=function(r)
{
	var byte='N';
	switch(r)
	{
		case 'A': byte='3D'; break;
		case 'B': byte='05'; break;
		case 'C': byte='0D'; break;
		case 'D': byte='15'; break;
		case 'E': byte='1D'; break;
		case 'H': byte='25'; break;
		case 'L': byte='2D'; break;
		case 'M': byte='35'; break;
		default: throw new Error('-r: incorrect register name!');
	}
	return [byte];
}

BC.dad=function(rp)
{
	switch(rp)
	{
		case 'BC': return ['09'];
		case 'DE': return ['19'];
		case 'HL': return ['29'];
		case 'SP': return ['39'];
		default: throw new Error('-rp: incorrect register pair name!');
	}
}
BC.inx=function(rp)
{
	switch(rp)
	{
		case 'BC': return ['03'];
		case 'DE': return ['13'];
		case 'HL': return ['23'];
		case 'SP': return ['33'];
		default: throw new Error('-rp: incorrect register pair name!');
	}
}
BC.dcx=function(rp)
{
	switch(rp)
	{
		case 'BC': return ['0B'];
		case 'DE': return ['1B'];
		case 'HL': return ['2B'];
		case 'SP': return ['3B'];
		default: throw new Error('-rp: incorrect register pair name!');
	}
}
tmp=[	['adi', 'C6'], ['aci', 'CE'], ['sui', 'D6'], ['sbi', 'DE'], 
		['ani', 'E6'], ['xri', 'EE'], ['ori', 'F6'], ['cpi', 'FE'] ];
for(var x in tmp)
{
	BC[tmp[x][0]]=(function(st)
	{
		return function(d8)
		{
			var result=bytes(d8);
			result.unshift(st);
			return result;
		}
	})(tmp[x][1]);
}

BC.daa=function(){return ['27'];}
BC.cma=function(){return ['2F'];}
BC.stc=function(){return ['37'];}
BC.cmc=function(){return ['3F'];}
BC.rlc=function(){return ['07'];}
BC.rrc=function(){return ['0F'];}
BC.ral=function(){return ['17'];}
BC.rar=function(){return ['1F'];}

BC.ldax=function(rp)
{
	switch(rp)
	{
		case 'BC': return ['0A'];
		case 'DE': return ['1A'];
		default: throw new Error('-rp: incorrect register pair name: for LDAX BC or DE only!');
	}
}
BC.lhld=function(addr)
{
	var result=bytes(addr);
	result.unshift('2A');
	return result;
}
BC.lda=function(addr)
{
	var result=bytes(addr);
	result.unshift('3A');
	return result;
}
BC.stax=function(rp)
{
	switch(rp)
	{
		case 'BC': return ['02'];
		case 'DE': return ['12'];
		default: throw new Error('-rp: incorrect register pair name: for STAX BC or DE only!');
	}
}
BC.shld=function(addr)
{
	var result=bytes(addr);
	result.unshift('22');
	return result;
}
BC.sta=function(addr)
{
	var result=bytes(addr);
	result.unshift('32');
	return result;
}
BC.xchg=function(){ return ['EB']; }

BC.jmp=function(addr, condition)
{
	var result=bytes(addr);
	switch(condition)
	{
		case '': case undefined: result.unshift('C3'); break;
		case 'NZ': 		result.unshift('C2'); break;
		case 'Z': 		result.unshift('CA'); break;
		case 'NC': 		result.unshift('D2'); break;
		case 'C': 		result.unshift('DA'); break;
		case 'PO': 		result.unshift('E2'); break;
		case 'PE': 		result.unshift('EA'); break;
		case 'P': 		result.unshift('F2'); break;
		case 'M': 		result.unshift('FA'); break;
	}
	return result;
}
BC.call=function(addr, condition)
{
	var result=bytes(addr);
	switch(condition)
	{
		case '': case undefined: result.unshift('CD'); break;
		case 'NZ': 		result.unshift('C4'); break;
		case 'Z': 		result.unshift('CC'); break;
		case 'NC': 		result.unshift('D4'); break;
		case 'C': 		result.unshift('DC'); break;
		case 'PO': 		result.unshift('E4'); break;
		case 'PE': 		result.unshift('EC'); break;
		case 'P': 		result.unshift('F4'); break;
		case 'M': 		result.unshift('FC'); break;
	}
	return result;
}
BC.ret=function(condition)
{
	switch(condition)
	{
		case '': case undefined: return ['C9']; break;
		case 'NZ': 		return ['C0']; break;
		case 'Z': 		return ['C8']; break;
		case 'NC': 		return ['D0']; break;
		case 'C': 		return ['D8']; break;
		case 'PO': 		return ['E0']; break;
		case 'PE': 		return ['E8']; break;
		case 'P': 		return ['F0']; break;
		case 'M': 		return ['F8']; break;
	}
}

BC.push=function(rp)
{
	switch(rp)
	{
		case 'BC': return ['C5'];
		case 'DE': return ['D5'];
		case 'HL': return ['E5'];
		case 'PSW': return ['F5'];
		default: throw new Error('-rp: incorrect register pair name!');
	}
}
BC.pop=function(rp)
{
	switch(rp)
	{
		case 'BC': return ['C1'];
		case 'DE': return ['D1'];
		case 'HL': return ['E1'];
		case 'PSW': return ['F1'];
		default: throw new Error('-rp: incorrect register pair name!');
	}
}

BC.xthl=function(){return ['E3'];}
BC.sphl=function(){return ['F9'];}

BC.out=function(d8)
{
	var result=bytes(d8);
	result.unshift('D3');
	return result;
}
BC['in']=function(d8)
{
	var result=bytes(d8);
	result.unshift('DB');
	return result;
}
BC.di=function(){return ['F3'];}
BC.ei=function(){return ['FB'];}
BC.nop=function(){return ['00'];}
BC.hlt=function(){return ['76'];}