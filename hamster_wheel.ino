#include <Servo.h>

Servo servo360;

//0 to 90 where 0 is full speed and 90 is stop 
int speed = 78;

//receives data from p5
int go;

//pin for servo
int servoPin = 10;

void setup() {
  Serial.begin(115200);
  Serial.println("Looking at the screen controls hamster wheel spin.");
  servo360.attach(servoPin);
}

void loop() {
  if(Serial.available() > 0){
    String rcvdSerialData = Serial.readStringUntil('\n'); 
    go = rcvdSerialData.toInt();

    if (go) {
      servo360.write(speed);
    } 
    else {
      servo360.write(90);
    }
  }
}
