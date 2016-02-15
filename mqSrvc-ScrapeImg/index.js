'use strict';

const MsgQueueClient = require('msgqueue-client');
const GoogleScrape = require('./google-img-scrape-cse.js');
const s3 = require('./s3.js');
const fb = require('./firebase.js');

const mqServerConfig = require('../common/config/mqserver.js');
const CSE_secrets = require('../common/secrets/scrape-img.js').CSE;

const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`, { log: true });
const gClient = new GoogleScrape(CSE_secrets.CSE_ID, CSE_secrets.API_KEY);

mq.on('connected', () => { console.log('connected to mq'); });

mq.listen('srvc_img_scrape_req', (ack, reject, payload) => {
    // fire off query via search clients
  getWebImgObjSet(payload.query, payload.num)
  .then(webImgObjSet => {
    return Promise.all(
      flattenArray(webImgObjSet).map(webImgObj => {
        console.log(`got back webImgObjSet from ${payload.query}, ${webImgObj.length} of ${payload.num}`);
        // console.log(webImgObj);
        return uploadWebImgObjToS3(webImgObj)
            // TODO save img obj to db
          .then(s3ImgObj => {
            console.log('got back s3ImgObj');
            ack();
            syncToFirebase(s3ImgObj);
          })
          .then(fbImgRef => {
            console.log('got back fbImgRef');
            console.log(fbImgRef);
          });
      })
    );
  })
  .then(allImgRefs => {
    // TODO enqueue img refs to db
    let queue = 'ctrl_img_scrape_res';
    mq.enqueue(queue, imgObjRefs) // TODO add payload (firebase ref to obj that contains img ref to S3 img)
    .then(() => {
      console.log('service: srvc_img_scrape_req --> ctrl_img_scrape_res')
      ack();
    });
  })
});

function getWebImgObjSet (query, num) {
  return gClient.search(query, num);
}

function uploadWebImgObjToS3 (imgObj) {
  return s3.pipeTransformAndUploadImgObjToS3(imgObj);
}

function syncToFirebase (imgObj) {
  return fb.pushAndAddUID(imgObj);
}

function flattenArray(arrTwoDim) {
  return [].concat.apply([], arrTwoDim);
}
