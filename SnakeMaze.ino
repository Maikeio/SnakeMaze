#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>

#define SERVO_PIN 13
#define SERVO_Freq 50
#define SERVO_Channel 0
#define SERVO_Res 8
AsyncWebServer server(80);

const char* ssid = "SchlangenPlan";
const char* password = "yourSnake";

const char* PARAM_MESSAGE = "message";


void notFound(AsyncWebServerRequest *request) {
    request->send(404, "text/plain", "Not found");
}

void setup() {

    ledcSetup(SERVO_Channel, SERVO_Freq, SERVO_Res);
  /* Attach the LED PWM Channel to the GPIO Pin */
    ledcAttachPin(SERVO_PIN, SERVO_Channel);
    ledcWrite(SERVO_Channel, 15);
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

    server.on("/reset.png", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/reset.png", "image/png");
    });

    server.on("/models/SandNormal.png", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/models/SandNormal.png", "image/png");
    });

    server.on("/models/block.obj", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/models/block.obj");
    });
    
    server.on("/models/halfBlock.obj", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/models/halfBlock.obj");
    });

    server.on("/models/DestinationDefault.png", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/models/DestinationDefault.png", "image/png");
    });
    
    server.on("/models/DestinationNormal.png", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/models/DestinationNormal.png", "image/png");
    });

    server.on("/levels/lvl1.json", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/levels/lvl1.json");
    });
    
    server.on("/levels/lvl2.json", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/levels/lvl2.json");
    });
    
    server.on("/levels/lvl3.json", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/levels/lvl3.json");
    });

    server.on("/wonStyle.css", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/wonStyle.css");
    });
    
    server.on("/won.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/won.js");
    });

    server.on("/wonToClose.html", HTTP_GET, [](AsyncWebServerRequest *request){
      ledcWrite(SERVO_Channel, 20);
    request->send(SPIFFS, "/wonToClose.html");
    });

    server.on("/wonToOpen.html", HTTP_GET, [](AsyncWebServerRequest *request){
      ledcWrite(SERVO_Channel, 15);
    request->send(SPIFFS, "/wonToOpen.html");
    });
    
    server.onNotFound(notFound);

    server.begin();
}

void loop() {
}
