var db = new Firebase('https://dazzling-heat-3394.firebaseio.com/');
var params = _.getUrlParams();
var vidToDisplay;

db.on('value', function (snapshot) {
  data = snapshot.val();

  setVideo(data);
});

db.on('child_added', function (snapshot){
  var addedAnnotation = snapshot.val();
  console.log('Posted to Firebase:', addedAnnotation);
});

window.onload = function () {
  var instructions = document.getElementById('instructions');
  var response_area = document.getElementById('response_area');
  var annotations;
  var submit = document.getElementById('submit');
  var taskNum = Number(params.task.slice(-1));

  if (taskNum === 3) { // checkboxes response
    
    instructions.innerHTML =  'Please watch the entire video.<br>' +
                              'Select each concept that applies among the checkboxes below.<br>' +
                              'Then click submit.';
    response_area.innerHTML = '<div id="annochecks">' +
                              '<input type="checkbox" name="checkboxes[]" value="driving">driving</input><br>' +
                              '<input type="checkbox" name="checkboxes[]" value="carExterior">car exterior</input><br>' +
                              '<input type="checkbox" name="checkboxes[]" value="carInterior">car interior</input><br>' +
                              '<input type="checkbox" name="checkboxes[]" value="road">road</input><br>' +
                              '<input type="checkbox" name="checkboxes[]" value="people">people</input><br>' +
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

    response_area.innerHTML = '<textarea id="annotext" placeholder="Your annotations here"></textarea>';
    var annotext = document.getElementById('annotext');
    annotext.focus();
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
      console.log('checkboxes array', annotations);
      console.log('checkboxes string', annotations.join(','));
    } else { // textarea
      annotations = annotext.value;
    }
    if (annotations.length > 0) {
      annotext.value = '';
      var postRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/' + vidToDisplay + '/' + params.task + '/');
      var workerId = params.workerId || 'undefined';
      postRef.push({'workerId': workerId, 'annotation': annotations}, function () {
        mturkSubmit();
      });
      console.log('POST to Firebase:', workerId, annotations);
    } else {
      alert('Please describe the video before submitting.');
    }
  });

  mturkCheckPreview();
};

var setVideo = function (data) {
  var vidIDs = Object.keys(data);
  vidToDisplay = vidIDs[0];
  console.log(data, vidIDs);
  _.each(vidIDs, function (id) {
    if (!data[id][params.task]) data[id][params.task] = {};
    if (Object.keys(data[id][params.task]).length < Object.keys(data[vidToDisplay][params.task]).length) vidToDisplay = id;
  });
  document.getElementById('video').innerHTML = '<iframe width="420" height="315" src="' + data[vidToDisplay].embedURL + '" frameborder="0" allowfullscreen></iframe>';
};

function mturkSubmit() {
    var f = $('<form action="' + params.turkSubmitTo + '/mturk/externalSubmit" method="GET"><input type="hidden" name="assignmentId" value="' + params.assignmentId + '"></input><input type="hidden" name="unused" value="unused"></input></form>')
    $('body').append(f)
    f.submit()
};

function mturkCheckPreview() {
    if (params.assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE") {
        _.dialog($('<div style="background-color: rgba(0,0,0,0.5);color:white;font-size:xx-large;padding:10px"/>').text('preview'), false)
        $('body').click(function () {
            alert('This is a preview. Please accept the HIT to work on it.')
        })
        return true
    }
};
