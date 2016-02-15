'use strict';

const Promise = require('bluebird');
// const _ = require('underscore');
// const fs = Promise.promisifyAll(require('fs'));
const Scraper = require('images-scraper');
const google = new Scraper.Google();
const bing = new Scraper.Bing();
// const yahoo = new Scraper.Yahoo();
// const picsearch = new Scraper.Picsearch();

// photo only
// google: &tbs=itp:photo
// bing: &qft=+filterui:photo-photo

function scrapeGoogle(queryString, maxResultsNum) {
  return google.list({
    keyword: queryString,
    num: maxResultsNum,
    detail: true,
    nightmare: {
      show: false
    }
  });
  // // you can also watch on events
  // google.on('result', function (item) {
  //   console.log('out', item);
  // });
}

function normalizeBingToGoogle(imgObjSet) {
  return imgObjSet.map(item => {
    let imgObj = item;
    imgObj.thumbnail_url = imgObj.thumb;
    delete imgObj.thumb;
    imgObj.size = `${imgObj.size.slice(0, -2)}000`;
    imgObj.type = `image/${imgObj.format}`;
    return imgObj;
  });
}

function scrapeBing(queryString, maxResultsNum) {
  return new Promise((resolve, reject) => {
    bing.list({
      keyword: queryString,
      num: maxResultsNum,
      detail: true
    })
    .then(res => {
      resolve(normalizeBingToGoogle(res));
      // writeFile(`./results/${queryString.replace(' ', '_')}.js`, normalRes);
      // writeFile(`./results/${queryString.replace(' ', '_')}.json`, normalRes);
    })
    .catch(err => {
      reject(err);
    });
  });
}

module.exports = {
  scrapeGoogle: scrapeGoogle,
  scrapeBing: scrapeBing,
};
