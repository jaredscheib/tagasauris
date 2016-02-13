'use strict';

const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db.js');

const app = express();
const PORT = process.env.PORT || 3020;

app.use(morgan('dev')); // log HTTP requests in pre-defined 'dev' format
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); // only accept flat objects
app.use(methodOverride());
app.use(express.static(__dirname + '/../public')); // serve static HTML files from a dedicated directory and bypasses remaining routes
app.use(cors());

app.get('/tickets', (req, res) => {
  const task = req.query.task;
  const num = req.query.num;
  console.log('tickets request', task, num);
  
  db.getOpenTickets(task, num)
  .then(data => {
    console.log('GOT DATA!');
    console.log(data.length);
    // console.log(data);
    res.status(200).send(data);
  })
  .catch(err => {
    console.log('error getting tickets', err);
    res.status(503).send(err);
  });
});

app.post('/tickets', (req, res) => {
  const tickets = req.body;
  console.log('POST received');
  console.log('req.body');
  console.log(tickets);

  db.closeTickets(tickets)
  .then(response => {
    res.status(201).send(response);
  })
  .catch(err => {
    console.log('error closing tickets', err);
    res.status(503).send(err);
  })
});

app.get('*', (req, res) => {
  console.log('* request');
  res.send(200);
});

app.listen(PORT, 'localhost', (err) => {
  if (err) { console.log(err); };
  console.log(`Listening at http://localhost:${PORT}`);
});
