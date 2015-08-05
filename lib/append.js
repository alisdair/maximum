var path = require('path');

module.exports = function(dirname, files, items) {
  return items.map(function(filename) {
    var file = path.join(dirname, filename);

    return files[file];
  });
};
