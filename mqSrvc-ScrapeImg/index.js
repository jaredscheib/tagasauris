'use strict';

const MsgQueueClient = require('msgqueue-client');
const GoogleClient = require('./google-image-search-stream.js');

const mqServerConfig = require('../common/config/mqserver.js');
const secrets = require('../common/secrets/scrape-img.js');

const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`, { log: true });
const gClient = new GoogleClient(secrets.CSE_ID, secrets.API_KEY);

mq.on('connected', () => { console.log('connected to mq'); });

mq.listen('image_scrape_req', (ack, reject, payload) => {
    // fire off query via search clients
  getWebImgRefs(query, num)
  .then(results => {
    console.log('results');
    console.log(results);
    let queue = 'image_scrape_res';
    mq.enqueue(queue, results[0]) // TODO add payload (firebase ref to obj that contains img ref to S3 image)
    .then(() => {
      console.log('service: image_scrape_req --> image_scrape_res')
      ack();
    });
  });
  // .then(uploadToS3)
    // require('aws-sdk');
    // require('s3-upload-stream');
    // set up config file for now, env variables later
    // follow example at https://www.npmjs.com/package/s3-upload-stream
  // .then(pushToDb)
  // .then()

    // save successfully scraped image refs to database

    // then enqueue final results to mq
});

function getWebImgRefs (query, num) {
  return gClient.search('porsche macan', 11)
}
