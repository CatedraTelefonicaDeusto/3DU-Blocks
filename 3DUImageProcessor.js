
var UNDEFINED_COLOR = 0;
var RED = 1;
var GREEN = 2;
var BLUE = 3;
var YELLOW = 4;
var WHITE = 5;
var BLACK = 6;

/* 
  Conversion from the RGB color model to HSV
*/
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  var max = Math.max(r, g, b);
  var h, s, v = max;
  var min = Math.min(r, g, b);

  var d = max - min;
  s = max === 0 ? 0 : d / max;

  if(max === min) {
    h = 0; // achromatic
  }
  else {
    switch(max) {
      case r: 
        h = (g - b) / d + (g < b ? 6 : 0); 
        break;
      case g: 
        h = (b - r) / d + 2; 
        break;
      case b: 
        h = (r - g) / d + 4; 
        break;
    }
    h /= 6;
  }
  
  var ret = {
    h: h*360,
    s: s,
    v: v
  };

  return ret;
}

/* 
  Given an RGB value, it converts it to HSV and determines which of our predetermined colors is more accurate to the 
  given one. The predetermined colors we work with at the moment are defined as constants at the beginning of this file.
  If there is not match for the pixel, UNDEFINED_COLOR is returned
*/

function determineColor(r, g, b) {
  var hsv = rgbToHsv(r, g, b);
  var ret = UNDEFINED_COLOR;

  if(hsv.s <= 0.25 && hsv.v >= 0.55) {
    ret = WHITE;
  } 
  else if (hsv.v < 0.25) {
    ret = BLACK;
  }
  else if (hsv.s >= 0.3) {
    if (hsv.h <= 25 || hsv.h >= 300) {
      ret = RED;
    }
    if (hsv.h >= 25 && hsv.h <= 70) {
      ret = YELLOW;
    }
    if (hsv.h >= 70 && hsv.h <= 155) {
      ret = GREEN;
    }
    if (hsv.h >= 155 && hsv.h <= 300) {
      ret = BLUE;
    }
  }
  
  return ret;
}

/* 
  Receives an image and returns an array composed of the normalized pixels of that photo.
*/
function normalizeImageColors(img, array) {
  var i, j, r, g, b, index;
  for(j = 0; j < img.height; j++) {
    for(i = 0; i < img.width; i++) {
      index = (j * img.width + i) * 4;

      r = img.data[index];
      g = img.data[index + 1];
      b = img.data[index + 2];
      
      array[i][j] = determineColor(r,g,b);
    }
  }
  return array;
}

/* 
  Determines an area's predominant color.
  The function receives an array which represents an image, and the divisions we will to make on both X and Y axises 
  (xDiv and yDiv). This areas will generate a new array[xDiv][yDiv] with an object per cell which counts the number 
  of appearances of each color at that area of the initial array.
  Finally, this new array is return with the main predominant color of each area. 
*/
function determinePredominantColor(array, xDiv, yDiv) {
  var xDimension = array.length;
  var yDimension = array[0].length;
  var i, j;

  var pixelsPerCell = (Math.floor(xDimension/xDiv)) * (Math.floor(yDimension/yDiv));

  var percentagesArray = Array.matrix(xDiv, yDiv, 0);

  for(i = 0; i < xDiv; i++) {
    for(j = 0; j < yDiv; j++) {
      percentagesArray[i][j] = {
        'UNDEFINED_COLOR': 0,
        'RED': 0,
        'BLUE': 0,
        'GREEN': 0,
        'YELLOW': 0,
        'WHITE': 0,
        'BLACK': 0
      };
    }
  }
  
  for(j = 0; j < yDimension; j++) {
    for(i = 0; i < xDimension; i++) {      
      switch(array[i][j]) {
        case RED:
          percentagesArray[Math.floor(i/(xDimension/xDiv))][Math.floor(j/(yDimension/yDiv))].RED++;
          break;
        case GREEN:
          percentagesArray[Math.floor(i/(xDimension/xDiv))][Math.floor(j/(yDimension/yDiv))].GREEN++;
          break;
        case BLUE:
          percentagesArray[Math.floor(i/(xDimension/xDiv))][Math.floor(j/(yDimension/yDiv))].BLUE++;
          break;
        case YELLOW:
          percentagesArray[Math.floor(i/(xDimension/xDiv))][Math.floor(j/(yDimension/yDiv))].YELLOW++;
          break;
        case WHITE:
          percentagesArray[Math.floor(i/(xDimension/xDiv))][Math.floor(j/(yDimension/yDiv))].WHITE++;
          break;
        case BLACK:
          percentagesArray[Math.floor(i/(xDimension/xDiv))][Math.floor(j/(yDimension/yDiv))].BLACK++;
          break;
      }
    }
  }

  var color = UNDEFINED_COLOR;
  var highest;

  for(j = 0; j < yDiv; j++) {
    for(i = 0; i < xDiv; i++) {
      highest = percentagesArray[i][j].UNDEFINED_COLOR;
      
      if(percentagesArray[i][j].RED > highest) {
        highest = percentagesArray[i][j].RED;
        color = RED;
      }
      if(percentagesArray[i][j].BLUE > highest) {
        highest = percentagesArray[i][j].BLUE;
        color = BLUE;
      }
      if(percentagesArray[i][j].GREEN > highest) {
        highest = percentagesArray[i][j].GREEN;
        color = GREEN;
      }
      if(percentagesArray[i][j].YELLOW > highest) {
        highest = percentagesArray[i][j].YELLOW;
        color = YELLOW;
      }
      if(percentagesArray[i][j].WHITE > highest) {
        highest = percentagesArray[i][j].WHITE;
        color = WHITE;
      }
      if(percentagesArray[i][j].BLACK > highest) {
        highest = percentagesArray[i][j].BLACK;
        color = BLACK;
      }
      
      (highest > (pixelsPerCell * 0.15)) ? percentagesArray[i][j] = color : percentagesArray[i][j] = UNDEFINED_COLOR;
    }
  }
  
  return percentagesArray;
}

