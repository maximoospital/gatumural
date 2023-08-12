// script.js
paper.setup(document.getElementById('canvas'));

// Load the custom SVG shape
paper.project.importSVG('gaturro_outline.svg', function (item) {
  // Create a path from the imported SVG item
  const path = item.children[0];
  path.strokeColor = 'black';
  path.strokeWidth = 2;

  // Create a Paper.js Path object to use as the clipping mask
  const clippingPath = new paper.Path(path.pathData);
  clippingPath.fillColor = 'black';

  // Create a Paper.js Layer to contain the canvas drawing
  const drawingLayer = new paper.Layer();
  drawingLayer.clipped = true;
  drawingLayer.clipMask = clippingPath;

  // Your canvas drawing code goes here, using the drawingLayer
});
