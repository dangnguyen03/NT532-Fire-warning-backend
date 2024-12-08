#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include "DHT.h"


// WiFi
const char *ssid = "TheLight"; // Tên WiFi của bạn
const char *password = "20022003";  // Mật khẩu WiFi của bạn

// MQTT Broker
const char *topic = "iot/value";
const char *topicrec = "iot/detected";
const char *topicmac = "iot/mac";
const char *mqtt_broker = "269cddc81f3446da8c939add434498cf.s1.eu.hivemq.cloud";
const char *mqtt_username = "hive_thanhdang";
const char *mqtt_password = "ThanhDang123";
const int mqtt_port = 8883;

const int gas = A0;
const int DHTPIN = 5;
const int DHTTYPE = DHT22; 
DHT dht(DHTPIN, DHTTYPE);
#define MQ2_ANALOG_PIN A0 
int buzzer = 0;
 
const int led = 16;
bool state = false;
int lastPostTime = 0;
const unsigned long post_interval = 10000; 
String macAddr = ""; 
const String macRasp ="1";
String returnRasp ="";
// WiFiClient espClient;
// PubSubClient client(espClient);



WiFiClientSecure espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(9600);
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to the WiFi network");
  macAddr =WiFi.macAddress();
  Serial.print("Dia chi MAC: ");
  Serial.println(macAddr);
  // Set CA certificate
  espClient.setInsecure();

  // Set MQTT broker and callback
  client.setServer(mqtt_broker, mqtt_port);
  client.setCallback(callback);

  // Connect to MQTT broker
  while (!client.connected()) {
    if (client.connect("ESP8266Client", mqtt_username, mqtt_password)) {
        Serial.println("Connected to MQTT broker");
        client.subscribe(topic);
        client.subscribe(topicrec);
        client.subscribe(topicmac);
    } else {
      Serial.print("Failed to connect to MQTT broker, rc =");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
  StaticJsonDocument<200> sensorMAC;
  sensorMAC["macAddr"] = macAddr;
  sensorMAC["macRasp"] = macRasp;  
  char jsonBuffer[256];
  serializeJson(sensorMAC, jsonBuffer);
  client.publish(topicmac, jsonBuffer);
  dht.begin();    
  pinMode(led, OUTPUT);
  pinMode(buzzer, OUTPUT);

  pinMode(gas,INPUT);
}

void callback(char *topicrec, byte *payload, unsigned int length) {
    Serial.print("Message arrived in topic: ");
    Serial.println(topicrec);
    Serial.print("Message:");
    for (int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
    }
    Serial.println();
    String data = "";
    for (int i = 0; i < length; i++) {
        data.concat((char)payload[i]);
    }
    DynamicJsonDocument doc(256);
    DeserializationError error = deserializeJson(doc, data);
    state = doc["state"];
    returnRasp = doc["macRasp"].as<String>();
    Serial.println();
    Serial.println("-----------------------");  
}

void loop() {
  client.loop();
    // if (state && returnRasp == macRasp)
    // {
    //   digitalWrite(led,HIGH);
    //   Serial.println("Bật cảnh báo");
    //   delay(500);
    // }else  digitalWrite(led,LOW);
    // delay(150);
    if (state)
    {
      digitalWrite(led,HIGH);
      Serial.println("Bật cảnh báo");
      tone(buzzer, 1000, 200);
      delay(500);
      digitalWrite(led,LOW);
            delay(200);

    }

    float h = dht.readHumidity();
    float t = dht.readTemperature();
    h =(int) roundf(h * 100) / 100;  // Làm tròn đến số thập phân thứ hai cho humidity
    t =(int) roundf(t * 100) / 100;

    // int val = analogRead(gas);
    // val = map(val, 0, 1023, 0, 100);

    // int sensorValue = analogRead(MQ2_ANALOG_PIN);
    // int smoke = map(sensorValue, 0, 1023, 0, 100);

    StaticJsonDocument<200> sensorData;

    sensorData["temper"] = t;
    sensorData["humid"] = h;
    int ra = random(45, 50);
    sensorData["gas"] = ra;
    sensorData["macAddr"] = macAddr;
    char jsonBuffer[256];
    serializeJson(sensorData, jsonBuffer);

    if (millis() - lastPostTime >= post_interval) {
      client.publish(topic, jsonBuffer);
    lastPostTime = millis();
  }
}
