'use strict';

const MsgQueueClient = require('msgqueue-client');
const Firebase = require('firebase');
const fs = require('fs');
const GoogleScrape = require('./google-img-scrape-cse.js');
const s3 = require('./s3.js');
const fb = require('./firebase.js');

const mqServerConfig = require('../common/config/mqserver.js');
const CSE_secrets = require('../common/secrets/scrape-img.js').CSE;

const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`, { log: true });
const gClient = new GoogleScrape(CSE_secrets.CSE_ID, CSE_secrets.API_KEY);

mq.on('connected', () => { console.log('connected to mq'); });

let lQ = 'srvc_img_scrape_req';
mq.listen(lQ, (ack, reject, payload) => {
  // fire off query via search clients
  Firebase.goOnline();
  getWebImgObjSet(payload.query, payload.num)
  .then(webImgObjSet => {
    let flatSet = flattenArray(webImgObjSet);
    // fs.writeFile('./temp/imgData.json', JSON.stringify(flatSet, null, 4), { flags: 'w' });
    return Promise.all(
      flatSet.map((webImgObj, i) => {
        console.log(`got back webImgObj from ${payload.query}, ${i} of ${payload.num}`);
        // console.log(webImgObj);
        webImgObj.concept = payload.concept;
        webImgObj.query = payload.query;
        return uploadWebImgObjToS3(webImgObj)
            // TODO save img obj to db
          .then(s3ImgObj => {
            console.log('got back s3ImgObj');
            console.log(s3ImgObj);
            if (s3ImgObj) syncToFirebase(s3ImgObj); // TODO reconsider this hotfix to exclude failing urls
          })
          .then(fbImgRef => {
            console.log('synced s3ImgObj to firebase');
          });
      })
    );
  })
  .then(allImgRefs => {
    console.log('synced', allImgRefs.length, 'to Firebase');
    ack();
    Firebase.goOffline();
    let nQ = 'ctrl_img_scrape_res';
    mq.enqueue(nQ, payload) // TODO add payload (firebase ref to obj that contains img ref to S3 img)
    .then(() => {
      console.log(`service: ${lQ} --> ${nQ}`);
    });
  })
});

function getWebImgObjSet (query, num) {
  return gClient.search(query, num);
}

function uploadWebImgObjToS3 (imgObj, bucket) {
  return s3.pipeTransformAndUploadImgObjToS3(imgObj, bucket);
}

function syncToFirebase (imgObj) {
  return fb.pushAndAddUID(imgObj);
}

function flattenArray(arrTwoDim) {
  return [].concat.apply([], arrTwoDim);
}
