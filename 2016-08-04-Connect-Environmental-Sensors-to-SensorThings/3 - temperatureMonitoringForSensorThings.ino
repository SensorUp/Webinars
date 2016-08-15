/*
   2016 SensorUp (http://www.sensorup.com)
   This content is released under the (https://opensource.org/licenses/MIT) MIT License.

   Simple code to upload temperature observations to SensorThings Scratchpad (http://scratchpad.sensorup.com)
   from the grove DHT22 temperature and humidity sensor (https://www.seeedstudio.com/item_detail.html?p_id=746).

   It works with Linkit One board . (https://www.seeedstudio.com/item_detail.html?p_id=2017)
*/
#include <LWiFi.h>
#include <LWiFiClient.h>
#include <PubSubClient.h>

/*
  Modify to your WIFI Access Credentials.
*/
#define WIFI_AP "steve"
#define WIFI_PASSWORD "sensorup-rocks"
#define WIFI_AUTH LWIFI_WPA  // choose from LWIFI_OPEN, LWIFI_WPA, or LWIFI_WEP.
LWiFiClient client;

// DHT22
#include <DHT.h> // https://github.com/Seeed-Studio/Grove_Starter_Kit_For_LinkIt/tree/master/libraries/Humidity_Temperature_Sensor
#define DHTPIN 2        // what pin the DHT sensor connected to
#define DHTTYPE DHT22   // DHT 22  (AM2302)
float temperature, humidity;
DHT dht(DHTPIN, DHTTYPE);

// MQTT
#define MQTT_PROXY_IP "scratchpad.sensorup.com"

void msgCallback(char* topic, byte* payload, unsigned int len)
{
  // handle message arrived
}

PubSubClient mqttClient((char*)MQTT_PROXY_IP, 1883, msgCallback, client);

/******************************************************************************************
    change the <id> from the line below (e.g., #define DATASTREAM_ID_LIGHT <id>) to the
    <id> of your SensorThings Datastream. You can get the Datastream <id> from the SensorUp
    playground's Observation API Request: /st-playground/proxy/v1.0/Datastreams(<id>)/Observations
 *****************************************************************************************/
const int TEMPERATURE_DATASTREAM_ID = 1851;
/******************************************************************************************
    change the <token> from the line below (e.g., #define ACCESS_TOKEN <token>) to the
    <token> of your SensorThings Datastream. You can get the St-P-Access-Token <token> from the SensorUp
    playground's Observation API Request: St-P-Access-Token: d6ffe625-7e9f-42cb-8187-49d391107139
 *****************************************************************************************/

#define SERVER_IP "scratchpad.sensorup.com"
#define PORT 80
const int INTERVAL = 10;  // Interval (in seconds) to post data
void setup()
{
  Serial.begin( 9600 );
  Serial.println("Start connecting your Linkit One to SensorThings Scratchpad.");
  InitLWiFi();
}

void loop()
{
  mqttLoop();
  dht.readHT(&temperature, &humidity);
  while (isnan(temperature) || isnan(humidity) || temperature <= -40 || temperature > 80 || humidity <= 5 || humidity > 99) {
    delay(100);
    dht.readHT(&temperature, &humidity);
  }
  //httpPostResult(temperature, TEMPERATURE_DATASTREAM_ID);
  mqttPublishResult(temperature, TEMPERATURE_DATASTREAM_ID);
  
  delay(INTERVAL*1000);
}
void InitLWiFi()
{
  LWiFi.begin();
  // Keep retrying until connected to AP
  Serial.println("Connecting");
  while (0 == LWiFi.connect(WIFI_AP, LWiFiLoginInfo(WIFI_AUTH, WIFI_PASSWORD))) {
    delay(1000);
  }
  Serial.println("Connected");
}

void httpPostResult(float value, int datastreamId)
{
  Serial.println("HTTP POST an Observation result to SensorThings Scratchpad...");
 String observationJson = createObservationJson(value);
  Serial.println(observationJson);
  if (client.connect(SERVER_IP, PORT))
  {
    Serial.println("SensorThings Scratchpad connected ");
    // Build HTTP POST request
    client.println("POST /OGCSensorThings/v1.0/Datastreams(" + String(datastreamId) + ")/Observations HTTP/1.1");
    Serial.println("POST /OGCSensorThings/v1.0/Datastreams(" + String(datastreamId) + ")/Observations HTTP/1.1");
    String host = "Host: ";
    host.concat(SERVER_IP);
    client.println(host);
    Serial.println(host);
    client.println("Connection: close");
    Serial.println("Connection: close");
    client.println("Content-Type: application/json");
    Serial.println("Content-Type: application/json");
    client.println("Cache-Control: no-cache");
    Serial.println("Cache-Control: no-cache");
    client.print("Content-Length: ");
    Serial.print("Content-Length: ");
    client.print(observationJson.length());
    Serial.print(observationJson.length());
    client.print("\n\n");
    Serial.print("\n\n");
    client.print(observationJson);
    Serial.println("Observation: " + observationJson);
    while (true)
    {
      // if there are incoming bytes available
      // from the server, read them and print them:
      if (client.available()) {
        char c = client.read();
        //  Serial.print(c);
      }
      // if the server's disconnected, stop the client:
      if (!client.connected()) {
        Serial.println();
        Serial.println("server disconnected. stopping the client.\n");
        client.stop();
        break;
      }
    }
  }
  else {
    // if you didn't get a connection to the server:
    Serial.println("connection failed");
  }
}

void mqttPublishResult(float value,int datastreamId)
{
  char sensorData[100];
  createObservationJson(value).toCharArray( sensorData, 100 );
  char topic[50];
  sprintf(topic, "v1.0/Datastreams(%d)/Observations", datastreamId); 
  Serial.print("Publish Topic:");
  Serial.println(topic);
  mqttClient.publish(topic, sensorData );
  Serial.println( sensorData );
}

String createObservationJson(float value){
  String jsonString = "{";
  jsonString += "\"result\":";
  jsonString +=  value;
  jsonString += "}";
  return jsonString;
}

void mqttLoop()
{
  if( !mqttClient.connected() ) {
    mqttReconnect();
  }
  mqttClient.loop();
}

void mqttReconnect() {
  boolean isConnected;
  if (!mqttClient.connected()) {
    Serial.print("Connecting to MQTT broker ...");
    // Attempt to connect
    isConnected = mqttClient.connect("SensorUp2016");// Better use some random name
    if (isConnected) {  
      Serial.println( "[DONE]" );
    } else {
      Serial.print( "[FAILED] [ rc = " );
      Serial.print( mqttClient.state() );
      Serial.println( " : retrying in 5 seconds]" );
      delay( 5000 );
    }
  }
}
