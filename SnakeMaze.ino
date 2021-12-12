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
    

    server.on("/libs/three.module.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/libs/three.module.js");
    });

    server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/style.css");
    });

    server.on("/main.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/main.js");
    });

    server.on("/ObjectList.json", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/ObjectList.json");
    });

    server.on("/libs/Player.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/libs/Player.js");
    });

    server.on("/libs/Level.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/libs/Level.js");
    });

    server.on("/libs/OBJLoader.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/libs/OBJLoader.js");
    });

    server.on("/models/lvl1.json", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/models/lvl1.json");
    });

    server.on("/models/arrow.obj", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/models/arrow.obj");
    });

    server.on("/models/rock_default.png", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/models/rock_default.png", "image/png");
    });

    server.on("/models/RockNormal.png", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/models/RockNormal.png", "image/png");
    });

    server.on("/models/slope.obj", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/models/slope.obj");
    });

    server.on("/models/StartDefault.png", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/models/StartDefault.png", "image/png");
    });

    server.on("/models/tesseract.obj", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/models/tesseract.obj");
    });
    

    server.onNotFound(notFound);

    server.begin();
}

void loop() {
}
