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
  .then(normalizePromiseSet)
  .then(saveLocalCopy)
  .then(webImgObjSet => {
    ack();
    let nQ = 'ctrl_img_scrape_res';
    my.enqueue(nQ, webImgObjSet)
    .then(console.log(`service: ${lQ_scrape} --> ${nQ}`));
  });
});

mq.listen(lQ_upload_sync, (ack, reject, payload) => {
  s3UploadFirebaseSyncImgSet(payload)
  .then(finalFbRefSet => { // TODO why are these all undefined?
    let nQ = 'ctrl_upload_sync_res';
    mq.enqueue(nQ, finalFbRefSet)
    .then(console.log(`service: ${lQ_upload_sync} --> ${nQ}`));
  })
});

function getWebImgObjSet (query, num, mod) {
  return gClient.search(query, num, mod);
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

function loadFiles (dirPath, concept) {
  return fs.readdirAsync(dirPath)
  .then(allFiles => {
    let matchedFiles = [];
    allFiles.forEach(file => {
      if (concept) {
        let search = `-C${concept.split(' ').join('_')}-`;
        if (file.indexOf(search) !== -1) matchedFiles.push(dirPath + file);
      } else {
        matchedFiles.push(dirPath + file);
      }
    });
    return Promise.map(matchedFiles, loadFile);
  });
}

function loadFile (filePath) {
  return fs.readFileAsync(`${filePath}`, 'utf8')
  .then(JSON.parse);
}

function s3UploadFirebaseSyncImgSet (webImgObjSet) {
  console.log(`upload and sync img set of size ${webImgObjSet.length}..`);
  return Promise.map(webImgObjSet, imgObjSet => {
    return s3UploadImgObj(imgObjSet)
    .then(s3ImgObj => {
      if (s3ImgObj === null) {
        console.log('did not upload unresolved img to s3');
        return null;
      } else {
        console.log('successful upload of imgObj to s3');
        return firebaseSync(s3ImgObj);
      }
    })
    .then(fbImgRef => {
      if (fbImgRef === null) console.log('null not synced to firebase');
      else console.log('synced s3ImgObj to firebase');
      console.log('fbImgRef', fbImgRef === null, typeof fbImgRef);
      return fbImgRef;
    })
    .catch(err => {
      console.log(err);
      return Promise.resolve;
    });
  })
  .then(allFbImgRefs => {
    let finalFbRefs = normalizeDataSet(allFbImgRefs);
    console.log(`uploaded and synced ${finalFbRefs.length} valid images out of ${webImgObjSet.length} search results`);
    return finalFbRefs;
  });
}

function s3UploadImgObj (imgObj) {
  return s3.pipeTransformAndUploadImgObjToS3(imgObj);
}

function firebaseSync (imgObj) {
  return fb.pushAndAddUID(imgObj);
}

function normalizePromiseSet (arr) {
  console.log('normalizing promise set..');
  return arr.reduce((a, b, i, o) => {
    // console.log(`normalizing at obj ${i} of ${o.length}`);
    return (typeof b === 'function' || b === null || b === undefined) ? a : a.concat(b);
  }, []);
}

function normalizeDataSet (arr) {
  console.log('normalizing data set..');
  return arr.filter(obj => {
    // console.log(`normalizing at obj ${i} of ${o.length}`);
    let isValid = !(obj === null || obj === undefined);
    console.log('filter obj?', typeof obj, isValid);
    return isValid;
  });
}

function fs_prep (str) {
  return str.slice().split(' ').join('_').toLowerCase()
}

module.exports = {
  s3UploadFirebaseSyncImgSet: s3UploadFirebaseSyncImgSet,
  loadFiles: loadFiles
};
