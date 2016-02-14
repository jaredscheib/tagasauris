'use strict';

const express = require('express');
const MsgQueueServer = require('msgqueue-server');

const mqServerConfig = require('../common/config/mqserver.js');

const app = express();
const msgQueue = new MsgQueueServer(app);

app.set('port', mqServerConfig.port);

app.listen(app.get('port'), () => {
  console.log('MsgQueueServer is running on port', app.get('port'));
});

module.exports = app;