/*  
  Paints a given string array on a canvas.
  The array will be looped through in order to determine the color of each pixel that conforms the final image, which will 
  be passed to the image_data that will next be painted on the canvas.
  If enableLines is true, a kind of grille will be drawn in black between each cell
*/
function paint(array, image_data, context, enableLines) {
  var xDimension = array.length;
  var yDimension = array[0].length;
  var pixel = image_data.data;
  var i, j, index;

  for(j = 0; j < image_data.height; j++) {
    for(i = 0; i < image_data.width; i++) {
      index = (j * image_data.width + i) * 4;
      if(i == 0 && j == 0) {
          //console.log("Color: " + array[0]);
        }
      switch (array[Math.floor(i/(image_data.width/xDimension))][Math.floor(j/(image_data.height/yDimension))]) {
        case UNDEFINED_COLOR:
          pixel[index+3] = 0;
          break;
        case RED:
          pixel[index] = 255;
          pixel[index+1] = 0;
          pixel[index+2] = 0;
          pixel[index+3] = 255;
          break;
        case GREEN:
          pixel[index] = 0;
          pixel[index+1] = 255;
          pixel[index+2] = 0;
          pixel[index+3] = 255;
          break;
        case BLUE:
          pixel[index] = 0;
          pixel[index+1] = 0;
          pixel[index+2] = 255;
          pixel[index+3] = 255;
          break;
        case YELLOW:
          pixel[index] = 255;
          pixel[index+1] = 255;
          pixel[index+2] = 0;
          pixel[index+3] = 255;
          break;
        case 5:
          pixel[index] = 255;
          pixel[index+1] = 255;
          pixel[index+2] = 255;
          pixel[index+3] = 255;
          break;
        case BLACK:
          pixel[index] = 0;
          pixel[index+1] = 0;
          pixel[index+2] = 0;
          pixel[index+3] = 255;
          break;
      }
      
      if(enableLines) {
        if(i % Math.floor(image_data.width/xDimension) === 0) {
          pixel[index] = 0;
          pixel[index+1] = 0;
          pixel[index+2] = 0;
          pixel[index+3] = 255;
        }
        if(j % Math.floor(image_data.height/yDimension) === 0) {
          pixel[index] = 0;
          pixel[index+1] = 0;
          pixel[index+2] = 0;
          pixel[index+3] = 255;
        }
      }
    }
  }
  context.putImageData(image_data, 0, 0);
}

/*
  Uses both bottom marker pieces on the image to calculate the angle between them.
  The function is able to tell if the image needs to be rotated clockwise or counterclockwise, and the radians of the rotation.
*/
function calculateRotation(array) {
  var xDimension = array.length;
  var yDimension = array[0].length;
  var i, j;

  var auxCounter = 0;
  var markerCounter;
  var markerFound = false;
  var top = 0;
  
  for(j = 0; j < yDimension; j++) {
    markerCounter = 0;
    for(i = 0; i < xDimension; i++) {
      if(array[i][j] === MARKER_COLOR) {
        markerCounter++;
        top = j;
      }
    }
    if(markerCounter !== 0 && !markerFound) {
      markerFound = true;
    }
    if(markerCounter === 0 && markerFound) {
      auxCounter++;
    }
    if(auxCounter > 1) {
      break;
    }
  }

  var bottomLeft = {"x": 0, "y": top};
  var bottomRight = {"x": xDimension/2, "y": top};

  markerFound = false;

  for(j = top; j < yDimension; j++) {
    if(!markerFound) {
      for(i = 0; i < Math.floor(xDimension/2); i++) {
        if(array[i][j] === MARKER_COLOR && array[i][j+1] === MARKER_COLOR) {
          bottomLeft.x = i;
          bottomLeft.y = j;
          markerFound = true;
        }
      }
    }
  }

  markerFound = false;

  for(j = top; j < yDimension; j++) {
    if(!markerFound) {
      for(i = Math.floor(xDimension/2); i < xDimension; i++) {
        if(array[i][j] === MARKER_COLOR && array[i][j+1] === MARKER_COLOR) {
          bottomRight.x = i;
          bottomRight.y = j;
          markerFound = true;
        }
      }
    }
  }

  var xDifference = bottomRight.x - bottomLeft.x;
  var yDifference = bottomLeft.y - bottomRight.y;

  if(xDifference < 0) {
    var ex = new userException('Unable to calculate rotation.');
    throw ex;
  }

  var rotation = {
    'angle': (Math.atan(Math.abs(yDifference)/xDifference)), 
    'direction': (yDifference > 0) ? "clockwise" : "counterclockwise"
  };

  return rotation;
}

