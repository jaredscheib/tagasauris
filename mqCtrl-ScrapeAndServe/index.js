'use strict';

const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');

const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`, { log: true });

mq.on('connected', () => { console.log('connected to mq'); });

mq.listen('image_scrape_res', (ack, reject, payload) => {
  mq.enqueue('ticket_gen_req', payload) // TODO determine which task this can serve
  .then(() => {
    console.log('controller: image_scrape_res --> ticket_get_req')
    ack();
  });
});
