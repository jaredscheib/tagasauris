/* global jQuery, Firebase, _, YT, anno */

var $j = jQuery.noConflict();

// wrap in IIFE to not expose global variables
(function app() {
  var db = new Firebase('https://dazzling-heat-3394.firebaseio.com/');
  var params = _.getUrlParams(); params.TASK_NUM = Number(params.TASK_NUM);
  var annotations = {};
  var vidEvents = {};
  var vidCompleted = false;
  var data;
  var assetsCounts;
  var assetId;
  var firstImgToDisplay = 0;
  var imgTotal;
  var imgPerGrid = 4;
  // hard code imgTotal for now
  var assetToImgTotal = {
    '01': 30,
    '02': 30,
    '03': 37,
    '04': 38,
    '05': 33,
  };
  // page elements
  var instructions;
  var prevBtns;
  var nextBtns;
  var mediaArea;
  var controls;
  var imgCounters;
  var player;
  var annotext;
  var responseArea;
  var enterKeywordBtn;
  var submitBtn;

  console.log('params', params);

  if (params.ASSET_TYPE === 'img') {
    loadScript('lib/annotorious.css'); // local lib since GitHub Pages not over SSL: https://github.com/isaacs/github/issues/156
    loadScript('lib/annotorious.min.js', function () {
      // annotorious event handlers
      anno.addHandler('onAnnotationCreated', function (createdAnno) {
        if (createdAnno.text.length < 2) return anno.removeAnnotation(createdAnno);
        // persist annotations to later remove and restore on Next/Prev
        updatePersistedAnnotations(createdAnno);
        // console.log('create annotation event');
      });

      anno.addHandler('onAnnotationRemoved', function (removedAnno) {
        updatePersistedAnnotations(removedAnno);
        // console.log('remove annotation event');
      });

      anno.addHandler('onAnnotationUpdated', function (updatedAnno) {
        // remove blank/invalid anno from update
        if (updatedAnno.text.length < 2) anno.removeAnnotation(updatedAnno);
        updatePersistedAnnotations(updatedAnno);
        // console.log('update annotation event');
      });
    });
  // load and set callback for YouTube API
  } else if (params.ASSET_TYPE === 'vid') {
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
        playerVars: {
          start: startSeconds,
        },
        events: {
          onStateChange: onPlayerStateChange,
        },
      });
    };

    function onPlayerStateChange(event) {
      var eventNames = {
        '-1': 'unstarted',
        '0': 'ended',
        '1': 'playing',
        '2': 'paused',
        '3': 'buffering',
        '5': 'video cued',
      };
      vidEvents[getNow()] = eventNames[String(event.data)];
      if (event.data === 0) {
        document.getElementById('submit_btn').disabled = false;
        vidCompleted = true;
      }
      annotext.focus();
    }
  }


  db.once('value', function (snapshot) {
    // console.log('db.once event');
    data = snapshot.val();
    assetsCounts = data.assets[params.TODAY_DATA_DATE];
    if (data.data[params.TODAY_DATA_DATE] === undefined) data.data[params.TODAY_DATA_DATE] = {};

    if (params.TODAY_DATA_DATE === '20160114') {
      assetId = getAssetId(assetsCounts, data.data[params.TODAY_DATA_DATE]);
    // any dates past 20160114
    } else {
      assetId = getAssetId(assetsCounts[params.ASSET_TYPE], data.data[params.TODAY_DATA_DATE]);
      // console.log('assetId', assetId);
    }

    if (params.ASSET_TYPE === 'img') {
      imgTotal = assetToImgTotal[assetId];

      drawImgGrid();
      setImgCounter();
    } else if (params.ASSET_TYPE === 'vid') {
      loadScript('https://www.youtube.com/iframe_api');
    }
  });


  // set HTML and create event listeners on window load
  window.onload = function () {
    instructions = document.getElementById('instructions');
    prevBtns = document.getElementsByClassName('prev_btn');
    nextBtns = document.getElementsByClassName('next_btn');
    mediaArea = document.getElementById('media_area');
    controls = document.getElementsByClassName('controls');
    responseArea = document.getElementById('response_area');
    submitBtn = document.getElementById('submit_btn');

    // non img+annotorious tasks
    if (params.ASSET_TYPE === 'vid') {
      var playerDiv = document.createElement('div');
      playerDiv.id = 'player';
      mediaArea.appendChild(playerDiv);
      
      if (params.TASK_NUM === 3) { // checkboxes response
        
        instructions.innerHTML = 'Please watch the entire video. Pause and replay as necessary.<br>' +
                                  'At the moment you see anything, click that concept from among the checkboxes below.<br>' +
                                  'Please pause and replay as necessary in order to submit multiple simultaneous concepts.<br>' +
                                  'When you have entered every concept and finished the video, click submit.';
        responseArea.innerHTML = '<div id="annochecks">' +
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
          instructions.innerHTML = '<li>Press play to watch the video.</li>' +
                                    '<li>Enter a keyword or phrase for each action or sound in the video.</li>' +
                                    '<li>Note: the video will pause when you start typing.</li>' +
                                    '<li>Pause and replay the video as necessary to enter all keywords.</li>' +
                                    '<li>When you have entered keywords for the entire video, click Submit HIT below.</li>';
        } else if (params.TASK_NUM === 2) {
          instructions.innerHTML = '<li>Press play to watch the video related to <b>cars</b>.</li>' +
                                    '<li>Enter a keyword or phrase for each action or sound related to <b>cars</b> in the video.</li>' +
                                    '<li>Note: the video will pause when you start typing.</li>' +
                                    '<li>Pause and replay the video as necessary to enter all keywords.</li>' +
                                    '<li>When you have entered keywords for the entire video, click Submit HIT below.</li>';
        }

        responseArea.innerHTML = '<textarea id="annotext" placeholder="Enter keyword or phrase"></textarea><button id="enter_keyword_btn" disabled>Enter</button>';
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
    // img+annotorious tasks
    } else if (params.ASSET_TYPE === 'img') {

      instructions.innerHTML = '<li>Use your mouse to draw a box around every concept or object you see in each image.</li>' +
                                '<li>Enter a keyword or phrase to describe each concept within that box.</li>' +
                                '<li>Note: The same concept may appear in multiple images.</li>' +
                                '<li>When you have annotated every image, click Submit HIT below.</li>';


      _.each(controls, function(div){
        div.innerHTML = '<div>' +
                          '<button class="prev_btn" disabled>Prev Set</button>' +
                          '<button class="next_btn" disabled>Next Set</button>' +
                         '</div>' +
                          '<span class="img_remain">Total images remaining to annotate: <span class="img_count"></span></span>';
      });

      imgCounters = document.getElementsByClassName('img_count');

      responseArea.remove();
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


      // make 'Enter' simulate clicking 'Save'
      $j(mediaArea).on('focus', '.annotorious-editor-text', function (e) {
        $j(e.target).on('keypress', function (e) {
          if (e.which === 13) {
            var saveBtn = $j(e.target).parent().find('.annotorious-editor-button-save');
            e.stopImmediatePropagation(); // prevents repeat click event resulting in annotorious error after Save button has disappeared
            e.preventDefault();
            clickButtonOnce(saveBtn);
          }
        });
      });

      // create new bounding box after and 'Enter' on current open one if exists
      $j(mediaArea).on('mousedown', '.annotorious-annotationlayer', function (e) {
        e.stopImmediatePropagation(); // prevents repeat click event resulting in annotorious error after Save button has disappeared
        e.preventDefault();

        var currSaveBtn = $j(e.currentTarget).find('.annotorious-editor-button-save');
        if (currSaveBtn.is(':visible')) {
          clickButtonOnce(currSaveBtn);
   
          var clickEvent = document.createEvent ('MouseEvents');
          clickEvent.initMouseEvent('mousedown', true, true, window, 0, 0, 0, e.clientX, e.clientY, false, false, false, false, 0, null);

          var annotoriousLayer = $j(e.currentTarget).parent().find('.annotorious-item-focus')[0];
          annotoriousLayer.dispatchEvent (clickEvent);
        }
      });

      function clickButtonOnce (jQbuttonObj) {
        var btn = jQbuttonObj[0];
        if (btn.click) {
          btn.click(); // annotorious.js uses goog.Events (from Google Closure library), rather than actual 'click' event, FYI, ex. goog.events.dispatchEvent(jQbuttonObj, goog.events.EventType.CLICK);
        // for legacy IE
        } else if (document.createEvent) {
          var newEvent = document.createEvent('MouseEvents');
          // TODO check if coords below require saveBtn coords
          newEvent.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          jQbuttonObj[0].dispatchEvent(newEvent);
        }
      }
    }


    submitBtn.addEventListener('click', function (event) {
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

  function updatePersistedAnnotations (annoToUpdate) {
    var imgNum = getImgNum(annoToUpdate);
    annotations[imgNum] = _.deepClone(anno.getAnnotations(annoToUpdate.src));
    updateLabelBank(imgNum);
    setImgCounter();
    // console.log('annotations after update persisted', annotations);
  }

  function updateLabelBank (imgNum) {
    var labelBank = document.getElementById('labelBank' + imgNum);
    var align = labelBank.classList[1].slice(-3);
    // var bankTitle = document.createElement('span');

    $j(labelBank).children().remove();
    
    // bankTitle.className = 'bank_title';
    // bankTitle.innerHTML = 'annotations';
    // $j(labelBank).append(bankTitle);
    
    _.each(annotations[imgNum], function(tempAnno) {
      var label = document.createElement('div');
      label.className = 'label_container label-' + align;
      $j(labelBank).append(label);
      label.innerHTML = '<span class="label">' + tempAnno.text + '</span>';
    });
  }

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

  if (params.ASSET_TYPE === 'img') {
    // create image grid
    function drawImgGrid () {
      $j(mediaArea).children().remove();
      var imgGrid = document.createElement('div');
      imgGrid.id = 'img_grid';

      // TODO: get an array of image URLs to know limit, and only build rows and image banks accordingly
      // create and populate the grid
      for (var i = 0; i < 2; i++) {
        anno.reset(); // necessary for addAnnotation functionality below
        var imgRow = document.createElement('div');
        imgRow.className = 'img_row';

        // determine image number for use in iterator below
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
          var imgBank = document.createElement('div');
          imgBank.className = 'img_bank';

          var imgNum = String(j);
          if (imgNum.length < 2) imgNum = '0' + imgNum;
          imgNum += '00'; // until non-integer frames added
          // console.log('imgNum', imgNum);
          var newImg = document.createElement('img');
          newImg.id = 'img' + imgNum;
          newImg.className = 'anno_img';
          newImg.src = 'assets/img/' + assetId + '-' + imgNum + '.jpg';

          var labelBank = document.createElement('div');
          labelBank.className = 'label_bank ';
          labelBank.id = 'labelBank' + imgNum;
          
          // add class of label bank depending on which side image is on
          if (j % 2 === 0) {
            labelBank.className += ' bank-lft';
            imgBank.appendChild(labelBank);
            imgBank.appendChild(newImg);
          } else {
            labelBank.className += ' bank-rgt';
            imgBank.appendChild(newImg);
            imgBank.appendChild(labelBank);
          }

          // add current image bank to current image row
          imgRow.appendChild(imgBank);

          // when image actually loads, make annotatable and set style of label bank to image height
          $j(newImg).load(function () { // on img load event so annotorious loads properly
            var imgNum = this.id.slice(3);

            var labelBank = document.getElementById('labelBank' + imgNum);
            labelBank.style.height = String(this.height) + 'px';

            updateLabelBank(imgNum);
            anno.makeAnnotatable(this);
            if (annotations[imgNum]) {
              // console.log('annotations[imgNum]', annotations[imgNum]);
              _.each(annotations[imgNum], function (tempAnno) {
                // delete tempAnno.context;
                // tempAnno.src = tempAnno.src.slice(tempAnno.src.indexOf('assets/'));
                // tempAnno.editable = false; // make annotation read-only
                anno.addAnnotation(tempAnno);
              });
            }
          // TODO: remove this hacky solution while images not being served up with array of filenames
          }).error(function () {
            console.log('this', this);
            $j(this).remove();
          }.bind(imgBank));
        }

        imgGrid.appendChild(imgRow);
      }

      mediaArea.appendChild(imgGrid);
    }

    function getImgNum (annotation) {
      return annotation.src.slice(annotation.src.indexOf('/img/') + 8, annotation.src.indexOf('.jp'));
    }

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
    }

    function setImgCounter() {
      _.each(imgCounters, function (counter) {
        counter.innerHTML = imgRemaining();
      });
    }
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

  function getNow() {
    return new Date().getTime();
  }

  function loadScript(url, callback) {
    var fileType = url.split('.').reverse()[0] === 'css' ? 'css' : 'js';
    var script;
    if (fileType === 'js') {
      script = document.createElement('script');
      document.head.appendChild(script); // ideal practice to add to DOM, then set onload, then src, though clunkier
      if (callback !== undefined) script.onload = callback;
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('src', url);
    } else if (fileType === 'css') {
      script = document.createElement('link');
      document.head.appendChild(script); // ideal practice to add to DOM, then set onload, then src, though clunkier
      if (callback !== undefined) script.onload = callback;
      script.setAttribute('rel', 'stylesheet');
      script.setAttribute('type', 'text/css');
      script.setAttribute('href', url);
    }

    return script;
  }
}());
