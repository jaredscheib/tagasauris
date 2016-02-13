'use strict';

// const path = require('path');
const express = require('express');
const scraper = require('./scraper.js');
const app = express();

const PORT = process.env.PORT || 3020;

// curl 'http://localhost:3020/images/fetch_and_store?concept=car&count=50'
app.get('/images/fetch_and_store', (req, res) => {
  const concept = req.query.concept;
  const count = req.query.count;
  const responseCode = scraper.fetchAndStore(concept, count);
  // todo send images themselves to S3 and add to imgRefs
  res.sendStatus(responseCode);
});

// curl 'http://localhost:3020/tickets/create_pool?task=task_img_verification'
app.get('/tickets/create_pool', (req, res) => {
  const task = req.query.task;
  console.log('task', task);
  scraper.createTicketsPool(task)
  .then((response) => { res.sendStatus(response); });
});

app.listen(PORT, 'localhost', (err) => {
  if (err) { console.log(err); }
  console.log(`Listening at http://localhost:${PORT}`);
});
