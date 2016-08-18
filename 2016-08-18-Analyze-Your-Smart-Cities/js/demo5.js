$(document).ready(function(){
	// init map and set the center of the map to Calgary and an appropriate zoom level.
	var map =L.map('map').setView([50.95, -113.96],11);

	// set the tile layer of the map, can be changed using different map styles from mapbox.
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
	
	// make a get request to the following URL 
		$.getJSON("http://example.sensorup.com/v1.0/Locations?$count=true&$filter=(geo.distance(location,+geography'POINT+(-114.00+50.99)')+lt+10000)&$orderby=id+desc").then(function(data){

		//loop each location
		for(var i=0; i<data.value.length; i++){

		// add location of each Location entity to the map
		var geoJSONFeature=L.geoJSON(data.value[i].location).addTo(map);
		}
		// add a circle representing the buffer query.
		var circle = L.circle([50.99, -114.00], 10000, {
		    color: 'green',
		    fillColor: 'green',
		    fillOpacity: 0.3
		}).addTo(map);

	});
});