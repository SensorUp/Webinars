$(document).ready(function(){
	//Get moderate, unhealthy, total readings by making a get requests to SensorThings API. 
	//The code below is setting up the promises so we can execute the rest of the code after we get all the data.

	var moderate_readings_promise = $.getJSON("http://example.sensorup.com/v1.0/Datastreams(3505)/Observations?$filter=result ge 13 and result lt 35.5");
	var unhealthy_readings_promise = $.getJSON("http://example.sensorup.com/v1.0/Datastreams(3505)/Observations?$filter=result gt 35.5");
	var total_readings_promise= $.getJSON("http://example.sensorup.com/v1.0/Datastreams(3505)/Observations");

	// Attach a handler, which is called once all the requests have been completed successfully.
	$.when(moderate_readings_promise, unhealthy_readings_promise, total_readings_promise).done(function(moderate_readings_data, unhealthy_readings_data, total_readings_data){
		// Parse the data to get the attributes we need to make the pie chart

		// get the total readings
		var total_readings=total_readings_data[0]["@iot.count"];

		// get percentage of moderate readings (round to 2 decimal places)
		var percentage_moderate_readings=Math.round((moderate_readings_data[0]["@iot.count"]/total_readings)* 100*100)/100;

		// get percentage of unhealthy readings (round to 2 decimal places)
		var percentage_unhealthy_readings=Math.round((unhealthy_readings_data[0]["@iot.count"]/total_readings)*100*100)/100;
		
		// get percentage of healthy readings
		var percentage_healthy_readings= 100-(percentage_moderate_readings+percentage_unhealthy_readings);

		// Setup pie chart using highcharts library
		$("#container").highcharts({
			chart: {	// set chart type to pie
				type: "pie"
			},
			title: {	// set title of chart
				text: "Air Quality Readings"
			},
			tooltip: {	// add units to the tooltip
				pointFormat: "{series.name}: <b>{point.percentage}%</b>"
			},
			plotOptions: {
				pie: {	
					cursor: "pointer",
					allowPointSelect: true,
					dataLabels: {	//enable data labels (value) to be displayed on the pie chart
						enabled: true,
						format: "<b>{point.name}</b>: {point.percentage}%"	// add units to the data label
					}
				}
			},
			// add the data to the chart
			series: [{
				name: "Air Quality",
				colorByPoint: true,
				data: [{
					name: "Unhealthy",
					y: percentage_unhealthy_readings
				},{
					name: "Moderate",
					y: percentage_moderate_readings
				},{
					name: "Healthy",
					y: percentage_healthy_readings
				}]
			}]
		});

	});
	
});