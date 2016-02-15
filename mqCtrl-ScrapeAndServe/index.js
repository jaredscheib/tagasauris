'use strict';

const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');

const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`, { log: true });

mq.on('connected', () => { console.log('connected to mq'); });

let lQ1 = 'ctrl_sns_img_scrape_req';
mq.listen(lQ1, (ack, reject, payload) => {
  let nQ1 = 'srvc_img_scrape_req';
  mq.enqueue(nQ1, payload) // TODO determine which task this can serve
  .then(() => {
    console.log(`controller: ${lQ1} --> ${nQ1}`);
    ack();
  });
});

let lQ2 = 'ctrl_img_scrape_res';
mq.listen(lQ2, (ack, reject, payload) => {
  let nQ2 = 'srvc_ticket_gen_req';
  mq.enqueue(nQ2, payload) // TODO determine which task this can serve
  .then(() => {
    console.log(`controller: ${lQ2} --> ${nQ2}`);
    ack();
  });
});
