$(document).ready(function(){
	// init map and set the center of the map to Calgary and an appropriate zoom level.
	var map =L.map('map').setView([51.02, -114.06],11);

	// set the tile layer of the map, can be changed using different map styles from mapbox.
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
	
	// make a get request to get all the locations in a specific region
	$.getJSON("http://example.sensorup.com/v1.0/Locations?$count=true&$filter=st_disjoint(location,+geography'POLYGON+((-114.03+50.93,+-114.03+51.00,+-113.88+51.00,+-113.88+50.93,+-114.03+50.93))')&$orderby=id+desc").then(function(data){
		var values=data.value;

		// loop through all the locations.
		for(var i=0; i<values.length; i++){
			var type=values[i].location.type;	
			var coord=values[i].location.coordinates;
			var description=values[i].description;

			// setup the geojson feature
			var geojsonFeature = {
			    "type": "Feature",
			    "geometry": {
			        "type": type,
			        "coordinates": coord
			    }
			};

			var polygon = L.polygon([
			    [50.93, -114.03],
			    [51.00, -114.03],
			    [51.00, -113.88],
			    [50.93, -113.88]
			]).addTo(map);
			polygon.bindPopup("I am the bbox query.");

			// create a geojson layer and add it to the map
			var layer =L.geoJson().addTo(map);

			// add the geojson to the map and create popup
			layer.addData(geojsonFeature);
			layer.bindPopup(description);
		}

	});
});