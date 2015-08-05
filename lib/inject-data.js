var path = require('path');
var append = require('./append');
var match = require('multimatch');

module.exports = function(options) {
  var from = options.from || ['*/data.json'];
  var to = options.to || [];

  return function(files, metalsmith) {
    match(Object.keys(files), from).forEach(function(file) {
      var data = files[file].data;
      var dirname = path.dirname(file);
      var targets = to.map(function(f) { return path.join(dirname, f); });

      match(Object.keys(files), targets).forEach(function(filename) {
        for (var key in data) {
          files[filename][key] = data[key];

          if (key === 'append') {
            files[filename]['appended'] = append(dirname, files, data[key])
          }

          if (key === 'stylesheet') {
            var css = files[path.join(dirname, data[key])].contents;
            files[filename]['stylesheet'] = css;
          }
        }
      });
    });
  }
};

