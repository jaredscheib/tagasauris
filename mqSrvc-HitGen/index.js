'use strict';

const express = require('express');
const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');

const mq = MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`);
mq.on('connected', () => { console.log('connected to mq'); });

mq.listen('hit_gen_req', (resolve, reject, payload) => {
  console.log('mq: hit_gen_req');
  // TODO
  // create task in tasks pool
    // create ticket pool
    // register task with AMT
    // then enqueue hit gen res
    let queue = 'hit_gen_res';
    mq.enqueue(enqueue, { dummy: 'dummy' }) // TODO payload
    .then(() => {
      console.log(`enqueue ${queue}`);
    });
});
