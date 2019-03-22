#include <Firebase.h>
#include <FirebaseArduino.h>
#include <FirebaseCloudMessaging.h>
#include <FirebaseError.h>
#include <FirebaseHttpClient.h>
#include <FirebaseObject.h>

//#include <FirebaseArduino.h>

#include <ESP8266WiFi.h>                 //wifi library
#define WIFI_SSID "PIBO1416"             //replace SSID with your wifi username
#define WIFI_PASSWORD "QuangMinhThanhMy" //replace PWD with your wifi password
#define WIFI_LED D4                      //connect a led to any of the gpio pins of the board and replace pin_number with it eg. D4
#define RELAY_1 D5
#define RELAY_2 D6
#define RELAY_3 D7
#define RELAY_4 D8

#define FIREBASE_HOST "jlpt-c7a95.firebaseio.com" //link of api
#define FIREBASE_AUTH ""                          //database secret
int state_1 = 1;
int save_state_1 = -1;

void setup()
{
  // put your setup code here, to run once:
  Serial.begin(115200);
  pinMode(WIFI_LED, OUTPUT); //define pinmodes
  pinMode(RELAY_1, OUTPUT);  //define pinmodes
  pinMode(RELAY_2, OUTPUT);  //define pinmodes
  pinMode(RELAY_3, OUTPUT);  //define pinmodes
  pinMode(RELAY_4, OUTPUT);  //define pinmodes
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  //connect to wifi
  while (WiFi.status() != WL_CONNECTED)
  { //wait till connected to WiFi
    delay(100);
    digitalWrite(WIFI_LED, LOW); //Blink the light till connected to WiFi
    delay(100);
    digitalWrite(WIFI_LED, HIGH);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  digitalWrite(WIFI_LED, HIGH);
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH); //connect to Database
  delay(1000);
}

void loop()
{
  // put your main code here, to run repeatedly:

  //Relay_1
  state_1 = Firebase.getInt("Relay_1");
  if (save_state_1 != state_1)
  {
    save_state_1 = state_1;
    digitalWrite(RELAY_1, bitRead(state_1, 0));
    digitalWrite(RELAY_2, bitRead(state_1, 1));
    digitalWrite(RELAY_3, bitRead(state_1, 2));
    digitalWrite(RELAY_4, bitRead(state_1, 3));
    //    if (bitRead(state_1,0) == 1)
    //      digitalWrite(RELAY_1, HIGH);
    //    else
    //      digitalWrite(RELAY_1, LOW);
    //    //Relay_2
    //      if (bitRead(state_1,1) == 1)
    //      digitalWrite(RELAY_2, HIGH);
    //    else
    //      digitalWrite(RELAY_2, LOW);
    //    //Relay_3
    //      if (bitRead(state_1,2) == 1)
    //      digitalWrite(RELAY_3, HIGH);
    //    else
    //      digitalWrite(RELAY_3, LOW);
    //    //Relay_4
    //      if (bitRead(state_1,3) == 1)
    //      digitalWrite(RELAY_4, HIGH);
    //    else
    //      digitalWrite(RELAY_4, LOW);
  }

  delay(100);
}