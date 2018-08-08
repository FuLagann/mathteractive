
// TODO: 5x y returns 10 x y FIX PLOX
// TODO: 2x + 3 y returns 6 y + 4 x FIX PLOX

// Variables
const	PAML=	(function()	{
	// Objects
	const	ExpressionFlag=	{
		started:	0,
		plus:	1,
		minus:	2,
		multiply:	3,
		divide:	3,
		exponent:	5,
		function:	6,
		number:	7,
		other:	8,
		parenthStart:	9,
		parenthEnd:	10,
		space:	11
	};
	const	ExpressionType=	{
		unknown:	0,
		variable:	1,
		coefficient:	2,
		expression:	3,
		parenthesis:	3,
		operator:	4,
		constant:	5
	};
	const	Functions=	[
		{
			name:	"sin",
			jsExpression:	function(inside)	{	return "Math.sin("+inside+")";	},
			func:	function()	{	return Math.sin(arguments[0]);	},
			derivative:	function(inside, wrt)	{	return ExpressionHelper.derive(inside, wrt)+" cos("+inside+")";	}
		},
		{
			name:	"cos",
			jsExpression:	function(inside)	{	return "Math.cos("+inside+")";	},
			func:	function()	{	return Math.cos(arguments[0]);	},
			derivative:	function(inside, wrt)	{	return "-"+ExpressionHelepr.derive(inside, wrt)+" sin("+inside+")";	}
		},
		{
			name:	"tan",
			jsExpression:	function(inside)	{	return "Math.tan("+inside+")";	},
			func:	function()	{	return Math.tan(arguments[0]);	},
			derivative:	function(inside, wrt)	{	return ExpressionHelper.derive(inside, wrt)+" sec("+inside+")^2";	}
		},
		{
			name:	"csc",
			jsExpression:	function(inside)	{	return "(1.0/Math.sin("+inside+"))";	},
			func:	function()	{	return 1/Math.sin(arguments[0]);	},
			derivative:	function(inside, wrt)	{	return "-"+ExpressionHelper.derive(inside, wrt)+" cot("+inside+")csc("+inside+")";	}
		},
		{
			name:	"sec",
			jsExpression:	function(inside)	{	return "(1.0/Math.cos("+inside+"))";	},
			func:	function()	{	return 1/Math.cos(arguments[0]);	},
			derivative:	function(inside, wrt)	{	return ExpressionHelper.derive(inside, wrt)+" tan("+inside+")sec("+inside+")";	}
		},
		{
			name:	"cot",
			jsExpression:	function(inside)	{	return "(1.0/Math.tan("+inside+"))";	},
			func:	function()	{	return 1/Math.tan(arguments[0]);	},
			derivative:	function(inside, wrt)	{	return "-"+ExpressionHelper.derive(inside, wrt)+" csc("+inside+")^2";	}
		},
		{
			name:	"sqrt",
			jsExpression:	function(inside)	{	return "Math.sqrt("+inside+")";	},
			func:	function()	{	return Math.sqrt(arguments[0]);	},
			derivative:	function(inside, wrt)	{	return "1/2 ("+inside+")^(-1/2)";	}
		},
		{
			name:	"log",
			jsExpression:	function(inside)	{	return "Math.log("+inside+")";	},
			func:	function()	{	return Math.log(arguments[0]);	},
			derivative:	function(inside, wrt)	{	return "1/("+inside+")";	}
		},
		{
			name:	"ln",
			jsExpression:	function(inside)	{	return "Math.log("+inside+")";	},
			func:	function()	{	return Math.log(arguments[0]);	},
			derivative:	function(inside, wrt)	{	return "1/("+inside+")";	}
		}
	];
	function getFunctionByName(name)	{
		for(let i= 0; i< Functions.length; i++)	{
			if(Functions[i].name== name)	{
				return Functions[i];
			}
		}
		return null;
	}
	const	ExpressionHelper=	{
		getFlag:	function(c)	{
			if(c.charCodeAt(0)>= 48 && c.charCodeAt(0)<= 57)
				return ExpressionFlag.number;
			switch(c)	{
				case '+':	return ExpressionFlag.plus;
				case '-':	return ExpressionFlag.minus;
				case '*':	return ExpressionFlag.multiply;
				case '/':	return ExpressionFlag.divide;
				case '^':	return ExpressionFlag.exponent;
				case '#':	return ExpressionFlag.function;
				case '(':	return ExpressionFlag.parenthStart;
				case ')':	return ExpressionFlag.parenthEnd;
				case ' ':	return ExpressionFlag.space;
			}
			return ExpressionFlag.other;
		},
		reformat:	function(ascii)	{
			// Variables
			let	str=	ascii;
			
			for(let i= 0; i< Functions.length; i++)	{
				if(str.indexOf(Functions[i].name+" # ")!= -1)
					continue;
				str=	str.replace(Functions[i].name, " "+Functions[i].name+" # ");
			}
			
			return str;
		},
		build:	function(ascii, e)	{
			// Variables
			let	flag=	0, prevFlag=	0;
			let	bucketText=	"";
			let	scope=	0;
			let	isVariable=	false;
			
			for(let i= 0; i< ascii.length; i++)	{
				// Variables
				const	c=	ascii[i];
				
				prevFlag=	flag;
				flag=	this.getFlag(c);
				
				if(flag== ExpressionFlag.space) // Let's just ignore spaces for now
					continue;
				if(flag== ExpressionFlag.parenthStart)	scope++;
				else if(flag== ExpressionFlag.parenthEnd)	scope--;
				
				// If the signs are +- => - or -+ => -
				if(
					(flag== ExpressionFlag.plus && bucketText== "-") ||
					(flag== ExpressionFlag.minus && bucketText== "+")
				)	{
					bucketText=	"-";
					continue;
				}
				// If the signs are ++ => + or -- => +
				if(
					(flag== ExpressionFlag.plus && bucketText== "+") ||
					(flag== ExpressionFlag.minus && bucketText== "-")
				)	{
					bucketText=	"";
					continue;
				}
				if(flag!= prevFlag && flag<= ExpressionFlag.minus && scope== 0)	{
					if(prevFlag== ExpressionFlag.multiply)	{
						if(bucketText.length> 0 && bucketText[0]== '-')
							bucketText=	bucketText.substring(1);
						else
							bucketText=	"-"+bucketText;
						continue;
					}
					if(prevFlag> 0)	{
						if(bucketText.length> 0 && bucketText[0]!= '+' && bucketText[0]!= '-')
							bucketText=	"+"+bucketText;
						e.addBucket(this.reformat(bucketText.trim()));
						isVariable=	false;
					}
					bucketText=	c.toString();
				}
				else	{
					if(isVariable || (flag== ExpressionFlag.number && prevFlag== ExpressionFlag.other))	{
						isVariable=	true;
					}
					else if(flag!= prevFlag || flag== ExpressionFlag.parenthStart || flag== ExpressionFlag.parenthEnd)
						bucketText+=	" ";
					bucketText+=	c.toString();
				}
			}
			if(bucketText.length> 0 && bucketText[0]!= '+' && bucketText[0]!= '-')
				bucketText=	"+"+bucketText;
			e.addBucket(this.reformat(bucketText.trim()));
			e.finalizeExpression();
			e.preBuild();
			
			return e;
		},
		decapsulate:	function(expr)	{
			// Variables
			let	temp=	new ListArray();
			
			temp.addRange(expr.buckets);
			for(let i= 0; i< temp.length; i++)	{
				// Turns (sin(x)+4(x-2)(3-x)) => sin(x)+4(x^2)(3-x)
				if(this.isEncapsulated(temp[i]))	{
					// Variables
					let	e=	temp[i].numerator[0].data;
					
					if(!temp[i].isPositive)	{
						for(let i= 0; i< e.buckets.length; i++)	{
							e.buckets[i].isPositive= !e.buckets[i].isPositive;
							temp.add(e.buckets[i]);
						}
					}
					else
						temp.addRange(e.buckets);
					temp.removeAt(i);
					i--;
				}
				// Goes to find if there is a bucket with an expression inside so we can decap it
				else	{
					/*for(int a= 0; a< temp[i].numerator.Count; a++)	{
						if(temp[i].numerator[a].IsExpression())	{
							// Variables
							Expression	e=	(Expression)temp[i].numerator[a].data;
							
							Decapsulate(ref e);
							if(e.buckets.Count== 1)	{
								temp[i].Multiply(e.buckets[0], a);
							}
						}
					}*/
					for(let a= 0; a< temp[i].denominator.length; a++)	{
						if(temp[i].denominator[a].isExpression())	{
							this.decapsulate(temp[i].denominator[a].data);
						}
					}
				}
			}
			
			expr.buckets.clear();
			expr.buckets.addRange(temp);
			expr.sortFully();
		},
		isEncapsulated:	function(bucket)	{
			return (
				bucket.numerator.length== 1 &&  bucket.numerator[0].isExpression() &&
				bucket.denominator.length== 1 && bucket.denominator[0].isOne()
			);
		},
		isCoefficient:	function(nodes)	{
			return (nodes!= null && nodes.length== 1 && nodes[0].isCoefficient());
		},
		getCoefficient:	function(nodes)	{
			if(nodes== null)	return 0;
			if(nodes.length== 0)	return 0;
			return nodes[0].getCoefficient();
		},
		isOne:	function(nodes)	{
			if(nodes== null)	return false;
			if(nodes.length!= 1)	return false;
			if(!nodes[0].isCoefficient())	return false;
			return (nodes[0].data== 1);
		},
		stringify:	function(nodes, start)	{
			// Variables
			let	str=	"";
			
			if(!start)
				start=	0;
			
			for(let i= start; i< nodes.length; i++)
				str+=	nodes[i].toString()+" ";
			
			return str.trim();
		},
		jsStringify:	function(nodes, start)	{
			// Variables
			let	str=	"";
			
			if(!start)
				start=	0;
			
			for(let i= start; i< nodes.length; i++)
				str+=	nodes[i].toJsString()+(i< nodes.length-1 ? "*" : "");
			
			return str.trim();
		}
	};
	
	/************************
		ListArray
	************************/
	function ListArray()	{}
	ListArray.prototype=	Object.create(Array.prototype);
	ListArray.prototype.add=	function(item)	{	this.push(item);	};
	ListArray.prototype.addRange=	function(items)	{	for(let i= 0; i< items.length; i++)	{	this.add(items[i]);	}	};
	ListArray.prototype.insert=	function(index, item)	{	this.splice(index, 0, item);	};
	ListArray.prototype.removeAt=	function(index)	{	this.splice(index, 1);	};
	ListArray.prototype.clear=	function()	{	this.splice(0, length);	};
	
	/************************
		ExpressionNode
	************************/
	function ExpressionNode(__data)	{
		this.data=	null;
		this.left=	null;
		this.right=	null;
		this.metadata=	0;
		this.type=	ExpressionType.unknown;
		
		this.toString=	function()	{
			return this.build();
		};
		
		this.setData(__data);
	}
	ExpressionNode.prototype.isOne=	function()	{	return (this.isCoefficient() && this.data.toString()== "1");	};
	ExpressionNode.prototype.isCoefficient=	function()	{	return (this.type== ExpressionType.coefficient);	};
	ExpressionNode.prototype.isConstant=	function()	{	return (this.type== ExpressionType.constant);	};
	ExpressionNode.prototype.isVariable=	function()	{	return (this.type== ExpressionType.variable);	};
	ExpressionNode.prototype.isExponent=	function()	{	return (this.type== ExpressionType.operator && this.metadata== 1);	};
	ExpressionNode.prototype.isFunction=	function()	{	return (this.type== ExpressionType.operator && this.metadata== 4);	};
	ExpressionNode.prototype.isMultiplication=	function()	{	return (this.type== ExpressionType.operator && this.metadata== 2);	};
	ExpressionNode.prototype.isDivision=	function()	{	return (this.type== ExpressionType.operator && this.metadata== 3);	};
	ExpressionNode.prototype.isExpression=	function()	{	return (this.type== ExpressionType.expression);	};
	ExpressionNode.prototype.setData=	function(_data)	{
		this.data=	_data;
		this.type=	ExpressionType.operator;
		this.metadata=	0;
		//console.log(typeof(_data), _data, _data.isPrototypeOf(Expression));
		if(typeof(_data)== "ExpressionBucket")	{
			this.type=	_data.type;
			this.data=	_data.data;
			this.metadata=	_data.metadata;
			return;
		}
		switch(_data)	{
			case "^":	this.metadata=	1;	break;
			case "*":	this.metadata=	2;	break;
			case "/":	this.metadata=	3;	break;
			case "#":	this.metadata=	4;	break;
			default:	{
				if(isNaN(_data))	{
					if(typeof(_data)== "object")	{
						this.type=	ExpressionType.expression;
						break;
					}
					/*if(GlobalConstants.hasConstant(_data))	{
						type=	ExpressionType.constant;
						break;
					}*/
					this.type=	ExpressionType.variable;
				}
				else	{
					this.type=	ExpressionType.coefficient;
					this.data=	Number(_data);
				}
			}break;
		}
	};
	ExpressionNode.prototype.isSame=	function(node)	{
		if(node== null)
			return false;
		if(this.isDivision())
			return this.right.isSame(node);
		else if(node.isDivision())
			return this.isSame(node.right);
		if(this.type!= node.type)
			return false;
		if(this.metadata!= node.metadata)
			return false;
		if(this.isCoefficient())
			return true;
		if(this.isVariable())
			return (this.data== node.data);
		if(this.isExponent())
			return (left.toString()== node.left== toString());
		if(this.isExpression())
			return true;
		
		return (toString()== node.toString());
	};
	ExpressionNode.prototype.hasVariable=	function(str)	{
		if(this.isVariable())
			return (data== str);
		if(this.isExpression())
			return this.data.hasVariable(str);
		if(this.left!= null && this.left.hasVariable(str))
			return true;
		if(this.right!= null && this.right.hasVariable(str))
			return true;
		return false;
	};
	ExpressionNode.prototype.getSortID=	function()	{
		if(this.isCoefficient())	return 1;
		if(this.isVariable())	return 2;
		if(this.isDivision())	return 2;
		if(this.isMultiplication())	return 3;
		if(this.isExponent())	return 4;
		if(this.isFunction())	return 5;
		if(this.isExpression())	return 6;
		
		return 0;
	};
	ExpressionNode.prototype.build=	function()	{
		// Variables
		let	str=	"";
				
		if(this.left!= null)	str+=	this.left.build();
		if(!this.isFunction())	{
			str+=	this.data.toString();
		}
		if(this.right!= null)	str+=	this.right.build();
		
		return str;	
	};
	ExpressionNode.prototype.toJsString=	function()	{
		if(this.isMultiplication())	{
			return this.left.toJsString()+"*"+this.right.toJsString();
		}
		if(this.isDivision())	{
			return this.left.toJsString()+"/"+this.right.toJsString();
		}
		if(this.isExponent())	{
			return "Math.pow("+this.left.toJsString()+", "+this.right.toJsString()+")";
		}
		if(this.isFunction())	{
			return getFunctionByName(this.left.toString()).jsExpression(this.right.toJsString());
		}
		if(this.isCoefficient())	{
			return this.data;
		}
		if(this.isConstant())	{
			// TODO: Implement constants
			return this.data;
		}
		if(this.isExpression())	{
			return this.data.getJsExpression();
		}
		if(this.isVariable())	{
			return this.data.toString();
		}
	};
	ExpressionNode.prototype.clone=	function()	{
		// Variables
		let	node=	new ExpressionNode(this.data);
		
		if(this.left!= null)	node.left=	this.left.clone();
		if(this.right!= null)	node.right=	this.right.clone();
		node.metadata=	this.metadata;
		
		return node;
	};
	ExpressionNode.prototype.increaseExponentBy=	function(num)	{
		if(this.right.isCoefficient())	{
			this.right.data=	right.data+num;
		}
		else if(this.right.isExpression())	{
			this.right.data.addBy(num.toString());
		}
		else	{
			this.right.data=	new Expression(this.right.toString()+"+"+num.toString(), true);
		}
	};
	ExpressionNode.prototype.decreaseExponentBy=	function(num)	{
		if(this.right.isCoefficient())	{
			this.right.data=	this.right.data-num;
			if(this.right.data< 0)	{
				this.right.data=	new Expression(this.right.toString()+"-"+this.right.data.toString(), true);
			}
		}
		else if(this.right.isExpression())	{
			(this.right.data).subBy(num.toString());
		}
		else	{
			this.right.data=	new Expression(this.right.toString()+"-"+num.toString(), true);
		}
	};
	ExpressionNode.prototype.hasSimilarVariableName=	function(node)	{
		return (this.left.toString()== node.toString());
	};
	ExpressionNode.prototype.getVariableName=	function()	{
		if(this.isMultiplication())
			return (this.left.getVariableName()+this.right.toString());
		if(this.isCoefficient())
			return "";
		return toString();
	};
	ExpressionNode.prototype.getCoefficient=	function()	{
		if(this.isCoefficient())
			return this.data;
		if(this.left== null)
			return 1;
		return this.left.getCoefficient();
	};
	ExpressionNode.prototype.reducedExponent=	function()	{
		if(this.right.isExpression())	{
			// Variables
			let	e=	this.right.data.clone();
			
			e.subBy("1");
			
			return this.left.toString()+"^("+e.toString()+")";
		}
		else
			return this.left.toString()+"^("+this.right.toString()+"-1)";
	};
	ExpressionNode.prototype.evaluate=	function(hashtable)	{
		if(this.isCoefficient())
			return Number(this.data);
		/*if(this.isConstant())
			return GlobalConstants.getGlobalConstant(data);*/
		if(this.isVariable())	{
			if(hashtable[this.data])
				return hashtable[this.data];
			else
				return 0;
		}
		if(this.isExponent())	{
			// Variables
			let	a=	this.left.evaluate(hashtable);
			let	b=	this.right.evaluate(hashtable);
			
			return Math.pow(a, b);
		}
		if(this.isDivision())	{
			// Variables
			let	a=	this.left.evaluate(hashtable);
			let	b=	this.right.evaluate(hashtable);
			
			return a/b;
		}
		if(this.isMultiplication())	{
			// Variables
			let	a=	this.left.evaluate(hashtable);
			let	b=	this.right.evaluate(hashtable);
			
			return a*b;
		}
		if(this.isExpression())
			return this.data.evaluate(hashtable);
		if(this.isFunction())
			return Functions.callFunc(this.left.toString(), this.right.evaluate(hashtable));
		return 0;
	};
	ExpressionNode.prototype.getComponents=	function(a)	{
		if(a== undefined)
			return;
		function sortList(list)	{
			for(let i= list.length-2; i>= 0; i--)	{
				if(list[i].localeCompare(list[i+1])> 0)	{
					// Variables
					const	temp=	list[i];
					
					list[i]=	list[i+1];
					list[i+1]=	temp;
				}
				else
					break;
			}
		}
		
		if(this.isVariable())	{
			// Variables
			const	c=	this.toString();
			
			// Checks if it exists
			for(let i= 0; i< a.length; i++)	{
				if(a[i]== c)
					return;
			}
			// If it doesn't exist then add it and sort it
			a.push(c);
			
			sortList(a);
		}
		else if(
			this.isMultiplication() ||
			this.isDivision() ||
			this.isExponent()
		)	{
			this.left.getComponents(a);
			this.right.getComponents(a);
		}
		else if(this.isExpression())	{
			this.data.getComponents(a);
		}
		else if(this.isFunction())	{
			this.right.getComponents(a);
		}
	};
	
	/************************
		ExpressionBucket
	************************/
	function ExpressionBucket(bucket)	{
		this.isPositive=	false;
		this.numerator=	new ListArray();
		this.denominator=	new ListArray();
		this.prebuiltExpression=	"";
		this.shouldBeDeleted=	false;
		
		this.toString=	function()	{
			return (this.isPositive ? "+" : "-")+this.prebuiltExpression;
		}
		
		if(typeof(bucket)== "object")	{
			this.isPositive=	bucket.isPositive;
			for(let i= 0; i< bucket.numerator.length; i++)
				this.numerator.add(bucket.numerator[i].clone());
			for(let i= 0; i< bucket.denominator.length; i++)
				this.denominator.add(bucket.denominator[i].clone());
			this.prebuiltExpression=	bucket.prebuiltExpression;
			this.shouldBeDeleted=	bucket.shouldBeDeleted;
		}
		else	{
			// Variables
			let	l=	bucket.split(' ');
			
			l.splice(0, 1);
			
			this.isPositive=	(bucket[0]== '+');
			this.shouldBeDeleted=	false;
			
			this.createBucket(l);
			this.preBuild();
		}
	}
	ExpressionBucket.prototype.isEmpty=	function()	{	return (this.numerator.length== 0 || this.denominator.length== 0);	};
	ExpressionBucket.prototype.clone=	function()	{	return new ExpressionBucket(this);	};
	ExpressionBucket.prototype.getNumberData=	function()	{	return (ExpressionHelper.getCoefficient(this.numerator)/ExpressionHelper.getCoefficient(this.denominator));	};
	ExpressionBucket.prototype.getRawData=	function()	{	return this.prebuiltExpression;	};
	ExpressionBucket.prototype.derive=	function(wrt)	{	return ExpressionHelper.derive(this, wrt);	};
	ExpressionBucket.prototype.multiply=	function(bucket, exclude)	{
		// Variables
		let	str=	"";
		let	b=	null;
		
		for(let i= 0; i< this.numerator.length; i++)	{
			if(i== exclude)
				continue;
			str+=	this.numerator[i].toString()+" ";
		}
		str+=	bucket.prebuiltExpression;
		if(this.isPositive!= bucket.isPositive)	str=	"- "+str;
		else	str=	"+ "+str;
		str=	ExpressionHelper.reformat(str.trim());
		b=	new Expression(str);
		if(b.buckets.length== 0)	{
			this.shouldBeDeleted=	true;
			return;
		}
		this.isPositive=	b.buckets[0].isPositive;
		this.numerator=	b.buckets[0].numerator;
		this.denominator=	b.buckets[0].denominator;
		this.prebuiltExpression=	b.buckets[0].prebuiltExpression;
		this.shouldBeDeleted=	b.buckets[0].shouldBeDeleted;
	};
	ExpressionBucket.prototype.isNumericalConstant=	function()	{
		if(this.numerator.length!= 1 || this.denominator.length!= 1)
			return false;
		return (this.numerator[0].isCoefficient() && this.denominator[0].isCoefficient());
	};
	ExpressionBucket.prototype.evaluate=	function(hashtable)	{
		if(this.isEmpty())
			return 0;
		
		// Variables
		let	n=	1;
		let	d=	1;
		
		for(let i= 0; i< this.numerator.length; i++)
			n*=	this.numerator[i].evaluate(hashtable);
		for(let i= 0; i< this.denominator.length; i++)
			d*=	this.denominator[i].evaluate(hashtable);
		
		return (n/d);
	};
	ExpressionBucket.prototype.getVariableName=	function()	{
		if(this.isEmpty())
			return "";
		
		// Variables
		let	str=	"(";
		
		for(let i= 0; i< this.numerator.length; i++)	{
			if(this.numerator[i].isCoefficient() || this.numerator[i].isConstant())
				continue;
			str+=	this.numerator[i].toString();
		}
		str+=	")/(";
		for(let i= 0; i< this.denominator.length; i++)	{
			if(this.denominator[i].isCoefficient() || this.denominator[i].isConstant())
				continue;
			str+=	this.denominator[i].toString();
		}
		str+=	")";
		
		return str;
	};
	ExpressionBucket.prototype.getCoefficient=	function()	{
		if(this.isEmpty())	{
			return 0;
		}
		
		// Variables
		let	num=	(
			ExpressionHelper.getCoefficient(this.numerator)/
			ExpressionHelper.getCoefficient(this.denominator)
		);
		
		if(!this.isPositive)
			num*=	-1;
		
		return num;
	};
	ExpressionBucket.prototype.increaseCoefficient=	function(amt)	{
		if(this.isEmpty())
			return;

		// Variables
		let	ppt=	ExpressionHelper.getCoefficient(this.denominator);
		let	foundCoeff=	false;

		amt*=	ppt;
		for(let i= 0; i< this.numerator.length; i++)	{
			if(this.numerator[i].isCoefficient())	{
				this.numerator[i].data=	(this.isPositive ? 1 : -1)*this.numerator[i].data+amt;
				if(this.numerator[i].data== 0)
					this.shouldBeDeleted=	true;
				if(this.numerator[i].data< 0)	{
					this.numerator[i].data=	-1*this.numerator[i].data;
					this.isPositive=	false;
				}
				foundCoeff=	true;
				break;
			}
			else
				break;
		}
		if(!foundCoeff)	{
			this.numerator.insert(0, new ExpressionNode(
				(this.isPositive ? 1 : -1)+amt
			));
			if((this.isPositive ? 1 : -1)+amt== 0)	{
				this.shouldBeDeleted=	true;
			}
		}
		// TODO: Simplify Fraction Coefficients
		this.preBuild();
	};
	ExpressionBucket.prototype.hasVariable=	function(vname)	{
		for(let i= 0; i< this.numerator.length; i++)	{
			if(this.numerator[i].hasVariable(vname))
				return true;
		}
		for(let i= 0; i< this.denominator.length; i++)	{
			if(this.denominator[i].hasVariable(vname))
				return true;
		}
		return false;
	};
	ExpressionBucket.prototype.preBuild=	function()	{
		if(this.isEmpty())
			this.prebuiltExpression=	"";
		else if(ExpressionHelper.isOne(this.denominator))
			this.prebuiltExpression=	ExpressionHelper.stringify(this.numerator);
		else	{
			this.prebuiltExpression=	(
				ExpressionHelper.stringify(this.numerator)+" / ("+
				ExpressionHelper.stringify(this.denominator)+")"
			);
		}
		if(this.prebuiltExpression== "" || this.prebuiltExpression== "0")	{
			this.shouldBeDeleted=	true;
		}
		if(this.getCoefficient()== 0)
			this.shouldBeDeleted=	true;
		//this.prebuiltExpression=	this.prebuiltExpression.trim();
	};
	ExpressionBucket.prototype.getJsExpression=	function()	{
		// Variables
		const	sign=	(this.isPositive ? "+" : "-");
		
		if(this.isEmpty())
			return "";
		else if(ExpressionHelper.isOne(this.denominator))
			return sign+ExpressionHelper.jsStringify(this.numerator);
		else	{
			return sign+(
				"("+ExpressionHelper.jsStringify(this.numerator)+") / "+
				"("+ExpressionHelper.jsStringify(this.denominator)+")"
			);
		}
	};
	ExpressionBucket.prototype.createBucket=	function(data)	{
		this.constructNodeList(data);
		if(this.denominator.length== 0)
			this.denominator.add(new ExpressionNode(1));
		this.constructList(this.numerator, true);
		this.constructList(this.denominator, false);
		this.simplifyFraction(this.numerator, this.denominator);
	};
	ExpressionBucket.prototype.constructList=	function(nodes, isNumerator)	{
		if(!isNumerator && nodes.length== 0)
			return;
		this.combineFunctions(nodes);
		this.combineExponents(nodes);
		this.sort(nodes);
		this.skimEvaluate(nodes);
		this.ruleOut1(nodes);
		this.reformatPowerOf1(nodes);
		//this.distributeAll(nodes);
	};
	// TODO: toUnscopedString
	ExpressionBucket.prototype.constructNodeList=	function(data)	{
		// Variables
		let	temp=	"";
		let	divisionFlag=	false;
		let	scope=	0;
		
		// Starts at 1 to ignore the + or -
		for(let i= 0; i< data.length; i++)	{
			if(data[i]== "")
				continue;
			if(data[i]== "(")	{
				scope++;
				if(scope== 1)
					continue;
			}
			else if(data[i]== ")")	{
				scope--;
				if(scope== 0)	{
					if(divisionFlag)	{
						divisionFlag=	false;
						this.denominator.add(new ExpressionNode(new Expression(temp, true)));
					}
					else
						this.numerator.add(new ExpressionNode(new Expression(temp, true)));
					temp=	"";
					continue;
				}
			}
			if(scope> 0)	{
				temp+=	data[i]+" ";
			}
			else	{
				if(data[i]== "/")	{
					if(data[i+1]== "(")
						divisionFlag=	true;
					else
						this.denominator.add(new ExpressionNode(data[++i]));
				}
				else if(data[i]!= "*")	{
					this.numerator.add(new ExpressionNode(data[i]));
				}
			}
		}
	};
	ExpressionBucket.prototype.combine=	function(nodes, left, curr, right)	{
		if(left< 0 || right>= nodes.length)
			return;
		if(curr< 0 || curr>= nodes.length)
			return;
		
		// Variables
		let	node=	nodes[curr];
		
		node.left=	nodes[left];
		node.right=	nodes[right];
		nodes.removeAt(right);
		nodes.removeAt(left);
	};
	ExpressionBucket.prototype.combineFunctions=	function(nodes)	{
		for(let i= nodes.length-1; i>= 0; i--)	{
			if(nodes[i].type== ExpressionType.operator)	{
				if(nodes[i].isFunction())	{
					this.combine(nodes, i-1, i, i+1);
					i--;
					if(!nodes[i].right.isExpression())	{
						nodes[i].right.setData(new Expression(nodes[i].right.toString(), true));
					}
				}
			}
		}
	};
	ExpressionBucket.prototype.combineExponents=	function(nodes)	{
		for(let i= nodes.length-1; i>= 0; i--)	{
			if(nodes[i].type== ExpressionType.operator)	{
				if(nodes[i].data.toString()== "^")	{
					this.combine(nodes, i-1, i, i+1);
					i--;
				}
			}
		}
	};
	ExpressionBucket.prototype.sort=	function(nodes)	{
		for(let i= 0; i< nodes.length; i++)	{
			this.insertionSort(nodes, i);
		}
	};
	ExpressionBucket.prototype.insertionSort=	function(nodes, sz)	{
		// Variables
		let	left, right;
		
		for(let i= sz-1; i>= 0; i--)	{
			left=	nodes[i+1].getSortID();
			right=	nodes[i].getSortID();
			left-=	right;
			
			// Definately swap
			if(left< 0)	{
				this.swap(nodes, i);
			}
			// If it's the same then sort by coolness
			else if(left== 0)	{
				if(nodes[i].isVariable())	{
					if(!this.sortByVariable(nodes, i))
						break;
				}
				if(nodes[i].isDivision())	{
					if(!this.sortByDivision(nodes, i))
						break;
				}
				if(nodes[i].isExponent())	{
					if(!this.sortByExponentVariable(nodes, i))	{
						if(!this.sortByExponent(nodes, i))	{
							break;
						}
					}
				}
				if(nodes[i].isFunction())	{
					if(!this.sortByFunctionName(nodes, i))	{
						if(!this.sortByFunctionBody(nodes, i))	{
							break;
						}
					}
				}
			}
			// No more sorting is needed
			else	{
				break;
			}
		}
	};
	ExpressionBucket.prototype.sortByVariable=	function(nodes, i)	{
		// Variables
		let	u=	nodes[i].data;
		let	v=	(
			nodes[i+1].isDivision() ?
			nodes[i+1].right.toString() :
			nodes[i+1].data
		);
		
		if(u.localeCompare(v)> 0)	{
			this.swap(nodes, i);
			return true;
		}
		
		return false;
	};
	ExpressionBucket.prototype.sortByDivision=	function(nodes, i)	{
		// Variables
		let	u=	nodes[i].right.toString();
		let	v=	(
			nodes[i+1].isDivision() ?
			nodes[i+1].right.toString() :
			nodes[i+1].data
		);
		
		if(u.localeCompare(v)> 0)	{
			this.swap(nodes, i);
			return true;
		}
		
		return false;
	};
	ExpressionBucket.prototype.sortByExponentVariable=	function(nodes, i)	{
		// Variables
		let	u=	nodes[i].left.data.toString();
		let	v=	nodes[i+1].left.data.toString();
		
		if(u.localeCompare(v)> 0)	{
			this.swap(nodes, i);
			return true;
		}
		
		return false;
	};
	ExpressionBucket.prototype.sortByFunctionName=	function(nodes, i)	{	return this.sortByExponentVariable(nodes, i);	};
	ExpressionBucket.prototype.sortByExponent=	function(nodes, i)	{
		// Variables
		let	u=	nodes[i].right.data.toString();
		let	v=	nodes[i+1].right.data.toString();
		
		if(u.localeCompare(v)> 0)	{
			this.swap(nodes, i);
			return true;
		}
		
		return false;
	};
	ExpressionBucket.prototype.sortByFunctionBody=	function(nodes, i)	{	return this.sortByExponent(nodes, i);	};
	ExpressionBucket.prototype.swap=	function(nodes, index)	{
		// Variables
		const	temp=	nodes[index];
			
		nodes[index]=	nodes[index+1];
		nodes[index+1]=	temp;
	};
	ExpressionBucket.prototype.skimEvaluate=	function(nodes)	{
		if(nodes.length<= 1)
			return;
		
		// Variables
		let	temp=	new ListArray();
		let	stack=	[];
		
		for(let i= 0; i< nodes.length; i++)	{
			if(nodes[i].isExpression())	{
				temp.add(nodes[i]);
				continue;
			}
			if(stack.length== 0)	{
				stack.push(nodes[i]);
				continue;
			}
			if(nodes[i].isSame(stack[stack.length-1]))	{
				if(stack.length> 0 && stack[stack.length-1].isVariable() && nodes[i].isDivision())	{
					stack.pop();
				}
				else if(stack.length> 0 && stack[stack.length-1].isDivision() && nodes[i].isVariable())	{
					stack.pop();
				}
				else
					stack.push(nodes[i]);
			}
			else	{
				temp.add(this.aggregateStack(stack));
				if(temp[temp.length-1]== null)
					temp.removeAt(temp.length-1);
				else
					this.insertionSort(temp, temp.length-1);
				stack=	[];
				if(temp[temp.length-1].isSame(nodes[i]))	{
					stack.push(temp[temp.length-1]);
					temp.removeAt(temp.length-1);
				}
				stack.push(nodes[i]);
			}
		}
		if(stack.length> 0)	{
			temp.add(this.aggregateStack(stack));
			if(temp[temp.length-1]== null)
				temp.removeAt(temp.length-1);
			else
				this.insertionSort(temp, temp.length-1);
		}
		nodes=	temp;
		if(nodes.length> 1)	{
			if(nodes[0].isCoefficient() && nodes[0].data== 1)	{
				nodes.removeAt(0);
			}
		}
	};
	ExpressionBucket.prototype.aggregateStack=	function(stack)	{
		if(stack.length== 1)	{
			return stack.pop();
		}
		
		if(stack[stack.length-1].isCoefficient())	{
			// Variables
			let	num=	stack.pop().data;
			
			while(stack.length> 0)
				num*=	stack.pop().data;
			
			return new ExpressionNode(num);
		}
		if(stack[stack.length-1].isVariable())	{
			return ExpressionNode.createExponentNode(stack[stack.length-1].data, stack.length.toString());
		}
		if(stack[stack.length-1].isDivision())	{
			// Variables
			let	node=	new ExpressionNode("/");
			
			node.left=	new ExpressionNode(1);
			node.right=	ExpressionNode.createExponentNode(stack[stack.length-1].right.toString(), stack.length.toString());
			
			return node;
		}
		if(stack[stack.length-1].isExponent())	{
			// Variables
			let	str=	"";
			let	t=	"";
			let	v=	stack[stack.length-1].left.toString();
			let	expr=	null;
			
			while(stack.length> 0)	{
				t=	stack.pop().right.toString();
				str+=	"+"+t;
			}
			
			expr=	new Expression(str, true);
			if(expr.isNumber())	{
				return ExpressionNode.createExponentNode(v, expr.getExpression(false));
			}
			return ExpressionNode.createExponentNode(v, expr);
		}
		if(stack[stack.length-1].isFunction())	{
			return ExpressionNode.createExponentNode(new Expression(stack[stack.length-1].toString(), true), stack.length.toString());
		}
		
		return null;
	};
	ExpressionBucket.prototype.ruleOut1=	function(nodes)	{
		if(nodes.length<= 1)
			return;
		
		if(nodes[0].isCoefficient() && nodes[0].data== 1)	{
			nodes.removeAt(0);
		}
	};
	ExpressionBucket.prototype.reformatPowerOf1=	function(nodes)	{
		for(let i= nodes.length-1; i>= 0; i--)	{
			if(nodes[i].isExponent())	{
				if(nodes[i].right.isCoefficient() && nodes[i].right.data== 1)	{
					nodes[i].setData(nodes[i].left);
					nodes[i].left=	null;
					nodes[i].right=	null;
				}
			}
			else if(!nodes[i].isFunction())
				break;
		}
	};
	ExpressionBucket.prototype.simplifyFraction=	function(num, den)	{
		// Variables
		let	simplifyFlag=	false;
			
		for(let a= num.length-1; a>= 0; a--)	{
			for(let b= den.length-1; b>= 0; b--)	{
				if(num[a].isSame(den[b]))	{
					if(num[a].isVariable())	{
						if(num[b].isExponent())	{
							num[b].decreaseExponentBy(1);
						}
						num.removeAt(a);
						den.removeAt(b);
						simplifyFlag=	true;
						break;
					}
				}
			}
		}
		
		if(simplifyFlag && num.length== 0)	{
			num.add(new ExpressionNode(1));
		}
	};
	ExpressionBucket.prototype.getComponents=	function(a)	{
		for(let i= 0; i< this.numerator.length; i++)
			this.numerator[i].getComponents(a);
		for(let i= 0; i< this.denominator.length; i++)
			this.denominator[i].getComponents(a);
	};
	
	
	/************************
		Expression
	************************/
	function Expression(__expr, __isParenth)	{
		// Variables
		this.buckets=	new ListArray();
		this.isParenthesis=	__isParenth || false;
		this.prebuilt=	"";
		
		this.toString=	function()	{
			return this.prebuilt;
		};
		
		if(typeof(__expr)== "object")	{
			for(let i= 0; i< __expr.buckets.length; i++)
				this.buckets.add(__expr.buckets[i].clone());
			this.isParenthesis=	__expr.isParenthesis;
			this.prebuilt=	__expr.prebuilt;
		}
		else
			this.build(__expr);
	}
	Expression.prototype.addBy=	function(expr)	{	ExpressionHelper.build("+"+expr, this);	};
	Expression.prototype.subBy=	function(expr)	{	ExpressionHelper.build("-"+expr, this);	};
	Expression.prototype.clone=	function()	{	return new Expression(this);	};
	Expression.prototype.preBuild=	function()	{		this.prebuilt=	this.getExpression().trim();	};
	Expression.prototype.derive=	function(wrt)	{	return new Expression(this.deriveStr(wrt));	};
	Expression.prototype.hasVariable=	function(vname)	{
		for(let i= 0; i< this.buckets.length; i++)	{
			if(this.buckets[i].hasVariable(vname))
				return true;
		}
		return false;
	};
	Expression.prototype.sortFully=	function()	{
		for(let i= 0; i< this.buckets.length; i++)
			this.sortBuckets(i);
	};
	Expression.prototype.addBucket=	function(bucket)	{
		if(bucket== "")
			return;
		this.buckets.add(new ExpressionBucket(bucket));
		this.sortBuckets(this.buckets.length-1);
	};
	Expression.prototype.finalizeExpression=	function()	{
		//ExpressionHelper.decapsulate(this);
		this.combineLikeTerms();
		this.trimBuckets();
		this.preBuild();
	};
	Expression.prototype.isNumber=	function()	{
		if(buckets.length!= 1)
			return false;
		
		return buckets[0].isNumericalConstant();	
	};
	Expression.prototype.evaluate=	function(hashtable)	{
		// Variables
		let	num=	0;
		
		
		for(let i= 0; i< this.buckets.length; i++)	{
			num+=	this.buckets[i].evaluate(hashtable);
		}
		
		return num;
	};
	Expression.prototype.deriveStr=	function(wrt)	{
		// Variables
		let	str=	"";
		
		for(let i= 0; i< this.buckets.length; i++)	{
			if(this.buckets[i].isPositive)	str+=	"+";
			else	str+=	"-";
			str+=	this.buckets[i].derive(wrt);
		}
		if(str[0]== '+')	str=	str.substring(1);
		
		return "("+str+")";
	};
	Expression.prototype.build=	function(expr)	{
		this.buckets=	new ListArray();
		ExpressionHelper.build(expr, this);
	};
	Expression.prototype.trimBuckets=	function()	{
		for(let i= this.buckets.length-1; i>= 0; i--)	{
			if(this.buckets[i].shouldBeDeleted== true)
				this.buckets.removeAt(i);
		}
	};
	Expression.prototype.combineLikeTerms=	function()	{
		for(let i= this.buckets.length-2; i>= 0; i--)	{
			if(this.buckets[i].getVariableName()== this.buckets[i+1].getVariableName())	{
				this.addBucketsTogether(i, i+1);
			}
		}
	};
	Expression.prototype.addBucketsTogether=	function(left, right)	{
		// Variables
		let	num=	this.buckets[right].getCoefficient();
			
		this.buckets[left].increaseCoefficient(num);
		this.buckets.removeAt(right);
	};
	Expression.prototype.sortBuckets=	function(sz)	{
		if(this.buckets.length<= 1)
			return;
		
		// Variables
		let	left=	"";
		let	right=	"";
		
		for(let i= sz-1; i>= 0; i--)	{
			right=	this.buckets[i+1].getRawData();
			left=	this.buckets[i].getRawData();
			
			if(left.localeCompare(right)< 0)	{
				// Variables
				const	temp=	this.buckets[i];
				
				this.buckets[i]=	this.buckets[i+1];
				this.buckets[i+1]=	temp;
			}
			else	{
				break;
			}
		}
	};
	Expression.prototype.invertExpression=	function()	{
		for(let i= 0; i< this.buckets.length; i++)
			this.buckets[i].isPositive=	!this.buckets[i].isPositive;
	};
	Expression.prototype.getExpression=	function(useParenthesis)	{
		if(this.buckets.length== 0)	{
			return "0";
		}
		
		if(!useParenthesis)
			useParenthesis=	this.isParenthesis;
		
		// Variables
		let	str=	"";
		
		for(let i= 0; i< this.buckets.length; i++)	{
			str+=	this.buckets[i].toString();
		}
		if(str[0]== '+')
			str=	str.substring(1);
		if(useParenthesis== true)	str=	"("+str+")";
		
		return str;
	};
	Expression.prototype.getJsExpression=	function(useParenthesis)	{
		if(this.buckets.length== 0)	{
			return "0";
		}
		
		if(!useParenthesis)
			useParenthesis=	this.isParenthesis;
		
		// Variables
		let	str=	"";
		
		for(let i= 0; i< this.buckets.length; i++)	{
			str+=	this.buckets[i].getJsExpression();
		}
		if(str[0]== '+')
			str=	str.substring(1);
		if(useParenthesis== true)	str=	"("+str+")";
		
		return str;
	};
	Expression.prototype.getFunction=	function()	{
		// Variables
		let	func=	function(x)	{	return 0;	};
		
		function getParams(e)	{
			// Variables
			let	comps=	[];
			let	str=	"";
			
			e.getComponents(comps);
			
			for(let i= 0; i< comps.length; i++)	{
				str+=	comps[i]+(i== comps.length-1 ? "" : ", ");
			}
			
			return str;
		}
		
		try	{
			eval("func= function("+getParams(this)+") { return ("+this.getJsExpression()+"); };");
		}	catch(e)	{console.warn(e);}
		
		return func;
	};
	Expression.prototype.getComponents=	function(a)	{
		for(let i= 0; i< this.buckets.length; i++)	{
			this.buckets[i].getComponents(a);
		}
	};
	
	
	/************************
		Equation
	************************/
	function Equation(__left, __right)	{
		this.left=	__left;
		this.right=	__right;
	}
	return {
		Expression:	Expression,
		Functions:	Functions,
		createExpression:	function(ascii)	{	return new Expression(ascii);	}
	};
})();