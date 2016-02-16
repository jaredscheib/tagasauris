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
  let syncedToFb = 0;
  // fire off query via search clients
  Firebase.goOnline();
  getWebImgObjSet(payload.query, payload.num)
  .then(webImgObjSet => {
    let flatSet = flattenArray(webImgObjSet);
    console.log(`got ${flatSet.length} images in webImgObjSet`);
    // fs.writeFile('./temp/imgData.json', JSON.stringify(flatSet, null, 4), { flags: 'w' });
    return Promise.all(
      flatSet.map((webImgObj, i) => {
        console.log(`got webImgObj from ${payload.query}, ${i+1} of ${payload.num}`);
        webImgObj.concept = payload.concept.slice().split(' ').join('_').toLowerCase();
        webImgObj.query = payload.query.slice().split(' ').join('_').toLowerCase();
        return uploadWebImgObjToS3(webImgObj)
          .then(s3ImgObj => {
            if (s3ImgObj === null) {
              console.log('null on s3ImgObj');
              return null;
            } else {
              console.log('successful upload of imgObj to s3');
              syncedToFb++;
              return syncToFirebase(s3ImgObj);
            }
          })
          .then(fbImgRef => {
            if (fbImgRef === null) console.log('null not synced to firebase');
            else console.log('synced s3ImgObj to firebase');
            return fbImgRef;
          });
      })
    );
  })
  .then(allImgRefs => {
    // allImgRefs.forEach((imgRef, i) => { console.log(`imgRef ${i} of ${allImgRefs.length}`); });
    console.log(`uploaded and synced ${syncedToFb} valid images out of ${allImgRefs.length} search results`);
    ack();
    Firebase.goOffline();
    let nQ = 'ctrl_img_scrape_res';
    mq.enqueue(nQ, allImgRefs.filter(imgRef => { return imgRef !== null; }))
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
