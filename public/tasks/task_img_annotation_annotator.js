// img+annotorious tasks

/* global jQuery, Firebase, _, anno */
/* global elements, params */

var annotations = {};
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

window.onload = function () {
  elements.instructionsList.innerHTML = '<li>Use your mouse to draw a box around every concept or object you see in each image.</li>' +
                            '<li>Enter a keyword or phrase to describe each concept within that box.</li>' +
                            '<li>Note: The same concept may appear in multiple images.</li>' +
                            '<li>When you have annotated every image, click Submit HIT below.</li>';


  _.each(elements.controlsArea, function(div){
    div.innerHTML = '<div>' +
                      '<button class="prev_btn" disabled>Prev Set</button>' +
                      '<button class="next_btn" disabled>Next Set</button>' +
                     '</div>' +
                      '<span class="img_remain">Total images remaining to annotate: <span class="img_counter"></span></span>';
  });

  elements.responseArea.remove();
  // set up prev and next buttons for carousel
  $j(elements.prevBtns)
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

  $j(elements.nextBtns)
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
  $j(elements.mediaArea).on('focus', '.annotorious-editor-text', function (e) {
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
  $j(elements.mediaArea).on('mousedown', '.annotorious-annotationlayer', function (e) {
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

function updatePersistedAnnotations (annoToUpdate) {
  var imgNum = getImgNum(annoToUpdate);
  annotations[imgNum] = _.deepClone(anno.getAnnotations(annoToUpdate.src));
  updateLabelBank(imgNum);
  setImgCounters();
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

// create image grid
function drawImgGrid () {
  $j(elements.mediaArea).children().remove();
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

  elements.mediaArea.appendChild(imgGrid);
}

function getImgNum (annotation) {
  return annotation.src.slice(annotation.src.indexOf('/img/') + 8, annotation.src.indexOf('.jp'));
}

function imgRemaining () {
  var remaining = imgTotal;

  elements.resTicketItems.forEach(function (resTicketItem) {
    if (resTicketItem.resTicket.result) remaining--;
  });

  if (elements.submitBtn.disabled === true) {
    if (remaining === 0) {
      elements.submitBtn.disabled = false;
    }
  } else {
    if (remaining > 0) {
      elements.submitBtn.disabled = true;
    }
  }

  return remaining;
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

function setImgCounters() {
  if (!elements.imgCounters) elements.imgCounters = document.getElementsByClassName('img_counter');
  _.each(elements.imgCounters, function (imgCounter) {
    imgCounter.innerHTML = imgRemaining();
  });
}