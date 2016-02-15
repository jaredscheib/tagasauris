'use strict';

const express = require('express');
const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');

const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`, { log: true });

mq.on('connected', () => { console.log('connected to mq'); });

let lQ = 'srvc_ticket_gen_req';
mq.listen(lQ, (ack, reject, payload) => {
  // TODO
  // create task in tasks pool
    // create ticket pool
    // register task with AMT
    // then enqueue ticket gen res
    let nQ = 'srvc_ticket_gen_res';
    mq.enqueue(nQ, payload) // TODO payload
    .then(() => {
      console.log(`service: ${lQ} --> ${nQ}`);
      ack();
    });
});
