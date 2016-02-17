var makeInstructionsList = function (arrInstructions, type) {
  type = type || 'ol';
  var instructionsList = document.createElement(type);
  instructionsList.id = 'instructions_list';

  arrInstructions.forEach(function (instruction) {
    var instructionItem = document.createElement('li');
    instructionItem.className = 'instruction_item';
    instructionItem.innerHTML = instruction;
    instructionsList.appendChild(instructionItem);
  });

  return instructionsList;
};