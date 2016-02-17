/* global _, isTaskComplete */

var Operand = function (imgData, i) {
  var self = this;
  this.imgData = imgData;
  this.i = i;

  this.operandContainer = document.createElement('div');
  // this.pOptSelect = document.createElement('p');
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
  this.radioOptSelect0 = document.createElement('input');
  this.labelOptSelect0 = document.createElement('label');
  this.divOptSelectRadioLabel0 = document.createElement('div');

  var iOptSelect = 'optselect' + String(i);
  var iOptSelect_neg = iOptSelect + '_-1';
  var iOptSelect_mid = iOptSelect + '_+0';
  var iOptSelect_pos = iOptSelect + '_+1';
  var iOptSelect_not = iOptSelect + '_-2';

  this.operandContainer.id = iOptSelect;
  this.operandContainer.className = 'optselect_container';

  // this.pOptSelect.className = 'optselect_p';
  // this.pOptSelect.id = iOptSelect + '_p';
  // this.pOptSelect.innerHTML = this.imgData.query.slice().split('_').join(' ');

  this.imgOptSelect.className = 'optselect_img';
  this.imgOptSelect.src = this.imgData.url;

  this.divOptSelectRadio.className = 'div_OptSelect_radio';

  // yes
  this.radioOptSelect3.setAttribute('type', 'radio');
  this.radioOptSelect3.setAttribute('name', iOptSelect);
  this.radioOptSelect3.setAttribute('value', 3);
  this.radioOptSelect3.id = iOptSelect_pos;
  this.radioOptSelect3.className = 'optselect_radio';

  this.labelOptSelect3.setAttribute('for', iOptSelect_pos);
  this.labelOptSelect3.className = 'optselect_radio_label';
  this.labelOptSelect3.innerText = '(1) Yes, this is clearly a ' + this.imgData.concept;
  this.labelOptSelect3.textContent = '(1) Yes, this is clearly a ' + this.imgData.concept;

  // maybe
  this.radioOptSelect2.setAttribute('type', 'radio');
  this.radioOptSelect2.setAttribute('name', iOptSelect);
  this.radioOptSelect2.setAttribute('value', 2);
  this.radioOptSelect2.id = iOptSelect_mid;
  this.radioOptSelect2.className = 'optselect_radio';

  this.labelOptSelect2.setAttribute('for', iOptSelect_mid);
  this.labelOptSelect2.className = 'optselect_radio_label';
  this.labelOptSelect2.innerText = '(2) It is not a clear image of a ' + this.imgData.concept;
  this.labelOptSelect2.textContent = '(2) It is not a clear image of a ' + this.imgData.concept;

  // no
  this.radioOptSelect1.setAttribute('type', 'radio');
  this.radioOptSelect1.setAttribute('name', iOptSelect);
  this.radioOptSelect1.setAttribute('value', 1);
  this.radioOptSelect1.id = iOptSelect_neg;
  this.radioOptSelect1.className = 'optselect_radio';

  this.labelOptSelect1.setAttribute('for', iOptSelect_neg);
  this.labelOptSelect1.className = 'optselect_radio_label';
  this.labelOptSelect1.innerText = '(3) There is no ' + this.imgData.concept + ' in this image';
  this.labelOptSelect1.textContent = '(3) There is no ' + this.imgData.concept + ' in this image';

  // not a photo
  this.radioOptSelect0.setAttribute('type', 'radio');
  this.radioOptSelect0.setAttribute('name', iOptSelect);
  this.radioOptSelect0.setAttribute('value', 0);
  this.radioOptSelect0.id = iOptSelect_not;
  this.radioOptSelect0.className = 'optselect_radio';

  this.labelOptSelect0.setAttribute('for', iOptSelect_not);
  this.labelOptSelect0.className = 'optselect_radio_label';
  this.labelOptSelect0.innerText = '(0) This is not a real photo';
  this.labelOptSelect0.textContent = '(0) This is not a real photo';

  // this.operandContainer.appendChild(this.pOptSelect);
  this.operandContainer.appendChild(this.imgOptSelect);
  this.divOptSelectRadioLabel1.appendChild(this.radioOptSelect1);
  this.divOptSelectRadioLabel1.appendChild(this.labelOptSelect1);
  this.divOptSelectRadioLabel2.appendChild(this.radioOptSelect2);
  this.divOptSelectRadioLabel2.appendChild(this.labelOptSelect2);
  this.divOptSelectRadioLabel3.appendChild(this.radioOptSelect3);
  this.divOptSelectRadioLabel3.appendChild(this.labelOptSelect3);
  this.divOptSelectRadioLabel0.appendChild(this.radioOptSelect0);
  this.divOptSelectRadioLabel0.appendChild(this.labelOptSelect0);
  this.divOptSelectRadio.appendChild(this.divOptSelectRadioLabel3);
  this.divOptSelectRadio.appendChild(this.divOptSelectRadioLabel2);
  this.divOptSelectRadio.appendChild(this.divOptSelectRadioLabel1);
  this.divOptSelectRadio.appendChild(this.divOptSelectRadioLabel0);
  this.operandContainer.appendChild(this.divOptSelectRadio);

  this.addRadioChangeHandler = function (radio) {
    radio.addEventListener('change', function (e) {
      console.log('this', this);
      console.log(e.target);
      self.result = this.value;
      self.updateColor()
      // console.log(IsTaskComplete());
    });
  };

  this.addRadioChangeHandler(this.radioOptSelect1);
  this.addRadioChangeHandler(this.radioOptSelect2);
  this.addRadioChangeHandler(this.radioOptSelect3);
  this.addRadioChangeHandler(this.radioOptSelect0);

  this.imgOptSelect.addEventListener('click', function(e) {
    if (self.result === undefined) self.result = 4;
    if (--self.result < 0) self.result = 3;
    self['radioOptSelect'+self.result].checked = true;
    self.updateColor();
  });

  this.updateColor = function() {
    this.operandContainer.style.backgroundColor = colorOptions[this.result];
  }
};

var colorOptions = ['#cccccc', '#ff9999', '#ffff99', '#99ff99'];
