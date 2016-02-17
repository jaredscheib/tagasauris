/* global taskInfo */

var dbRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/');

var stub_db = {
  getTickets: function() {
    return new Promise(function(fulfill, reject) {
      dbRef.child('img_ref').child(info.concept).once('value', function(snapshot) {
        var imgData = snapshot.val();
        var tickets = [];
        for (var key in imgData) {
          tickets.push(imgData[key]);
          if (tickets.length === 30) break;
        }
        fulfill(tickets);
      });
    });
  }
}




// old ajax
// TODO AJAX GET
// console.log('ajax get attempt');
// return $j.ajax({
//   url: apiRoute,
//   type: 'GET',
//   data: {
//     task: task,
//     num: num
//   }
// });

// console.log('ajax post attempt');
// $j.ajax({
//   url: apiRoute,
//   type: 'POST',
//   data: stub_db.getResultsData()
// })
// .done(function (res) {
//   console.log('closed tickets via POST!');
//   console.log('response:', res);
// });
