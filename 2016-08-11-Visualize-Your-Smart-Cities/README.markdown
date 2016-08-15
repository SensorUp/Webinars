# Visualization Demos

This is part of the SensorUp 2016 Summer Webinar on building simple smart cities dashboard with SensorThings API. Video is available [here](https://www.youtube.com/watch?v=W-_FgpwscCo) and slides are available [here](http://www.slideshare.net/steve.liang/visualize-your-smart-city-build-a-realtime-smart-city-dashboard-for-sensorthings-api). These pages demonstrate how to retrieve data from SensorThings and display the data in a format that is easier to understand than raw JSON.

All the libraries are loaded from a Content Distribution Network (CDN). This simplifies loading the libraries and means we do not need to distribute the libraries with this demo page.

## Demo 1: Static chart with separate AJAX calls

This page shows how we can use JQuery for AJAX, MomentJS for date parsing, and HighCharts for graphing of Observations from SensorThings.

We first set up the base page with an empty chart. Next we use JQuery to download the Datastream. The Datastream's details are used for the chart title.

Then we retrieve the Observations from the Datastream entity's Observations navigation link, and add a descending sort by phenomenon time and set to only grab the latest 100 observations. This may be the default for some SensorThings implementations but here we are being explicit in what is returned.

In the response from the server, we retrieve the "value" array and convert it into data for the chart library. We use MomentJS to parse the ISO8601 date string into a Unix Epoch timestamp integer, and we assume the result data is a float.

The data is then sorted by phenomenon time in ascending order for the chart library. Missing this step is a common source of weird display issues with HighCharts.

Finally we can add the data to the chart, as well as update the yAxis with the Datastream's unit of measurement.

## Demo 2: Static chart with $expand

Similar to the last demo, except we can reduce the number of HTTP requests required by using the `$expand` function in SensorThings. This causes the Observations to be embedded in the Datastream entity.

## Demo 3: Static chart with map background from Location

Building on the previous demo, we add a background map using Leaflet that is centred on the Datastream's Thing's Location.

## Demo 4: Latest value auto-poll, with previous value also displayed

This demo displays two values: the latest Observation result, and the previous latest Observation result. It works with a simple timer to check the latest Observation and update if it has changed.

## Demo 5: Combining previous examples into a single page

Combining all the code from the previous demos, we get a page with all the features together. Note that `$expand` is *not* used to retrieve the Observations, as this causes the `Observations@iot.navigationLink` property to not be sent from SensorThings. Without that navigationLink, we cannot retrieve more observations unless we re-request the base entity without the Observations expanded.

The poller runs every 10 seconds and only checks for the latest value. If more than one Observation is posted between checks, then it is possible some Observations will not be shown on the chart. If graphing all the Observations is really important, then MQTT should be used to subscribe to new Observations instead.

#Acknowledgement
Thanks to James Badger for developing the original source codes. You can find the original source code here: https://bitbucket.org/geosensorweblab/visualization-tutorials
