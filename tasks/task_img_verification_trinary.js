/* global _, Promise, elements, getNow, minToMs, loadScript */
/* global taskInfo, ticketsInfo, dbRef, taskData */
/* global setImgCounters, removeLoader, makeInstructionsList, makeImgRow, ImgTrinary */

var loadClasses = function (callback) {
  loadScript('./classes/instructionsList.js', function () {
    elements.instructionsArea.appendChild(makeInstructionsList([
      'Does each of the <span class="img_counter"></span> photos below contain the named concept?'
    ], 'li'));
    loadScript('./classes/imgTrinary.js', function () {
      loadScript('./classes/imgRow.js', function () {
        callback();
      });
    });
  });
};

loadClasses(function () {
  stub_db.getTickets(taskInfo.taskName, taskInfo.ticketsToGet)
    .then(function(reqTickets) {
    // iterate over server response
      // console.log('succeeded to get', reqTickets.length, 'of', taskInfo.ticketsToGet, 'tickets requested for task', taskInfo.taskName);
      // console.log(reqTickets);
      // instantiate imgTrinary class per image
      removeLoader();
      reqTickets.map(function(reqTicket, i){
        if (i % 3 === 0) elements.mediaArea.appendChild(makeImgRow());
        var newImgTrinary = new ImgTrinary(stub_db.getImage(reqTicket), reqTicket, i);
        elements.resTicketItems.push(newImgTrinary);
        elements.mediaArea.lastElementChild.appendChild(newImgTrinary.trinaryContainer);
      // event listeners on trinary
        // add response and other metadata (worker id, img_ref) to flat output obj based on trinary state change
        // enable submitBtn if all images completed
      });   
      setImgCounters();
    })
    .catch(function(err) {
      console.log('failed to get tickets for task');
      throw err;
    });
    
  // event listener on submitBtn for click
    // iterate over results obj
      // push to img_sanitizer_task_worker_res  
});

var isTaskComplete = function () {
  // return !$j('input[name=""')
};