#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>

AsyncWebServer server(80);

const char* ssid = "SchlangenPlan";
const char* password = "yourSnake";

const char* PARAM_MESSAGE = "message";

void notFound(AsyncWebServerRequest *request) {
    request->send(404, "text/plain", "Not found");
}

void setup() {

    Serial.begin(115200);
    WiFi.softAP(ssid, password);

    Serial.print("IP Address: ");
    Serial.println(WiFi.softAPIP());

    if(!SPIFFS.begin(true)){
        Serial.println("An Error has occurred while mounting SPIFFS");
        return;
    }
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/index.html");
    });
    

    server.on("/three.module.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/three.min.js");
    });

    server.onNotFound(notFound);

    server.begin();
}

void loop() {
}
