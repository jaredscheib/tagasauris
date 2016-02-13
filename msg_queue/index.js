'use strict';

const express = require('express');
const MsgQueueServer = require('msgqueue-server');

const app = express();
const msgQueue = new MsgQueueServer(app);

app.set('port', 3000);

app.listen(app.get('port'), () => {
  console.log('MsgQueueServer is running on port', app.get('port'));
});
