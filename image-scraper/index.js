'use strict';

const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');

const mQ = new MsgQueueClient(mqServerConfig.url, (res) => {
  console.log('image scraper mQclient connected');  
});

mQ.listen('image_scrape_req', function(resolve, reject, payload) {
  console.log('mQ: image_scrape_req');
  // TODO
  // fire off query via search clients
    // save images to S3
    // save successfully scraped image refs to database
    // then enqueue final results to mq
    let queue = 'image_scrape_res';
    mQ.enqueue(queue, scrape_results);
    console.log(`enqueued ${queue}`);
});
