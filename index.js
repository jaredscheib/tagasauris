var $j = jQuery.noConflict();

// wrap in IIFE to not expose global variables
(function app () {

var db = new Firebase('https://dazzling-heat-3394.firebaseio.com/');
var params = _.getUrlParams();
if (!params.length) {
  params.workerId = 'test',
  params.task = 'annotations_task5'
}
var taskNum = Number(params.task.slice(-1));
var annotations = {};
var annotext;
var vidEvents = {};
var vidCompleted = false;
var data;
var assetsCounts;
const todayDataDate = '20160123';
const assetType = 'img'; // alternately, 'vid'
var assetId;
var firstImgToDisplay = 0;
var imgTotal;
var imgPerGrid = 4;

// page elements
var instructions;
var prevBtns;
var nextBtns;
var media_area;
var response_area;
var enterKeyword;
var submitBtn;

// db.on('child_added', function (snapshot){
//   var addedAnnotation = snapshot.val();
//   console.log('Confirmed post to Firebase:', addedAnnotation);
// });

if (assetType === 'img') {
  // loadScript('https://annotorious.github.com/latest/annotorious.css'); // GitHub Pages not over SSL: https://github.com/isaacs/github/issues/156
  // loadScript('https://annotorious.github.com/latest/annotorious.min.js');
  loadScript('lib/annotorious.css');
  loadScript('lib/annotorious.min.js');
}

db.once('value', function (snapshot) {
  // console.log('db.once event');
  data = snapshot.val();
  assetsCounts = data.assets[todayDataDate];
  if (data.data[todayDataDate] === undefined) data.data[todayDataDate] = {};

  if (todayDataDate === '20160114') {
    assetId = getAssetId(assetsCounts, data.data[todayDataDate]);
  } else if (todayDataDate === '20160123') {
    assetId = getAssetId(assetsCounts[assetType], data.data[todayDataDate]);
    // console.log('assetId', assetId);

    // hard code imgTotal for now
    if (assetId === '01') {
      imgTotal = 30;
    } else if (assetId === '02') {
      imgTotal = 30;
    } else if (assetId === '03') {
      imgTotal = 37;
    } else if (assetId === '04') {
      imgTotal = 38;
    } else if (assetId === '05') {
      imgTotal = 33;
    }

    drawImgGrid();
    setImgCounter();
  }

  if (assetType === 'vid') {
    loadScript('https://www.youtube.com/iframe_api');
  }
});


// load and set callback for YouTube API
if (assetType === 'vid') {
  var player;

  // must be in global namespace to be triggered upon script load
  window.onYouTubeIframeAPIReady = function () {
    // console.log('YT READY');
    var sliceVid = assetId;
    var startSeconds = 0;
    var startSecondsIndex = assetId.indexOf('?t=');
    if (startSecondsIndex !== -1) {
      startSeconds = Number(assetId.slice(startSecondsIndex + 3));
      sliceVid = assetId.slice(0, startSecondsIndex);
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
      document.getElementById('submit_btn').disabled = false;
      vidCompleted = true;
    }
    annotext.focus();
  };
}


// set HTML and create event listeners on window load
window.onload = function () {
  instructions = document.getElementById('instructions');
  prevBtns = document.getElementsByClassName('prev_btn');
  nextBtns = document.getElementsByClassName('next_btn');
  media_area = document.getElementById('media_area');
  response_area = document.getElementById('response_area');
  enterKeyword;
  submitBtn = document.getElementById('submit_btn');

  // non img+annotorious tasks
  if (taskNum <= 3) {
    $j(prevBtns).each(function (i, el) { $j(el).hide(); });
    $j(nextBtns).each(function (i, el) { $j(el).hide(); });
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
                                  '<li>When you have entered keywords for the entire video, click Submit HIT below.</li>';
      } else if (taskNum === 2) {
        instructions.innerHTML =  '<li>Press play to watch the video related to <b>cars</b>.</li>' +
                                  '<li>Enter one keyword or phrase at a time to describe what you see related to <b>cars</b> in the video.</li>' +
                                  '<li>Pause and replay the video as necessary to enter all keywords.</li>' +
                                  '<li>When you have entered keywords for the entire video, click Submit HIT below.</li>';
      }

      response_area.innerHTML = '<textarea id="annotext" placeholder="Enter keyword or phrase"></textarea><button id="enter_keyword" disabled>Enter</button>';
      annotext = document.getElementById('annotext');
      annotext.focus();
      enterKeyword = document.getElementById('enter_keyword');

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
    if (assetType === 'img') {
      instructions.innerHTML =  '<li>Draw a box around each concept you see in each image.</li>' +
                                '<li>Enter a keyword or phrase in the text box that appears under each drawn box.</li>' +
                                '<li>Note: the same concept may appear across multiple images.</li>' +
                                '<li>When you have annotated each image in a set, click Next Set to annotate remaining images.</li>' +
                                '<li>When you have annotated every image, click Submit HIT below.</li>';
      response_area.remove()
      // set up prev and next buttons for carousel
      $j(prevBtns)
      .prop('disabled', false)
      .on('click', function (e) {
        e.preventDefault();
        var imgSet = $j('.anno_img');
        var allAnnotated = true;
        imgSet.each(function (i, el) {
          var imgAnno = anno.getAnnotations(el.src);
          if (imgAnno.length === 0) allAnnotated = false;
        });
        if (allAnnotated) {
          firstImgToDisplay -= imgPerGrid;

          // prevent error on missing expected tail images
          if (firstImgToDisplay < 0) firstImgToDisplay = imgTotal - (imgTotal % imgPerGrid);
          drawImgGrid();
        } else {
          alert('Please annotate each image in the set.');
        }
      });

      $j(nextBtns)
      .prop('disabled', false)
      .on('click', function (e) {
        e.preventDefault();
        var imgSet = $j('.anno_img');
        var allAnnotated = true;
        imgSet.each(function (i, el) {
          var imgAnno = anno.getAnnotations(el.src);
          if (imgAnno.length === 0) allAnnotated = false;
        });
        if (allAnnotated) {
          firstImgToDisplay += imgPerGrid;
          if (firstImgToDisplay > imgTotal) firstImgToDisplay = 0;
          drawImgGrid();
        } else {
          alert('Please annotate each image in the set.');
        }
      });
    }


    // annotorious event handlers
    anno.addHandler('onAnnotationCreated', function (annotation) {
      var imgNum = getImgNum(annotation);

      if (annotation.text.length < 2) {
        anno.removeAnnotation(annotation);
        return alert('Text must be a valid keyword.')
      }
      // persist annotations to later remove and restore on Next/Prev
      if (!annotations[imgNum]) annotations[imgNum] = [];
      annotations[imgNum].push(annotation);
      setImgCounter();
    });

    anno.addHandler('onAnnotationRemoved', function (annotation) {
      var imgNum = getImgNum(annotation);

      _.each(annotations[imgNum], function (tempAnno, i) {
        if (_.deepEquals(annotation, tempAnno)) {
          annotations[imgNum].splice(i, 1);
        }
      });
      setImgCounter();
    });

    anno.addHandler('onAnnotationUpdated', function (annotation) {
      var imgNum = getImgNum(annotation);

      _.each(annotations[imgNum], function (tempAnno, i) {
        if (_.deepEquals(annotation, tempAnno)) {
          annotations[imgNum][i] = annotation;
        }
      });
      setImgCounter();
    });

    // make 'Enter' trigger Save button to prevent multi-line annotations
    $j(media_area).on('focus', '.annotorious-editor-text', function (e) {
      $j(e.target).on('keyup', function (e) {
        // var saveBtn = $j(e.target).parent().find('.annotorious-editor-button-save');
        // console.log('keyup', e);
        if (e.keyCode === 13) {
          // val below is a hack rather than modifying annotorious source code via goog.events, which replaces the default 'click' event on the <a> of saveBtn
          var val = $j(e.target).val().split('\n').join('');
          $j(e.target).val(val);
          // console.log('hit enter in box; saveBtn:', saveBtn);
          // debugger;
          // console.log(goog);
          // to implement 'Enter' triggering Save, would need to modify annotorious.js, a la https://groups.google.com/forum/#!topic/annotorious/dq1-Qtif3b4
          // goog.events.dispatchEvent(saveBtn, goog.events.EventType.CLICK);
          // $j(saveBtn).simulate('click');
        }
      });
    });

  }


  submitBtn.addEventListener('click', function (event) {
    event.preventDefault();

    if (taskNum < 4 && !vidCompleted) {
      return alert('Please finish watching the video.');
    }

    // console.log('submit event', annotations);

    if (Object.keys(annotations).length > 0) {
      var postRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/data/' + todayDataDate + '/' + params.workerId + '/');
        var postData = {
          assetId: assetId,
          workerId: params.workerId,
          task: taskNum,
          annotations: annotations,
          time_submitted: getNow()
        };
      if (taskNum <= 3) postData.video_events = vidEvents

      postRef.push(postData, function () {
        // console.log('assetsCounts before [assetId]++', assetsCounts);
        assetsCounts[assetType][assetId]++;
        // console.log('assetsCounts after [assetId]++', assetsCounts);
        var assetsRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/assets/' + todayDataDate + '/' + assetType + '/');
        // console.log('assetsRef', assetsRef);
        assetsRef.child(assetId).set(assetsCounts[assetType][assetId], function (err) {
          if (err) {
            console.log('POST of', assetsCounts[assetType][assetId], 'to', assetsRef.child(assetId), 'failed');
          } else { 
            console.log('POST of', assetsCounts[assetType][assetId], 'to', assetsRef.child(assetId), 'succeeded');
            mturkSubmit();
          }
        });
        // console.log('POST to Firebase:', postData);
      });
    } else {
      alert('Please annotate the media before submitting.');
    }
  });

  mturkCheckPreview();
};

function getAssetId (assetsCounts, data) {
  // console.log('assetsCounts', assetsCounts);
  // console.log('data', data);

  if (Object.keys(data).length === 0) {
    return Object.keys(assetsCounts)[0];
    // return setVidHTML(assetId);
  } else {
    var assetsCountsClone = _.deepClone(assetsCounts);
    var assetsCountsRemaining = [];

    _.each(data[params.workerId], function (entry) {
      if (taskNum === entry.task) {
        assetsCountsClone[entry.assetId] = false;
      }
    });

    _.each(assetsCountsClone, function (val, key) {
      if (val !== false) assetsCountsRemaining.push([key, val]);
    });

    // console.log('assetsCounts', assetsCounts);
    // console.log('assetsCountsClone', assetsCountsClone);
    // console.log('assetsCountsRemaining', assetsCountsRemaining);

    if (assetsCountsRemaining.length > 0) {
      // return vid with least views
      assetsCountsRemaining.sort(function (a, b) { return a[1] < b[1]; });
      return assetsCountsRemaining.pop()[0];
      // return setVidHTML(assetId);
    } else {
      _.dialog($j('<div style="background-color: rgba(0,0,0,0.5);color:white;font-size:xx-large;padding:10px"/>').text('all HITs completed'), false)
      $j('body').click(function () {
          alert('You have annotated all videos. Please return this HIT.')
      })
      return true;
    }
  }
};

// create image grid
function drawImgGrid () {
  // console.log(firstImgToDisplay);
  $j(media_area).children().remove();
  var imgGrid = document.createElement('div');
  imgGrid.id = 'img_grid';

  for (var i = 0; i < 2; i++) {
    anno.reset(); // necessary for addAnnotation functionality below
    var imgRow = document.createElement('div');
    imgRow.className = 'img_row';

    var j, limit;
    if (i === 0) {
      j = firstImgToDisplay;
      limit = j + imgPerGrid / 2;
    } else {
      j = firstImgToDisplay + imgPerGrid / 2;
      limit = j + imgPerGrid / 2;
    }

    // console.log('j, limit', j, limit);
    for (j; j < limit; j++) {
      var imgNum = String(j);
      if (imgNum.length < 2) imgNum = '0' + imgNum;
      imgNum += '00'; // until non-integer frames added
      // console.log('imgNum', imgNum);
      var newImg = document.createElement('img');
      newImg.id = 'img' + imgNum;
      newImg.className = 'anno_img';
      newImg.src = 'assets/img/' + assetId + '-' + imgNum + '.jpg';
      imgRow.appendChild(newImg);
      $j(newImg).load(function () { // on img load event so annotorious loads properly
        anno.makeAnnotatable(this);
        var imgNum = this.id.slice(3);
        if (annotations[imgNum]) {
          // console.log('annotations[imgNum]', annotations[imgNum]);
          _.each(annotations[imgNum], function (tempAnno) {
            // delete tempAnno.context;
            // tempAnno.src = tempAnno.src.slice(tempAnno.src.indexOf('assets/'));
            // tempAnno.editable = false; // make annotation read-only
            anno.addAnnotation(tempAnno);
          });
        }
      }).error(function (err) {
        $j(this).remove();
      }).bind(newImg);
    }

    imgGrid.appendChild(imgRow);
  }

  media_area.appendChild(imgGrid);
};

function getImgNum (annotation) {
  return annotation.src.slice(annotation.src.indexOf('/img/') + 8, annotation.src.indexOf('.jp'));
};

function imgRemaining () {
  var remaining = imgTotal;

  _.each(annotations, function (tempAnno) {
    if (tempAnno.length > 0) {
      remaining--;
    }
  });

  if (submitBtn.disabled === true) {
    if (remaining === 0) {
      submitBtn.disabled = false;
    }
  } else {
    if (remaining > 0) {
      submitBtn.disabled = true;
    }
  }

  return remaining;
};

function setImgCounter (remaining) {
  var imgCounters = document.getElementsByClassName('img_counter');
  _.each(imgCounters, function (counter) {
    counter.innerHTML = imgRemaining();
  });
};

function mturkSubmit() {
  var f = $j('<form action="' + params.turkSubmitTo + '/mturk/externalSubmit" method="GET"><input type="hidden" name="assignmentId" value="' + params.assignmentId + '"></input><input type="hidden" name="unused" value="unused"></input></form>');
  $j('body').append(f);
  f.submit();
};

function mturkCheckPreview() {
  if (params.assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE") {
    _.dialog($j('<div style="background-color: rgba(0,0,0,0.5);color:white;font-size:xx-large;padding:10px"/>').text('preview'), false);
    $j('body').click(function () {
        alert('This is a preview. Please accept the HIT to work on it.');
    });
    return true;
  }
};

function getNow() {
  return new Date().getTime();
};

function loadScript (url) {
  var fileType = url.split('.').reverse()[0];
  var script;
  if (fileType === 'js') {
    script = document.createElement('script');
    script.setAttribute('src', url);
    script.setAttribute('type', 'text/javascript');
  } else if (fileType === 'css') {
    script = document.createElement('link');
    script.setAttribute('rel', 'stylesheet');
    script.setAttribute('type', 'text/css');
    script.setAttribute('href', url);
  }
  // console.log('script dynamically added', script);
  $j('script').parent().append(script);
}

}());
