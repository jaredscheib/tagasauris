'use strict';

const express = require('express');
const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');

const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`, { log: true });

mq.on('connected', () => { console.log('connected to mq'); });

mq.listen('ticket_gen_req', (ack, reject, payload) => {
  // TODO
  // create task in tasks pool
    // create ticket pool
    // register task with AMT
    // then enqueue ticket gen res
    let queue = 'ticket_gen_res';
    mq.enqueue(queue, { dummy: 'dummy' }) // TODO payload
    .then(() => {
      mq.log = false;
      console.log('service: ticket_gen_req --> ticket_get_res')
      ack();
    });
});