/*
  Flips a given array vertically (over the x-axis).
*/
function flipVertically(array) {
  var xDimension = array.length;
  var yDimension = array[0].length;
  var i, j;
  
  var flippedArray = Array.matrix(xDimension, yDimension, UNDEFINED_COLOR);

  for(i = 0; i < xDimension; i++) {
    for(j = 0; j < yDimension; j++) {
      flippedArray[i][yDimension-j] = array[i][j];
    }
  }
  
  return flippedArray;
}

/*
  Applies a rotation matrix over an array with a given angle and direction (clockwise/counterclockwise).
  This method is called after calculateRotation.
*/
function rotateMatrix(array, angle, direction) {
  var xDimension = array.length;
  var yDimension = array[0].length;
  var i, j, x, y;
  
  angle = (direction === "counterclockwise") ? angle : (angle * -1);

  var rotatedArray = Array.matrix(xDimension, yDimension, UNDEFINED_COLOR);
  
  for(i = 0; i < xDimension; i++) {
    for(j = 0; j < yDimension; j++) {
      x = Math.floor((i * Math.cos(angle)) - ((yDimension-j) * Math.sin(angle)));
      y = Math.floor((i * Math.sin(angle)) + ((yDimension-j) * Math.cos(angle)));
      
      if(x >= 0 && x < xDimension && y >= 0 && y < yDimension) {
        rotatedArray[x][y] = array[i][j];
      }
    }
  }

  var ret = flipVertically(rotatedArray);
  
  return ret;
}

/*
  Finds the marker pieces on the image and returns the margin limitations.
*/
function calculateMargins(array, width, height) {
  var xDimension = array.length;
  var yDimension = array[0].length;
  var i, j, pos;
  
  var top = 0;  
  var markerCounter;  
  
  for(j = 0; j < yDimension; j++) {
    markerCounter = 0;
    for(i = 0; i < xDimension; i++) {
      if(array[i][j] === MARKER_COLOR) {
        markerCounter++;
      }
    }
    if(markerCounter !== 0) {
      top = j;
    }
    if(markerCounter === 0 && top !== 0) {
      break;
    }
  }
  
  var bottom = 0;
  var bottomFound = false;
  
  for(j = top + 1; j < yDimension; j++) {
    for(i = 0; i < xDimension; i++) {
      if(array[i][j] === MARKER_COLOR) {
        bottom = j;
        bottomFound = true;
      }
    }
    if(bottomFound) {
      break;
    }
  }
  
  var left = 0;
  var leftFound = false;
  var auxCounter = 0;
  
  for(i = 1; i < xDimension; i++) {
    pos = array[i].indexOf(MARKER_COLOR); 
    if(pos !== -1) {
      if(array[i-1].indexOf(MARKER_COLOR) !== -1) {
        left = i
        leftFound = true;
      }
    }
    if(pos === -1 && leftFound) {
      auxCounter++;
    }
    if(auxCounter > 3) {
      break;
    }
  }
  
  var right = 0;
  
  for(i = left + 1; i < xDimension; i++) {
    pos = array[i].indexOf(MARKER_COLOR); 
    if(pos !== -1 && array[i+1].indexOf(MARKER_COLOR) !== -1) {
      right = i;
      break;
    }
  }

  if(left > right || top > bottom) {
    var ex = new userException('Unable to calculate margins.');
    throw ex;
  }
  
  var margins = {
    'left': (left + 1) * Math.floor(width/xDimension),
    'top': (top + 1) * Math.floor(height/yDimension),
    'right': right * Math.floor(width/xDimension),
    'bottom': bottom * Math.floor(height/yDimension)
  }

  return margins;
}

/*
  This function receives an array and cut it by the given left, top, right and bottom limits, returning the cut array.
  It is called after 'calculateMargins' to cut the array inside the marker pieces.
*/
function cutArray(array, left, top, right, bottom) {
  var cutArray = Array.matrix(right-left, bottom-top, undefined);
  var i,j;

  for(i = left; i < right; i++) {
    for(j = top; j < bottom; j++) {
      cutArray[i-left][j-top] = array[i][j];
    }
  }
  
  return cutArray;
}
