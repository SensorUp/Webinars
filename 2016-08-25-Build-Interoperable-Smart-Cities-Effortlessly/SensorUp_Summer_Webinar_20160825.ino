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
#include <SensorThings.h>

/*
  Modify to your WIFI Access Credentials.
*/
#define WIFI_AP "sensorup"
#define WIFI_PASSWORD "sensorup-rocks"
#define WIFI_AUTH LWIFI_WPA  // choose from LWIFI_OPEN, LWIFI_WPA, or LWIFI_WEP.
LWiFiClient client;

SensorThings sta;
char* server = "scratchpad.sensorup.com";
char* broker = "scratchpad.sensorup.com";

unsigned long starttime;

// DHT22
#include <DHT.h> // https://github.com/Seeed-Studio/Grove_Starter_Kit_For_LinkIt/tree/master/libraries/Humidity_Temperature_Sensor
#define DHTPIN 2        // what pin the DHT sensor connected to
#define DHTTYPE DHT22   // DHT 22  (AM2302)
float temperature, humidity;
DHT dht(DHTPIN, DHTTYPE);

void setup()
{
  Serial.begin( 9600 );
  Serial.println("Start connecting your Linkit One to SensorThings Scratchpad.");
  InitLWiFi();
  
  /** Initialize SensorThings SDK**/
  Serial.println(F("init SensorThings"));
  sta = SensorThings (client, server, 80, broker, 1883);
  Serial.println(F("done"));

  /** Create Entities for SensorThings API**/
  sta.createEntities("Webinar #4","Temperature Datastream","°C","DHT22","Temperature");

  starttime = millis();

  /** Read sensor observations from DHT22 **/
  dht.readHT(&temperature, &humidity);
  while (isnan(temperature) || isnan(humidity) || temperature <= -40 || temperature > 80 || humidity <= 5 || humidity > 99) {
    delay(100);
    dht.readHT(&temperature, &humidity);
  }
  
  char buf [10];
  sprintf (buf, "%2.2f", temperature);
  Serial.println(buf);
  sta.sendObservation(buf,"51.04426", "-114.06306");
}

void loop()
{
  if (millis() - starttime > 1000) {
    starttime = millis();
    dht.readHT(&temperature, &humidity);
    while (isnan(temperature) || isnan(humidity) || temperature <= -40 || temperature > 80 || humidity <= 5 || humidity > 99) {
      delay(100);
      dht.readHT(&temperature, &humidity);
    }
    char buf [10];
    sprintf (buf, "%2.2f", temperature);
    Serial.println(buf);
    sta.sendObservation(buf);
  }
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



