var db = new Firebase('https://dazzling-heat-3394.firebaseio.com/');

window.onload = function () {
  var annotext = document.getElementById('annotext');
  annotext.focus();

  var submit = document.getElementById('submit');
  submit.addEventListener('click', function (event) {
    event.preventDefault();

    var annotations = annotext.value;
    annotext.value = '';
    db.push(annotations, function () {
      mturkCheckPreview();
    });
    console.log('POST to Firebase:', annotations);

    mturkSubmit();
  });

};

db.on('child_added', function (snapshot){
  var addedAnnotation = snapshot.val();
  console.log('Posted to Firebase:', addedAnnotation);
});

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
