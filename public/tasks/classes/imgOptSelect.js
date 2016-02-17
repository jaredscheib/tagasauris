var Operand = function (imgData, index) {
  var self = this;
  this.imgData = imgData;
  this.index = index;

  this.operandContainer = this.opC = document.createElement('div');
  this.opC.id = 'optselect' + String(this.index);
  this.opC.className = 'optselect_container';

  // this.pOptSelect = document.createElement('p');
  // this.pOptSelect.className = 'optselect_p';
  // this.pOptSelect.id = this.opC.id + '_p';
  // this.pOptSelect.innerHTML = this.imgData.query.slice().split('_').join(' ');
  
  this.imgOptSelect = document.createElement('img');
  this.imgOptSelect.className = 'optselect_img';
  this.imgOptSelect.src = this.imgData.url;

  this.divOptSelectRadio = document.createElement('div');
  this.divOptSelectRadio.className = 'div_optselect_radio';

  var options = [
    {
      label: '(Click on the image to select your answer)',
      color: '#ffffff',
      value: null
    },
    {
      label: 'Yes, this image clearly depicts <b>' + info.concept.toUpperCase() + '</b>',
      color: '#99ff99',
      value: 1
    },
    {
      label: 'No, there is no <b>' + info.concept.toUpperCase() + '</b> in this image</b>',
      color: '#ffff99',
      value: -1
    },
    {
      label: 'This is not a clear depiction of <b>' + info.concept.toUpperCase() + '</b>',
      color:  '#ff9999',
      value: 0
    },
    {
      label: 'This image is not a photograph',
      color:  '#cccccc',
      value: -2
    } 
  ];

  // this.addRadioChangeHandler = function (radio) {
  //   radio.addEventListener('change', function (e) {
  //     console.log('this', this);
  //     console.log(e.target);
  //     self.imgData.response = Number(this.value);
  //     self.updateColor()
  //   });
  // };

  this.divOpts = [];
  for (var i = 0; i < options.length; i++) {
    // var key = options[i].value;
    var d = 'divOptSelectRadioLabel'+i;
    var r = 'radioOptSelect'+i;
    var l = 'labelOptSelect'+i;
    var s = 'spanOptSelect'+i;
    var iKey = this.opC.id+i;

    this[d] = document.createElement('div');
    this[r] = document.createElement('input');
    // this[l] = document.createElement('label');
    this[s] = document.createElement('span');
    this[d].style.backgroundColor = options[i].color;

    this[r].setAttribute('type', 'radio');
    this[r].setAttribute('name', this.opC.id);
    this[r].setAttribute('value', i);
    this[r].id = iKey;
    this[r].className = 'optselect_radio';
    this[r].style.visibility = 'hidden';

    // this[l].setAttribute('for', iKey);
    // this[l].className = 'optselect_radio_label';
    // this[l].innerText = 'Yes, this image clearly depicts <b>' + info.concept.toUpperCase() + '</b>';
    // this[l].textContent = 'Yes, this image clearly depicts <b>' + info.concept.toUpperCase() + '</b>';
    this[s].innerHTML = options[i].label;
    this[d].appendChild(this[s]);
    this[d].appendChild(this[r]);

    if (i === 0) {
      this.divOptSelectRadio.appendChild(this[d]);
    } else {
      this.divOpts.push(this[d]); // don't want to keep the instructions in rotation
    }
    // this.addRadioChangeHandler(this[r]);
  }
  // this.opC.appendChild(this.pOptSelect);
  this.opC.appendChild(this.imgOptSelect);
  this.opC.appendChild(this.divOptSelectRadio);

  this.imgOptSelect.addEventListener('click', function(e) {
    var isInitial = self.imgData.response === undefined;
    if (isInitial) self.imgData.response = 4;
    if (--self.imgData.response < 0) self.imgData.response = 3;
    self['radioOptSelect'+String(self.imgData.response)].checked = true;
    self.rotateCaption(isInitial);
  });

  this.rotateCaption = function(letGo) {
    var add = this.divOpts.shift();
    var target = this.divOptSelectRadio;
    var current = target.firstChild;
    if (!letGo) this.divOpts.push(current);
    target.removeChild(current);
    target.appendChild(add);
    this.opC.style.backgroundColor = add.style.backgroundColor;
  }
};
