/* global _, Promise, elements, getNow, minToMs, loadScript */
/* global setImgCounters, makeInstructionsList, makeImgRow, Operand */

  // event listener on submitBtn for click
    // iterate over results obj
      // push to img_sanitizer_task_worker_res

var stub_rx = {
  loadComponents: function() {
    return Promise.all([
      loadScript('./tasks/classes/instructionsList.js'),
      loadScript('./tasks/classes/imgOptSelect.js'),
      loadScript('./tasks/classes/imgRow.js')
    ]);
  },
  updateComponentState: function(tickets) {
   // TODO feed React
    console.log('update compenents with tickets:', tickets)

    elements.questionSpan.innerHTML = 'Do each of these <span class="img_counter"></span> photos contain "' + info.concept + '"?';
    elements.instructionsArea.appendChild(makeInstructionsList([
      'Click on each image to select your response.'
    ], 'li'));

    // instantiate Operand class per image
    elements.ticketComponents = tickets.map(function(ticket, i){
      // if (i % 3 === 0) elements.mediaArea.appendChild(makeImgRow());
      var newOperand = new Operand(ticket, i);
      elements.mediaArea.appendChild(newOperand.operandContainer);
    // event listeners on OptSelect
      // add response and other metadata (worker id, img_ref) to flat output obj based on OptSelect state change
      // enable submitBtn if all images completed
    });   
    // setImgCounters();
  },
  getResultsData() {
   // TODO get all results data in React style
    return {
      here: 'is',
      is: 'an',
      object: 'object'
    };
  }
};


var isTaskComplete = function () {
  // return !$j('input[name=""')
};
