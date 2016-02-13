/* global $j */

// dependencies: jQuery
// license : public domain

if (typeof(module) == 'undefined') var module = {};
var gl519 = module.exports = (function () {
  var _ = {};

  _.getNow = function() {
    return new Date().getTime();
  };

  _.minToMs = function (minutes) {
    return minutes * 60 * 1000;
  };

  _.has = function (o, k) {
    return o.hasOwnProperty(k);
  };

  _.identity = function (e) { return e; };

  _.each = function (o, func) {
    if (!func) func = _.identity;
    if (o instanceof Array) {
      for (var i = 0; i < o.length; i++)
        if (func(o[i], i, o) == false)
          break;
    } else {
      for (var k in o)
        if (o.hasOwnProperty(k))
          if (func(o[k], k, o) == false)
            break;
    }
  };

  _.map = function (o, func) {
    if (!func) func = _.identity;
    var accum;
    if (o instanceof Array) {
      accum = [];
      for (var i = 0; i < o.length; i++)
        accum[i] = func(o[i], i, o);
      return accum;
    } else {
      accum = {};
      for (var k in o)
        if (o.hasOwnProperty(k))
          accum[k] = func(o[k], k, o);
      return accum;
    }
  };

  _.deepClone = _.cloneDeep = function (o) { // TODO fix for objects
    if (o == null) return o;
    return _.map(o, function (v) {
      if (typeof(v) == 'object') {
        return _.cloneDeep(v);
      }
      return v;
    });
  };

  _.unescapeUrl = function (s) {
    return decodeURIComponent(s.replace(/\+/g, '%20'));
  };

  _.getUrlParams = function (url) {
    if (url === undefined) {
      url = window.location.href;
    }
    var params = {};
    var m = url.match(/\?([^#]+)/);
    if (m) {
      _.each(m[1].split(/&/), function (m) {
        if (m.length > 0) {
          var a = m.split(/=/);
          params[_.unescapeUrl(a[0])] = a.length > 1 ? _.unescapeUrl(a[1]) : true;
        }
      });
    }
    return params;
  };

  _.dialog = function (content) {
    var win = $j(window);
    var w = win.width();
    var h = win.height();
    
    var b;
    $j('body').append(b = $j('<div style="position:fixed;left:0px;top:0px; z-index:10000;background:black;opacity:0.5"/>').width(w).height(h));
    
    var d = $j('<div style="position:fixed;z-index:20000;background:white"/>').append(content);
    $j('body').append(d);
    setTimeout(function () {
      var w = window.innerWidth;
      var h = window.innerHeight;
      d.css({
        left : Math.round(w / 2 - d.width() / 2) + 'px',
        top : Math.round(h / 2 - d.height() / 2) + 'px'
      });
    }, 0);
    
    _.closeDialog = function () {
      b.remove();
      d.remove();
    };
  };

  return _;
})();
if (typeof(_) == 'undefined') var _ = gl519;
