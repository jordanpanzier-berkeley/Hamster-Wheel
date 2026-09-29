/*
Updated from: jd's Nose-ifier and 
Sudhu Tewari's TDF_ComputerVision_HeadPositionControlsServo
*/

let pHtmlMsg;
let serialOptions = { baudRate: 115200  };
let serial;

let video;
let bodyPose;
let poses = [];

// data that is sent to the arduino 
let go;

function preload() {
  bodyPose = ml5.bodyPose();
}

function setup() {
  createCanvas(640, 480);
  
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  bodyPose.detectStart(video, gotPoses);

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  // Add in a lil <p> element to provide messages. This is optional
  pHtmlMsg = createP("Click anywhere on this page to open the serial connection dialog");
  pHtmlMsg.style('color', 'deeppink');
}

function gotPoses(newPoses) {
  poses = newPoses;
}
 
// Checks when the user is not looking at the screen. 
// ie. if nose coordinates crosses over the left eye or right eye, or goes above them.
function goOrNoGo(left_eye, right_eye, nose, iod) {
  if (nose.x+iod/8 >= left_eye.x||
      nose.x-iod/8 <= right_eye.x ||
      nose.y-iod/4 <= left_eye.y+iod/6 ||
      nose.y-iod/4 <= right_eye.y+iod/6){
    go = 0;
  } else {
    go = 1;
  }
}

function draw() {
  image(video, 0, 0, width, height);
  
  if (poses.length > 0) {
    let left_eye = poses[0].left_eye;
    let right_eye = poses[0].right_eye;
    let iod = dist(left_eye.x, left_eye.y, right_eye.x, right_eye.y);
    let nose = poses[0].nose;

    /*
    noFill();
    stroke("blue");
    ellipse(left_eye.x, left_eye.y, iod/2, iod/3);
    ellipse(right_eye.x, right_eye.y, iod/2, iod/3);
    stroke("red");
    ellipse(nose.x, nose.y, iod/2, iod/2);
    */

    goOrNoGo(left_eye, right_eye, nose, iod);
    serial.writeLine(go);

  }
}

// helper functions below ==========================================================================

/**
 * Callback function by serial.js when there is an error on web serial
 * 
 * @param {} eventSender 
 */
 function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
  pHtmlMsg.html(error);
}

/**
 * Callback function by serial.js when web serial connection is opened
 * 
 * @param {} eventSender 
 */
function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
  pHtmlMsg.html("Serial connection opened successfully");
}

/**
 * Callback function by serial.js when web serial connection is closed
 * 
 * @param {} eventSender 
 */
function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
  pHtmlMsg.html("onSerialConnectionClosed");
}

/**
 * Callback function serial.js when new web serial data is received
 * 
 * @param {*} eventSender 
 * @param {String} newData new data received over serial
 */
function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);
}

/**
 * Called automatically by the browser through p5.js when mouse clicked
 */
function mouseClicked() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}
