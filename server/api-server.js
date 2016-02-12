'use strict';

const express = require('express');
const db = require('./db.js');

const app = express();

const PORT = process.env.PORT || 3020;

app.get('/tickets', (req, res) => {
  const task = req.query.task;
  const num = req.query.num;
  
  db.getOpenTickets(task, num)
  .then(data => {
    console.log('GOT DATA!');
    console.log(data.length, data);
    res.status(200).send(data);
  })
  .catch(err => {
    console.log('error getting tickets', err);
    res.status(503).send(err);
  });
});

app.listen(PORT, 'localhost', (err) => {
  if (err) { console.log(err); };
  console.log(`Listening at http://localhost:${PORT}`);
});
