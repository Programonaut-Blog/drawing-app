import '../css/style.css'
import { colors } from "./colors";

const container = document.getElementById("canvas-container");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");
const width = 1920;
const height = 1080;

function setupCanvas(canvasToSetup) {
  // context of the canvas
  const context = canvasToSetup.getContext("2d");
  context.imageSmoothingEnabled = true;

  // resize canvas (CSS does scale it up or down)
  canvasToSetup.height = height;
  canvasToSetup.width = width;
  return context;
}

const context = setupCanvas(canvas);
const previewCtx = setupCanvas(preview);

function setColor(e, color) {
  context.strokeStyle = colors[color];
  context.fillStyle = colors[color];

  previewCtx.strokeStyle = colors[color];
  previewCtx.fillStyle = colors[color];

  selectColor(e);
}

function selectColor(e) {
  const colors = document.getElementById("colors").children;
  for (const color of colors) {
    color.classList.remove('selected');
  }

  e.target.classList.add('selected');
}

let mode = 'draw';

function selectMode(e, newMode) {
  const tools = document.getElementsByClassName("tool");
  for (const tool of tools) {
    tool.classList.remove('selected');
  }
  
  const size = document.querySelector(".size.selected");
  if (size !== null)
  {
    size.classList.remove('hide-select');
    if (newMode === 'rect')
      size.classList.add('hide-select');
  }
    
  
  e.target.parentElement.classList.add('selected');

  mode = newMode;
}

const activeEvents = {
  "mousedown": undefined,
  "mouseup": undefined,
  "mousemove": undefined
};

function setMode(e, mode) {
  for (const event in activeEvents) {
    window.removeEventListener(event, activeEvents[event]);
    activeEvents[event] = undefined;
  }

  switch (mode) {
    case 'pen':
      window.addEventListener("mousedown", startDraw);
      window.addEventListener("mouseup", endDraw);
      window.addEventListener("mousemove", draw);

      activeEvents['mousedown'] = startDraw;
      activeEvents['mouseup'] = endDraw;
      activeEvents['mousemove'] = draw;
      break;
    case 'path':
      window.addEventListener("mousedown", startPath);
      window.addEventListener("mouseup", endPath);
      window.addEventListener("mousemove", updatePath);

      activeEvents['mousedown'] = startPath;
      activeEvents['mouseup'] = endPath;
      activeEvents['mousemove'] = updatePath;
      break;
    case 'polygon':
      window.addEventListener("mousedown", startPolygon);
      window.addEventListener("mouseup", endPolygon);

      activeEvents['mousedown'] = startPolygon;
      activeEvents['mouseup'] = endPolygon;
      break;
    case 'rect':
      window.addEventListener("mousedown", startRect);
      window.addEventListener("mouseup", endRect);

      activeEvents['mousedown'] = startRect;
      activeEvents['mouseup'] = endRect;
      break;

    default:
      break;
  }

  selectMode(e, mode);
}

const sizes = {
  'small': 5,
  'medium': 10,
  'big': 15
}

function setSize(e, size) {
  context.lineWidth = size;

  previewCtx.lineWidth = size;

  selectSize(e);
}


function selectSize(e) {
  if (mode === 'rect')
    return;

  const sizes = document.getElementsByClassName("size");
  for (const size of sizes) {
    size.classList.remove('selected');
  }
  
  if (e === undefined)
  return;
  
  e.target.parentElement.classList.add('selected');
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

  return {
    x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  }
}


// --- Pen ---

let drawing = false;

function startDraw(e) {
  drawing = true;
  context.beginPath();
  draw(e)
}

function endDraw(e) {
  drawing = false;
}

function draw(e) {
  if (!drawing) return;

  let { x, y } = getMousePos(canvas, e);

  context.lineTo(x, y);
  context.stroke();

  // for smoother drawing
  context.beginPath();
  context.moveTo(x, y);
}

// --- Path ---

const startPos = {
  x: 0,
  y: 0
}

function startPath(e) {
  drawing = true;
  context.beginPath();

  let { x, y } = getMousePos(canvas, e);
  startPos.x = x;
  startPos.y = y;

  draw(e)
}

function updatePath(e) {
  if (!drawing) return;
  clearCanvas(previewCtx);

  let { x: startX, y: startY } = startPos;
  let { x, y } = getMousePos(canvas, e);
  console.log(startX, startY, x, y);

  previewCtx.beginPath();
  previewCtx.moveTo(startX, startY);
  previewCtx.lineTo(x, y);
  previewCtx.stroke();
}

function endPath(e) {
  drawing = false;
  let { x, y } = getMousePos(canvas, e);
  
  context.lineTo(x, y);
  context.stroke();
}

// --- Polygon ---

let poly = false;
let polyTimeout = undefined;

function startPolygon(e) {
  if (e.target.id !== 'canvas')
    return;

  drawing = true;

  if (poly) {
    polygon(e);
  }
  else {
    context.beginPath();
    draw(e);
  }
  poly = true;
}

function endPolygon(e) {
  if (!poly)
    return;

  polyTimeout = setTimeout(() => {
    drawing = false;
    context.closePath();
    context.stroke();

    poly = false;
  }, 1000);
}

function polygon(e) {
  if (!drawing) return;
  clearTimeout(polyTimeout);

  let { x, y } = getMousePos(canvas, e);
  
  context.lineTo(x, y);
  context.stroke();
}

// --- Rect ---
let start = {}

function startRect(e) {
    start = getMousePos(canvas, e);
}

function endRect(e) {
    let { x, y } = getMousePos(canvas, e);
    context.fillRect(start.x, start.y, x - start.x, y - start.y);
}

// --- Clear ---

function clearCanvas(context) {
  console.log("Clearing canvas");
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function initialize() {
  const colorButtons = document.getElementById('colors').children;
  for (const colorButton of colorButtons) {
    colorButton.addEventListener('click', (e) => { setColor(e, colorButton.classList.value.replace(/bg-(\w*).*/, '$1'))} );
  }

  const tools = document.getElementsByClassName('tool');
  for (const tool of tools) {
    tool.addEventListener('click', (e) => { setMode(e, tool.id)} );
  }

  const sizeButtons = document.getElementsByClassName('size');
  for (const sizeButton of sizeButtons) {
    sizeButton.addEventListener('click', (e) => { setSize(e, sizes[sizeButton.id])} );
  }

  document.getElementById('clear').addEventListener('click', (e) => clearCanvas(context));

  // set default settings
  context.lineCap = 'round';
  document.getElementById('small').firstElementChild.click();
  document.getElementById('pen').firstElementChild.click();
  document.getElementById('black').click();
}

initialize();