'use strict';

const express = require('express');
const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');
const config = require('./config.js');

const app = express();
const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`, { log: true });

mq.on('connected', () => { console.log('connected to mq'); });

app.set('port', config.port);

app.get('/images', (req, res) => {
  console.log('GET on /images');
  mq.enqueue('image_scrape_req', req.body);
  res.status(200).send('images');
});

app.listen(app.get('port'), () => {
  console.log('api-server is listening on port', app.get('port'));
});

module.exports = app;
