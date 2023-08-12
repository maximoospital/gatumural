const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const energyBar = document.getElementById('energy-bar');
const energyFill = document.getElementById('energy-fill');

// About dialog
        function openAboutDialog() {
            const aboutDialog = document.getElementById('aboutDialog');
            aboutDialog.style.display = 'block';
          }
          
          function closeAboutDialog() {
            const aboutDialog = document.getElementById('aboutDialog');
            aboutDialog.style.display = 'none';
          }
          function getCookie(name) {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.startsWith(name + '=')) {
                return cookie.substring(name.length + 1);
              }
            }
            return null;
          }
          
          function setCookie(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            const expires = 'expires=' + date.toUTCString();
            document.cookie = name + '=' + value + ';' + expires + ';path=/';
          }
          function updateEnergyBar() {
            energyFill.style.width = `${energyLevel}%`;
          }                     
          window.addEventListener('DOMContentLoaded', () => {
            let energyLevel = getCookie('energyLevel');
            const firstVisit = getCookie('firstVisit');
            if (!firstVisit) {
              openAboutDialog();
              setCookie('firstVisit', 'true', 365); // Set the firstVisit cookie for 365 days
            }
            if (!energyLevel) {
              setCookie('energyLevel', '100', 8/24);
            }
            updateEnergyBar();
          });
          
          
// Screenshots

document.getElementById('captureButton').addEventListener('click', () => {
    const elementToCapture = document.getElementById('dibujo');
    // Create a canvas element to draw the captured image
    const canvas = document.createElement('canvas');
    canvas.width = elementToCapture.offsetWidth;
    canvas.height = elementToCapture.offsetHeight;
  
    // Draw the captured element on the canvas
    html2canvas(elementToCapture).then((canvas) => {
      // Convert the canvas to a data URL
      const dataUrl = canvas.toDataURL('image/png');
  
      // Create a temporary anchor link to trigger the download
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = 'Gatumural-' + Date.now() + '.png'; // Change the filename as needed
  
      // Programmatically trigger the download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  });

// Drawing

let energyLevel = parseInt(getCookie('energyLevel')); // Default energy level (percent)
const energyDrainRatePerClick = 20; // Energy drain rate per click (percent)
const energyDrainRatePerMousedrag = 50; // Energy drain rate per millisecond of mousedrag (percent)
const maxClicks = 5; // Maximum number of clicks allowed
let clicks = 0;
let mousedragStartTimestamp = null;

// Function to get a cookie value by name
function getCookie(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
}
updateEnergyBar();

const colorPicker = document.getElementById('colorPicker');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.lineCap = 'round';
ctx.lineJoin = 'round';

let isDrawing = false;
let lastX = 0;
let lastY = 0;

colorPicker.addEventListener('change', () => {
    ctx.strokeStyle = colorPicker.value;
});

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

const socket = io();
socket.on('draw', (data) => {
    drawLine(data);
});

socket.on('drawingHistory', (data) => {
    data.forEach((line) => drawLine(line));
});

function drawLine(line) {
    ctx.beginPath();
    ctx.moveTo(line.lastX, line.lastY);
    ctx.lineTo(line.x, line.y);
    ctx.strokeStyle = line.color;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.closePath();
}

function startDrawing(e) {
    let energyLevel = parseInt(getCookie('energyLevel'));
    if (e.target === canvas && energyLevel > 0) {
        isDrawing = true;
        lastX = e.clientX;
        lastY = e.clientY;
        if (e.type === 'mousedown') {
          drainEnergyForClick();
          energyFill.style.width = `${energyLevel}%`;
        }
      } else {
        mousedragStartTimestamp = Date.now();
      }  
}
    
function draw(e) {
    if (!isDrawing) return;

    const line = {
    lastX,
    lastY,
    x: e.clientX,
    y: e.clientY,
    color: ctx.strokeStyle,
    size: ctx.lineWidth,
    };

    drawLine(line);
    socket.emit('draw', line);

    lastX = e.clientX;
    lastY = e.clientY;
}

function stopDrawing() {
    mousedragStartTimestamp = null;
    drainEnergyForMousedrag();
    isDrawing = false;
    energyFill.style.width = `${energyLevel}%`;
    energyFill.style.width = `${energyLevel}%`;
}

function drainEnergyForClick() {
    let energyLevel = parseInt(getCookie('energyLevel'));
  if (clicks < maxClicks) {
    energyLevel = Math.max(0, energyLevel - energyDrainRatePerClick);
    clicks++;
    document.cookie = `energyLevel=${energyLevel};`;
    energyFill.style.width = `${energyLevel}%`;
  }
}

function drainEnergyForMousedrag() {
  if (mousedragStartTimestamp) {
    const mousedragDuration = Date.now() - mousedragStartTimestamp;
    const energyToDrain = (mousedragDuration * energyDrainRatePerMousedrag);
    energyLevel = Math.max(0, energyLevel - energyToDrain);
    energyFill.style.width = `${energyLevel}%`;
    document.cookie = `energyLevel=${energyLevel};`;
  }
}
