/* global _, Promise, elements, getNow, minToMs, loadScript */
/* global setImgCounters, makeInstructionsList, makeImgRow, Operand */

  // event listener on submitBtn for click
    // iterate over responses obj
      // push to img_sanitizer_task_worker_res

var stub_rx = {
  loadComponents: function(tickets) {
    return Promise.all([
      loadScript('public/tasks/classes/instructionsList.js'),
      loadScript('public/tasks/classes/imgOptSelect.js'),
      // loadScript('public/tasks/classes/imgRow.js')
    ])
    .then(function() {
      console.log('loaded compenents with image data', tickets)

      elements.questionSpan.innerHTML = 'Does each of the <span id="img_counter"></span> photos below depict <b>' + info.concept.toUpperCase() + '</b>?';
      elements.imgCounter = document.getElementById('img_counter');
      elements.imgCounter.innerHTML = info.received;
      elements.instructionsArea.appendChild(makeInstructionsList([
        'Click on each image to select your answer.',
        '1 click: if the image IS A CLEAR DEPICTION of ' + info.concept.toUpperCase() + '.',
        '2 clicks: if there IS NO ' + info.concept.toUpperCase() + ' in the image.',
        '3 clicks: if the image IS UNCLEAR.',
        '4 clicks: if the image is NOT A PHOTOGRAPH.'
      ], 'ul', true));

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
  getComponentsData: function(mod, incrementKey) {
    return elements.ticketComponents.map(function(ticketComponent) {
      return _.extend(ticketComponent.imgData, mod, incrementKey);
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
