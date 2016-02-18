/* global _ */

var dbRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/');

var stub_db = {
  getTickets: function(concept) {
    return new Promise(function(fulfill, reject) {
      dbRef.child('img_ref').child(concept).once('value', function(snapshot) {
        var imgData = snapshot.val();
        var tickets = [];
        for (var key in imgData) {
          tickets.push(imgData[key]);
          if (tickets.length === 1) break;
        }
        fulfill(tickets);
      });
    });
  },
  updateImgRefTaskCount: function(updateObj, taskCountKey) {
    return new Promise(function(fulfill, reject) {
      dbRef.child('img_ref').child(updateObj.concept).child(updateObj.uid).child(taskCountKey)
      .transaction(function(val) {
        if (val === null) {
          var newObj = {};
          newObj[taskCountKey] = 1;
          return newObj;
        } else {
          return val++;
        }
      }, function(error, committed, snapshot) {
        if (error) {
          console.log('Transaction to create/increment', taskCountKey, 'failed at', updateObj.uid);
          reject(error);
        } else if (!committed) {
          console.log('Aborted transaction at', updateObj.uid, taskCountKey);
          reject();
        } else {
          console.log('Transaction successful at', updateObj.uid, taskCountKey);
        }
        console.log('Data:', snapshot.val());
        resolve(snapshot.val);
      });
    });
  },
  // pushResultRef: function(sourceObj, targetRef) {
  //   console.log('push result obj to task results and add UID', sourceObj);
  //   // update orig img ref and push to general results pool
  // },
  // pushAndAddUID(sourceObj, targetRef) {
  //   console.log(`attempt to pushAndAddUID`)
  //   targetRef = targetRef || sourceObj.s3_key.split('/').slice(0,2).join('/');
  //   // console.log('targetRef', targetRef);
  //   let targetRef = dbRef.child(targetRef) || dbRef.child('img_ref3');
  //   const item = sourceObj;
  //   return new Promise((resolve, reject) => {
  //     targetRef.push(item)
  //     .then(tempRef => {
  //       tempRef.update({ uid: tempRef.key() });
  //       console.log('pushAndAddUID success', typeof tempRef);
  //       resolve(tempRef); // return updated obj ref
  //     })
  //     .catch(err => {
  //       resolve(null);
  //     })
  //   });
  // },
  // addUID(targetRef) {
  // }
};

var fixture = {
  amt_assignment_id: undefined,
  amt_hit_id: undefined,
  amt_turk_submit_to: undefined,
  amt_worker_id: undefined,
  concept: "porsche",
  height: 450,
  orig_url: "http://o.aolcdn.com/dims-shared/dims3/GLOB/crop/800x450+0+29/resize/800x450!/format/jpg/quality/85/http://o.aolcdn.com/hss/storage/midas/921d893e399821cf9c23a388d62e5f8c/202030982/porsche-918-recall.jpg",
  query: "porsche",
  response: 3,
  s3_bucket: "vid_decomp",
  s3_etag: "4a0357eb12f01f2590a35e72090f865d-1",
  s3_key: "img_ref/porsche/w600q80/0e9ed762-c768-4ab7-b4b1-09c63411c6b6-Cporsche-Qporsche-W600-L80.jpg",
  size: 92357,
  task_img_verification: 1,
  thumb_height: 80,
  thumb_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcFOgAyc-NXytmhMhp48I1D_HlBDXqIcIDgZSUgkrURdQFUwKG49iisLs",
  thumb_width: 143,
  time_submitted: 1455752979856,
  type: "image/jpeg",
  uid: "-KAj2yERfG2ctyIt6rLV",
  url: "https://s3.amazonaws.com/vid_decomp/img_ref%2Fporsche%2Fw600q80%2F0e9ed762-c768-4ab7-b4b1-09c63411c6b6-Cporsche-Qporsche-W600-L80.jpg",
  width: 800
};

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
