
// Variables
const	Grapher=	(function()	{
	// Variables
	let	is2D=	true;
	let	canvas=	null;
	let	context2d=	null;
	let	canvasBounds=	null;
	let	wrt=	"x_y";
	const	init=	function(id)	{
		canvas=	document.getElementById(id);
		context2d=	canvas.getContext("2d");
		canvasBounds=	new GraphBounds(0, canvas.clientWidth, 0, canvas.clientHeight, 0, 1);
		
		render();
	};
	const	resize=	function(id)	{
		canvasBounds=	new GraphBounds(0, canvas.clientWidth, 0, canvas.clientHeight, 0, 1);
		canvas.width=	canvas.clientWidth;
		canvas.height=	canvas.clientHeight;
		render();
	};
	const	render=	function()	{
		requestAnimationFrame(render);
		
		if(is2D)	{
			if(!GraphRegistry.tabs[wrt])
				return;
			
			// Variables
			let	curves=	GraphRegistry.tabs[wrt].curves;
			 
			context2d.strokeStyle=	"#fff";
			context2d.lineWidth=	2;
			context2d.beginPath();
			for(let c= 0; c< curves.length; c++)	{
				for(let d= 0; d< curves[c].mesh.length; d++)	{
					if(d== 0)
						context2d.moveTo(curves[c].mesh[d].x, curves[c].mesh[d].y);
					else
						context2d.lineTo(curves[c].mesh[d].x, curves[c].mesh[d].y);
				}
			}
			context2d.stroke();
		}
	};
	const	create2DCurve=	function(eq, a, b, s, bounds)	{
		// Variables
		const	f=	eq.getFunction();
		let	pts=	[];
		let	x;
		let	fx;
		
		for(let i= 0; i<= s; i++)	{
			x=	i*(b-a)/s+a;
			fx=	f(x);
			// TODO: Scale this by multiplying it by the canvas' width and height
			// it is already in between 0 and 1.
			pts.push(new Vector(
				pointToCanvas(x, bounds, 0)*canvas.width,
				(1-pointToCanvas(fx, bounds, 1))*canvas.height
			));
		}
		
		return pts;
	};
	const	pointToCanvas=	function(x, bounds, id)	{
		if(id== 0)	return (x-bounds.left)/(bounds.right-bounds.left);
		if(id== 1)	return (x-bounds.bottom)/(bounds.top-bounds.bottom);
		if(id== 2)	return (x-bounds.near)/(bounds.far-bounds.near);
		
		return x;
	};
	
	// --- Objects ---
	
	function Vector(__x, __y, __z)	{
		this.x=	__x;
		this.y=	__y;
		this.z=	__z || 0;
	}
	Vector.prototype.add=	function(vec)	{	return new Vector(this.x+vec.x, this.y+vec.y, this.z+vec.z);	};
	Vector.prototype.sub=	function(vec)	{	return new Vector(this.x-vec.x, this.y-vec.y, this.z-vec.z);	};
	Vector.prototype.mult=	function(scalar)	{	return new Vector(scalar*this.x, scalar*this.y, scalar*this.z);	};
	Vector.prototype.div=	function(scalar)	{	return this.mult(1/scalar);	};
	Vector.prototype.perp2d=	function()	{	return new Vector(this.y, -this.x);	};
	Vector.prototype.magnitudeSquared=	function()	{	return (this.x*this.x+this.y*this.y+this.z*this.z);	};
	Vector.prototype.magnitude=	function()	{	return Math.sqrt(this.magnitudeSquared());	};
	Vector.prototype.normalized=	function()	{
		// Variables
		const	m=	this.magnitudeSquared();
		
		if(m== 1)
			return new Vector(this.x, this.y, this.z);
		if(m== 0)
			return new Vector(0, 0, 0);
		
		return new Vector(this.x/m, this.y/m, this.z/m);
	};
	Vector.prototype.normalize=	function()	{
		// Variables
		const	m=	this.magnitudeSquared();
		
		if(m== 1 || m== 0)
			return;
		this.x/=	m;
		this.y/=	m;
		this.z/=	m;
	};
	Vector.prototype.cross=	function(vec)	{
		return new Vector(
			this.y*vec.z-this.z*vec.y,
			this.z*vec.x-this.x*vec.z,
			this.x*vec.y-this.y*vec.z
		);
	};
	
	function GraphBounds(__l, __r, __b, __t, __n, __f)	{
		this.left=	__l;
		this.right=	__r;
		this.bottom=	__b;
		this.top=	__t;
		this.near=	__n;
		this.far=	__f;
	}
	
	return {
		GraphBounds:	GraphBounds,
		Vector:	Vector,
		init:	init,
		resize:	resize,
		create2DCurve:	create2DCurve,
		updateGraph:	render
	};
})();

window.addEventListener("load", function()	{
	Grapher.init("graph-canvas");
	Grapher.resize("graph-canvas");
});

window.addEventListener("resize", function()	{
	Grapher.resize("graph-canvas");
});