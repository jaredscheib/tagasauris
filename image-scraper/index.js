'use strict';

const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');

const mQ = new MsgQueueClient(mqServerConfig.url);

mQ.listen('image_scrape_req', function(resolve, reject, payload) {
  // TODO
  // fire off query via search clients
    // save images to S3
    // save successfully scraped image refs to database
    // then enqueue final results to mq
    let queue = 'image_scrape_res';
    mQ.enqueue(queue, scrape_results);
    console.log(`enqueued ${queue}`);
});
