/* global _, Promise, elements, getNow, minToMs, loadScript */
/* global setImgCounters, makeInstructionsList, makeImgRow, ImgTrinary */

loadClasses()
.then(function() {
  console.log('classes loaded');
    
  // event listener on submitBtn for click
    // iterate over results obj
      // push to img_sanitizer_task_worker_res
});

function loadClasses () {
  var classPromises = [];

  classPromises.push(
    loadScript('./tasks/classes/instructionsList.js'),
    loadScript('./tasks/classes/imgTrinary.js'),
    loadScript('./tasks/classes/imgRow.js')
  );

  return Promise.all(classPromises);
};

var isTaskComplete = function () {
  // return !$j('input[name=""')
};

function stub_updateComponentState(reqTickets) {
 // TODO feed React
  console.log('update compenents with reqTickets:', reqTickets)

  elements.instructionsArea.appendChild(makeInstructionsList([
    'Does each of the <span class="img_counter"></span> photos below contain the named concept?'
  ], 'li'));

  // instantiate imgTrinary class per image
  reqTickets.map(function(reqTicket, i){
    if (i % 3 === 0) elements.mediaArea.appendChild(makeImgRow());
    var newImgTrinary = new ImgTrinary(reqTicket, i);
    elements.ticketComponents.push(newImgTrinary);
    elements.mediaArea.lastElementChild.appendChild(newImgTrinary.trinaryContainer);
  // event listeners on trinary
    // add response and other metadata (worker id, img_ref) to flat output obj based on trinary state change
    // enable submitBtn if all images completed
  });   
  setImgCounters();
}

function stub_getResultsData() {
 // TODO get all results data in React style
  return {
    here: 'is',
    is: 'an',
    object: 'object'
  };
}
