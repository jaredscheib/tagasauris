var db = new Firebase('https://dazzling-heat-3394.firebaseio.com/');
var params = _.getUrlParams();
var taskNum = Number(params.task.slice(-1));
var vidToDisplay;
var annotations = {};
var annotext;
var vidEvents = {};
var vidCompleted = false;
var data;
var assetsCounts;
var imgToDisplayLead = 0;
var imgPerGrid = 4;
const todayDataDate = '20160114';

db.on('child_added', function (snapshot){
  var addedAnnotation = snapshot.val();
  console.log('Posted to Firebase:', addedAnnotation);
});

if (taskNum < 4) {
  // load and set callback for YouTube API
  var player;

  function onYouTubeIframeAPIReady() {
    db.once('value', function (snapshot) {
      data = snapshot.val();
      assetsCounts = data.assets[todayDataDate];

      if (data.data[todayDataDate] === undefined) data.data[todayDataDate] = {};

      vidToDisplay = getVideoId(assetsCounts, data.data[todayDataDate]);
      console.log('vidToDisplay', vidToDisplay);
      var sliceVid = vidToDisplay;
      var startSeconds = 0;
      var startSecondsIndex = vidToDisplay.indexOf('?t=');
      if (startSecondsIndex !== -1) {
        startSeconds = Number(vidToDisplay.slice(startSecondsIndex + 3));
        sliceVid = vidToDisplay.slice(0, startSecondsIndex);
      }

      player = new YT.Player('player', {
        height: '315',
        width: '420',
        videoId: sliceVid,
        playerVars: {start: startSeconds},
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    });
  };

  function onPlayerReady(event) {
    // event.target.playVideo();
  };

  function onPlayerStateChange(event) {
    var eventNames = {
      '-1': 'unstarted',
      '0': 'ended',
      '1': 'playing',
      '2': 'paused',
      '3': 'buffering',
      '5': 'video cued'
    };
    vidEvents[getNow()] = eventNames[String(event.data)];
    if (event.data === 0) {
      document.getElementById('submit').disabled = false;
      vidCompleted = true;
    }
    annotext.focus();
  };
}


// set HTML and create event listeners on window load
window.onload = function () {
  var instructions = document.getElementById('instructions');
  var media_area = document.getElementById('media_area');
  var response_area = document.getElementById('response_area');
  var enterKeyword;
  var submit = document.getElementById('submit');

  // non img+annotorious tasks
  if (taskNum < 4) {
    var playerDiv = document.createElement('div');
    playerDiv.id = 'player';
    media_area.appendChild(playerDiv);

    if (taskNum === 3) { // checkboxes response
      
      instructions.innerHTML =  'Please watch the entire video. Pause and replay as necessary.<br>' +
                                'At the moment you see anything, click that concept from among the checkboxes below.<br>' +
                                'Please pause and replay as necessary in order to submit multiple simultaneous concepts.<br>' +
                                'When you have entered every concept and finished the video, click submit.';
      response_area.innerHTML = '<div id="annochecks">' +
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

      if (taskNum === 1) {
        instructions.innerHTML =  '<li>Press play to watch the video.</li>' +
                                  '<li>Enter one keyword or phrase at a time to describe what you see in the video.</li>' +
                                  '<li>Pause and replay the video as necessary to enter all keywords.</li>' +
                                  '<li>When you have entered keywords for the entire video, click Submit HIT.</li>';
      } else if (taskNum === 2) {
        instructions.innerHTML =  '<li>Press play to watch the video related to <b>cars</b>.</li>' +
                                  '<li>Enter one keyword or phrase at a time to describe what you see related to <b>cars</b> in the video.</li>' +
                                  '<li>Pause and replay the video as necessary to enter all keywords.</li>' +
                                  '<li>When you have entered keywords for the entire video, click Submit HIT.</li>';
      }

      response_area.innerHTML = '<textarea id="annotext" placeholder="Enter keyword or phrase"></textarea><button id="enterKeyword" disabled>Enter</button>';
      annotext = document.getElementById('annotext');
      annotext.focus();
      enterKeyword = document.getElementById('enterKeyword');

      annotext.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {
          event.preventDefault();
          annotations[getNow()] = {text: annotext.value, timestamp: player.getCurrentTime()};
          annotext.value = '';
          // console.log(annotations);
        }
      });

      annotext.addEventListener('keyup', function (event) {
        if (annotext.value === '') {
          enterKeyword.setAttribute('disabled', 'disabled');
        } else {
          enterKeyword.removeAttribute('disabled');
        }
      });
    }
  // img+annotorious tasks
  } else {
    if (taskNum === 5) {
      instructions.innerHTML =  '<li>Click and drag on each image to draw a box around each concept you see.</li>' +
                                '<li>Enter a keyword or phrase in the text box that appears under each drawn box.</li>' +
                                '<li>The same concept may appear across multiple images.</li>' +
                                '<li>When you have annotated each image, click next to keep annotating more images.</li>' +
                                '<li>When you have annotated every image, click Submit HIT.</li>';
    
      var imgGrid = document.createElement('div');
      imgGrid.id = 'img_grid';

      for (var i = 0; i < 2; i++) {
        var imgRow = document.createElement('div');
        imgRow.className = 'img_row';

        var j, limit;
        if (i === 0) {
          j = imgToDisplayLead;
          limit = j + imgPerGrid / 2;
        } else {
          j = imgToDisplayLead + imgPerGrid / 2;
          limit = j + imgPerGrid / 2;
        }

        console.log('j, limit', j, limit);
        for (j; j < limit; j++) {
          var imgNum = String(j);
          if (imgNum.length < 2) imgNum = '0' + imgNum;
          console.log('imgNum', imgNum);
          var newImg = document.createElement('img');
          newImg.id = 'img' + imgNum;
          newImg.className = 'gallery_img';
          newImg.src = 'assets/img/01-' + imgNum + '.jpeg';
          imgRow.appendChild(newImg);
        }

        imgGrid.appendChild(imgRow);
      }

      media_area.appendChild(imgGrid);
    }
  }


  submit.addEventListener('click', function (event) {
    event.preventDefault();

    if (!vidCompleted) {
      return alert('Please finish watching the video.');
    }

    console.log('submit', annotations);

    if (Object.keys(annotations).length > 0) {
      var postRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/data/' + todayDataDate + '/' + params.workerId + '/');
      var postData = {
        videoId: vidToDisplay,
        workerId: params.workerId,
        task: taskNum,
        annotations: annotations,
        time_submitted: getNow(),
        video_events: vidEvents
      };
      postRef.push(postData, function () {
        assetsCounts[vidToDisplay]++;
        db.assets[todayDataDate].set(assetsCounts);
        mturkSubmit();
        console.log('POST to Firebase:', postData);
      });
    } else {
      alert('Please annotate the media before submitting.');
    }
  });

  mturkCheckPreview();
};

