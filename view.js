var db = new Firebase('https://dazzling-heat-3394.firebaseio.com/');

db.once('value', function (snapshot) {
  renderView(snapshot.val());
});

var renderView = function (data) {
  console.log(data);
  var view = document.getElementById('data_view');
  // var buildHTML = '';
  _.each(data, function (video) {
    var divSet = document.createElement('div');
    divSet.className = 'set';
    var divVid = document.createElement('div');
    divVid.className = 'video';
    divVid.innerHTML = '<iframe width="210" height="157" src="' + video.embedURL + '" frameborder="0" allowfullscreen></iframe>';
    divSet.appendChild(divVid);

    var divAno = document.createElement('div');
    divAno.className = 'annotations';
    var ul = document.createElement('ul');
    ul.className = 'data';
    var ulHTML = '';
    for (var i = 1; i < 4; i++) {
      _.each(video['annotations_task' + i], function (anno) {
        var li = document.createElement('li');
        li.className = 'annotation';
        li.innerHTML = 'TASK' + i + '::  workerId: ' + anno.workerId + ', annotation: ' + anno.annotation;
        ul.appendChild(li); 
      });
      divAno.appendChild(ul);
    }
    divSet.appendChild(divAno);
    view.appendChild(divSet);
  });
};
