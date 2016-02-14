'use strict';

const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');

const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`);
mq.log = true;

mq.on('connected', () => { console.log('connected to mq'); });

mq.listen('image_scrape_req', (resolve, reject, payload) => {
  // TODO
  // fire off query via search clients
    // save images to S3
    // save successfully scraped image refs to database
    // then enqueue final results to mq
    let queue = 'image_scrape_res';
    mq.enqueue(queue, { dummy: 'dummy' }); // TODO add payload (firebase ref to obj that contains img ref to S3 image)
});
