var _ = require('./utils.js');
var secrets = require('./secrets.js');

console.log(secrets.ID, secrets.KEY);

var arg = {
  hit: {},
  ExternalQuestion: {
    ExternalURL: secrets.URL,
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

function mturkSubmit() {
    var params = _.getUrlParams()
    var f = $('<form action="' + params.turkSubmitTo + '/mturk/externalSubmit" method="GET"><input type="hidden" name="assignmentId" value="' + params.assignmentId + '"></input><input type="hidden" name="unused" value="unused"></input></form>')
    $('body').append(f)
    f.submit()
};

function mturkCheckPreview() {
    var params = _.getUrlParams()
    if (params.assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE") {
        _.dialog($('<div style="background-color: rgba(0,0,0,0.5);color:white;font-size:xx-large;padding:10px"/>').text('preview'), false)
        $('body').click(function () {
            alert('This is a preview. Please accept the HIT to work on it.')
        })
        return true
    }
};

_.run(function () {
  var x = mturkRequest(secrets.ID, secrets.KEY, true, {
            Operation : 'CreateHIT',
            Title : 'CHANGE_ME',
            Description : 'CHANGE_ME',
            'Reward.1.Amount' : 0.01,
            'Reward.1.CurrencyCode' : 'USD',
            MaxAssignments : 1,
            AssignmentDurationInSeconds : 60 * 60,
            LifetimeInSeconds : 60 * 60 * 24,
            AutoApprovalDelayInSeconds : 60 * 60,
            Question: arg.hit.question
        });
  console.log(x);
});
