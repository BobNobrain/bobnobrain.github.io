function parseNum(str)
{
	console.log(str);
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

function Port(addr)
{
	this.addr=addr;
	this.buffer=0;
}
Port.prototype.read=function()
{
	return Math.floor(Math.random()*255);
}
Port.prototype.write=function(d8)
{
	Emul.out('Port '+this.addr+'h received '+hex(d8));
	return d8;
}


Emul=
{
	stack: [],
	
	reg:
	{ A:0, B:0, C:0, D:0, E:0, H:0, L:0 },
	
	flags:
	{ Z: false, P: false, C:false, PE:false },
	setFlags:function()
	{
		this.flags.Z=this.reg.A==0;
		this.flags.P=this.reg.A>=0;
		this.flags.C=this.reg.A>255;
		this.flags.PE=(this.reg.A.toString(2).replace(/0/g, '').length)%2==0;
		return this.reg.A;
	},
	getFlag: function(flag)
	{
		switch(flag)
		{
			case 'NZ': 		return !this.flags.Z;
			case 'Z': 		return this.flags.Z;
			case 'NC': 		return !this.flags.C;
			case 'C': 		return this.flags.C;
			case 'PO': 		return !this.flags.PE;
			case 'PE': 		return this.flags.PE;
			case 'P': 		return this.flags.P;
			case 'M': 		return !this.flags.P;
		}
		throw new Error('Unknown flag "'+flag+'"!');
	},
	
	ports:{},
	
	commands: [],
	commandPointer: 0,
	jump: false,
	interval: 100,
	stopAddr: 0,
	jobID: -1,
	
	mem: [],
	memStart: dec('2280'),
	memRead: function(addr)
	{
		return Emul.mem[addr-this.memStart];
	},
	memSet: function(addr, value)
	{
		Emul.mem[addr-this.memStart]=value;
	},
	memoryDump: function()
	{
		
	},
	
	fn: {},
	
	outBuffer: [],
	out: function(msg)
	{
		this.outBuffer.push(msg);
	},
	flush: function()
	{
		output.innerHTML=this.outBuffer.join('\n');
		output.lastChild.scrollIntoView();
	},
	
	reset: function()
	{
		this.outBuffer=[];
		this.stack=[];
		this.commands=[];
		this.commandPointer=0;
	},
	
	run: function(start, stop)
	{
		for(var i=0; i<this.commands.length; i++)
		{
			if(this.commands.addr==start) this.commandPointer=i;
		}
		
		this.stopAddr=dec(stop);
		this.jobID=setInterval(function(){Emul.doStep();}, 200);
	},
	
	doStep: function()
	{
		if(this.commands[this.commandPointer].addr==this.stopAddr)
		{
			this.out(hex(this.stopAddr)+': <b>STOP addr reached</b>');
			this.flush();
			clearInterval(this.jobID);
			return;
		}
		
		this.jump=false;
		var cmd=this.commands[this.commandPointer];
		var code=hex(cmd.addr)+': '+cmd.action.toUpperCase()+' '+cmd.args.join(', ');
		
		for(var i=0; i<cmd.args.length; i++)
		{
			if(typeof cmd.args[i] != typeof '') continue;
			if(cmd.args[i].indexOf('#')==0)
			{
				for(var j=0; j<this.commands.length; j++)
				{
					if(this.commands[j].label==cmd.args[i].substring(1))
					{
						cmd.args[i]=j;
						break;
					}
				}
			}
		}
		
		console.log(code);
		var msg=this.fn[cmd.action].apply(this, cmd.args);
		if(!this.jump) this.commandPointer++;
		
		this.out(code+'; <b>'+msg+'</b>');
		this.flush();
	}
};

Object.defineProperty(Emul.reg, 'M', {
	enumerable: true, configurable: true,
	get: function(){ return Emul.memRead(Emul.reg.H*256+Emul.reg.L); },
	set: function(val) { Emul.memSet(Emul.reg.H*256+Emul.reg.L, val); }
});

/*
 * PORT <FB>
 *
*/
Emul.ports['FB']=new Port('FB');
Emul.ports['FB'].state={
	stopBits:'0',
	parityControl:'none',
	byteLength: 8,
	innerDivider: '1x',
	
	readReady:false, writeReady: false, writeEmpty: true,
	
	stopBitLost: false, parityError: false, overflow: false,
	
	receiveAllowed: false, sendAllowed: false,
	
	mode: true // mode or command
};
Emul.ports['FB'].read=function()
{
	var result=0;
	if(this.state.stopBitLost)	result|=32;
	if(this.state.overflow)		result|=16;
	if(this.state.parityError)	result|=8;
	
	if(this.state.writeEmpty)	result|=4;
	if(this.state.readReady)	result|=2;
	if(this.state.writeReady)	result|=1;
	
	if(Math.random()>0.9) result|=64;
	if(Math.random()>0.9) result|=128;
	
	return result;
}
Emul.ports['FB'].write=function(d8)
{
	if(this.state.mode)
	{
		switch(d8 & (128 | 64))
		{
			case 0:		this.state.stopBits='0';
						break;
			case 64:	this.state.stopBits='1';
						break;
			case 128:	this.state.stopBits='1,5';
						break;
			case (128|64):this.state.stopBits='2';
						break;
		}
		
		switch(d8 & (32 | 16))
		{
			case 16: this.state.parityControl='odd'; break;
			case 32|16: this.state.parityControl='even'; break;
			default: this.state.parityControl='none';
		}
		
		switch(d8 & (8 | 4))
		{
			case 0: this.state.byteLength='5'; break;
			case 4: this.state.byteLength='6'; break;
			case 8: this.state.byteLength='7'; break;
			case 8|4: this.state.byteLength='8'; break;
		}
		
		switch(d8 & (2 | 1))
		{
			case 0: this.state.innerDivider='sync'; break;
			case 1: this.state.innerDivider='1x'; break;
			case 2: this.state.innerDivider='16x'; break;
			case 2|1: this.state.innerDivider='64x'; break;
		}
		
		this.state.mode=false;
		
		Emul.out('-- IO CONFIGURATION SET --');
		Emul.out('Stop bits count: <b>'+this.state.stopBits+'</b>');
		Emul.out('Parity control: <b>'+this.state.parityControl+'</b>');
		Emul.out('Message length: <b>'+this.state.byteLength+' bits</b>');
		Emul.out('Internal divider: <b>'+this.state.innerDivider+'</b>');
	}
	else // command
	{
		if((d8 & 64)!=0) // reset
		{
			this.state={
				stopBits:'0',
				parityControl:'none',
				byteLength: 8,
				innerDivider: '1x',
				readReady:false, writeReady: false, writeEmpty: true,
				stopBitLost: false, parityError: false, overflow: false,
				receiveAllowed: false, sendAllowed: false,
				mode: true 
			};
			Emul.out('FB port received <b>reset</b> command!');
			return;
		}
		if((d8 & 16)!=0) // err flags reset
		{
			this.state.stopBitLost=this.state.parityError=this.state.overflow=false;
			Emul.out('FB port resets errors');
		}
		
		this.state.receiveAllowed=(d8 & 4)!=0;
		this.state.sendAllowed=(d8 & 1)!=0;
	}
}

Emul.ports['FA']=new Port('FA');
Emul.ports['FA'].read=function()
{
	if(!Emul.ports['FB'].state.receiveAllowed)
	{
		console.log('Read not allowed!');
		return 0;
	}
	Emul.ports['FB'].state.readReady=false;
	return this.buffer;
}
Emul.ports['FA'].write=function(d8)
{
	if(!Emul.ports['FB'].state.sendAllowed)
	{
		console.log('Write not allowed!');
		return;
	}
	Emul.ports['FB'].state.writeReady=false;
	Emul.ports['FB'].state.writeEmpty=false;
	setTimeout("Emul.ports['FB'].state.writeEmpty=true", 100);
	setTimeout("Emul.ports['FB'].state.writeReady=true", 150);
	Emul.out('<b>FA speaks: <u>'+hex(d8)+'</u>!</b>');
}



for(var i=Emul.memStart; i<dec('23FF'); i++)
{
	Emul.memSet(i, Math.floor(Math.random()*255));
}


Emul.fn.mov=function(to, from)
{
	return Emul.reg[to]=Emul.reg[from];
}
Emul.fn.mvi=function(reg, num)
{
	return Emul.reg[reg]=parseNum(num);
}
Emul.fn.lxi=function(rp, d16)
{
	d16=parseNum(d16);
	
	Emul.reg[rp[0]]=Math.floor(d16/256);
	Emul.reg[rp[1]]=d16%256;
	
	return d16;
}

Emul.fn.add=function(reg) { Emul.reg.A+=Emul.reg[reg]+(this.getFlag('C')?1:0); Emul.setFlags(); return this.reg.A=limitByte(Emul.reg.A); }
Emul.fn.sub=function(reg) { Emul.reg.A-=Emul.reg[reg]-(this.getFlag('C')?1:0); Emul.setFlags(); return this.reg.A=limitByte(Emul.reg.A); }

Emul.fn.adc=function(reg) { Emul.reg.A+=Emul.reg[reg]; Emul.setFlags(); return this.reg.A=limitByte(Emul.reg.A); }
Emul.fn.sbb=function(reg) { Emul.reg.A-=Emul.reg[reg]; Emul.setFlags(); return this.reg.A=limitByte(Emul.reg.A); }
Emul.fn.ana=function(reg) { Emul.reg.A&=Emul.reg[reg]; Emul.setFlags(); return this.reg.A=limitByte(Emul.reg.A); }
Emul.fn.xra=function(reg) { Emul.reg.A^=Emul.reg[reg]; Emul.setFlags(); return this.reg.A=limitByte(Emul.reg.A); }
Emul.fn.ora=function(reg) { Emul.reg.A|=Emul.reg[reg]; Emul.setFlags(); return this.reg.A=limitByte(Emul.reg.A); }
Emul.fn.cmp=function(reg) { Emul.reg.A-=Emul.reg[reg]; Emul.setFlags(); return this.reg.A=limitByte(Emul.reg.A); }


Emul.fn.inr=function(r)
{
	return Emul.reg[r]=limitByte(Emul.reg[r]+1);
}
Emul.fn.dcr=function(r)
{
	return Emul.reg[r]=limitByte(Emul.reg[r]-1);
}

Emul.fn.dad=function(rp)
{
	throw new Error('Not implemented yet');
}
Emul.fn.inx=function(rp)
{
	Emul.reg[rp[1]]++;
	if(Emul.reg[rp[1]]>255)
	{
		Emul.reg[rp[1]]-=256;
		Emul.reg[rp[0]]++;
		if(Emul.reg[rp[0]]>255)
		{
			Emul.reg[rp[1]]=0;
			Emul.reg[rp[0]]=0;
		}
	}
	return Emul.reg[rp[1]]+Emul.reg[rp[0]]*256;
}
Emul.fn.dcx=function(rp)
{
	Emul.reg[rp[1]]--;
	if(Emul.reg[rp[1]]<0)
	{
		Emul.reg[rp[1]]+=256;
		Emul.reg[rp[0]]--;
		if(Emul.reg[rp[0]]<0)
		{
			Emul.reg[rp[1]]=255;
			Emul.reg[rp[0]]=255;
		}
	}
	return Emul.reg[rp[1]]+Emul.reg[rp[0]]*256;
}

Emul.fn.aci=function(d8) { Emul.reg.A+=parseNum(d8); Emul.setFlags(); return Emul.reg.A=limitByte(Emul.reg.A); }
Emul.fn.sbi=function(d8) { Emul.reg.A-=parseNum(d8); Emul.setFlags(); return Emul.reg.A=limitByte(Emul.reg.A); }
		
Emul.fn.adi=function(d8) { Emul.reg.A+=parseNum(d8); Emul.reg.A%=256; return Emul.reg.A=limitByte(Emul.reg.A); }
Emul.fn.sui=function(d8) { Emul.reg.A-=parseNum(d8); Emul.reg.A%=256; return Emul.reg.A=limitByte(Emul.reg.A); }
Emul.fn.ani=function(d8) { Emul.reg.A&=parseNum(d8); Emul.setFlags(); return Emul.reg.A=limitByte(Emul.reg.A); }
Emul.fn.xri=function(d8) { Emul.reg.A^=parseNum(d8); Emul.setFlags(); return Emul.reg.A=limitByte(Emul.reg.A); }
Emul.fn.ori=function(d8) { Emul.reg.A|=parseNum(d8); Emul.setFlags(); return Emul.reg.A=limitByte(Emul.reg.A); }
Emul.fn.cpi=function(d8) { Emul.reg.A-=parseNum(d8); Emul.setFlags(); return Emul.reg.A=limitByte(Emul.reg.A); }

Emul.fn.daa=function(){throw new Error('Not implemented yet');}
Emul.fn.cma=function(){ this.reg.A=255^this.reg.A; }
Emul.fn.stc=function(){ this.flags.C=true; }
Emul.fn.cmc=function(){ this.flags.C=!this.flags.C; }
Emul.fn.rlc=function(){ this.reg.A=this.reg.A<<1; this.flags.C=this.reg.A>255; return this.reg.A=limitByte(this.reg.A); }
Emul.fn.rrc=function(){ this.reg.A=this.reg.A>>1; /*this.flags.C=this.reg.A==0;*/ return this.reg.A=limitByte(this.reg.A); }
Emul.fn.ral=function()
{
	this.reg.A=this.reg.A<<1;
	if(this.flags.C) this.reg.A|=1;
	return this.reg.A=limitByte(this.reg.A);
}
Emul.fn.rar=function()
{
	this.reg.A=this.reg.A<<1;
	if(this.flags.C) this.reg.A|=128;
	return this.reg.A=limitByte(this.reg.A);
}

Emul.fn.ldax=function(rp)
{
	return Emul.reg.A=Emul.memRead(Emul.reg[rp[1]]+Emul.reg[rp[0]]*256);
}
Emul.fn.lhld=function(addr)
{
	throw new Error('Not implemented yet');
}
Emul.fn.lda=function(addr)
{
	return Emul.reg.A=Emul.memRead(addr);
}
Emul.fn.stax=function(rp)
{
	Emul.memSet(Emul.reg[rp[1]]+Emul.reg[rp[0]]*256, Emul.reg.A);
	return Emul.reg.A;
}
Emul.fn.shld=function(addr)
{
	throw new Error('Not implemented yet');
}
Emul.fn.sta=function(addr)
{
	Emul.memSet(addr, Emul.reg.A);
	return Emul.reg.A;
}
Emul.fn.xchg=function(){ throw new Error('Not implemented yet'); }

Emul.fn.jmp=function(addr, condition)
{
	if(condition != '' && condition != undefined)
	{
		if(!Emul.flags[condition])
			return;
	}
	this.jump=true;
	Emul.commandPointer=addr;
	return addr;
}
Emul.fn.call=function(addr, condition)
{
	if(condition != '' && condition != undefined)
	{
		if(!Emul.getFlag(condition))
			return 'false';
	}
	this.jump=true;
	this.stack.push(this.commandPointer);
	this.commandPointer=addr;
	return hex(this.commands[addr].addr);
}
Emul.fn.ret=function(condition)
{
	if(condition != '' && condition != undefined)
	{
		if(!Emul.flags[condition])
			return;
	}
	return hex(this.commands[this.commandPointer=this.stack.pop()].addr);
}

Emul.fn.push=function(rp)
{
	Emul.stack.push(Emul.reg[rp[0]]*256+Emul.reg[rp[1]]);
	return Emul.reg[rp[0]]*256+Emul.reg[rp[1]];
}
Emul.fn.pop=function(rp)
{
	var r=Emul.stack.pop();
	Emul.reg[rp[0]]=Math.floor(r/256);
	Emul.reg[rp[1]]=r%256;
	return r/256;
}

Emul.fn.xthl=function(){throw new Error('Not implemented yet');}
Emul.fn.sphl=function(){throw new Error('Not implemented yet');}

Emul.fn.out=function(d8)
{
	Emul.ports[hex(parseNum(d8))].write(Emul.reg.A);
	return d8;
}
Emul.fn['in']=function(d8)
{
	return Emul.reg.A=Emul.ports[hex(parseNum(d8))].read();
}
Emul.fn.di=function(){return 'disabled';}
Emul.fn.ei=function(){return 'enabled';}
Emul.fn.nop=function(){return '-';}
Emul.fn.hlt=function(){throw new Error('PROGRAM HALTED');}
