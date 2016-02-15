'use strict';

const MsgQueueClient = require('msgqueue-client');
const GoogleScrape = require('./google-img-scrape-cse.js');

const mqServerConfig = require('../common/config/mqserver.js');
const secrets = require('../common/secrets/scrape-img.js');

const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`, { log: true });
const gClient = new GoogleScrape(secrets.CSE_ID, secrets.API_KEY);

mq.on('connected', () => { console.log('connected to mq'); });

mq.listen('srvc_img_scrape_req', (ack, reject, payload) => {
    // fire off query via search clients
  getWebImgRefs(payload.query, payload.num)
  .then(imgRefsWeb => {
    imgRefsWeb.forEach(ref => {
      uploadToS3(ref)
    })
  })
  // .then(uploadToS3)
    // require('aws-sdk');
    // require('s3-upload-stream');
    // set up config file for now, env variables later
    // follow example at https://www.npmjs.com/package/s3-upload-stream
  // .then(pushToDb)
  // .then()

    // save successfully scraped img refs to database

    // then enqueue final results to mq
  .then(imgRefsS3 => {
    let queue = 'ctrl_img_scrape_res';
    mq.enqueue(queue, imgRefsS3) // TODO add payload (firebase ref to obj that contains img ref to S3 img)
    .then(() => {
      console.log('service: srvc_img_scrape_req --> ctrl_img_scrape_res')
      ack();
    });
  });
});

function getWebImgRefs (query, num) {
  return gClient.search(query, num);
}

function uploadToS3 (ref) {

}
