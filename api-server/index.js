'use strict';

const express = require('express');
const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');

const app = express();
const mQ = new MsgQueueClient(mqServerConfig.url);

app.get('/test', (req, res) => {
  mQ.enqueue('scrape_req');
});
