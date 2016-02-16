'use strict';

const MsgQueueClient = require('msgqueue-client');
const Firebase = require('firebase');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const GoogleScrape = require('./img-scrape-google-cse.js');
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
  getWebImgObjSet(payload.query, payload.num, { query: payload.query, concept: payload.concept })
  .then(normalizeSet)
  .then(saveLocalCopy)
  .then(webImgObjSet => {
    ack();
    let nQ = 'ctrl_img_scrape_res';
    my.enqueue(nQ, webImgObjSet)
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

function getWebImgObjSet (query, num, mod) {
  return gClient.search(query, num, mod);
}

function normalizeSet (arr) {
  console.log('normalizing..');
  return arr.reduce((a, b) => { return typeof b === 'function' ? a : a.concat(b); }, []);
}

function saveLocalCopy (webImgObjSet) {
  console.log('saving..');
  return new Promise((fulfill, reject) => {
    let pathJSON = './results_redundancy/json/';
    let pathJS = './results_redundancy/js/';
    let concept = fs_prep(webImgObjSet[0].concept);
    let query = fs_prep(webImgObjSet[0].query);
    let filenameJS = `google${webImgObjSet.length}-C${concept}-Q${query}.js`;
    let filenameJSON = `${filenameJS}on`;
    fs.writeFileAsync(`${pathJSON}${filenameJSON}`, JSON.stringify(webImgObjSet, null, 4), { flags: 'w' })
    .then(() => {
      console.log(`saved ${webImgObjSet.length} web image objects to ${pathJSON}${filenameJSON}`);
      return fs.writeFileAsync(`${pathJS}${filenameJS}`, `var ${query} = ${JSON.stringify(webImgObjSet, null, 4)};\n`, { flags: 'w' });
    }).then(() => {
      console.log(`saved ${webImgObjSet.length} web image objects to ${pathJS}${filenameJS}`);
      fulfill(webImgObjSet);
    });
  });
}

function s3UploadFirebaseSyncImgSet (webImgObjSet) {
  return Promise.all(
    webImgObjSet.map(
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
      })));
}

function s3UploadImgObj (imgObj) {
  return s3.pipeTransformAndUploadImgObjToS3(imgObj);
}

function firebaseSync (imgObj) {
  return fb.pushAndAddUID(imgObj);
}

function fs_prep (str) {
  return str.slice().split(' ').join('_').toLowerCase()
}
