// Loading JSON
var cores_tailwind;
fetch('./assets/cores_tailwind.json')
  .then(response => response.json())
  .then(cores_tailwind_json => {
    cores_tailwind = cores_tailwind_json;
    
    // Calling the main function after loading JSON
    acharCores();
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
function acharCores() {
  var red = parseInt(document.querySelector('#red').value);
  var green = parseInt(document.querySelector('#green').value);
  var blue = parseInt(document.querySelector('#blue').value);
  var coordenadas = [red, green, blue];
  var range = 10;
  var lista = [];

  function acharProximos() {
    var minimo = [red-range, green-range, blue-range];
    var maximo = [red+range, green+range, blue+range];
    for (var key in cores_tailwind){
      var value = cores_tailwind[key];
      var in_range = true;
      for (var i = 0; i < 3; i++) {
        if (value[i] < minimo[i] || value[i] > maximo[i]) {
          in_range = false;
          break;
        }
      }
      if (in_range && !lista.includes(key)) {
        lista.push(key);
      }
    }
  }

  while (lista.length < 3){
    acharProximos(range);
    range += 5;
  }

  var distancias = []
  for (cor of lista)  {
    var distancia_atual = []
    for (const [i] of Object.entries(cores_tailwind[cor])) {
      distancia_atual.push(cores_tailwind[cor][i] - coordenadas[i]);
    }
    distancias.push(Math.hypot(...distancia_atual));
  }

  var lista_ordenada = []
  while (distancias.length > 0){
    var index_min_distancia = distancias.indexOf(Math.min(...distancias));
    lista_ordenada.push(lista[index_min_distancia]);
    
    lista.splice(index_min_distancia, 1);
    distancias.splice(index_min_distancia, 1);
  }

  document.querySelector('body').style.background = `rgb(${coordenadas[0]}, ${coordenadas[1]}, ${coordenadas[2]})`;  
  
  createTailwindColorsDivs(lista_ordenada, cores_tailwind)
}

function createTailwindColorsDivs(cores_proximas, cores_tailwind) {
  while (document.querySelector("#tailwind-colors").children.length > 1) {
    document.querySelector("#tailwind-colors").removeChild(document.querySelector("#tailwind-colors").lastChild);
  }

  var i = 1;
  for (var cor of cores_proximas) {
    if (i <= 5) {
      if (cores_proximas.length <= 5) {
        var altura = 100/cores_proximas.length;
      } else {
        var altura = 100/5;
      }

      const container = document.querySelector('template').content.firstElementChild.cloneNode(true);
      container.id = `container-${i}`;

      var nome_container_atual = container.querySelector(`.name`);
      var rgb_container_atual = container.querySelector(`.rgb span`);
      var hex_container_atual = container.querySelector(`.hex span`);
    
      var lista_cor_atual = cores_tailwind[cor];
      var cor_atual_rgb = `rgb(${lista_cor_atual[0]}, ${lista_cor_atual[1]}, ${lista_cor_atual[2]})`;
      var red = lista_cor_atual[0].toString(16);
      var green = lista_cor_atual[1].toString(16);
      var blue = lista_cor_atual[2].toString(16);
      var red_hex = red.length == 1 ? "0" + red : red;
      var green_hex = green.length == 1 ? "0" + green : green;
      var blue_hex = blue.length == 1 ? "0" + blue : blue;
      var cor_atual_hex = "#" + red_hex + green_hex + blue_hex;

      var nome_atual = cores_proximas[i-1];
    
      nome_container_atual.textContent = nome_atual;
      rgb_container_atual.textContent = `${lista_cor_atual[0]}, ${lista_cor_atual[1]}, ${lista_cor_atual[2]}`;
      hex_container_atual.textContent = cor_atual_hex.toUpperCase();
      container.style.height = altura + "vh";
      container.style.height = altura + "%";
      container.style.backgroundColor = cor_atual_rgb;

      document.querySelector("#tailwind-colors").appendChild(container);
    }
  
    i++;
  }
}

// Adding EventListener to the inputs
document.querySelector("#color-picker").addEventListener("input", function() {  
  hexToRGBfromColorPicker();
  acharCores();
});
document.querySelector("#hex").addEventListener("input", function() {
  if (document.querySelector("#hex").value.length === 6) {
    hexToRGBfromHEXInput(document.querySelector("#hex").value);
    acharCores();
  }
  else if (document.querySelector("#hex").value.length === 3) {
    var hex_color = document.querySelector("#hex").value.replace(/([a-f\d])/gi, '$1$1');
    hexToRGBfromHEXInput(hex_color);
    acharCores();
  }
});

document.querySelectorAll("#rgb .inputs").forEach(function(input) {
  input.addEventListener("input", function() {
    rgbToHex();
    acharCores();
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
  var varters = '0123456789ABCDEF';
  var color = '';
  for (var i = 0; i < 6; i++) {
    color += varters[Math.floor(Math.random() * 16)];
  }
  document.querySelector("#hex").value = color;
  hexToRGBfromHEXInput(color);
}
randomizeColor();