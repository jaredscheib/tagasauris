'use strict';

// const _ = require('underscore');
// const Promise = require('bluebird');
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

// helper
function isTicketInReqAndNotExpired (ticket) {
  for (var reqTicketUID in taskData.taskTicketsReq) {
    var reqTicket = taskData.taskTicketsReq[reqTicketUID];
    var poolTicket = taskData.taskTicketsPool[reqTicket[ticketsInfo.ticketsPool_uid]];
    console.log('isTicketInReqAndNotExpired', poolTicket, ticket);
    if (poolTicket && (poolTicket.uid === ticket.uid) && (!isReqTicketExpired(reqTicket))) return true;
  }
  return false;
}

// helper
function isTicketInRes (ticket) {
  for (var resTicketUID in taskData.taskTicketsRes) {
    var resTicket = taskData.taskTicketsRes[resTicketUID];
    var reqTicket = taskData.taskTicketsReq[resTicket[ticketsInfo.ticketsReq_uid]];
    var poolTicket = taskData.taskTicketsPool[reqTicket[ticketsInfo.ticketsPool_uid]];
    console.log('isTicketInRes', poolTicket, ticket);
    if (poolTicket && poolTicket.uid === ticket.uid) return true;
  }
  return false;
}

// helper
function isReqTicketExpired (reqTicket) {
  return (getNow() - reqTicket.timeSubmitted) > reqTicket.taskDuration; // TODO create these keys, normalize taskDuration and reference it back from jobs bucket
}

// helper
function remainsOpen (poolTicket) {
  console.log('remainsOpen?');
  if (isTicketInRes(poolTicket) || (isTicketInReqAndNotExpired(poolTicket))) return false;
  else return true;
}

// API
function getTickets (taskName, maxCount) {
  taskInfo.taskName = taskName;
  ticketsInfo.ticketsPool = taskInfo.taskName + '_tickets_pool',
  ticketsInfo.ticketsReq = taskInfo.taskName + '_tickets_req',
  ticketsInfo.ticketsRes = taskInfo.taskName + '_tickets_res',
  ticketsInfo.ticketsPool_uid = ticketsInfo.ticketsPool + '_uid';
  ticketsInfo.ticketsReq_uid = ticketsInfo.ticketsReq + '_uid';

  return new Promise(function(resolve, reject) {
    dbRef.root.once('value', wholeDbSnapshot => {
      taskData.all = wholeDbSnapshot.val();
      taskData.imgTickets = taskData.all.img_ref;
      taskData.taskTicketsPool = taskData.all[ticketsInfo.ticketsPool];
      taskData.taskTicketsReq = taskData.all[ticketsInfo.ticketsReq] || {};
      taskData.taskTicketsRes = taskData.all[ticketsInfo.ticketsRes] || {};
      resolve()
    }, err => { reject(err); });
  })
  .then(() => {
    var ticketsToServe = [];
    for (var poolTicketUID in taskData.taskTicketsPool) {
      var poolTicket = taskData.taskTicketsPool[poolTicketUID];
      if (ticketsToServe.length === maxCount) break;
      if (remainsOpen(poolTicket)) {
        dbRef.taskTicketsReq = dbRef.root.child(ticketsInfo.ticketsReq);
        console.log('found open ticket');
        ticketsToServe.push(dbRef.taskTicketsReq.push(poolTicket)
        .then(function (pushedReqTicketRef) {
          console.log('pushedReqTicketRef', pushedReqTicketRef);
          this[ticketsInfo.ticketsPool_uid] = this.uid;
          this.uid = pushedReqTicketRef.path.u[1];
          this.timeSubmitted = getNow();
          this.taskDuration = minToMs(taskInfo.taskDuration); // TODO add this via reference to job entry?
          delete this.img_ref_uid;

          var pushObj = {};
          pushObj[ticketsInfo.ticketsPool_uid] = this[ticketsInfo.ticketsPool_uid];
          pushObj.uid = this.uid;
          pushObj.timeSubmitted = this.timeSubmitted;
          pushObj.taskDuration = this.taskDuration;
          pushedReqTicketRef.set(pushObj);

          return this;
        }.bind(_.deepClone(poolTicket)))
        .catch(function (err) {
          throw err;
        }));
      }
    }
    taskInfo.ticketsReceived = ticketsToServe.length;
    console.log('ticketsToServe', ticketsToServe);
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
    console.log('item at ' + targetRef.path.u[0] + '/' + item.uid + 'updated');
  })
  .catch(function (err) { throw (err); });
}

function sendErr (err) {
  console.log(err);
  return err;
}

function getNow() {
  return new Date().getTime();
}

module.exports = {
  getTickets: getTickets,
}
