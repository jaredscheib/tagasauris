/* global _, Promise, elements, getNow, minToMs, loadScript */
/* global setImgCounters, makeInstructionsList, makeImgRow, Operand */

  // event listener on submitBtn for click
    // iterate over responses obj
      // push to img_sanitizer_task_worker_res

var stub_rx = {
  loadComponents: function(tickets) {
    return Promise.all([
      loadScript('./tasks/classes/instructionsList.js'),
      loadScript('./tasks/classes/imgOptSelect.js'),
      // loadScript('./tasks/classes/imgRow.js')
    ])
    .then(function() {
      console.log('loaded compenents with image data', tickets)

      elements.questionSpan.innerHTML = 'Do each of these <span class="img_counter"></span> photos contain "' + info.concept + '"?';
      elements.instructionsArea.appendChild(makeInstructionsList([
        'You can click on each image to select your response.'
      ], 'li'));

      // instantiate Operand class per image
      elements.ticketComponents = tickets.map(function(ticket, i){
        // if (i % 3 === 0) elements.mediaArea.appendChild(makeImgRow());
        var newOperand = new Operand(ticket, i);
        elements.mediaArea.appendChild(newOperand.operandContainer);
        return newOperand;
      });
      return true;
    });
  },
  updateComponents: function(tickets) {
    // TODO feed React
    // setImgCounters();
  },
  getComponentsData: function(mod) {
    return elements.ticketComponents.map(function(ticketComponent) {
      for (var key in mod) ticketComponent[key] = mod[key];
      return ticketComponent.imgData;
    });
  },
  isTaskComplete: function () {
    for (var i = 0; i < elements.ticketComponents.length; i++) {
      if (!elements.ticketComponents[i].imgData.hasOwnProperty('response')) {
        console.log('task not complete');
        return false;
      }
    }
    console.log('task complete');
    return true;
  }
};
