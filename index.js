/* global jQuery, Firebase, _, YT, anno */

var $j = jQuery.noConflict();

// wrap in IIFE to not expose global variables
// (function app() {
var params = _.getUrlParams(); if (params.TASK_NUM) params.TASK_NUM = Number(params.TASK_NUM);

var taskInfo = {
  ticketsToGet: Number(params.ticketsToGet) || 30,
  ticketsReceived: 0,
  taskName: params.taskName || 'task_img_verification_trinary',
  taskDuration: (Number(params.AssignmentDurationInSeconds) * 1000 || _.minToMs(10)), // TODO refactor?
};

var taskData = {};

// page elements
var elements = {
  instructionsArea: document.getElementById('instructions_area'),
  prevBtns: document.getElementsByClassName('prev_btn'),
  nextBtns: document.getElementsByClassName('next_btn'),
  controlsArea: document.getElementsByClassName('controls_area'),
  mediaArea: document.getElementById('media_area'),
  resTicketItems: [],
  responseArea: document.getElementById('response_area'),
  submitBtn: document.getElementById('submit_btn'),
};

console.log('params', params);

getTickets(taskInfo.taskName, taskInfo.ticketsToGet)
.then(function (ticketsPool) {
  updateComponents(ticketsPool);
  // if (params.TODAY_DATA_DATE) {
  //   assetsCounts = taskData.all.assets[params.TODAY_DATA_DATE];
  //   if (taskData.all.data[params.TODAY_DATA_DATE] === undefined) taskData.all.data[params.TODAY_DATA_DATE] = {};
  // }

  // if (params.TODAY_DATA_DATE === '20160114') {
  //   assetId = getAssetId(assetsCounts, taskData.all.data[params.TODAY_DATA_DATE]);
  // // any dates past 20160114
  // } else if (params.TODAY_DATA_DATE === '20160123') {
  //   assetId = getAssetId(assetsCounts[params.ASSET_TYPE], taskData.all.data[params.TODAY_DATA_DATE]);
  //   // console.log('assetId', assetId);
  // }

  // if (params.ASSET_TYPE === 'img') {
  //   imgTotal = assetToImgTotal[assetId];

  //   drawImgGrid();
  //   setImgCounters();
  // } else if (params.ASSET_TYPE === 'vid') {
  //   loadScript('https://www.youtube.com/iframe_api');
  // }
});

// set HTML and create event listeners on window load
window.onload = function () {

  debugger;
  elements.submitBtn.addEventListener('click', function (event) {
    event.preventDefault();

    var postRef = dbRef.root.child(ticketsInfo.ticketsRes);
    elements.resTicketItems.forEach(function (resTicketItem) {
      resTicketItem.resTicket[ticketsInfo.ticketsReq_uid] = resTicketItem.resTicket.reqTicket.uid;
      resTicketItem.resTicket.workerId = params.workerId;
      resTicketItem.resTicket.timeSubmitted = _.getNow();
      postRef.push(resTicketItem.resTicket);
    });
    return;
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
}

function updateComponents() {
 // TODO feed React
}

function mturkSubmit() {
  var f = $j('<form action="' + params.turkSubmitTo + '/mturk/externalSubmit" method="GET"><input type="hidden" name="assignmentId" value="' + params.assignmentId + '"></input><input type="hidden" name="unused" value="unused"></input></form>');
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

function loadScript(url, callback) {
  var returnCallback = function(arg) { return callback(arg); };
  var fileType = url.split('.').reverse()[0] === 'css' ? 'css' : 'js';
  var script;
  if (fileType === 'js') {
    script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    if (callback !== undefined) script.onload = returnCallback;
  } else if (fileType === 'css') {
    script = document.createElement('link');
    script.href = url;
    script.type = 'text/css';
    script.rel = 'stylesheet';
    if (callback !== undefined) script.onload = returnCallback;
  }
  script.async = 'false';
  document.body.appendChild(script);
  return returnCallback;
}
// }());
