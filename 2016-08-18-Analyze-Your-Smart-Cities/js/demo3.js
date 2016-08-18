$(document).ready(function(){
	var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	// get current date
	var current_date=new Date();

	// get last weeks date
	var last_week_date = new Date(current_date.getFullYear(), current_date.getMonth(), current_date.getDate()-7);

	// init array where we will store all our promises
	var promise_arr=[];

	// get datastream information more imporantly we will need the units for this datastream.
	promise_arr.push($.getJSON("http://example.sensorup.com/v1.0/Datastreams(4207)"));

	// get last weeks date (specifically the day)
	var day=last_week_date.getDate();

	// loop through 7 days 
	while(day <= current_date.getDate()){
		// format month (getMonth() returns the month from 0-11)
		var month=last_week_date.getMonth()+1;

		// set up our requests, get min and max temperature daily
		var min_temp_promise = $.getJSON("http://example.sensorup.com/v1.0/Datastreams(4207)/Observations?$filter=day(phenomenonTime) eq "+day+" and month(phenomenonTime) eq "+month+"&$orderby=result asc&$top=1&$select=result,phenomenonTime");
		var max_temp_promise = $.getJSON("http://example.sensorup.com/v1.0/Datastreams(4207)/Observations?$filter=day(phenomenonTime) eq "+day+" and month(phenomenonTime) eq "+month+"&$orderby=result desc&$top=1&$select=result,phenomenonTime");
		
		// put the requests in our promise array
		promise_arr.push(min_temp_promise);
		promise_arr.push(max_temp_promise);

		// go to next iteration
		day++;
	}

	//Attach handler to execute once all the requests have completed.
	Promise.all(promise_arr).then(function(data){
		// init result arrays
		var data_arr=[];

		// get symbol of unit
		var symbol=data[0]["unitOfMeasurement"]["symbol"];

		// loop through the data
		for(var i=1; i<data.length-1; i=i+2){
			var phenomenonTime = data[i]["value"][0]["phenomenonTime"].split("T");

			// parse date and convert it to UTC time, so highcharts can plot the data
			var parsed_date = phenomenonTime[0].split("-");
			var date = new Date(parsed_date[1]+"/"+parsed_date[2]+"/"+parsed_date[0]);
			var utc_date = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
			
			// add UTC date, min, and max values to the array
			var index = i+1;
			data_arr.push([utc_date, Number(data[i]["value"][0]["result"]), Number(data[index]["value"][0]["result"])]);
			
		}

		// setup line chart using highcharts library
		$("#container").highcharts({
			chart: {	// set the chart type
				type: "columnrange",
				inverted: true
			},
			title: {
				text: "Min and Max Temperature for "+monthNames[last_week_date.getMonth()]+" "+last_week_date.getDate()+", "+last_week_date.getFullYear()+" - "+monthNames[current_date.getMonth()]+" "+current_date.getDate()+", "+current_date.getFullYear()
			},
			xAxis: {
				title: {	// title of x-axis
                	text: 'Date'
           		},
           		type: 'datetime'	// define the type of the x-axis to be date time
			},
			yAxis: {	// y-axis title
				title: {
					text: "Temperature ("+symbol+")"
				}
			},
			legend: {	// set the legends position
				layout: "vertical",
				align: "right",
				verticalAlign: "middle"
			},
			plotOptions: {
				columnrange: {
					dataLabels: {
						enabled: true,
						formatter: function(){
							return this.y+symbol
						}
					}
				}
			},
			tooltip: {
				valueSuffix: symbol
			},
			// add data
			series: [{
				name: "Temperature",
				data: data_arr
			}]
		});
	});
	
});