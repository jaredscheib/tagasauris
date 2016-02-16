'use strict';

const MsgQueueClient = require('msgqueue-client');
const Firebase = require('firebase');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const GoogleScrape = require('./google-img-scrape-cse.js');
const s3 = require('./s3.js');
const fb = require('./firebase.js');

const mqServerConfig = require('../common/config/mqserver.js');
const CSE_secrets = require('../common/secrets/scrape-img.js').CSE;

const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`, { log: true });
const gClient = new GoogleScrape(CSE_secrets.CSE_ID, CSE_secrets.API_KEY);

mq.on('connected', () => { console.log('connected to mq'); });

let lQ_scrape = 'srvc_img_scrape_req';
let lQ_upload_sync = 'srvc_upload_sync_req';

mq.listen(lQ_scrape, (ack, reject, payload) => {
  getWebImgObjSet(payload.query, payload.num)
  .then(finalizeSetAndSaveLocal)
  .then(flatFinalSet => {
    ack();
    let nQ = 'ctrl_img_scrape_res';
    my.enqueue(nQ, flatFinalSet)
    .then(console.log(`service: ${lQ_scrape} --> ${nQ}`));
  });
});

mq.listen(lQ_upload_sync, (ack, reject, payload) => {
  Firebase.goOnline();
  s3UploadFirebaseSyncImgSet(payload)
  .then(allImgRefs => {
    // allImgRefs.forEach((imgRef, i) => { console.log(`imgRef ${i} of ${allImgRefs.length}`); });
    Firebase.goOffline();
    let nQ = 'ctrl_upload_sync_res';
    let cleanPayload = allImgRefs.filter(imgRef => { return imgRef !== null; });
    console.log(`uploaded and synced ${cleanPayload.length} valid images out of ${allImgRefs.length} search results`);
    mq.enqueue(nQ, cleanPayload)
    .then(console.log(`service: ${lQ_upload_sync} --> ${nQ}`));
  })
});

function getWebImgObjSet (query, num) {
  return gClient.search(query, num);
}

function finalizeSetAndSaveLocal (webImgObjSet) {
  let pConcept = payload.concept.slice().split(' ').join('_').toLowerCase();
  let pQuery = payload.query.slice().split(' ').join('_').toLowerCase();
  let flatFinalSet = flattenArray(webImgObjSet)
    .forEach((webImgObj, i) => {
      console.log(`got webImgObj from ${payload.query}, ${i+1} of ${payload.num}`);
      webImgObj.concept = pConcept;
      webImgObj.query = pQuery;
    });
  console.log(`got ${flatFinalSet.length} images in webImgObjSet`);
  return new Promise((fulfill, reject) => {
    fs.writeFileAsync(`./results_redundancy/google1000-C${pConcept}-Q${pQuery}.json`, JSON.stringify(flatFinalSet, null, 4), { flags: 'w' })
    .then(() => {
      fulfill(flatFinalSet);
    });      
  });
}

function s3UploadFirebaseSyncImgSet (imgObjSet) {
  return Promise.all(
    flatFinalSet.map(
      s3UploadImgObj
      .then(s3ImgObj => {
        if (s3ImgObj === null) {
          console.log('null on s3ImgObj');
          return null;
        } else {
          console.log('successful upload of imgObj to s3');
          return firebaseSync(s3ImgObj);
        }
      })
      .then(fbImgRef => {
        if (fbImgRef === null) console.log('null not synced to firebase');
        else console.log('synced s3ImgObj to firebase');
        return fbImgRef;
      })
    )
  );
}

function s3UploadImgObj (imgObj) {
  return s3.pipeTransformAndUploadImgObjToS3(imgObj);
}

function firebaseSync (imgObj) {
  return fb.pushAndAddUID(imgObj);
}

function flattenArray(arrTwoDim) {
  return [].concat.apply([], arrTwoDim);
}
