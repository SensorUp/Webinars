$(document).ready(function(){
	var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	// get current date
	var current_date=new Date();

	// get last weeks date
	var last_week_date = new Date(current_date.getFullYear(), current_date.getMonth(), current_date.getDate()-7);

	// get the observed property for air quality and all the datastreams associated with this observed property. 
	$.getJSON("http://example.sensorup.com/v1.0/ObservedProperties(3499)/Datastreams?$expand=Thing").then(function(data){
		var promise_arr=[];
		var values=data.value;

		// loop through all the datastreams
		for(var i=0; i<values.length; i++){
			var month=last_week_date.getMonth()+1;
			var day=last_week_date.getDate();

			// for each day get the worst air quality
			while(day <= current_date.getDate()){
				var promise = $.getJSON(values[i]["Observations@iot.navigationLink"]+"?$filter=day(phenomenonTime) eq "+day+" and month(phenomenonTime) eq "+month+"&$orderby=result desc&$top=1&$select=result,phenomenonTime");
				promise_arr.push(promise);	// add all the promises to the promise array.
				day++;
			}
		}

		// Attach a handler to execute code once all the requests have been completed.
		Promise.all(promise_arr).then(function(response){
			var data_arr=[], index=8;
			var counter=0;

			// get the symbol for the units
			var symbol=values[0]["unitOfMeasurement"]["symbol"];

			// loop through all the datastreams
			for(var i=0; i<values.length; i++){
				var result_arr=[];

				//for each datastream, get the air quality for each day
				while(counter < index){
					var phenomenonTime = response[counter]["value"][0]["phenomenonTime"].split("T");

					// parse date and convert it to UTC time, so highcharts can plot the data
					var parsed_date = phenomenonTime[0].split("-");
					var date = new Date(parsed_date[1]+"/"+parsed_date[2]+"/"+parsed_date[0]);
					var utc_date = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

					result_arr.push([utc_date , Number(response[counter]["value"][0]["result"])]);
					counter++;
				}

				// set the station name and the corresponding data
				data_arr.push({
					name: values[i]["Thing"]["description"],
					data: result_arr
				});

				index+=8;	// increment the array by 8.
			}

			// setup line chart using highcharts library
			$("#container").highcharts({
				chart: {	// set the chart type
					type: "column",
				},
				title: {
					text: "The Worst PM2.5 Reading For Each Station (lower is better)"
				},
				xAxis: {
					crosshair: {	// highlight column on hover
						color: '#EBF4FF',
						width: 90
					},
					title: {	// title of x-axis
	                	text: 'Date'
	           		},
	           		type: 'datetime'	// define the type of the x-axis to be date time
				},
				yAxis: {	// y-axis title
					title: {
						text: "Particulate Matter 2.5 ("+symbol+")"
					}
				},
				legend: {	// set the legends position
					layout: "vertical",
					align: "right",
					verticalAlign: "middle"
				},
				tooltip: {
					valueSuffix: symbol,
					shared: true,
					headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
		            pointFormat: '<tr><td style="color:{series.color};padding:0; font-size: 12px;">{series.name}: </td>' +
		                '<td style="padding:0; font-size: 12px;"><b>{point.y}</b></td></tr>',
		            footerFormat: '</table>',
            		useHTML: true
				},
				series: data_arr
			});


		});
	});
	
});