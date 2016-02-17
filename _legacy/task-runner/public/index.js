/* global jQuery, _ */
/* global addLoader, removeLoader */

var $j = jQuery.noConflict();

// (function app() {

var params = _.getUrlParams();

var info = {
  requested: Number(params.requested) || 30,
  received: 0,
  task: params.task || 'task_img_verification',
  concept: params.concept || 'minivan'
};

var taskData = {};

// page elements
var elements = {
  instructionsArea: document.getElementById('instructions_area'),
  prevBtns: document.getElementsByClassName('prev_btn'),
  nextBtns: document.getElementsByClassName('next_btn'),
  controlsArea: document.getElementsByClassName('controls_area'),
  mediaArea: document.getElementById('media_area'),
  ticketComponents: [],
  responseArea: document.getElementById('response_area'),
  submitBtn: document.getElementById('submit_btn'),
};

console.log('params', params);

loadScript('loader.js')
.then(addLoader);

Promise.all([ loadScript('db.js'), loadScript('tasks/' + info.task + '.js') ])
.then(function() {
  stub_rx.loadComponents();
})
.then(function() {
  return stub_db.getTickets();
})
.then(function(tickets) {
  console.log('got ' + tickets.length);
  // tempResultsData = tickets.slice(); // TODO remove
  removeLoader();
  stub_rx.updateComponentState(tickets);
})

.catch(function(err) {
  console.log('failed to get tickets for task');
  throw err;
});

// set HTML and create event listeners on window load
window.onload = function () {
  elements.submitBtn.addEventListener('click', function (event) {
    event.preventDefault();


  });

  mturkCheckPreview();
};

function mturkSubmit() {
  var f = $j('<form action="' + params.turkSubmitTo + '/mturk/externalSubmit" type="GET"><input type="hidden" name="assignmentId" value="' + params.assignmentId + '"></input><input type="hidden" name="unused" value="unused"></input></form>');
  $j('body').append(f);
  f.submit();
}

function mturkCheckPreview() {
  if (params.assignmentId === 'ASSIGNMENT_ID_NOT_AVAILABLE') {
    _.dialog($j('<div style="background-color: rgba(0,0,0,0.5);color:white;font-size:xx-large;padding:10px"/>').text('preview'), false);
    $j('body').click(function () {
      alert('This is a preview. Please accept the HIT to work on it.');
    });
    return true;
  }
}

function loadScript(url) {
  return new Promise(function(fulfill, reject) {
    var fileType = url.split('.').reverse()[0] === 'css' ? 'css' : 'js';
    var script;
    if (fileType === 'js') {
      script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
    } else if (fileType === 'css') {
      script = document.createElement('link');
      script.href = url;
      script.type = 'text/css';
      script.rel = 'stylesheet';
    }
    script.onload = fulfill;
    script.async = 'false';
    document.body.appendChild(script);
  });
}
// }());

var stub_rx = {
  loadComponents: function() {
    return Promise.all([
      loadScript('./tasks/classes/instructionsList.js'),
      loadScript('./tasks/classes/imgOptSelect.js'),
      loadScript('./tasks/classes/imgRow.js')
    ]);
  },
  updateComponentState: function(tickets) {
   // TODO feed React
    console.log('update compenents with tickets:', tickets)

    elements.instructionsArea.appendChild(makeInstructionsList([
      'Does each of the <span class="img_counter"></span> photos below contain the named concept?'
    ], 'li'));

    // instantiate imgOptSelect class per image
    tickets.map(function(ticket, i){
      if (i % 3 === 0) elements.mediaArea.appendChild(makeImgRow());
      var newImgOptSelect = new ImgOptSelect(ticket, i);
      elements.ticketComponents.push(newImgOptSelect);
      elements.mediaArea.lastElementChild.appendChild(newImgOptSelect.optSelectContainer);
    // event listeners on OptSelect
      // add response and other metadata (worker id, img_ref) to flat output obj based on OptSelect state change
      // enable submitBtn if all images completed
    });   
    // setImgCounters();
  },
  getResultsData() {
   // TODO get all results data in React style
    return {
      here: 'is',
      is: 'an',
      object: 'object'
    };
  }
};
