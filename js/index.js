$(document).ready(function() {

	//Default MaxES
	var maxLon = 180;
	var maxLat = 90;

	var dataArray = [];
	
	var canvasWidth = 0;
	var canvasHeight = 0;

	var canvasMargin = 0;
		

	var c   = document.getElementById("main-canvas"),
		ctx = c.getContext("2d"), 
		canvas = $("#main-canvas"),
		mainDiv = $("#main-div"),
		canvasContainer = $("#canvas-container");

	/* City Object */ // Must be Global

	function cityObject(xInput, yInput, nameInput, populationInput){

		//Basic Info
		this.cityName = nameInput;
		this.cityNameSpan = "";
		this.Population = populationInput;
		this.tootTip = this.cityName + "<br/>" + this.Population + " ";
		//Position
		this.xCoef = xInput;
		this.yCoef = yInput;
		this.xPos = 0; 
		this.yPos = 0; 
		this.xPos;
		this.yPos;
		//Animation
		this.aFrames = 0;
		this.xTarget;
		this.yTarget;

		this.updateCoefs = function(canvasWidth, canvasHeight){
			this.xPos = this.xCoef * (canvasWidth / 100);
			this.yPos = this.yCoef * (canvasHeight / 100);
		} 

		this.drawCity = function(){
			//Draw the Rectangle
			console.log("Drawing City - " + this.cityName + " / " + this.xPos + " / " + this.yPos);
			ctx.beginPath();
				ctx.fillStyle = "rgba(255,255,255,0.3)";
				ctx.arc(this.xPos, this.yPos, 5, 0, Math.PI*2, true);
			ctx.closePath();
				ctx.strokeStyle = "rgba(255,255,255,1)";
				ctx.stroke(); 
				ctx.fill();
			//An OUter Circle
			ctx.beginPath();
				ctx.fillStyle = "rgba(255,255,255,0)";
				ctx.arc(this.xPos, this.yPos, 10, 0, Math.PI*2, true);
			ctx.closePath();
				ctx.strokeStyle = "rgba(255,255,255,0.5)";
				ctx.stroke(); 
				ctx.fill();
		};

		this.drawToolTip = function(){
			this.cityNameSpan = "<span class='citySpan' style='position:absolute;top: "+(this.yPos+canvasMargin-5)+"px; width: 10px; height: 10px; left:"+(this.xPos-5)+"px;display:block;' id='"+this.cityName+"'></span>";
			//Put some Words on it
			mainDiv.append(this.cityNameSpan);
			$("#"+this.cityName).simpletip({
				// Configuration properties
				content: this.tootTip,
				fixed: false
			});
		}

		this.drawText = function(){
			DrawEverything();
			ctx.save(); // push state on state stack
			ctx.translate(10, 0);  
			ctx.fillStyle = "white";  
			ctx.fillText(this.cityName, this.xPos, this.yPos);  
			ctx.restore();
			
		}

		this.moveToLongitude = function(){

			//No Animation
			this.xPos =  canvasWidth/2;
			this.yPos =  this.yCoef * (canvasHeight / 100);
			this.drawCity("red");
			//this.drawToolTip(); 

			//With Animation 
			/*
			this.xTarget = canvasWidth/2;
			this.yTarget = this.yPos;

			this.xDistance = (this.xTarget - this.xPos)/100;
			this.yDistance = (this.yTarget - this.yPos)/100;
			console.log(this.xTarget + " / " + this.yTarget);
			console.log(this.xDistance + " / " + this.yDistance);

			for(this.aFrames = 100; this.aFrames > 0; this.aFrames--){
				ctx.fillStyle   = 'rgba(50, 50, 50, 75)'; // set canvas background color
				ctx.fillRect  (0, 0, canvasWidth, canvasHeight);

				console.log(this.aFrames+ " - Frame");
				this.yPos =  this.yPos - this.yDistance;
				this.xPos =  this.xPos - this.xDistance;
				console.log(this.xPos + " / " + this.yPos);
				this.drawCity();
			}*/
		}

		this.moveToLatitude = function(){
			//No Animation
			this.xPos =  this.xCoef * (canvasWidth / 100);
			this.yPos =  canvasHeight/2;
			this.drawCity("green");
			//this.drawToolTip();
		}

	};   

	$.getJSON('../CityComparisson/data/CityList.json', function(data) {		

		SizeCanvas($(document).height(), $(document).width(), true);

		$.each(data, function(key, val) {

			dataArray.push([]);

			dataArray[key].push(val["City"]);
			dataArray[key].push(val["Rank"]);
			dataArray[key].push(val["Population"]);
			dataArray[key].push(val["Country"]);
			dataArray[key].push(val["Statistical Concept"]);
			dataArray[key].push(val["Elevation"]);

			var latCoords = val["Latitude"].match(/[0-9]*/g); 
			var lonCoords = val["Longitude"].match(/[0-9]*/g); 

			if(latCoords.length >= 6){
				latCoords = Geo.parseDMS(val["Latitude"])
			}
			else {
				var latDirection = val["Latitude"].match(/[a-zA-Z]{1}/g);
				latCoords = val["Latitude"].match(/[0-9]*/g);
				latCoords = $.grep(latCoords,function(n){
				return(n);
			});
			latCoords = latCoords.join(".");
				if(latDirection == "S"){
					latCoords = latCoords * -1;
				}
			}

			if(lonCoords.length >= 6){
				lonCoords = Geo.parseDMS(val["Longitude"])
			}
			else {
				var lonDirection = val["Longitude"].match(/[a-zA-Z]{1}/g);
				lonCoords = val["Longitude"].match(/[0-9]*/g);
				lonCoords = $.grep(lonCoords,function(n){
				return(n);
			});
			lonCoords = lonCoords.join(".");
				if(lonDirection == "W"){
					lonCoords = lonCoords * -1;
				}

			}

		  	dataArray[key].push(parseFloat(latCoords));
		    dataArray[key].push(parseFloat(lonCoords));

		  	//Calculate all Height and Width Coeficients so that we only have to Multiply by Height and Width
		  	if(latCoords < 0){
		  		//The Coordinate is in the South ( bottom Half) of the Cnavas
		  		var yCoef = 50 + Math.abs(latCoords) * (50/maxLat);
		  	}
		  	else {
		  		//The Coordinate is in the Noth ( Upper Half) of the Cnavas
		  		var yCoef = 50 - latCoords * (50/maxLat);
		  	}
		  	if(lonCoords < 0){
		  		//The Coordinate is in the South ( bottom Half) of the Cnavas
		  		var xCoef = 50 - Math.abs(lonCoords) * (50/maxLon);
		  	}
		  	else {
		  		//The Coordinate is in the Noth ( Upper Half) of the Cnavas
		  		var xCoef = 50 + lonCoords * (50/maxLon);
		  	}
		  	dataArray[key].push(xCoef);
		  	dataArray[key].push(yCoef);
		  	var cityName = val["City"].replace(/[^a-zA-Z-\-áíã]/g, "_"); //The tooltip, for some reason, is not taking spaces right now
		  	dataArray[key].push(new cityObject(xCoef, yCoef, cityName, val["Population"]));

		});
	})
	.success(function() { console.log("Succes"); })
	.error(function() { alert("error"); })
	.complete(function() { 

		function resizeCanvas(direction){
			if(direction){
				canvasWidth += 100;
				canvasHeight += (100 * (canvasHeight/canvasWidth));
			}else {
				canvasWidth -= 100;
				canvasHeight -= (100 * (canvasHeight/canvasWidth));
			}
			canvas.width(canvasWidth);
			canvas.height(canvasHeight);
			DrawEverything();
		}

		DrawEverything();

		//On MouseOver
		$(function(){
			canvas.mousemove(function(event) {
				for(var i = 0; i < dataArray.length; i++){
					var xPos = dataArray[i][10].xPos;
					var yPos = dataArray[i][10].yPos;
					if((event.pageX < (xPos + 5) && event.pageX > (xPos - 5)) && (event.pageY < (yPos + canvasMargin + 5) && event.pageY > (yPos + canvasMargin - 5))) {
						dataArray[i][10].drawText();
						console.log("Draw!Text: " + dataArray[i][10].cityName + " - " + xPos + " / " + yPos + " --- " + event.pageX + " / " + event.pageY);
					}
					else {
						console.log(".");
					}
					
				} 
			});
		});

		//If a key is pressed
		$(function(){
			var code = null;
			$(window).keypress(function(e)
			{
				code = (e.keyCode ? e.keyCode : e.which);
				if(code == 120){
					mainDiv.html("");
					for(var i = 0; i < dataArray.length; i++){
						
						if(i == 1){
							drawBegining(canvasWidth, canvasHeight);
						}
						dataArray[i][10].moveToLongitude();
					} 
				}
				else if(code == 121){
					mainDiv.html("");
					for(var i = 0; i < dataArray.length; i++){
						if(i == 1){
							//I have no Idea Why this is necesary, but for some reason it draws the last city if you don't do this...
							drawBegining(canvasWidth, canvasHeight);
						}
						dataArray[i][10].moveToLatitude();
					} 
				}
				else if(code == 61){
					resizeCanvas(true);
				}
				else if(code == 45){
					resizeCanvas(false)
				}
				else {
					console.log(code);
				}
				
			});
		});

		//If the window is ReSized
		$(window).resize(function() {
			setTimeout(SizeCanvas($(document).height(), $(document).width(), true), 500);
			DrawEverything();
		});

	}); //End Complete - Get Json

	function SizeCanvas(docHeight, docWidth, firstTime){
		//Calculate Canvas Size 
		// The canvas must be a certain proporation (1:2). So we will calculate the canvas size for it to be as big as possible, while maintining this proportion
		var winProportion = (docHeight / docWidth);

		if(winProportion > (maxLat/maxLon))
		{

			//The Margin will be at the top and bottom
			canvasHeight = docWidth * (maxLat/maxLon);
			canvasMargin = ((docHeight - canvasHeight) / 2);
			canvasWidth = docWidth;
			//Set Everything Up
			$("#main-canvas").width(docWidth);
			$("#main-canvas").height(canvasHeight);
			$("#main-canvas").css("margin-top",canvasMargin);
			$("#main-canvas").removeClass("xMiddle");
			$("#main-canvas").addClass("yMiddle");
		}
		else 
		{
			//Be sure to put it in the X middle
			//The Margin will be Left and Right ( auto )
			canvasWidth  = docHeight * (maxLon/maxLat);
			canvasMargin = ((docWidth - canvasWidth) / 2);
			canvasHeight = docHeight;
			//Set Everything Up
			$("#main-canvas").height(docHeight);
			$("#main-canvas").width(canvasWidth);
			$("#main-canvas").css("margin-left", canvasMargin);
			$("#main-canvas").removeClass("yMiddle");
			$("#main-canvas").addClass("xMiddle");
			
		}
		ctx.canvas.width  = canvasWidth;
  		ctx.canvas.height = canvasHeight;

  		if(firstTime){
  			canvasContainer.width(canvasWidth);
  			canvasContainer.height(canvasHeight);
  		}

	}

	//Start Drawing on Canvas
	function DrawEverything(){

		drawBegining(canvasWidth, canvasHeight);	

		for(var i = 0; i < dataArray.length; i++){
			dataArray[i][10].updateCoefs(canvasWidth, canvasHeight);
			dataArray[i][10].drawCity();
		} 
		
	}

	function drawBegining(canvasWidth, canvasHeight){
		console.log("Cleaning Up");
		ctx.fillStyle   = 'rgba(50, 50, 50, 1)'; // set canvas background color
		ctx.fillRect  (0, 0,canvasWidth, canvasHeight);
		//Draw the Equators
			ctx.strokeStyle = 'rgba(255, 255, 255, 75)';
			//Equators
			ctx.moveTo(canvasWidth/2,0);
			ctx.lineTo(canvasWidth/2,canvasHeight);
			ctx.stroke();
			// Vertical... whatever the name is, it's greenwich meridian right?
			ctx.moveTo(0,canvasHeight/2);
			ctx.lineTo(canvasWidth,canvasHeight/2);
			ctx.stroke();
	};

});

