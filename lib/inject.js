var path = require('path');
var match = require('multimatch');
var extend = require('extend');

module.exports = function(options) {
  var defaults = options.defaults || {};
  var from = options.from || ['*/data.json'];
  var to = options.to || [];

  return function(files, metalsmith) {
    match(Object.keys(files), from).forEach(function(file) {
      var data = extend({}, defaults, files[file].data);
      var dirname = path.dirname(file);
      var targets = to.map(function(f) { return path.join(dirname, f); });

      match(Object.keys(files), targets).forEach(function(filename) {
        extend(files[filename], data);
      });
    });
  }
};

