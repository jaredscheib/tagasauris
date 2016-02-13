'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const readPath = './www/allImgData.json';

fs.readFileAsync(readPath, 'utf8')
.then((data) => {
  var tallies = [];
  var superTally = 0;
  var allImgData = JSON.parse(data);
  for (var key in allImgData) {
    var tally = 0;
    allImgData[key].forEach((imgData) => {
      tally += imgData.size;
    });
    superTally += tally / 1000000;
    tallies.push([key, tally / 1000000]);
  }
  console.log(tallies);
  console.log('~' + Math.round(superTally) + 'MB total storage required for all images in set');
})
.catch((err) => { throw err; });