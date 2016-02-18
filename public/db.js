/* global _ */

var dbRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/');
var fbTargetSet = 'img_ref';

var stub_db = {
  getTickets: function(concept) {
    return new Promise(function(fulfill, reject) {
      dbRef.child(fbTargetSet).child(concept).once('value', function(snapshot) {
        var imgData = snapshot.val();
        var tickets = [];
        for (var key in imgData) {
          tickets.push(imgData[key]);
          if (tickets.length === 30) break;
        }
        fulfill(tickets);
      });
    });
  },
  updateImgRefTaskCount: function(updateObj, taskCountKey) {
    return new Promise(function(fulfill, reject) {
      // console.log(fbTargetSet, updateObj.concept, updateObj.uid, taskCountKey);
      return dbRef.child(fbTargetSet).child(updateObj.concept).child(updateObj.uid).child(taskCountKey)
      .transaction(function(val) {
        // console.log('val', val);
        if (val === null) {
          var newObj = {};
          newObj[taskCountKey] = 1;
          // console.log('transacting', newObj, 'at taskCountKey');
          return newObj;
        } else {
          // console.log('transacting ++val at taskCountKey');
          return ++val;
        }
      })
      .then(function(snapshot) {
        var val = snapshot.snapshot.val();
        if (!snapshot.committed) {
          // console.log('Aborted transaction at', updateObj.uid, taskCountKey);
          reject(); // TODO snapshot.error?
        } else {
          // console.log('Transaction successful. Atomically updated', taskCountKey, 'at', updateObj.uid, 'to', val);
          fulfill(val);
        }
      })
      .catch(err => {
        console.log('error transacting to firebase');
        console.log(err.stack);
      });
    });
  },
  pushResultRef: function(sourceObj, targetRef) {
    // console.log('attempt to push result obj to task results and add UID', sourceObj);
    targetRef = targetRef || sourceObj.s3_key.split('/').slice(0,2).join('/');
    targetRef = dbRef.child(targetRef).child(sourceObj.concept);
    return targetRef.push(sourceObj)
    .then(function(pushedRef) {
      return addUID(pushedRef, sourceObj.uid)
    });

    function addUID (pushedRef, img_ref_uid) {
      // console.log('calling addUID at', pushedRef)
      return pushedRef.update({ uid: pushedRef.key(), img_ref_uid: img_ref_uid });
    }
  }
};
