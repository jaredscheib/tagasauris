'use strict';

const express = require('express');
const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');

const app = express();
const mQ = new MsgQueueClient(mqServerConfig.url);

app.get('/test', (req, res) => {
  mQ.enqueue('image_scrape_req');
  res.status(200).send('test hit');
});

app.listen(app.get('port'), () => {
  console.log('api-server is listening on port', app.get('port'));
});
