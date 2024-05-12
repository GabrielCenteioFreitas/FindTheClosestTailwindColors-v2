// Loading JSON
var tailwind_colors;
fetch('./assets/cores_tailwind.json')
  .then(response => response.json())
  .then(data => {
    tailwind_colors = data;
    
    // Calling the main function after loading JSON
    findColors();
  })

// Function that changes the RGB code to Hex
function rgbToHex() {
  var red = parseInt(document.querySelector('#red').value).toString(16);
  var green = parseInt(document.querySelector('#green').value).toString(16);
  var blue = parseInt(document.querySelector('#blue').value).toString(16);

  var red_hex = red.length == 1 ? "0" + red : red;
  var green_hex = green.length == 1 ? "0" + green : green;
  var blue_hex = blue.length == 1 ? "0" + blue : blue;

  var hex_color = "#" + red_hex + green_hex + blue_hex;
  hex_color = hex_color.replace("NaN", "00");

  document.querySelector('#color-picker').value = hex_color.toUpperCase();
  document.querySelector('#hex').value = hex_color.replace("#", "").toUpperCase();
}
// Functions that changes the Hex code to RGB
function hexToRGBfromColorPicker() {
  var hex_color = document.querySelector("#color-picker").value;

  document.querySelector('#red').value = parseInt(hex_color.substring(1, 3), 16);
  document.querySelector('#green').value = parseInt(hex_color.substring(3, 5), 16);
  document.querySelector('#blue').value = parseInt(hex_color.substring(5, 7), 16);

  document.querySelector('#hex').value = hex_color.replace("#", "").toUpperCase();
}
function hexToRGBfromHEXInput(hex_color) {
  document.querySelector('#red').value = parseInt(hex_color.substring(0, 2), 16);
  document.querySelector('#green').value = parseInt(hex_color.substring(2, 4), 16);
  document.querySelector('#blue').value = parseInt(hex_color.substring(4, 6), 16);

  document.querySelector('#color-picker').value = "#" + hex_color.toUpperCase();
}

// Main function - responsible for find the closest Tailwind colors
function findColors() {
  var red = parseInt(document.querySelector('#red').value);
  var green = parseInt(document.querySelector('#green').value);
  var blue = parseInt(document.querySelector('#blue').value);
  var coordinates = [red, green, blue];
  var range = 10;
  var colors_list = [];

  function findClosestColors() {
    var minimum = [red-range, green-range, blue-range];
    var maximum = [red+range, green+range, blue+range];
    for (var key in tailwind_colors){
      var value = tailwind_colors[key];
      var in_range = true;
      for (var i = 0; i < 3; i++) {
        if (value[i] < minimum[i] || value[i] > maximum[i]) {
          in_range = false;
          break;
        }
      }
      if (in_range && !colors_list.includes(key)) {
        colors_list.push(key);
      }
    }
  }

  while (colors_list.length < 3){
    findClosestColors(range);
    range += 5;
  }

  var distances_list = []
  for (color of colors_list)  {
    var current_distance = []
    for (const [i] of Object.entries(tailwind_colors[color])) {
      current_distance.push(tailwind_colors[color][i] - coordinates[i]);
    }
    distances_list.push(Math.hypot(...current_distance));
  }

  var ordered_colors_list = []
  while (distances_list.length > 0){
    var min_distance_index = distances_list.indexOf(Math.min(...distances_list));
    ordered_colors_list.push(colors_list[min_distance_index]);
    
    colors_list.splice(min_distance_index, 1);
    distances_list.splice(min_distance_index, 1);
  }

  document.querySelector('body').style.background = `rgb(${coordinates[0]}, ${coordinates[1]}, ${coordinates[2]})`;  
  
  createTailwindColorsDivs(ordered_colors_list, tailwind_colors)
}

function createTailwindColorsDivs(closest_colors, tailwind_colors) {
  while (document.querySelector("#tailwind-colors").children.length > 1) {
    document.querySelector("#tailwind-colors").removeChild(document.querySelector("#tailwind-colors").lastChild);
  }

  var i = 1;
  for (var color of closest_colors) {
    if (i <= 5) {
      if (closest_colors.length <= 5) {
        var height = 100/closest_colors.length;
      } else {
        var height = 100/5;
      }

      const container = document.querySelector('template').content.firstElementChild.cloneNode(true);
      container.id = `container-${i}`;

      var current_container_name = container.querySelector(`.name`);
      var current_container_rgb = container.querySelector(`.rgb span`);
      var current_container_hex = container.querySelector(`.hex span`);
    
      var current_color_coordinates = tailwind_colors[color];
      var current_color_rgb = `${current_color_coordinates[0]}, ${current_color_coordinates[1]}, ${current_color_coordinates[2]}`;
      var red = current_color_coordinates[0].toString(16);
      var green = current_color_coordinates[1].toString(16);
      var blue = current_color_coordinates[2].toString(16);
      var red_hex = red.length == 1 ? "0" + red : red;
      var green_hex = green.length == 1 ? "0" + green : green;
      var blue_hex = blue.length == 1 ? "0" + blue : blue;
      var current_color_hex = "#" + red_hex + green_hex + blue_hex;

      var current_color_name = closest_colors[i-1];
    
      current_container_name.textContent = current_color_name;
      current_container_rgb.textContent = current_color_rgb;
      current_container_hex.textContent = current_color_hex.toUpperCase();
      container.style.height = height + "vh";
      container.style.height = height + "%";
      container.style.backgroundColor = `rgb(${current_color_rgb})`;

      document.querySelector("#tailwind-colors").appendChild(container);
    }
  
    i++;
  }
}

