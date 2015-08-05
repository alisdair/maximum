var match = require('multimatch');
var path = require('path');

module.exports = function(options) {
  var matches = options.files || ['*/index.*'];

  return function(files, metalsmith) {
    match(Object.keys(files), matches).forEach(function(file) {
      files[file].permalink = '/' + path.dirname(file) + '/';
    });
  }
};
