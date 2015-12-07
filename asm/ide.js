el=function(id){return document.getElementById(id);}

window.addEventListener('load', function()
{
	window.controls =
	{
		codeBox: el('code-box'),
		binBox: el('bin-box'),
		registers:
		{
			a: el('reg_a'),
			b: el('reg_b'), c: el('reg_c'),
			d: el('reg_d'), e: el('reg_e'),
			h: el('reg_h'), l: el('reg_l')
		},
		mem: el('mem-display'),
		
		buttons:(function(){
			var menuitems=el('menu').children;
			var memCtrls=el('mem-display-control').getElementsByTagName('button');
			return {
				translate: menuitems[0], run: menuitems[1],
				runStepByStep: menuitems[2], stepForward: menuitems[3], stop: menuitems[4],
				
				jumpTo2100: memCtrls[0], jumpTo2200: memCtrls[1], jumpTo2300: memCtrls[2]
			};
		})(),
		
		indicators:(function(){
			var inds=el('registers').getElementsByClassName('indicator');
			return {
				OVR: inds[0], HLT: inds[1], ADR: inds[2], ERR: inds[3],
				enable: function(list)
				{
					for(var x in this)
					{
						if(typeof this[x]==typeof this.OVR)
						{
							if(list.indexOf(x)!=-1)
								this[x].classList.add('active');
							else
								this[x].classList.remove('active');
						}
					}
				}
			 };
		})()
	};
	
	var hilightCode=function(codeBox)
	{
		console.log(codeBox.innerHTML);
		var plain=codeBox.innerHTML	.replace(/<br( *\/?)?>/g,	'\n')
									.replace(/&nbsp;/g,			' '	)
									.replace(/<.*?>/g,			''	);
		
		// ска, нельзя проверить, есть ли на элементе фокус -_- ссаный DOM и жаваскрипт
		// предположим, что он есть
		var selRng=window.getSelection().getRangeAt(0);
		// надо определить индекс каретки в тексте и запомнить его, чтобы потом снова вставить его в нужное место
		// да ну нахер...
		
		
		plain=plain.replace(/(MOV|MVI|MVX|MVI|LXI|ADD|ADC|ADB|CALL|RET)/g, '<b>$1</b>');
		plain=plain.replace(/ ([A-EHL])([^A-EHL])/g, ' <u>$1</u>$2');
		plain=plain.replace(/ (BC|DE|HL)([^A-EHL])/g, ' <i>$1</i>$2');
		plain=plain.replace(/ ([0-9]+|[0-9A-Fa-f]*?h)/g, ' <em>$1</em>');
		
		plain=plain.replace(/ /g, '&nbsp;').replace(/\n/g, '<br />').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
		
		codeBox.innerHTML=plain;
		console.log(plain);
	}
	
	window.controls.codeBox.addEventListener('keydown', function(ev)
	{
		//console.log(ev);
		var cb=window.controls.codeBox;
		
		if(ev.keyCode==9)
		{
			// Добавляем возможность нажатия Tab
			ev.preventDefault();
			
			var sel=window.getSelection();
			if(sel.isCollapsed)
			{
				// пустое выделение, вставляем 4 пробела
				start=sel.getRangeAt(0).startContainer;
				soffset=sel.getRangeAt(0).startOffset;
				if(start.nodeName=='#text')
				{
					console.log(start);
					window.start=start;
					start.nodeValue=start.nodeValue.substring(0, soffset)+'\t'+
									start.nodeValue.substring(soffset, start.nodeValue.length);
					
					sel.getRangeAt(0).setStart(start, soffset+1);
				}
			}
		}
		
		if(ev.keyCode==13 || true)
		{
			hilightCode(cb);
		}
	});
});