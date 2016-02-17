var makeInstructionsList = function (arrInstructions, type, leading) {
  type = type || 'ol';
  leading = leading || false;

  var instructionsDiv = document.createElement('div');
  var instructionsList = document.createElement(type);
  instructionsList.id = 'instructions_list';

  if (leading) {
    var subtitle = document.createElement('span');
    subtitle.id = 'subtitle_span';
    subtitle.innerHTML = '<b>' + arrInstructions.shift() + '</b>';
    instructionsDiv.appendChild(subtitle);
  }

  arrInstructions.forEach(function (instruction) {
    var instructionItem = document.createElement('li');
    instructionItem.className = 'instruction_item';
    instructionItem.innerHTML = instruction;
    instructionsList.appendChild(instructionItem);
  });

  instructionsDiv.appendChild(instructionsList);

  return instructionsDiv;
};