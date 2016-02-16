'use strict';

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

  if (maxResults < 1) throw 'Must search for at least 1 result';
  console.log('GoogleClient search', query, maxResults);

  let reqQueriesToResolve = [];
  for (let start = 1; start <= maxResults; start += 10) {
    let num = maxResults - start + 1;
    reqQueriesToResolve.push(
      got(this.endpoint + '/customsearch/v1', {
        query: this._buildOptions(query, { start: start, num: num < 10 ? num : 10 }),
        json: true
      })
      .then(res => {
        return this._buildResponse(res, mod);
      })
      .catch(err => {
        console.log('Google search error', err);
        return;
      })
    );
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
