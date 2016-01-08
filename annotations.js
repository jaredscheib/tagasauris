var db = new Firebase('https://dazzling-heat-3394.firebaseio.com/');
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
  var annotext = document.getElementById('annotext');
  annotext.focus();

  var submit = document.getElementById('submit');
  submit.addEventListener('click', function (event) {
    event.preventDefault();

    var annotations = annotext.value;
    if (annotations.length > 0) {
      annotext.value = '';
      var postRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/' + vidToDisplay + '/annotations_task1/');
      var workerId = _.getUrlParams().workerId;
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
    if (Object.keys(data[id]).length < Object.keys(data[vidToDisplay]).length) vidToDisplay = id;
  });
  document.getElementById('video').innerHTML = '<iframe width="420" height="315" src="' + data[vidToDisplay].embedURL + '" frameborder="0" allowfullscreen></iframe>';
};

function mturkSubmit() {
    var params = _.getUrlParams()
    var f = $('<form action="' + params.turkSubmitTo + '/mturk/externalSubmit" method="GET"><input type="hidden" name="assignmentId" value="' + params.assignmentId + '"></input><input type="hidden" name="unused" value="unused"></input></form>')
    $('body').append(f)
    f.submit()
};

function mturkCheckPreview() {
    var params = _.getUrlParams()
    if (params.assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE") {
        _.dialog($('<div style="background-color: rgba(0,0,0,0.5);color:white;font-size:xx-large;padding:10px"/>').text('preview'), false)
        $('body').click(function () {
            alert('This is a preview. Please accept the HIT to work on it.')
        })
        return true
    }
};
