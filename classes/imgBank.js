// wrap in IIFE, makeImg and makeLabelBank shouldn't be exposed as only ImgBank will use it

// assign new labelbank as property on imgBank
var ImgBank = function () {
  var imgBank = document.createElement('div');
  imgBank.className = 'img_bank';

  var imgNum = String(j);
  if (imgNum.length < 2) imgNum = '0' + imgNum;
  imgNum += '00'; // until non-integer frames added
  // console.log('imgNum', imgNum);
  var img = this.makeImg();
  var labelBank = this.makeLabelBank();
  
  // add class of label bank depending on which side image is on
  if (j % 2 === 0) {
    labelBank.className += ' bank-lft';
    imgBank.appendChild(labelBank);
    imgBank.appendChild(newImg);
  } else {
    labelBank.className += ' bank-rgt';
    imgBank.appendChild(newImg);
    imgBank.appendChild(labelBank);
  }

  // add current image bank to current image row
  imgRow.appendChild(imgBank);

  // when image actually loads, make annotatable and set style of label bank to image height
  $j(newImg).load(function () { // on img load event so annotorious loads properly
    var imgNum = this.id.slice(3);

    var labelBank = document.getElementById('labelBank' + imgNum);
    labelBank.style.height = String(this.height) + 'px';

    updateLabelBank(imgNum);
    anno.makeAnnotatable(this);
    if (annotations[imgNum]) {
      // console.log('annotations[imgNum]', annotations[imgNum]);
      _.each(annotations[imgNum], function (tempAnno) {
        // delete tempAnno.context;
        // tempAnno.src = tempAnno.src.slice(tempAnno.src.indexOf('assets/'));
        // tempAnno.editable = false; // make annotation read-only
        anno.addAnnotation(tempAnno);
      });
    }
  // TODO: remove this hacky solution while images not being served up with array of filenames
  }).error(function () {
    console.log('this', this);
    $j(this).remove();
  }.bind(imgBank));
};

var makeImg = function (imgNum, assetId) {
  var elmImg = document.createElement('img');
  elmImg.id = 'img' + imgNum;
  elmImg.className = 'anno_img';
  elmImg.src = 'assets/img/' + assetId + '-' + imgNum + '.jpg';
  return elmImg;
};

var makeLabelBank = function(imgNum, isLeft) {
  var elmLabelBank = document.createElement('div');
  elmLabelBank.id = 'labelBank' + imgNum;
  elmLabelBank.className = 'label_bank';
  if (isLeft) {
    elmLabelBank.className += ' bank-lft';
  } else {
    elmLabelBank.className += ' bank-rgt';
  }
  return elmLabelBank;
};