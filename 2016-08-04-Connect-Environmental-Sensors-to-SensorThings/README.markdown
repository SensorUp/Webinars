# Connect an Environment Monitoring IoT Device to OGC SensorThings API

This is part of the SensorUp 2016 Summer Webinar on connecting environment monitoring IoT devices to OGC SensorThings API. Video is available [here](https://www.youtube.com/watch?v=GMrnerjOqYs) and slides are available [here](http://www.slideshare.net/steve.liang/sense-your-smart-city-connect-environmental-sensors-to-sensorthings-api).

There are three steps to connect an IoT device to SensorThings API. In fact, the three steps should apply to all IoT devices-Cloud connection, using a standard or not. First two steps are provisioning, i.e., providing necessary metadata, and the last step is uploading, i.e., sending latest observations.

## SensorThings URL
This tutorial uses SensorThings Scratchpad (powered by SensorUp): http://scratchpad.sensorup.com

## Step #1 - create a Thing entity 
Water Temperature Monitor (Thing).json is an example request sending to an OGC SensorThings API (via HTTP POST). It will create a water temperature monitor Thing entity and its Location.

## Step #2 - create a Datastream entity
Water Temperature Datastream.json is an example request sending to an OGC SensorThings API (via HTTP POST). It will create a Datastream entity. It uses Deep Insert to create an ObservedProperty and a Sensor entity as well. It also links to the Thing entity that were just created. Please note that if the same ObservedProperty and Sensor entity already exist in the SensorThings server, the beset practice is to re-use them.

## Step #3 - connect a LinkIt ONE IoT board to SensorThings
temperatureMonitoringForSensorThings.ino is the source code uploading temperature and humidity readings to SensorThings API. In this tutorial, we use [LinkIt ONE board](http://seeedstudio.com/depot/LinkIt-ONE-p-2017.html).
