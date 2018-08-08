
window.addEventListener("load", function()	{
	// Variables
	const	exits=	document.getElementsByClassName("modal-exit");
	
	for(var i= 0; i< exits.length; i++)	{
		exits[i].addEventListener("click", function(args)	{
			hideModal(args.target.parentElement.id);
		});
	}
});

function showModal(modalID)	{
	// Variables
	const	modal=	document.getElementById(modalID);
	
	modal.style.display=	"block";
}

function hideModal(modalID)	{
	// Variables
	const	modal=	document.getElementById(modalID);
	
	modal.style.display=	"none";
}