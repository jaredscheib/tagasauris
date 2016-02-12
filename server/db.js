'use strict'

const _ = require('../scripts/helpers/utils.js');
const Promise = require('bluebird');
const Firebase = require('firebase');

var dbRef = {};
dbRef.root = new Firebase('https://dazzling-heat-3394.firebaseio.com/');
// .then(function (ref) {
//   dbRef.imgTickets = ref;
//   return dbRef.root.child(ticketsInfo.ticketsPool);
// })
// .then(function (ref) {
//   dbRef.taskTicketsPool = ref;
//   return dbRef.root.child(ticketsInfo.ticketsReq);
// })
// .then(function (ref) {
//   dbRef.taskTicketsReq = ref;
//   return dbRef.root.child(ticketsInfo.ticketsRes);
// })
// .then(function (ref) {
//   dbRef.taskTicketsRes = ref;
//   loadScript('tasks/' + taskInfo.taskName + '.js', function () {
//     console.log('loaded task: ' + taskInfo.taskName);
//   });
// })
// .catch(function (err) {
//   console.log(err);
// });

// return dbRef.root.child('img_ref');

var taskData = {};
var taskInfo = {};
var ticketsInfo = {};

getOpenTickets('task_img_verification_trinary', 30, 15)
.then(tickets => {
  console.log('GOT TICKETS');
  console.log(tickets);
})
.catch(err => {
  console.log('err');
  console.log(err);
});

// helper
// if a ticket is in req and not expired, it's considered actively in process, so don't serve it
function isInReqAndNotExpired (poolTicketToMatch) {
  let fbQuery = dbRef.taskTicketsReq.orderByChild(ticketsInfo.ticketsPool_uid).equalTo(poolTicketToMatch.uid);
  return new Promise((resolve, reject) => {
    fbQuery.once('value', matchedReqTickets => {
      matchedReqTickets = matchedReqTickets.val();

      for (var key in matchedReqTickets) {
        let matchedReqTicket = matchedReqTickets[key];
        if (isNotExpired(matchedReqTicket)) {
          // console.log('in req and not expired!')
          return resolve(true);
        }
      }
      // console.log('not in req or expired!');
      resolve(false);
    });
  });
}

// helper
function isInRes (poolTicketToMatch) {
  let fbQuery = dbRef.taskTicketsRes.orderByChild(ticketsInfo.ticketsPool_uid).equalTo(poolTicketToMatch.uid);
  return new Promise((resolve, reject) => {
    fbQuery.once('value', matchedResTickets => {
      matchedResTickets = matchedResTickets.val();
      console.log('matchedResTickets', matchedResTickets);
      matchedResTickets ? resolve(true) : resolve(false);
    });
  });
}

// helper
function isNotExpired (reqTicket) {
  return (_.getNow() - reqTicket.timeSubmitted) > reqTicket.taskDuration; // TODO create these keys, normalize taskDuration and reference it back from jobs bucket
}

// helper
function isOpen (poolTicket) {
  // console.log('isOpen?');
  return Promise.all([isInRes(poolTicket), isInReqAndNotExpired(poolTicket)])
  .then(resultsBoolArr => {
    return resultsBoolArr.reduce((prevBool, currBool, i, o) => {
      return prevBool && currBool;
    }, true);
  })
}

