const container = document.getElementById("canvas-container");
const canvas = document.getElementById("canvas");
const width = 1920;
const height = 1080;
let mode = 'draw';
let start = {};

// context of the canvas
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = true;

// resize canvas (CSS does scale it up or down)
canvas.height = height;
canvas.width = width;

// select default size
document.getElementById('small').firstElementChild.click();
document.getElementById('pen').firstElementChild.click();

window.addEventListener("load", () => {

});

function setSize(e, size) {
  console.log(e)
  selectSize(e);
}

function setMode(e, mode) {

  selectMode(e, mode);
}

function setColor(e, params) {
  
  selectColor(e);
}

function selectColor(e) {
  const colors = document.getElementById("colors").children;
  for (const color of colors) {
    color.classList.remove('selected');
  }

  e.target.classList.add('selected');
}

function selectMode(e, mode) {
  const tools = document.getElementsByClassName("tool");
  for (const tool of tools) {
    tool.classList.remove('selected');
  }

  const size = document.querySelector(".size.selected");
  if (size !== undefined)
    size.classList.remove('hide-select');

  if (mode === 'fill' || mode === 'rect')
    size.classList.add('hide-select');

  e.target.parentElement.classList.add('selected');
}

function selectSize(e) {
  const sizes = document.getElementsByClassName("size");
  for (const size of sizes) {
    size.classList.remove('selected');
  }

  if (e === undefined)
    return;

  e.target.parentElement.classList.add('selected');
}