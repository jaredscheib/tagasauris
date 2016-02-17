var _ = require('./util/mturk-utils.js');
var secrets = require('../dev/secrets.js');

var args = process.argv.slice(2);
var sandbox = args[0] === 'true' ? true : false;
var task = Number(args[1]) || 'task_img_verification';
var hitsToGen = Number(args[2]) || 1;
var requested = Number(args[3]) || 30;
var concept = String(args.slice(4)).split(' ').join('+') || 'porsche';
console.log(sandbox, task, hitsToGen, concept);

var arg = {
  hit: {},
  ExternalQuestion: {
    // task=task_img_verification&concept=porsche&requested=30
    ExternalURL: secrets.ext_url + '&task=' + task + '&concept=' + concept + '&requested=' + requested,
    FrameHeight: '650'
  }
};

arg.hit.question = '<ExternalQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd"><ExternalURL>' + _.escapeXml(arg.ExternalQuestion.ExternalURL) + '</ExternalURL><FrameHeight>' + arg.ExternalQuestion.FrameHeight + '</FrameHeight></ExternalQuestion>';

function mturkRequest(id, secret, sandbox, params) {
  function sign(text, secret) {
      return require('crypto').createHmac('sha1', secret).update(text).digest('base64')
  }
  if (!params) params = {}
  _.ensure(params, 'Service', 'AWSMechanicalTurkRequester')
  _.ensure(params, 'AWSAccessKeyId', id)
  _.ensure(params, 'Version', '2012-03-25')
  _.ensure(params, 'Timestamp', new Date().toISOString().replace(/\.\d+/, ''))
  _.ensure(params, 'Signature', sign(params.Service + params.Operation + params.Timestamp, secret))
  
  var url = sandbox ? "https://mechanicalturk.sandbox.amazonaws.com" : "https://mechanicalturk.amazonaws.com"
  
  return _.wget(url, params)
};

_.run(function () {
  for (var i = 0; i < hitsToGen; i++) {
    var x = mturkRequest(secrets.ID, secrets.KEY, sandbox, {
              Operation : 'CreateHIT',
              Title : 'Simple video annotation task',
              Description : 'Describe everything you see in the 30 second video',
              'Reward.1.Amount' : 0.10,
              'Reward.1.CurrencyCode' : 'USD',
              MaxAssignments : 10,
              AssignmentDurationInSeconds : 15 * 60,
              LifetimeInSeconds : 60 * 60 * 24,
              AutoApprovalDelayInSeconds : 60 * 60,
              Question: arg.hit.question
          });
    console.log(x);
  }
});
