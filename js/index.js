$(document).ready(function() {

	//Default MaxES
	var maxLon = 180;
	var maxLat = 90;

	var dataArray = [];
	
	var canvasWidth = 0;
	var canvasHeight = 0;

	$.getJSON('/CityComparisson/data/CityList.json', function(data) {		

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
		});
	});

	function SizeCanvas(docHeight, docWidth){
		//Calculate Canvas Size 
		// The canvas must be a certain proporation (1:2). So we will calculate the canvas size for it to be as big as possible, while maintining this proportion
		var canvasMargin = 0;
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

		console.log("Heiht: " + docHeight + " / " + canvasHeight);
		console.log("Width: " + docWidth + " / " + canvasWidth);
	}

	//Start Drawing on Canvas
	var DrawEverything = function(){
		var canvas = document.getElementById("main-canvas");
		// attaching the sketchProc function to the canvas
		var processingInstance = new Processing(canvas, sketchProc);


		function sketchProc(processing) {

			processing.setup = function(){
				processing.frameRate(5);
				processing.background(50);
				processing.size(canvasWidth, canvasHeight);
				//Nothing here, really
				processing.ellipseMode(processing.CENTER);
				
			}
			// Override draw function, by default it will be called 60 times per second
			processing.draw = function() {

				processing.fill(50,75);
				processing.rect(0,0,processing.width,processing.height);

				//Draw Equator and that other line
				processing.stroke(255);
				processing.line(processing.width/2,0,processing.width/2,processing.height);
				processing.line(0,processing.height/2,processing.width,processing.height/2);

				//Draw Each LIne
				for(var i = 0; i < dataArray.length; i++){
					
					processing.stroke(255, 10);
					processing.fill(255,75);
					processing.text(dataArray[i][0], dataArray[i][8] * (processing.width/100), dataArray[i][9] * (processing.height/100));

					processing.stroke(255);
					processing.noFill();
					processing.ellipse(dataArray[i][8] * (processing.width/100), dataArray[i][9] * (processing.height/100), 10, 10);

					processing.stroke(200, 40);
					processing.line(dataArray[i][8] * (processing.width/100), 0, dataArray[i][8] * (processing.width/100), processing.height);
					processing.line( 0, dataArray[i][9] * (processing.height/100), processing.width, dataArray[i][9] * (processing.height/100))
					//console.log(dataArray[i]);
					if(i == 35){
						break;
					}
				}

			};

		
		}
	}

	setTimeout(SizeCanvas($(document).height(), $(document).width()), 500);
  	DrawEverything();

	$(window).resize(function() {
  		setTimeout(SizeCanvas($(document).height(), $(document).width()), 500);
  		DrawEverything();
	});

});

