// non img+annotorious tasks

/* global jQuery, Firebase, _, anno */
/* global elements, params */

var assetsCounts;
var assetId;

var vidEvents = {};
var vidCompleted = false;

var player;
var annotext;
var enterKeywordBtn;

window.onload = function () {
  var playerDiv = document.createElement('div');
  playerDiv.id = 'player';
  elements.mediaArea.appendChild(playerDiv);

  if (params.TASK_NUM === 3) { // checkboxes response
    elements.instructionsList.innerHTML = 'Please watch the entire video. Pause and replay as necessary.<br>' +
                              'At the moment you see anything, click that concept from among the checkboxes below.<br>' +
                              'Please pause and replay as necessary in order to submit multiple simultaneous concepts.<br>' +
                              'When you have entered every concept and finished the video, click submit.';
    elements.responseArea.innerHTML = '<div id="annochecks">' +
                              '<input type="checkbox" name="checkboxes" value="driving">driving</input><br>' +
                              '<input type="checkbox" name="checkboxes" value="carExterior">car exterior</input><br>' +
                              '<input type="checkbox" name="checkboxes" value="carInterior">car interior</input><br>' +
                              '<input type="checkbox" name="checkboxes" value="road">road</input><br>' +
                              '<input type="checkbox" name="checkboxes" value="people">people</input><br>' +
                              '<input type="checkbox" name="checkboxes" value="truck">truck</input><br>' +
                              '<input type="checkbox" name="checkboxes" value="BMW">BMW</input><br>' +
                              '<input type="checkbox" name="checkboxes" value="motorcycle">motorcycle</input><br>' +
                              '<input type="checkbox" name="checkboxes" value="diesel">diesel</input><br>' +
                              '<input type="checkbox" name="checkboxes" value="drifting">drifting</input><br>' +
                             '</div>';

    var checkboxes = document.getElementById('annochecks');

    checkboxes.addEventListener('change', function (event) {
      event.preventDefault();
      annotations[getNow()] = {text: event.target.value, timestamp: player.getCurrentTime()};
      setTimeout(function() { event.target.checked = false; }, 100);
      // console.log(annotations);
    });
  } else { // textarea response
    if (params.TASK_NUM === 1) {
      elements.instructionsList.innerHTML = '<li>Press play to watch the video.</li>' +
                                '<li>Enter a keyword or phrase for each action or sound in the video.</li>' +
                                '<li>Note: the video will pause when you start typing.</li>' +
                                '<li>Pause and replay the video as necessary to enter all keywords.</li>' +
                                '<li>When you have entered keywords for the entire video, click Submit HIT below.</li>';
    } else if (params.TASK_NUM === 2) {
      elements.instructionsList.innerHTML = '<li>Press play to watch the video related to <b>cars</b>.</li>' +
                                '<li>Enter a keyword or phrase for each action or sound related to <b>cars</b> in the video.</li>' +
                                '<li>Note: the video will pause when you start typing.</li>' +
                                '<li>Pause and replay the video as necessary to enter all keywords.</li>' +
                                '<li>When you have entered keywords for the entire video, click Submit HIT below.</li>';
    }

    elements.responseArea.innerHTML = '<textarea id="annotext" placeholder="Enter keyword or phrase"></textarea><button id="enter_keyword_btn" disabled>Enter</button>';
    annotext = document.getElementById('annotext');
    annotext.focus();
    enterKeywordBtn = document.getElementById('enter_keyword_btn');

    annotext.addEventListener('keydown', function (event) {
      if (annotext.value === '') return;
      if (event.keyCode === 13) {
        event.preventDefault();
        annotations[getNow()] = {text: annotext.value, timestamp: player.getCurrentTime()};
        annotext.value = '';
        // console.log(annotations);
      }
    });

    annotext.addEventListener('keyup', function () {
      if (annotext.value === '') {
        enterKeywordBtn.setAttribute('disabled', 'disabled');
      } else {
        enterKeywordBtn.removeAttribute('disabled');
        player.pauseVideo();
      }
    });
  }

  elements.submitBtn.addEventListener('click', function (event) {
    event.preventDefault();

    if (params.TASK_NUM < 4 && !vidCompleted) {
      return alert('Please finish watching the video.');
    }

    if (Object.keys(annotations).length > 0) {
      var postRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/data/' + params.TODAY_DATA_DATE + '/' + params.workerId + '/');
      var postData = {
        assetId: assetId,
        workerId: params.workerId,
        task: params.TASK_NUM,
        annotations: annotations,
        time_submitted: getNow()
      };

      if (params.TASK_NUM <= 3) postData.video_events = vidEvents;

      postRef.push(postData, function () {
        var assetsRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/assets/' + params.TODAY_DATA_DATE + '/' + params.ASSET_TYPE + '/');
        assetsCounts[params.ASSET_TYPE][assetId]++;
        assetsRef.child(assetId).set(assetsCounts[params.ASSET_TYPE][assetId], function (err) {
          if (err) {
            // console.log('POST of', assetsCounts[params.ASSET_TYPE][assetId], 'to', assetsRef.child(assetId), 'failed');
          } else {
            // console.log('POST of', assetsCounts[params.ASSET_TYPE][assetId], 'to', assetsRef.child(assetId), 'succeeded');
            mturkSubmit();
          }
        });
      });
    } else {
      alert('Please annotate the media before submitting.');
    }
  });

  mturkCheckPreview();
};
