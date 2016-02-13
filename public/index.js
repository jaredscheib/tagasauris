/* global jQuery, _ */
/* global addLoader, removeLoader */

var $j = jQuery.noConflict();

// wrap in IIFE to not expose global variables
// (function app() {

var params = _.getUrlParams(); if (params.TASK_NUM) params.TASK_NUM = Number(params.TASK_NUM);

var taskInfo = {
  ticketsToGet: Number(params.ticketsToGet) || 30,
  ticketsReceived: 0,
  taskName: params.task || 'task_img_verification_trinary',
  taskDuration: (Number(params.AssignmentDurationInSeconds) * 1000 || _.minToMs(10)), // TODO refactor?
};

var server = 'http://127.0.0.1:3020';
var apiRoute = server + '/tickets';

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
.then(function() {
  addLoader();
});
loadScript('tasks/' + taskInfo.taskName + '.js')
.then(function() {
  getTickets(taskInfo.taskName, taskInfo.ticketsToGet)
  .done(function (ticketsPool) {
    console.log('got ' + Object.keys(ticketsPool).length + ' tickets via ajax');
    // tempResultsData = ticketsPool.slice(); // TODO remove
    removeLoader();
    stub_updateComponentState(ticketsPool);
    
  })
  .fail(function(err) {
    console.log('failed to get tickets for task');
    throw err;
  });
});

// set HTML and create event listeners on window load
window.onload = function () {
  debugger;

  elements.submitBtn.addEventListener('click', function (event) {
    event.preventDefault();

    console.log('ajax post attempt');
    $j.ajax({
      url: apiRoute,
      type: 'POST',
      data: stub_getResultsData()
    })
    .done(function (res) {
      console.log('closed tickets via POST!');
      console.log('response:', res);
    });
  });

  mturkCheckPreview();
};

function getAssetId(ac, d) {
  if (Object.keys(d).length === 0) {
    return Object.keys(ac)[0];
  } else {
    var assetsCountsClone = _.deepClone(ac);
    var assetsCountsRemaining = [];

    _.each(d[params.workerId], function (entry) {
      if (params.TASK_NUM === entry.task) {
        assetsCountsClone[entry.assetId] = false;
      }
    });

    _.each(assetsCountsClone, function (val, key) {
      if (val !== false) assetsCountsRemaining.push([key, val]);
    });

    if (assetsCountsRemaining.length > 0) {
      // return media with least annotations
      assetsCountsRemaining.sort(function (a, b) { return a[1] < b[1]; });
      return assetsCountsRemaining.pop()[0];
    } else {
      _.dialog($j('<div style="background-color: rgba(0,0,0,0.5);color:white;font-size:xx-large;padding:10px"/>').text('all HITs completed'), false);
      $j('body').click(function () {
        alert('You have annotated all media. Please return this HIT.');
      });
      return true;
    }
  }
}

function getTickets(task, num) {
  // TODO AJAX GET
  console.log('ajax get attempt');
  return $j.ajax({
    url: apiRoute,
    type: 'GET',
    data: {
      task: task,
      num: num
    }
  });
}

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
  return new Promise(function(resolve, reject) {
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
    script.onload = resolve;
    script.async = 'false';
    document.body.appendChild(script);
  });
}
// }());
