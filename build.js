var site = require('./lib/site');

site(__dirname).build(function(err) {
  if (err) throw err;
});