function getVideoId (assetsCounts, data) {
  if (Object.keys(data).length === 0) {
    return Object.keys(assetsCounts)[0];
    // return setVidHTML(vidToDisplay);
  } else {
    var assetsCountsClone = _.deepClone(assetsCounts);
    var assetsCountsRemaining = [];

    _.each(data[params.workerId], function (entry) {
      if (taskNum === entry.task) {
        assetsCountsClone[entry.videoId] = false;
      }
    });

    _.each(assetsCountsClone, function (val, key) {
      if (val !== false) assetsCountsRemaining.push([key, val]);
    });

    console.log('hello', assetsCounts, assetsCountsClone, assetsCountsRemaining);

    if (assetsCountsRemaining.length > 0) {
      // return vid with least views
      assetsCountsRemaining.sort(function (a, b) { return a[1] < b[1]; });
      return assetsCountsRemaining.pop()[0];
      // return setVidHTML(vidToDisplay);
    } else {
      _.dialog($('<div style="background-color: rgba(0,0,0,0.5);color:white;font-size:xx-large;padding:10px"/>').text('all HITs completed'), false)
      $('body').click(function () {
          alert('You have annotated all videos. Please return this HIT.')
      })
      return true;
    }
  }
};

function mturkSubmit() {
  var f = $('<form action="' + params.turkSubmitTo + '/mturk/externalSubmit" method="GET"><input type="hidden" name="assignmentId" value="' + params.assignmentId + '"></input><input type="hidden" name="unused" value="unused"></input></form>');
  $('body').append(f);
  f.submit();
};

function mturkCheckPreview() {
  if (params.assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE") {
    _.dialog($('<div style="background-color: rgba(0,0,0,0.5);color:white;font-size:xx-large;padding:10px"/>').text('preview'), false);
    $('body').click(function () {
        alert('This is a preview. Please accept the HIT to work on it.');
    });
    return true;
  }
};

function getNow() {
  return new Date().getTime();
};
