const BAUD_RATE = 9600; // This should match the baud rate in your Arduino sketch

let port, connectBtn; // Declare global variables

// Store joystick X value and mapped circle X position
let joyX = 512;   // raw joystick reading (0–1023)
let circleX = 25; // circle's x position on the canvas
let joyY = 512;   // raw joystick Y reading
let circleY = 25; // circle's y position on the canvas

function setup() {
  setupSerial(); // Run our serial setup function (below)

  // Create a canvas
  createCanvas(1700, 600);

  // Use HSB color mode like your second example
  colorMode(HSB);

  // Text settings (you can keep/change as needed)
  textFont("system-ui", 20);
  textAlign(CENTER, CENTER);
}

function draw() {
  // Check whether the port is open
  const portIsOpen = checkPort();
  if (!portIsOpen) return; // If the port is not open, exit draw

  // Read from the port until the newline character
  let str = port.readUntil("\n");

  // If we didn't read anything, keep using the last value
  if (str.length > 0) {
    // Clean the string
    str = str.trim();

    // Expecting "x,y" from Arduino
    let parts = str.split(",");

    // Expecting "x,y" from Arduino
    if (parts.length >= 2) {
      let xRaw = int(parts[0]);
      let yRaw = int(parts[1]);

      if (!isNaN(xRaw)) {
        joyX = xRaw;
      }
      if (!isNaN(yRaw)) {
        joyY = yRaw;
      }
    }
  }

  // Map joystick X (0–1023) to screen range
  // This mimics your "moving across x axis" idea
  circleX = map(joyX, 0, 1023, -120, width + 120);
  circleY = map(joyY, 0, 1023, -120, height + 120);

  // Constrain the circle so it cannot leave the canvas
  circleX = constrain(circleX, 25, width - 25);
  circleY = constrain(circleY, 25, height - 25);

  // Clear the background
  background(0);

  // Set fill color based on circleX (like your hue idea)
  fill((circleX / 3) % 360, 90, 90);

  // Draw the circle controlled by the joystick
  circle(circleX, circleY, 50);

  // Optional: label
  fill(255);
  text(`Joystick X: ${joyX}`, width / 2, 40);
  text(`Circle X: ${int(circleX)}`, width / 2, 70);
  text(`Joystick Y: ${joyY}`, width / 2, 100);
  text(`Circle Y: ${int(circleY)}`, width / 2, 130);

  // Accessibility description
  describe("circle moves horizontally based on joystick position");
}

// --- SERIAL HELPER FUNCTIONS (unchanged from your working code) ---

function setupSerial() {
  port = createSerial();

  // Check to see if there are any ports we have used previously
  let usedPorts = usedSerialPorts();
  if (usedPorts.length > 0) {
    // If there are ports we've used, open the first one
    port.open(usedPorts[0], BAUD_RATE);
  }

  // create a connect button
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(5, 5); // Position the button in the top left of the screen.
  connectBtn.mouseClicked(onConnectButtonClicked); // When the button is clicked, run the onConnectButtonClicked function
}

function checkPort() {
  if (!port.opened()) {
    // If the port is not open, change button text
    connectBtn.html("Connect to Arduino");
    // Set background to gray
    background("gray");
    return false;
  } else {
    // Otherwise we are connected
    connectBtn.html("Disconnect");
    return true;
  }
}

function onConnectButtonClicked() {
  // When the connect button is clicked
  if (!port.opened()) {
    // If the port is not opened, we open it
    port.open(BAUD_RATE);
  } else {
    // Otherwise, we close it!
    port.close();
  }
}