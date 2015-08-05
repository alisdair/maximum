var Metalsmith = require('metalsmith');
var sass = require('metalsmith-sass');
var autoprefixer = require('metalsmith-autoprefixer');
var json = require('metalsmith-json');
var inject = require('./lib/inject-data');
var permalink = require('./lib/permalink');
var collections = require('metalsmith-collections');
var feed = require('metalsmith-feed');
var markdown = require('metalsmith-markdown');
var embedCSS = require('./lib/embed-css');
var partials = require('metalsmith-register-partials');
var layouts = require('metalsmith-layouts');
var ignore = require('metalsmith-ignore');

require('./lib/moment-helper');

Metalsmith(__dirname)
  .metadata(require('./config/metadata'))
  .use(sass())
  .use(autoprefixer())
  .use(json({ key: 'data' }))
  .use(inject(require('./config/inject')))
  .use(permalink(require('./config/permalink')))
  .use(collections(require('./config/collections')))
  .use(feed(require('./config/feed')))
  .use(markdown(require('./config/markdown')))
  .use(embedCSS(require('./config/embed-css')))
  .use(partials({ directory: 'partials' }))
  .use(layouts(require('./config/layouts')))
  .use(ignore([ 'sass/*', '*/data.json' ]))
  .build(function(err, files) {
    if (err) throw err;
  });
