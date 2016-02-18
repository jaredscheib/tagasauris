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
  questionSpan: document.getElementById('question_span'),
  prevBtns: document.getElementsByClassName('prev_btn'),
  nextBtns: document.getElementsByClassName('next_btn'),
  controlsArea: document.getElementsByClassName('controls_area'),
  mediaArea: document.getElementById('media_area'),
  ticketComponents: [],
  responseArea: document.getElementById('response_area'),
  submitBtn: document.getElementById('submit_btn'),
};

console.log('params', params);

loadScript('public/loader.js')
.then(addLoader);

Promise.all([ loadScript('public/db.js'), loadScript('public/tasks/' + info.task + '.js') ])
.then(function() {
  return stub_db.getTickets();
})
.then(function(tickets) {
  info.received = tickets.length;
  console.log('got ' + tickets.length);
  return stub_rx.loadComponents(tickets);
})
.then(function(loaded) {
  if (loaded) {
    removeLoader();
  } else {
    console.log('failed to load data');
    alert('Failed to load data. Please return HIT.');
  }
})
.catch(function(err) {
  console.log('failed to get tickets for task');
  throw err;
});

// set HTML and create event listeners on window load
window.onload = function () {
  elements.submitBtn.addEventListener('click', function (event) {
    event.preventDefault();
    console.log('Submit clicked..');
    if (stub_rx.isTaskComplete()) {
      console.log('Submitting results!');
      elements.submitBtn.setAttribute('disabled', true);

      // promise each all result tickets
      Promise.map(elements.ticketComponents, function(ticketComponent, i) {
        // hash map ticket data result to Bahjat's desired values
        var imgObj = _.mapKey(ticketComponent.imgData, 'result', {
          3: 1,
          2: -1,
          1: 0,
          0: -2
        });

        var mod = {
          amt_worker_id: params.workerId,
          amt_assignment_id: params.assignmentId,
          amt_hit_id: params.hitId,
          amt_turk_submit_to: params.turkSubmitTo,
          time_submitted: Date.now(),
        };
        // push copy of mod result to fb task results pool
        return stub_db.pushResultsRef(_.extend(imgObj, mod, info.task), info.task+'_results')
        // then update orig img ref with task key
        .then(function(imgObj) {
          return stub_db.updateImgRef(_.extend(imgObj, {}, info.task))
        });
      })
      .then(function() {
        mTurkSubmit();
        // TODO Promisify mTurkSubmit and catch possible failure, re-enable submit button? elements.submitBtn.removeAttribute('disabled');
      })
      .catch(function(err) {
        console.log('failed to sync data to firebase', err);
      });

    } else {
      alert('Please complete every item.');
    }
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
