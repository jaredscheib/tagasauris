var db = new Firebase('https://dazzling-heat-3394.firebaseio.com/');
var params = _.getUrlParams();
var taskNum = Number(params.task.slice(-1));
var vidToDisplay;
var annotations = {};
var vidEvents = {};
const todayDataDate = '20160114';

db.on('child_added', function (snapshot){
  var addedAnnotation = snapshot.val();
  console.log('Posted to Firebase:', addedAnnotation);
});


// load and set callback for YouTube API
var player;

function onYouTubeIframeAPIReady() {
  db.once('value', function (snapshot) {
    data = snapshot.val();

    if (data.data[todayDataDate] === undefined) data.data[todayDataDate] = {};

    player = new YT.Player('player', {
      height: '315',
      width: '420',
      videoId: getVideoId(data.videos, data.data[todayDataDate]),
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
};


// set HTML and create event listeners on window load
window.onload = function () {
  var instructions = document.getElementById('instructions');
  var response_area = document.getElementById('response_area');
  var submit = document.getElementById('submit');

  if (taskNum === 3) { // checkboxes response
    
    instructions.innerHTML =  'Please watch the entire video.<br>' +
                              'Select each concept that applies among the checkboxes below.<br>' +
                              'Then click submit.';
    response_area.innerHTML = '<div id="annochecks">' +
                              '<input type="checkbox" name="checkboxes" value="driving">driving</input><br>' +
                              '<input type="checkbox" name="checkboxes" value="carExterior">car exterior</input><br>' +
                              '<input type="checkbox" name="checkboxes" value="carInterior">car interior</input><br>' +
                              '<input type="checkbox" name="checkboxes" value="road">road</input><br>' +
                              '<input type="checkbox" name="checkboxes" value="people">people</input><br>' +
                              '</div>';

  } else { // textarea response

    if (taskNum === 1) {
      instructions.innerHTML =  'Please watch the entire video.<br>' +
                                'Describe everything you see in the text box below.<br>' +
                                'Then click submit.';
    } else if (taskNum === 2) {
      instructions.innerHTML =  'Please watch the entire video.<br>' +
                                'Describe everything you see related to cars in the text box below.<br>' +
                                'Then click submit.';
    }

    response_area.innerHTML = '<textarea id="annotext" placeholder="Type concept here"></textarea>';
    var annotext = document.getElementById('annotext');
    annotext.focus();

    annotext.addEventListener('keydown', function (event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        annotations[getNow()] = {text: annotext.value, timestamp: player.getCurrentTime()};
        annotext.value = '';
        // console.log(annotations);
      }
    });
  }


  submit.addEventListener('click', function (event) {
    event.preventDefault();

    if (taskNum === 3) { // checkboxes
      annotations = [];
      var checkboxes = document.getElementsByName('checkboxes');
      _.each(checkboxes, function (checkbox) {
        console.log(checkbox);
        if (checkbox.checked) annotations.push(checkbox.value);
      });
      var annotations = annotations.join(',');
    } else { // textarea
      annotations = annotext.value;
      // annotext.value = '';
    }
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
        mturkSubmit();
        console.log('POST to Firebase:', postData);
      });
    } else {
      alert('Please describe the video before submitting.');
    }
  });

  mturkCheckPreview();
};

var getVideoId = function (videos, data) {
  if (Object.keys(data).length === 0) {
    vidToDisplay = Object.keys(videos)[0];
    return vidToDisplay;
    // return setVidHTML(vidToDisplay);
  } else {
    var vidsAll = _.deepClone(videos);
    var vidsRemaining = [];

    _.each(data[params.workerId], function (entry) {
      if (taskNum === entry.task) vidsAll[entry.videoId] = false;
    });

    _.each(vidsAll, function (val, key) {
      if (val === true) vidsRemaining.push(key);
    });

    
    if (vidsRemaining.length > 0) {
      vidToDisplay = vidsRemaining.pop();
      return vidToDisplay;
      // return setVidHTML(vidToDisplay);
    } else {
      _.dialog($('<div style="background-color: rgba(0,0,0,0.5);color:white;font-size:xx-large;padding:10px"/>').text('all HITs completed'), false)
      $('body').click(function () {
          alert('You have annotated all videos. Please return this HIT.')
      })
      return true;
    }
  }

  // function setVidHTML (id) {
  //   console.log('setting vid', id);
  //   document.getElementById('video').innerHTML = '<iframe width="420" height="315" src="https://www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe>';
  // };
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
