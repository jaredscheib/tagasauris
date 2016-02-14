'use strict';

const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');

const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`);
mq.log = true;

mq.on('connected', () => { console.log('connected to mq'); });

mq.listen('image_scrape_res', (resolve, reject, payload) => {
  mq.enqueue('hit_gen_req', payload);
});
