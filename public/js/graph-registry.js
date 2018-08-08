
// Variables
const	GraphRegistry=	(function()	{
	// Variables
	const	tabs=	{};
	const	getWrt=	function(eq)	{
		// Variables
		let	wrts=	[];
		const	comps=	[];
		
		eq.getComponents(comps);
		
		if(comps.length== 1)	{
			if(comps[0]== 'y')	comps.push('x');
			else	comps.push('y');
			sort(comps);
		}	
		
		switch(comps.length)	{
			case 2:	{
				wrts.push({
					str:	comps[0]+"_"+comps[1],
					vars:	[comps[0], comps[1]]
				});
			}break;
			case 3:	{
				wrts.push({
					str:	comps[0]+"_"+comps[1],
					vars:	[comps[0], comps[1]]
				});
				wrts.push({
					str:	comps[0]+"_"+comps[2],
					vars:	[comps[0], comps[2]]
				});
				wrts.push({
					str:	comps[1]+"_"+comps[2],
					vars:	[comps[1], comps[2]]
				});
				wrts.push({
					str:	comps[0]+"_"+comps[1]+"_"+comps[2],
					vars:	[comps[0], comps[1], comps[2]]
				});
			}break;
		}
		
		return wrts;
	};
	const	sort=	function(a)	{
		for(let i= a.length-2; i>= 0; i--)	{
			if(a[i].localeCompare(a[i+1])> 0)	{
				// Variables
				const	temp=	a[i];
				
				a[i]=	a[i+1];
				a[i+1]=	temp;
			}
			else
				break;
		}
	};
	const	addEquation=	function(id, eq)	{
		// Variables
		const	wrts=	getWrt(eq);
		
		for(let i= 0; i< wrts.length; i++)	{
			if(!tabs[wrts[i].str])	{
				tabs[wrts[i].str]=	new Tab();
			}
			
			tabs[wrts[i].str].addCurves(id, eq);
		}
	};
	
	function Tab()	{
		this.bounds=	new Grapher.GraphBounds(-10, 10, -10, 10, -10, 10);
		this.curves=	[];
		this.curveIDs=	{};
	}
	Tab.prototype.addCurves=	function(id, eq)	{
		if(this.curveIDs[id]!= undefined)	{
			this.curves.splice(this.curveIDs[id], 1);
			delete this.curveIDs[id];
		}
		
		// Variables
		const	curve=	{
			id:	id,
			mesh:	Grapher.create2DCurve(
				eq,
				this.bounds.left,
				this.bounds.right,
				100,
				this.bounds
			)
		};
		
		this.curveIDs[id]=	this.curves.length;
		this.curves.push(curve);
	};
	
	return {
		Tab:	Tab,
		tabs:	tabs,
		addEquation:	addEquation
	};
})();