/* global _, isTaskComplete */

var ImgOptSelect = function (imgData, i) {
  this.imgData = imgData;

  // console.log('this.imgData', this.imgData);

  this.i = i;

  this.optSelectContainer = document.createElement('div');
  this.pOptSelect = document.createElement('p');
  this.imgOptSelect = document.createElement('img');
  this.divOptSelectRadio = document.createElement('div');
  this.radioOptSelect1 = document.createElement('input');
  this.labelOptSelect1 = document.createElement('label');
  this.divOptSelectRadioLabel1 = document.createElement('div');
  this.radioOptSelect2 = document.createElement('input');
  this.labelOptSelect2 = document.createElement('label');
  this.divOptSelectRadioLabel2 = document.createElement('div');
  this.radioOptSelect3 = document.createElement('input');
  this.labelOptSelect3 = document.createElement('label');
  this.divOptSelectRadioLabel3 = document.createElement('div');
  this.radioOptSelect4 = document.createElement('input');
  this.labelOptSelect4 = document.createElement('label');
  this.divOptSelectRadioLabel4 = document.createElement('div');

  var iOptSelect = 'optselect' + String(i);
  var iOptSelect_neg = iOptSelect + '_-1';
  var iOptSelect_mid = iOptSelect + '_+0';
  var iOptSelect_pos = iOptSelect + '_+1';
  var iOptSelect_not = iOptSelect + '_-2';

  this.optSelectContainer.id = iOptSelect;
  this.optSelectContainer.className = 'optselect_container';

  this.pOptSelect.className = 'optselect_p';
  this.pOptSelect.id = iOptSelect + '_p';
  this.pOptSelect.innerHTML = this.imgData.query.slice().split('_').join(' ');

  this.imgOptSelect.className = 'optselect_img';
  this.imgOptSelect.src = this.imgData.url;

  this.divOptSelectRadio.className = 'div_OptSelect_radio';

  this.radioOptSelect1.setAttribute('type', 'radio');
  this.radioOptSelect1.setAttribute('name', iOptSelect);
  this.radioOptSelect1.setAttribute('value', -1);
  this.radioOptSelect1.id = iOptSelect_neg;
  this.radioOptSelect1.className = 'optselect_radio';

  this.labelOptSelect1.setAttribute('for', iOptSelect_neg);
  this.labelOptSelect1.className = 'optselect_radio_label';
  this.labelOptSelect1.innerText = 'No Way';
  this.labelOptSelect1.textContent = 'No Way';

  this.radioOptSelect2.setAttribute('type', 'radio');
  this.radioOptSelect2.setAttribute('name', iOptSelect);
  this.radioOptSelect2.setAttribute('value', 0);
  this.radioOptSelect2.id = iOptSelect_mid;
  this.radioOptSelect2.className = 'optselect_radio';

  this.labelOptSelect2.setAttribute('for', iOptSelect_mid);
  this.labelOptSelect2.className = 'optselect_radio_label';
  this.labelOptSelect2.innerText = 'Unclear';
  this.labelOptSelect2.textContent = 'Unclear';

  this.radioOptSelect3.setAttribute('type', 'radio');
  this.radioOptSelect3.setAttribute('name', iOptSelect);
  this.radioOptSelect3.setAttribute('value', 1);
  this.radioOptSelect3.id = iOptSelect_pos;
  this.radioOptSelect3.className = 'optselect_radio';

  this.labelOptSelect3.setAttribute('for', iOptSelect_pos);
  this.labelOptSelect3.className = 'optselect_radio_label';
  this.labelOptSelect3.innerText = 'Definitely';
  this.labelOptSelect3.textContent = 'Definitely';

  this.radioOptSelect4.setAttribute('type', 'radio');
  this.radioOptSelect4.setAttribute('name', iOptSelect);
  this.radioOptSelect4.setAttribute('value', 1);
  this.radioOptSelect4.id = iOptSelect_not;
  this.radioOptSelect4.className = 'optselect_radio';

  this.labelOptSelect4.setAttribute('for', iOptSelect_not);
  this.labelOptSelect4.className = 'optselect_radio_label';
  this.labelOptSelect4.innerText = 'Not a photo';
  this.labelOptSelect4.textContent = 'Not a photo';

  this.optSelectContainer.appendChild(this.pOptSelect);
  this.optSelectContainer.appendChild(this.imgOptSelect);
  this.divOptSelectRadioLabel1.appendChild(this.radioOptSelect1);
  this.divOptSelectRadioLabel1.appendChild(this.labelOptSelect1);
  this.divOptSelectRadioLabel2.appendChild(this.radioOptSelect2);
  this.divOptSelectRadioLabel2.appendChild(this.labelOptSelect2);
  this.divOptSelectRadioLabel3.appendChild(this.radioOptSelect3);
  this.divOptSelectRadioLabel3.appendChild(this.labelOptSelect3);
  this.divOptSelectRadioLabel4.appendChild(this.radioOptSelect4);
  this.divOptSelectRadioLabel4.appendChild(this.labelOptSelect4);
  this.divOptSelectRadio.appendChild(this.divOptSelectRadioLabel1);
  this.divOptSelectRadio.appendChild(this.divOptSelectRadioLabel2);
  this.divOptSelectRadio.appendChild(this.divOptSelectRadioLabel3);
  this.divOptSelectRadio.appendChild(this.divOptSelectRadioLabel4);
  this.optSelectContainer.appendChild(this.divOptSelectRadio);

  this.addRadioChangeHandler = function (radio) {
    radio.addEventListener('change', function (event) {
      console.log('this', this);
      console.log(event.target);
      console.log(IsTaskComplete());
    });
  };

  this.addRadioChangeHandler(this.radioOptSelect1);
  this.addRadioChangeHandler(this.radioOptSelect2);
  this.addRadioChangeHandler(this.radioOptSelect3);
  this.addRadioChangeHandler(this.radioOptSelect4);
};