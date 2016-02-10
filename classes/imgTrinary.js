var ImgTrinary = function (imgData, reqTicket, i) {
  this.trinaryContainer = document.createElement('div');
  this.pTrinary = document.createElement('p');
  this.imgTrinary = document.createElement('img');
  this.divTrinaryRadio = document.createElement('div');
  this.radioTrinary1 = document.createElement('input');
  this.labelTrinary1 = document.createElement('label');
  this.radioTrinary2 = document.createElement('input');
  this.labelTrinary2 = document.createElement('label');
  this.radioTrinary3 = document.createElement('input');
  this.labelTrinary3 = document.createElement('label');

  var iTrinary = 'trinary' + String(i);
  var iTrinary_neg = iTrinary + '_-1';
  var iTrinary_mid = iTrinary + '_+0';
  var iTrinary_pos = iTrinary + '_+1';

  this.trinaryContainer.id = iTrinary;
  this.trinaryContainer.className = 'trinary_container';

  this.pTrinary.className = 'trinary_p';
  this.pTrinary.id = iTrinary + '_p';
  this.pTrinary.innerHTML = imgData.query.split('_').join(' ');

  this.imgTrinary.className = 'trinary_img';
  this.imgTrinary.src = imgData.url;

  this.divTrinaryRadio.className = 'div_trinary_radio';

  this.radioTrinary1.setAttribute('type', 'radio');
  this.radioTrinary1.setAttribute('name', iTrinary);
  this.radioTrinary1.setAttribute('value', -1);
  this.radioTrinary1.id = iTrinary_neg;
  this.radioTrinary1.className = 'trinary_radio';

  this.labelTrinary1.setAttribute('for', iTrinary_neg);
  this.labelTrinary1.className = 'trinary_label';
  this.labelTrinary1.innerText = 'No Way';

  this.radioTrinary2.setAttribute('type', 'radio');
  this.radioTrinary2.setAttribute('name', iTrinary);
  this.radioTrinary2.setAttribute('value', 0);
  this.radioTrinary2.id = iTrinary_mid;
  this.radioTrinary2.className = 'trinary_radio';

  this.labelTrinary2.setAttribute('for', iTrinary_mid);
  this.labelTrinary2.className = 'trinary_label';
  this.labelTrinary2.innerText = 'Unclear';

  this.radioTrinary3.setAttribute('type', 'radio');
  this.radioTrinary3.setAttribute('name', iTrinary);
  this.radioTrinary3.setAttribute('value', 1);
  this.radioTrinary3.id = iTrinary_pos;
  this.radioTrinary3.className = 'trinary_radio';

  this.labelTrinary3.setAttribute('for', iTrinary_pos);
  this.labelTrinary3.className = 'trinary_label';
  this.labelTrinary3.innerText = 'Definitely';

  this.trinaryContainer.appendChild(this.pTrinary);
  this.trinaryContainer.appendChild(this.imgTrinary);
  this.divTrinaryRadio.appendChild(this.radioTrinary1);
  this.divTrinaryRadio.appendChild(this.labelTrinary1);
  this.divTrinaryRadio.appendChild(this.radioTrinary2);
  this.divTrinaryRadio.appendChild(this.labelTrinary2);
  this.divTrinaryRadio.appendChild(this.radioTrinary3);
  this.divTrinaryRadio.appendChild(this.labelTrinary3);
  this.trinaryContainer.appendChild(this.divTrinaryRadio);

  this.imgData = imgData;
  this.reqTicket = reqTicket;
  this.resTicket = {};

  this.addRadioChangeHandler = function (radio) {
    radio.addEventListener('change', function (event) {
      console.log(event);
      console.log(radio.value);
    });
  };

  this.addRadioChangeHandler(this.radioTrinary1);
  this.addRadioChangeHandler(this.radioTrinary2);
  this.addRadioChangeHandler(this.radioTrinary3);
};