/* global jQuery, Firebase, _, db, data, params */

var taskName = 'task_img_verification_trinary';
var ticketsPool = taskName + '_tickets_pool'
var ticketsReq = taskName + '_tickets_req';
var ticketsRes = taskName + '_tickets_res';
var ticketsPool_uid = ticketsPool + '_uid';
var ticketsReq_uid = ticketsReq + '_uid';
var ticketsRes_uid = ticketsRes + '_uid';

// stub db helpers & fixtures
stub_db = {
  imgRef: db.child('img_ref'), // TODO: need to resolve this before allowing methods below to be invoked?
  taskTicketsRef: db.child(ticketsPool),
  taskTicketsReqRef: db.child(ticketsReq),
  taskTicketsResRef: db.child(ticketsRes),
  imgTickets: data.img_ref,
  taskTicketsPool: data[ticketsPool],
  taskTicketsReq: data[ticketsReq] || [],
  taskTicketsRes: data[ticketsRes] || [],
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
    // if ticket is in res or (ticket is in req and is not expired ((getNow() - timeSubmitted) > taskDuration))
    if (isTicketInRes(ticket) || (isTicketInReqAndNotExpired(ticket))) return false;
    else return true;
    // var backChain = this.taskTickets[]
    // var backChain = this.taskTickets[this.taskTicketsReq[this.taskTicketsRes[ticketsReq]][ticketsPool_uid]].img_ref_uid;
    // if (ticket.img_ref_uid === backChain) return false;
  },
  // find up to first 30 open tickets from task_img_verification that are not in _req or _res
  getTickets: function (taskName, maxCount) {
    var ticketsToServe = [];
    // stub_db.imgTickets, stub_db.taskTickets, stub_db.taskTicketsReq, stub_db.taskTicketsRes
    debugger;
    for (var i = 0; i < Object.keys(this.taskTickets).length; i++) {
      var ticket = this.taskTickets[i];
      if (ticketsToServe.length === maxCount) break;
      if (this.remainsOpen(ticket)) {
        console.log('ticketsToServe.push:', ticket);
        var ticketPromise = this.taskTicketsReqRef.push(ticket)
          .then((pushedTicketRef) => {
            var newUID = pushedTicketRef.path.u[1];
            pushedTicketRef.set({task_img_verification_trinary_uid: this.uid, uid: newUID}, function(err) {
              if (err) console.log(err, 'failed to set in Firebase', this);
              else console.log('succeeded to set in Firebase', this);
            }).bind(this);
            this.task_img_verification_trinary_uid = this.uid;
            this.uid = newUID;
            return this;
          }).bind(ticket)
        ticketsToServe.push(ticketPromise);
      }
    } 
    return Promise.all(ticketsToServe);
  },
};

// query db for next 30 images (server will determine these but for now on client-side)
stub_db.getTickets(taskName, 30)
  .then(function(ticketsToServe) {
    debugger;
  // iterate over server response
    console.log('succeeded to get tickets for task', ticketsToServe);
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
