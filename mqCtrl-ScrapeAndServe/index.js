'use strict';

const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');

const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`, (res) => {
  console.log('image scraper mQclient connected');  
});

mq.listen('image_scrape_res', (resolve, reject, payload) => {
  console.log('message: image_scrape_res');
  mq.enqueue('hit_gen_req', payload);
});
