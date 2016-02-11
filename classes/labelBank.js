var makeLabelBank = function (imgNum, isLeft) {
  var element = document.createElement('div');
  element.id = 'labelBank' + imgNum;
  element.className = 'label_bank';
  if (isLeft) {
    element.className += ' bank-lft';
  } else {
    element.className += ' bank-rgt';
  }
  return element;
};