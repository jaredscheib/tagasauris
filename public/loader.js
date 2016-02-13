/* global $j, elements */

var addLoader = function () {
  elements.loader = document.createElement('p');
  document.body.appendChild(elements.loader);
  var loadingHTML = 'Loading task<br>';
  elements.loader.innerHTML = loadingHTML;
  elements.loader.id = 'loader';

  var x = 0;
  elements.loader.intervalID = setInterval(function() {
    if (++x === 5) {
      x = 0;
      elements.loader.innerHTML = loadingHTML;
    }
    elements.loader.innerHTML += '.';
  }, 300);
};

var removeLoader = function() {
  window.clearInterval(elements.loader.intervalID);
  $j('#loader').remove();
  delete elements.loader;
};

var showLoader = function() {
  $j('#loader').style('visibility', true);
};
