'use strict';

const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');

const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`, (res) => {
  console.log('image scraper mQclient connected');  
});

mq.listen('image_scrape_req', (resolve, reject, payload) => {
  console.log('mq: image_scrape_req');
  // TODO
  // fire off query via search clients
    // save images to S3
    // save successfully scraped image refs to database
    // then enqueue final results to mq
    let queue = 'image_scrape_res';
    mq.enqueue(queue, scrape_results); // firebase ref to obj that contains img refs to S3 images
    console.log(`enqueued ${queue}`);
});
