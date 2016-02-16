'use strict';

const express = require('express');
const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');
const config = require('./config.js');

const app = express();
const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`, { log: true });

mq.on('connected', () => { console.log('connected to mq'); });

app.set('port', config.port);

// curl 'http://localhost:65000/images?task=img_verification&num=200&concept=porsche&query=porsche'
// curl 'http://localhost:65000/images?task=img_verification&num=200&concept=porsche&query=porsche+macan'
app.get('/images', (req, res) => { // TODO shouldn't be GET since create resources
  console.log('GET on /images');
  if (req.query.num < 1 || req.query.num > 1000) res.status(400).send('Must search for between 1 and 1000 images.');
  if (!req.query.concept || !req.query.query) res.status(400).send('Must include concept and query in search.');
  req.query.concept = req.query.concept.split(' ').join('_').toLowerCase();
  req.query.query = req.query.query.split(' ').join('_').toLowerCase();

  let nQ = 'ctrl_sns_img_scrape_req';
  mq.enqueue(nQ, req.query)
  .then(() => {
    res.status(200).send('Created images successfully');
  });
});

app.listen(app.get('port'), () => {
  console.log('api-server is listening on port', app.get('port'));
});

module.exports = app;
