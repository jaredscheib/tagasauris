var addLoader = function () {
  var p = document.createElement('p');
  document.body.appendChild(p);
  var loadingHTML = 'Loading task<br>';
  p.innerHTML = 'Loading task<br>';
  p.setAttribute('font-size', '36px');
  p.setAttribute('text-align', 'center');
  p.setAttribute('margin', '200px auto');
  p.setAttribute('display', 'inline-block');
  p.id = 'p_loader';

  var x = 0;
  var intervalID = setInterval(function() {
    if (++x === 5) {
      x = 0
      p.innerHTML = loadingHTML;
    }
    p.innerHTML += '.';
  }, 300);

  setTimeout(function(){ window.clearInterval(intervalID); }, 5000)

  removeLoader.bind(null, intervalID);
};

var removeLoader = function() {
  $j('p_loader').remove();
};