// API
function getOpenTickets (taskName, maxCount, taskDuration) { // TODO can remove taskDuration from server, client, and db here once refactored probably
  taskInfo.taskName = taskName;
  taskInfo.maxTicketsToGet = Number(maxCount);
  taskInfo.taskDuration = Number(taskDuration);

  ticketsInfo.ticketsPool = taskInfo.taskName + '_tickets_pool',
  ticketsInfo.ticketsReq = taskInfo.taskName + '_tickets_req',
  ticketsInfo.ticketsRes = taskInfo.taskName + '_tickets_res',
  ticketsInfo.ticketsPool_uid = ticketsInfo.ticketsPool + '_uid';
  ticketsInfo.ticketsReq_uid = ticketsInfo.ticketsReq + '_uid';
  
  dbRef.imgRef = dbRef.root.child('img_ref');
  dbRef.taskTicketsPool = dbRef.root.child(ticketsInfo.ticketsPool);
  dbRef.taskTicketsReq = dbRef.root.child(ticketsInfo.ticketsReq);
  dbRef.taskTicketsRes = dbRef.root.child(ticketsInfo.ticketsRes);

  // console.log(taskInfo)
  // console.log(ticketsInfo)

  return new Promise(function(resolve, reject) {
    // get unexpired tickets
    
    dbRef.root.child(ticketsInfo.ticketsPool)

    dbRef.root.once('value', wholeDbSnapshot => {
      taskData.all = wholeDbSnapshot.val();
      taskData.imgTickets = taskData.all.img_ref;
      taskData.taskTicketsPool = taskData.all[ticketsInfo.ticketsPool];
      taskData.taskTicketsReq = taskData.all[ticketsInfo.ticketsReq] || {};
      taskData.taskTicketsRes = taskData.all[ticketsInfo.ticketsRes] || {};

      _.each(taskData, (item, key) => {
        console.log(key, Object.keys(item).length);
      });

      resolve(taskData.taskTicketsPool)
    }, err => { reject(err); });
  })
  .then(() => {
    var ticketsToServe = [];
    for (var poolTicketUID in taskData.taskTicketsPool) {
      var poolTicket = taskData.taskTicketsPool[poolTicketUID];
      if (ticketsToServe.length === maxCount) break;
      isOpen (poolTicket)
      .then(result => {
        // console.log('found open ticket');
        ticketsToServe.push(dbRef.taskTicketsReq.push(poolTicket)
        .then(function (pushedReqTicketRef) {
          // console.log('pushedReqTicketRef', pushedReqTicketRef);
          this[ticketsInfo.ticketsPool_uid] = this.uid;
          this.uid = pushedReqTicketRef.path.u[1];
          this.timeSubmitted = _.getNow();
          // this.taskDuration = _.minToMs(taskInfo.taskDuration); // TODO add this via reference to job entry?
          delete this.img_ref_uid;

          var pushObj = {};
          pushObj[ticketsInfo.ticketsPool_uid] = this[ticketsInfo.ticketsPool_uid];
          pushObj.uid = this.uid;
          pushObj.timeSubmitted = this.timeSubmitted;
          pushObj.taskDuration = this.taskDuration;
          // console.log('pushObj', pushObj);
          pushedReqTicketRef.set(pushObj);

          return this;
        }.bind(_.deepClone(poolTicket)))
        .catch(function (err) {
          throw err;
        }));
        
      });
    }
    taskInfo.ticketsReceived = ticketsToServe.length;
    console.log('ticketsToServe.length', ticketsToServe.length);
    return Promise.all(ticketsToServe);
  })
  .catch(err => {
    sendErr(err);
  }); 
}

// helper
function getImage (reqTicket) {
  var ticketsPoolKey = reqTicket[ticketsInfo.ticketsPool_uid];
  var ticketsPoolTask = taskData.taskTicketsPool[ticketsPoolKey];
  var gottenImg = taskData.imgTickets[ticketsPoolTask.img_ref_uid];
  return gottenImg;
}

// helper
function pushAndAddUID (targetRef, sourceObj) {
  var item = sourceObj;
  targetRef.push(item)
  .then(function (tempRef) {
    item.uid = tempRef.path.u[1];
    return tempRef.update({uid: item.uid});
  })
  .then(function () {
    // console.log('item at ' + targetRef.path.u[0] + '/' + item.uid + 'updated');
  })
  .catch(function (err) { throw (err); });
}

function sendErr (err) {
  console.log(err);
  return err;
}

module.exports = {
  getOpenTickets: getOpenTickets,
}
