
// Variables
const	eqentries=	document.getElementsByClassName("equation-entries")[0];
const	entries=	[];
let	currEntry=	null;
let	textID=	0;

window.addEventListener("load", function()	{
	// Variables
	const	eqlist=	document.getElementsByClassName("equation-list")[0];
	const	eqtoggle=	document.getElementsByClassName("equation-toggle")[0];
	const	eqsetting=	document.getElementsByClassName("equation-settings")[0];
	const	eqhelp=	document.getElementsByClassName("equation-help")[0];
	const	addeqbtn=	document.getElementsByClassName("add-equation-entry")[0];
	const	graphcanvas=	document.getElementById("graph-canvas");
	const	eqpantries=	document.getElementsByClassName("entry-pantry");
	const	h2=	window.innerHeight-24;
	
	graphcanvas.style.height=	h2+"px";
	//eqlist.style.clip=	"rect(0px, "+(100+eqlist.clientWidth)+"px, 0px, 0px)";
	
	addeqbtn.addEventListener("click", function(args)	{
		addNewEntry();
	});
	
	eqhelp.addEventListener("click", function(args)	{
		showModal("help-modal");
	});
	
	eqsetting.addEventListener("click", function(args)	{
		showModal("settings-modal");
	});
	
	eqtoggle.addEventListener("click", function(args)	{
		//	Variables
		const	h=	window.innerHeight-24;

		if(!eqlist.style.height || eqlist.style.height== "0px")	{
			//eqlist.style.clip=	"rect(0px, "+eqlist.clientWidth+"px, "+h+"px, 0px)";
			eqlist.style.height=	h+"px";
			eqtoggle.style.top=	h+"px";
			eqsetting.style.top=	h+"px";
			eqhelp.style.top=	h+"px";
		}	else	{
			//eqlist.style.clip=	"rect(0px, "+eqlist.clientWidth+"px, 0px, 0px)";
			eqlist.style.height=	"0px";
			eqtoggle.style.top=	"0px";
			eqsetting.style.top=	"0px";
			eqhelp.style.top=	"0px";
		}
	});
	
	addNewEntry();
});

window.addEventListener("resize", function(args)	{
	//	Variables
	const	h=	window.innerHeight-24;
	const	graphcanvas=	document.getElementById("graph-canvas");
	const	eqlist=	document.getElementsByClassName("equation-list")[0];
	const	eqtoggle=	document.getElementsByClassName("equation-toggle")[0];
	const	eqsetting=	document.getElementsByClassName("equation-settings")[0];
	const	eqhelp=	document.getElementsByClassName("equation-help")[0];
	
	graphcanvas.style.height=	h+"px";
	/*eqhelp.style.transition=	"";
	eqsetting.style.transition=	"";
	eqtoggle.style.transition=	"";*/
	if(!eqlist.style.height || eqlist.style.height== "0px")	{
		//eqlist.style.clip=	"rect(0px, "+eqlist.clientWidth+"px, 0px, 0px)";
		console.log("Not Open");
	}
	else	{
		//eqlist.style.clip=	"rect(0px, "+eqlist.clientWidth+"px, "+h+"px, 0px)";
		eqlist.style.height=	h+"px";
		eqtoggle.style.top=	h+"px";
		eqsetting.style.top=	h+"px";
		eqhelp.style.top=	h+"px";
		console.log("Open");
	}
	/*setTimeout(function(){
		eqhelp.style.transition=	"";
		eqsetting.style.transition=	"";
		eqtoggle.style.transition=	"";
	})*/
});

function addNewEntry()	{
	// Variables
	let	node=	document.createElement("div");
	let	pantry=	document.createElement("div");
	let	text=	document.createElement("input");
	let	entry=	{
		index:	entries.length,
		node:	node
	};
	let	timer=	null;
	
	node.classList.add("equation-entry");
	pantry.classList.add("entry-pantry");
	pantry.classList.add("far");
	pantry.classList.add("fa-newspaper");
	text.classList.add("entry-text");
	text.id=	"entry_"+(textID++);
	text.placeholder=	"Type in Equation...";
	pantry.addEventListener("click", function(args)	{
		setupPantry(entry);
		showModal("pantry-modal");
	});
	text.addEventListener("keyup", function(args)	{
		if(timer!= null)
			clearTimeout(timer);
		timer=	setTimeout(function()	{
			GraphRegistry.addEquation(
				args.target.id,
				PAML.createExpression(args.target.value)
			);
			Grapher.updateGraph();
		}, 1500);
		// TODO: Re-render here
	});
	node.appendChild(pantry);
	node.appendChild(text);
	
	eqentries.appendChild(node);
	entries.push(entry);
}

function removeEntry(entry)	{
	// Variables
	const	e=	entries[entry.index];
	
	eqentries.removeChild(e.node);
	entries.splice(entry.index, 1);
	for(let i= entry.index; i< entries.length; i++)	{
		entries[i].index--;
	}
}

function setupPantry(entry)	{
	// Variables
	const	pantry=	document.getElementById("pantry-modal");
	const	tabs=	pantry.getElementsByClassName("tabs")[0];
	let	del=	document.createElement("li");
	
	currEntry=	entry;
	// TODO: Setup pantry from the given entry
	if(tabs.lastChild.innerHTML!= "Delete Entry!")	{
		del.innerHTML=	"Delete Entry!";
		del.addEventListener("click", function(args)	{
			removeEntry(currEntry);
			hideModal("pantry-modal");
		});
		tabs.appendChild(del);
	}
}