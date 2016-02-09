var makeImgTrinary = function (imgData, reqTicket) {
  var trinaryContainer = document.createElement('div');
  var imgTrinary = document.createElement('img');
  var radioTrinary1 = document.createElement('input');
  var radioTrinary2 = document.createElement('input');
  var radioTrinary3 = document.createElement('input');

  trinaryContainer.className = 'container_trinary';

  imgTrinary.className = 'img_trinary';
  imgTrinary.src = imgData.url;

  radioTrinary1.setAttribute('type', 'radio');
  radioTrinary1.className = 'radio_trinary';
  radioTrinary1.value = 'No Way';
  radioTrinary2.setAttribute('type', 'radio');
  radioTrinary2.className = 'radio_trinary';
  radioTrinary2.value = 'Maybe';
  radioTrinary3.setAttribute('type', 'radio');
  radioTrinary3.className = 'radio_trinary';
  radioTrinary3.value = 'Definitely';

  trinaryContainer.appendChild(imgTrinary);
  trinaryContainer.appendChild(radioTrinary1);
  trinaryContainer.appendChild(radioTrinary2);
  trinaryContainer.appendChild(radioTrinary3);

  trinaryContainer.imgData = imgData;
  trinaryContainer.reqTicket = reqTicket;

  return trinaryContainer;
};