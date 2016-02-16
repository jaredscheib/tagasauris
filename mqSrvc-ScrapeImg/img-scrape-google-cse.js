'use strict';

const _ = require('underscore');
const got = require('got');

function GoogleClient (cse_id, api_key) {
  if (!(this instanceof GoogleClient)) {
    return new GoogleClient(cse_id, api_key);
  }

  this.endpoint = 'https://www.googleapis.com/customsearch/v1?';
  this.cx = cse_id;
  this.key = api_key;
}

GoogleClient.prototype._buildOptions = function (query, options) {
  let build = {
    key: this.key,
    cx: this.cx,
    q: query.replace(/\s/g, '+'),
    searchType: 'image',
    imgType: 'photo',
    start: 1,
    num: 10,
    json: true
  };

  for (var key in options) {
    build[key] = options[key];
  }

  return build;
}

GoogleClient.prototype._buildResponse = function (res, mod) {
  console.log('Google search success: ', res.body.items.length, 'results');
  return res.body.items.map(function (item) {
    return extend({
      type: item.mime,
      width: item.image.width,
      height: item.image.height,
      size: item.image.byteSize,
      orig_url: item.link,
      thumb_url: item.image.thumbnailLink,
      thumb_width: item.image.thumbnailWidth,
      thumb_height: item.image.thumbnailHeight
    }, mod);
  });
};

GoogleClient.prototype.search = function (query, maxResults, mod) {
  if (!query) {
    throw new TypeError('Expected a query');
  }

  if (maxResults < 1 || maxResults > 100) throw 'Must search for between 1 to 100 results';
  console.log('GoogleClient search', query, maxResults);

  let fnQueue = [];
  let initFnQueue = _.once(fnQueueStart.bind(undefined, 1000)); // Google CSE limits 100reqs/100sec and max 1000 results
  let reqQueriesToResolve = [];

  for (let start = 1; start <= maxResults; start += 10) {
    let num = maxResults - start + 1;
    let newPromise = new Promise((fulfill, reject) => {
      got(this.endpoint, {
        query: this._buildOptions(query, { start: start, num: num < 10 ? num : 10 }),
        json: true
      })
      .then(res => {
        fnQueue.push(function(res, mod) {
          fulfill(this._buildResponse.call(undefined, res, mod));
        }.bind(this, res, mod));
        initFnQueue();
      })
      .catch(err => {
        console.log('Google search error', err);
        fulfill(Promise.resolve);
      })
    });
    reqQueriesToResolve.push(newPromise);
  }

  let firstCall = true;
  function fnQueueStart (interval) {
    let intToClear = setInterval(() => {
      if (fnQueue.length === 0) {
        console.log('clearing fnQueue');
        return clearInterval(intToClear);
      }
      if (fnQueue.length > 0) fnQueue.pop()();
    }, interval);
    firstCall = false;
  }
  
  return Promise.all(reqQueriesToResolve);
};

function extend (addTo, addFrom) {
  for (var key in addFrom) {
    if (!addTo.hasOwnProperty(key)) {
      addTo[key] = addFrom[key];
    }
  }
  return addTo;
}

module.exports = GoogleClient;
