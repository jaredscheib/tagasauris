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
  this.radioOptSelect0 = document.createElement('input');
  this.labelOptSelect0 = document.createElement('label');
  this.divOptSelectRadioLabel0 = document.createElement('div');
  this['radioOptSelect-1'] = document.createElement('input');
  this['labelOptSelect-1'] = document.createElement('label');
  this['divOptSelectRadioLabel-1'] = document.createElement('div');
  this['radioOptSelect-2'] = document.createElement('input');
  this['labelOptSelect-2'] = document.createElement('label');
  this['divOptSelectRadioLabel-2'] = document.createElement('div');

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
  this.radioOptSelect1.setAttribute('type', 'radio');
  this.radioOptSelect1.setAttribute('name', iOptSelect);
  this.radioOptSelect1.setAttribute('value', 1);
  this.radioOptSelect1.id = iOptSelect_pos;
  this.radioOptSelect1.className = 'optselect_radio';

  this.labelOptSelect1.setAttribute('for', iOptSelect_pos);
  this.labelOptSelect1.className = 'optselect_radio_label';
  this.labelOptSelect1.innerText = '(1) Yes, this is clearly a ' + this.imgData.concept;
  this.labelOptSelect1.textContent = '(1) Yes, this is clearly a ' + this.imgData.concept;

  // maybe
  this.radioOptSelect0.setAttribute('type', 'radio');
  this.radioOptSelect0.setAttribute('name', iOptSelect);
  this.radioOptSelect0.setAttribute('value', 0);
  this.radioOptSelect0.id = iOptSelect_mid;
  this.radioOptSelect0.className = 'optselect_radio';

  this.labelOptSelect0.setAttribute('for', iOptSelect_mid);
  this.labelOptSelect0.className = 'optselect_radio_label';
  this.labelOptSelect0.innerText = '(2) It is not a clear image of a ' + this.imgData.concept;
  this.labelOptSelect0.textContent = '(2) It is not a clear image of a ' + this.imgData.concept;

  // no
  this['radioOptSelect-1'].setAttribute('type', 'radio');
  this['radioOptSelect-1'].setAttribute('name', iOptSelect);
  this['radioOptSelect-1'].setAttribute('value', -1);
  this['radioOptSelect-1'].id = iOptSelect_neg;
  this['radioOptSelect-1'].className = 'optselect_radio';

  this['labelOptSelect-1'].setAttribute('for', iOptSelect_neg);
  this['labelOptSelect-1'].className = 'optselect_radio_label';
  this['labelOptSelect-1'].innerText = '(3) There is no ' + this.imgData.concept + ' in this image';
  this['labelOptSelect-1'].textContent = '(3) There is no ' + this.imgData.concept + ' in this image';

  // not a photo
  this['radioOptSelect-2'].setAttribute('type', 'radio');
  this['radioOptSelect-2'].setAttribute('name', iOptSelect);
  this['radioOptSelect-2'].setAttribute('value', -2);
  this['radioOptSelect-2'].id = iOptSelect_not;
  this['radioOptSelect-2'].className = 'optselect_radio';

  this['labelOptSelect-2'].setAttribute('for', iOptSelect_not);
  this['labelOptSelect-2'].className = 'optselect_radio_label';
  this['labelOptSelect-2'].innerText = '(0) This is not a real photo';
  this['labelOptSelect-2'].textContent = '(0) This is not a real photo';

  // this.operandContainer.appendChild(this.pOptSelect);
  this.operandContainer.appendChild(this.imgOptSelect);
  this['divOptSelectRadioLabel-1'].appendChild(this['radioOptSelect-1']);
  this['divOptSelectRadioLabel-1'].appendChild(this['labelOptSelect-1']);
  this.divOptSelectRadioLabel0.appendChild(this.radioOptSelect0);
  this.divOptSelectRadioLabel0.appendChild(this.labelOptSelect0);
  this.divOptSelectRadioLabel1.appendChild(this.radioOptSelect1);
  this.divOptSelectRadioLabel1.appendChild(this.labelOptSelect1);
  this['divOptSelectRadioLabel-2'].appendChild(this['radioOptSelect-2']);
  this['divOptSelectRadioLabel-2'].appendChild(this['labelOptSelect-2']);
  this.divOptSelectRadio.appendChild(this.divOptSelectRadioLabel1);
  this.divOptSelectRadio.appendChild(this.divOptSelectRadioLabel0);
  this.divOptSelectRadio.appendChild(this['divOptSelectRadioLabel-1']);
  this.divOptSelectRadio.appendChild(this['divOptSelectRadioLabel-2']);
  this.operandContainer.appendChild(this.divOptSelectRadio);

  this.addRadioChangeHandler = function (radio) {
    radio.addEventListener('change', function (e) {
      console.log('this', this);
      console.log(e.target);
      self.imgData.response = Number(this.value);
      self.updateColor()
    });
  };

  this.addRadioChangeHandler(this['radioOptSelect-1']);
  this.addRadioChangeHandler(this.radioOptSelect0);
  this.addRadioChangeHandler(this.radioOptSelect1);
  this.addRadioChangeHandler(this['radioOptSelect-2']);

  this.imgOptSelect.addEventListener('click', function(e) {
    if (self.imgData.response === undefined) self.imgData.response = 2;
    if (--self.imgData.response < -2) self.imgData.response = 1;
    self['radioOptSelect'+String(self.imgData.response)].checked = true;
    self.updateColor();
  });

  this.updateColor = function() {
    console.log('update to color', this.imgData.response+2, 'of', this);
    this.operandContainer.style.backgroundColor = colorOptions[this.imgData.response+2];
  }
};

var colorOptions = ['#cccccc', '#ff9999', '#ffff99', '#99ff99'];
