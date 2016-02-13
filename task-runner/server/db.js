'use strict'

const _ = require('../public/util/utils.js');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const Firebase = require('firebase');

var dbRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/');

function getOpenTickets (task, num) {
  return new Promise((resolve, reject) => {
    console.log('getOpenTickets()');
    stub_getOpenTickets(task, num)
    .then(results => {
      resolve(results);
    });
  });
}

// post tickets with collected results to database
function closeTickets (tickets) {
  return new Promise((resolve, reject) => {
    console.log('closeTickets()');
    stub_closeTickets(tickets)
    .then(res => {
      resolve(res);
    })
  });
  // var postRef = dbRef.root.child(ticketsInfo.ticketsRes);
  // elements.resTicketItems.forEach(function (resTicketItem) {
  //   resTicketItem.resTicket[ticketsInfo.ticketsReq_uid] = resTicketItem.resTicket.reqTicket.uid;
  //   resTicketItem.resTicket.workerId = params.workerId;
  //   resTicketItem.resTicket.timeSubmitted = _.getNow();
  //   postRef.push(resTicketItem.resTicket);
  // });
  // return;
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
  .catch(sendErr);
}

function sendErr (err) {
  console.log(err);
  return err;
}

function stub_getOpenTickets (task, num) {
  // TODO check what structure firebase returns
  return fs.readFileAsync('./fixtures/flat-data.json', 'utf-8')
  .then(data => {
    data = JSON.parse(data);
    var flatData = [];
    _.each(data, obj => {
      flatData.push(obj);
    });
    var x = flatData.slice(0, 30);
    console.log(x.length);
    return x;
  });
}

function stub_closeTickets (tickets) {
  return new Promise((resolve, reject) => {
    resolve('yes');
  });
}

module.exports = {
  getOpenTickets: getOpenTickets,
  closeTickets: closeTickets
}
