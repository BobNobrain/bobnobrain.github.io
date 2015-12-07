byId=function(id) { return document.getElementById(id); }

keywords=[
	{
		keys: /([^A-z)-9]|^)(function|var|new)(?![A-z0-9])/g,
		result: '$1<span>$2</span>'
	}
];

window.onload=function()
{
	window.textBox=byId('textbox');
	
	byId('btn').onclick=function()
	{
		/*var text=textBox.innerHTML;
		
		for(var x in keywords)
		{
			
			text=text.replace(keywords[x].keys, keywords[x].result);
		}
		textBox.innerHTML=text;*/
		
		console.log(window.getSelection());
	}
}