'use strict'

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const readPath = './results/';
const writePath = './www/allImgData.js';

var concatImgDataAsync = (dirPath) => {
  let allImgFiles = [];
  let allImgData = {};

  return Promise.all(fs.readdirAsync(readPath)
    .then((data) => {
      return data
      .filter((file) => { return file.indexOf('all_data') !== -1; })
      .map((file) => {
        allImgFiles.push(file);
        return fs.readFileAsync(`./results/${file}`, 'utf8');
      });
    }))
    .then((imgSets) => {
      imgSets.forEach((set, i) => {
        let key = allImgFiles[i].split('-')[0];
        allImgData[key] = JSON.parse(set);
      });
      return fs.writeFileAsync(writePath, `var allImgData = ${JSON.stringify(allImgData, null, 4)};`, { flags: 'w' })
    })
    .catch((err) => { throw err; })  
};

concatImgDataAsync(readPath)
.then(() => {
  console.log('success');
})
.catch((err) => {
  console.log('error', err);
  throw err;
});