// Adding EventListener to the inputs
document.querySelector("#color-picker").addEventListener("input", function() {  
  hexToRGBfromColorPicker();
  findColors();
});
document.querySelector("#hex").addEventListener("input", function() {
  if (document.querySelector("#hex").value.length === 6) {
    hexToRGBfromHEXInput(document.querySelector("#hex").value);
    findColors();
  }
  else if (document.querySelector("#hex").value.length === 3) {
    var hex_color = document.querySelector("#hex").value.replace(/([a-f\d])/gi, '$1$1');
    hexToRGBfromHEXInput(hex_color);
    findColors();
  }
});

document.querySelectorAll("#rgb .inputs").forEach(function(input) {
  input.addEventListener("input", function() {
    rgbToHex();
    findColors();
  });
});

// Adding a click EventListener to close the Tailwind colors infos
document.addEventListener('click', function(event) {
  const expandedContainer = document.querySelector('.expanded .color-wrapper');

  // Verifica se o clique ocorreu fora da div expandida
  if (expandedContainer && !expandedContainer.contains(event.target)) {
    expandedContainer.parentElement.classList.remove("expanded");
  }
});

// Regex
function regexHex(event) {
  var typedChar = event.data || String.fromCharCode(event.which || event.keyCode);
  var regex = /[a-fA-F0-9]/;

  if (!regex.test(typedChar)) {
      event.preventDefault();
      return false;
  }
  return true;
}

function regexRGB(event) {
  var keyCode = ('which' in event) ? event.which : event.keyCode;
  var typedChar = String.fromCharCode(keyCode);
  var regex1 = /[\d\b]/;
  var regex2 = /^(?:25[0-5]|2[0-4][0-9]|[01]?[0-9]?[0-9])?$/;

  if (regex1.test(typedChar)) {
      var currentValue = event.target.value;
      var newValue = currentValue.slice(0, event.target.selectionStart) + typedChar + currentValue.slice(event.target.selectionEnd);

      if (regex2.test(newValue)) {
          return true;
      }
      else {
          event.preventDefault();
          return false;
      }
  }
  else {
      event.preventDefault();
      return false;
  }
}

// Copy button
function copyText(text) {
  var temporaryTextArea = document.createElement("textarea");
  temporaryTextArea.value = text;
  document.body.appendChild(temporaryTextArea);
  temporaryTextArea.select();
  temporaryTextArea.setSelectionRange(0, 99999);
  document.execCommand("copy");
  document.body.removeChild(temporaryTextArea);
}
function copyHexCode() {
  var hexCodeToCopy = "#" + document.querySelector("#hex").value;
  copyText(hexCodeToCopy);
}
function copyRGBCode() {
  var RGBCodeToCopy = `rgb(${document.querySelector("#red").value}, ${document.querySelector("#green").value}, ${document.querySelector("#blue").value})`;
  copyText(RGBCodeToCopy);
}
function copyTailwindColorName() {
  var tailwindColorName = event.target.parentNode.parentNode.parentNode.querySelector(".name").textContent;
  copyText(tailwindColorName);
}
function copyTailwindRGBCode() {
  var tailwindRGBCode = `rgb(${event.target.parentNode.parentNode.querySelector("span").textContent})`;
  copyText(tailwindRGBCode);
}
function copyTailwindHexCode() {
  var tailwindHexCode = `${event.target.parentNode.parentNode.querySelector("span").textContent}`;
  copyText(tailwindHexCode);
}

// Show Tailwind color info
function expandColorInfo() {
  if (document.querySelector(".expanded") && (document.querySelector(".expanded") != event.target.parentNode.parentNode.parentNode.parentNode)) {
    document.querySelector(".expanded").classList.remove("expanded");
  }

  event.target.parentNode.parentNode.parentNode.parentNode.classList.toggle("expanded");
}

// Randomizing the start color
function randomizeColor() {
  var hex_characters = '0123456789ABCDEF';
  var color = '';
  for (var i = 0; i < 6; i++) {
    color += hex_characters[Math.floor(Math.random() * 16)];
  }
  document.querySelector("#hex").value = color;
  hexToRGBfromHEXInput(color);
}
randomizeColor();