'use strict';

const pg = require('pg');
const express = require('express');
const MsgQueueClient = require('msgqueue-client');

const mqServerConfig = require('../common/config/mqserver.js');
const config = require('./config.js');
const secrets = require('./secrets.json');

const app = express();

// postgresql
var client = new pg.Client(secrets.conn_string);
client.connect(err => {
  if (err) return console.error('could not connect to postgres', err);

  client.query(`CREATE TABLE img_ref (
      code        char(5) CONSTRAINT firstkey PRIMARY KEY,
      title       varchar(40) NOT NULL,
      did         integer NOT NULL,
      date_prod   date,
      kind        varchar(10),
      len         interval hour to minute
    );`, (err, result) => {
    if (err) return console.error('error running query', err);
    client.end();
  });

  // message server
  const mq = new MsgQueueClient(`${mqServerConfig.url}:${mqServerConfig.port}`, { log: true });
  mq.on('connected', () => { console.log('connected to mq'); });

  app.set('port', config.port);

  // task library client api
  app.get('/tickets', (req, res) => {
    console.log('GET on /tickets');

  });

  app.post('/results', (req, res) => {
    console.log('POST on /results');

  });

  // scrape and serve microservice api  
  // curl 'http://localhost:65000/images/save?task=img_verification&num=100&concept=porsche&query=porsche'
  // curl 'http://localhost:65000/images/save?task=img_verification&num=100&concept=porsche&query=porsche+macan'
  app.get('/images/save', (req, res) => { // TODO shouldn't be GET since create resources
    console.log('GET on /images/save');
    if (req.query.num < 1 || req.query.num > 100) res.status(400).send('Must search for between 1 and 100 images.');
    if (!req.query.concept || !req.query.query) res.status(400).send('Must include concept and query in search.');

    let nQ = 'ctrl_img_scrape_req';
    mq.enqueue(nQ, req.query)
    .then(() => {
      res.status(200).send('Received image scrape request');
    });
  });

  app.get('/images/sync', (req, res) => {
    console.log('GET on /images/sync');
    let nQ = 'ctrl_upload_sync_res';
    mq.enqueue(nQ, req.query)
    .then(() => {
      res.status(201).send(`Uploaded and synced images in category ${req.query.query}`);
    });
  });

  // start server
  app.listen(app.get('port'), () => {
    console.log('api-server is listening on port', app.get('port'));
  });
});

module.exports = app;
