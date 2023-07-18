const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const indicator = document.getElementById('indicator');
const colorPalette = document.querySelectorAll('.color-button');

// Set canvas size
const canvasWidth = 600;
const canvasHeight = 400;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Initialize pixel size and color
const pixelSize = 10;

// Set initial color
let currentColor = '#000000';

// Initialize drawing data
let drawing = [];

// Socket.io setup
const socket = io();

socket.on('history', (data) => {
  data.forEach((item) => {
    drawPixel(item.x, item.y, item.color);
  });
});

socket.on('drawing', (data) => {
  drawPixel(data.x, data.y, data.color);
});

// Function to draw a pixel
function drawPixel(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, pixelSize, pixelSize);
}

// Function to get canvas coordinates based on mouse position
function getCanvasCoordinates(event) {
  const canvasRect = canvas.getBoundingClientRect();
  const x = event.clientX - canvasRect.left;
  const y = event.clientY - canvasRect.top;
  return { x, y };
}

// Function to draw pixels on canvas
function drawOnCanvas(event) {
  const { x, y } = getCanvasCoordinates(event);

  const data = {
    x: Math.floor(x / pixelSize) * pixelSize,
    y: Math.floor(y / pixelSize) * pixelSize,
    color: currentColor,
  };

  drawPixel(data.x, data.y, data.color);
  drawing.push(data);

  // Send the drawing data to the server
  socket.emit('drawing', data);
}

// Attach event listener to canvas for drawing
canvas.addEventListener('mousedown', drawOnCanvas);
canvas.addEventListener('mousemove', (event) => {
  indicator.textContent = `X: ${Math.floor(getCanvasCoordinates(event).x / pixelSize)} | Y: ${Math.floor(getCanvasCoordinates(event).y / pixelSize)}`;
});
canvas.addEventListener('mouseup', () => {
  drawing = [];
});
canvas.addEventListener('mouseout', () => {
  drawing = [];
});

// Function to set the current drawing color
function setColor(color) {
  currentColor = color;
}

// Attach event listener to color palette buttons
colorPalette.forEach((button) => {
  const color = button.dataset.color;
  button.style.backgroundColor = color;
  button.addEventListener('click', () => setColor(color));
});
