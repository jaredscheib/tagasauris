var makeImgTrinary = function (imgData, reqTicket, i) {
  var trinaryContainer = document.createElement('div');
  var imgTrinary = document.createElement('img');
  var divTrinaryRadio = document.createElement('div');
  var radioTrinary1 = document.createElement('input');
  var labelTrinary1 = document.createElement('label');
  var radioTrinary2 = document.createElement('input');
  var labelTrinary2 = document.createElement('label');
  var radioTrinary3 = document.createElement('input');
  var labelTrinary3 = document.createElement('label');

  var iTrinary = 'trinary' + String(i);
  var iTrinary_neg = iTrinary + '_-1';
  var iTrinary_mid = iTrinary + '_+0';
  var iTrinary_pos = iTrinary + '_+1';

  trinaryContainer.className = 'trinary_container';

  imgTrinary.className = 'trinary_img';
  imgTrinary.src = imgData.url;

  divTrinaryRadio.className = 'div_trinary_radio';

  radioTrinary1.setAttribute('type', 'radio');
  radioTrinary1.setAttribute('name', iTrinary);
  radioTrinary1.id = iTrinary_neg;
  radioTrinary1.className = 'trinary_radio';

  labelTrinary1.setAttribute('for', iTrinary_neg);
  labelTrinary1.className = 'trinary_label';
  labelTrinary1.innerText = '-1: No Way';

  radioTrinary2.setAttribute('type', 'radio');
  radioTrinary2.setAttribute('name', iTrinary);
  radioTrinary2.id = iTrinary_mid;
  radioTrinary2.className = 'trinary_radio';

  labelTrinary2.setAttribute('for', iTrinary_mid);
  labelTrinary2.className = 'trinary_label';
  labelTrinary2.innerText = '0: Unclear';

  radioTrinary3.setAttribute('type', 'radio');
  radioTrinary3.setAttribute('name', iTrinary);
  radioTrinary3.id = iTrinary_pos;
  radioTrinary3.className = 'trinary_radio';

  labelTrinary3.setAttribute('for', iTrinary_pos);
  labelTrinary3.className = 'trinary_label';
  labelTrinary3.innerText = '1: Definitely';

  trinaryContainer.appendChild(imgTrinary);
  divTrinaryRadio.appendChild(radioTrinary1);
  divTrinaryRadio.appendChild(labelTrinary1);
  divTrinaryRadio.appendChild(radioTrinary2);
  divTrinaryRadio.appendChild(labelTrinary2);
  divTrinaryRadio.appendChild(radioTrinary3);
  divTrinaryRadio.appendChild(labelTrinary3);
  trinaryContainer.appendChild(divTrinaryRadio);

  trinaryContainer.imgData = imgData;
  trinaryContainer.reqTicket = reqTicket;

  return trinaryContainer;
};