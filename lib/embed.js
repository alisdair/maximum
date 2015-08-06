var match = require('multimatch');
var path = require('path');

module.exports = function(options) {
  var from = options.from;
  var to = options.to;
  var targets = options.targets || [];

  if (!from) {
    throw new Error('option "from" is required');
  }

  if (!to) {
    throw new Error('option "to" is required');
  }

  return function(files, metalsmith) {
    match(Object.keys(files), targets).forEach(function(filename) {
      var dirname = path.dirname(filename);
      var file = files[filename];

      if (!file[from]) {
        return;
      }

      file[to] = file[from].map(function(name) {
        var pathname = path.normalize(path.join(dirname, name));
        var file = files[pathname];

        if (!file) {
          throw new Error('missing embed: target=' + filename +
                          ', from=' + from + ', embed=' + pathname);
        }

        return file;
      });
    });
  }
};
