var db = new Firebase('https://dazzling-heat-3394.firebaseio.com/');

window.onload = function () {
  var annotext = document.getElementById('annotext');
  annotext.focus();

  var submit = document.getElementById('submit');
  submit.addEventListener('click', function (event) {
    event.preventDefault();

    var annotations = annotext.value;
    annotext.value = '';
    db.push(annotations);
    console.log('POST to Firebase:', annotations);
  });

  mturkCheckPreview();
};

db.on('child_added', function (snapshot){
  var addedAnnotation = snapshot.val();
  console.log('Posted to Firebase:', addedAnnotation);
  mturkSubmit();
});