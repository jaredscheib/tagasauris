/* global _, Promise, elements, getNow, minToMs, loadScript */
/* global taskInfo, ticketsInfo, dbRef, taskData */
/* global makeInstructionsList, makeImgRow, ImgTrinary */

// stub db helpers
var stub_db = {
  isTicketInReqAndNotExpired: function (ticket) {
    for (var reqTicketUID in taskData.taskTicketsReq) {
      var reqTicket = taskData.taskTicketsReq[reqTicketUID];
      var poolTicket = taskData.taskTicketsPool[reqTicket[ticketsInfo.ticketsPool_uid]];
      if ((poolTicket.uid === ticket.uid) && (!this.isReqTicketExpired(reqTicket))) return true;
    }
    return false;
  },
  isTicketInRes: function (ticket) {
    for (var resTicketUID in taskData.taskTicketsRes) {
      var resTicket = taskData.taskTicketsRes[resTicketUID];
      var reqTicket = taskData.taskTicketsReq[resTicket[ticketsInfo.ticketsReq_uid]];
      var poolTicket = taskData.taskTicketsPool[reqTicket[ticketsInfo.ticketsPool_uid]];
      if (poolTicket.uid === ticket.uid) return true;
    }
    return false;
  },
  isReqTicketExpired: function (reqTicket) {
    return (getNow() - reqTicket.timeSubmitted) > reqTicket.taskDuration; // TODO create these keys, normalize taskDuration and reference it back from jobs bucket
  },
  remainsOpen: function (poolTicket) {
    if (this.isTicketInRes(poolTicket) || (this.isTicketInReqAndNotExpired(poolTicket))) return false;
    else return true;
  },
  // retrieve up to n open tickets
  getTickets: function (taskName, maxCount) {
    var ticketsToServe = [];
    for (var poolTicketUID in taskData.taskTicketsPool) {
      var poolTicket = taskData.taskTicketsPool[poolTicketUID];
      if (ticketsToServe.length === maxCount) break;
      if (this.remainsOpen(poolTicket)) {
        ticketsToServe.push(dbRef.taskTicketsReq.push(poolTicket)
        .then(function (pushedReqTicketRef) {
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
    return Promise.all(ticketsToServe);
  },
  getImage: function (reqTicket) {
    var ticketsPoolKey = reqTicket[ticketsInfo.ticketsPool_uid];
    var ticketsPoolTask = taskData.taskTicketsPool[ticketsPoolKey];
    var gottenImg = taskData.imgTickets[ticketsPoolTask.img_ref_uid];
    return gottenImg;
  },
  pushAndAddUID: function (targetRef, sourceObj) {
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
  },
};

var loadClasses = function (callback) {
  loadScript('./classes/instructionsList.js', function () {
    elements.instructionsArea.appendChild(makeInstructionsList([
      'Indicate if each of the ' + taskInfo.ticketsToGet + ' images contains the named concept.'
    ], 'li'));
    loadScript('./classes/imgTrinary.js', function () {
      loadScript('./classes/imgRow.js', function () {
        callback();
      });
    });
  });
};

loadClasses(function () {
  // query db for next 30 images (server will determine these but for now on client-side)
  stub_db.getTickets(taskInfo.taskName, taskInfo.ticketsToGet)
    .then(function(reqTickets) {
    // iterate over server response
      // console.log('succeeded to get', reqTickets.length, 'of', taskInfo.ticketsToGet, 'tickets requested for task', taskInfo.taskName);
      // console.log(reqTickets);
      // instantiate imgTrinary class per image
      elements.resTicketItems = [];
      reqTickets.map(function(reqTicket, i){
        if (i % 3 === 0) elements.mediaArea.appendChild(makeImgRow());
        var newImgTrinary = new ImgTrinary(stub_db.getImage(reqTicket), reqTicket, i);
        elements.resTicketItems.push(newImgTrinary);
        elements.mediaArea.lastElementChild.appendChild(newImgTrinary.trinaryContainer);
      // event listeners on trinary
        // add response and other metadata (worker id, img_ref) to flat output obj based on trinary state change
        // enable submitBtn if all images completed
      });   
    })
    .catch(function(err) {
      console.log('failed to get tickets for task');
      throw err;
    });
    
  // event listener on submitBtn for click
    // iterate over results obj
      // push to img_sanitizer_task_worker_res  
});

