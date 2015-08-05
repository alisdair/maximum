var match = require('multimatch');

module.exports = function(options) {
  var from = options.from || 'css/site.css';
  var to = options.to || [];

  return function(files, metalsmith) {
    var css = files[from].contents;

    match(Object.keys(files), to).forEach(function(file) {
      files[file].css = css;
    });
  }
};

