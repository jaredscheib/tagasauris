/* global jQuery, Firebase, _, Promise, db, data, params */

var ticketsToGet = 30;

var taskName = 'task_img_verification_trinary';
var ticketsPool = taskName + '_tickets_pool'
var ticketsReq = taskName + '_tickets_req';
var ticketsRes = taskName + '_tickets_res';
var ticketsPool_uid = ticketsPool + '_uid';
var ticketsReq_uid = ticketsReq + '_uid';
var ticketsRes_uid = ticketsRes + '_uid';

// stub db helpers & fixtures
stub_db = {
  // TODO: need to resolve these refs before allowing methods below to be invoked?
  imgRef: db.child('img_ref'),
  taskTicketsPoolRef: db.child(ticketsPool),
  taskTicketsReqRef: db.child(ticketsReq),
  taskTicketsResRef: db.child(ticketsRes),
  imgData: data.img_ref,
  taskTicketsPool: data[ticketsPool],
  taskTicketsReq: data[ticketsReq] || {},
  taskTicketsRes: data[ticketsRes] || {},
  isTicketInReqAndNotExpired: function (ticket) {
    for (var reqTicketKey in this.taskTicketsReq) {
      var reqTicket = this.taskTicketsReq[reqTicketKey];
      if ((reqTicket[ticketsPool_uid] === ticket.uid) && (!this.isReqTicketExpired(reqTicket))) return true;
    }
    return false;
  },
  isTicketInRes: function (ticket) {
    for (var resTicketKey in this.taskTicketsRes) {
      var resTicket = this.taskTicketsRes[resTicketKey];
      if (this.taskTicketsPool[this.taskTicketsReq[resTicket[ticketsReq_uid]][ticketsPool_uid]] === ticket.uid) return true;
    }
    return false;
  },
  isReqTicketExpired: function (reqTicket) {
    return (getNow() - reqTicket.timeSubmitted) > reqTicket.taskDuration; // TODO create these keys, normalize taskDuration and reference it back from jobs bucket
  },
  remainsOpen: function (ticket) {
    if (this.isTicketInRes(ticket) || (this.isTicketInReqAndNotExpired(ticket))) return false;
    else return true;
  },
  // retrieve up to n open tickets
  getTickets: function (taskName, maxCount) {
    var ticketsToServe = [];
    for (var uid in this.taskTicketsPool) {
      var ticket = this.taskTicketsPool[uid];
      if (ticketsToServe.length === maxCount) break;
      if (this.remainsOpen(ticket)) {
        ticketsToServe.push(this.taskTicketsReqRef.push(ticket)
        .then(function (pushedReqTicketRef) {
          this[ticketsPool_uid] = this.uid;
          this.uid = pushedReqTicketRef.path.u[1];
          this.timeSubmitted = getNow();
          this.taskDuration = minToMs(1); // TODO add this via reference to job entry
          delete this.img_ref_uid;
          pushedReqTicketRef.set({
            task_img_verification_trinary_tickets_pool_uid: this[ticketsPool_uid],
            uid: this.uid,
            timeSubmitted: this.timeSubmitted,
            taskDuration: this.taskDuration,
          });
          return this;
        }.bind(ticket))
        .catch(function (err) {
          throw err;
        }));
      }
    }
    return Promise.all(ticketsToServe);
  },
  getImage: function (ticket) {
    return imgData[taskTicketsPool[ticket[taskTicketsPool_uid]][img_ref_uid]];
  },
};

// query db for next 30 images (server will determine these but for now on client-side)
stub_db.getTickets(taskName, ticketsToGet)
  .then(function(ticketsToServe) {
  // iterate over server response
    console.log('succeeded to get', ticketsToServe.length, 'of', ticketsToGet, 'requested for task', taskName);
    console.log(ticketsToServe);
    ticketsToServe.forEach(function(ticket){
    // instantiate imgTrinary class per image (follow angular pattern)
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
