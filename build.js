var Metalsmith = require('metalsmith');
var sass = require('metalsmith-sass');
var autoprefixer = require('metalsmith-autoprefixer');
var json = require('metalsmith-json');
var inject = require('./lib/inject');
var permalink = require('./lib/permalink');
var collections = require('metalsmith-collections');
var feed = require('metalsmith-feed');
var markdown = require('metalsmith-markdown');
var partials = require('metalsmith-register-partials');
var embed = require('./lib/embed');
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
  .use(partials({ directory: 'partials' }))
  .use(embed(require('./config/embed-appends')))
  .use(embed(require('./config/embed-css')))
  .use(layouts(require('./config/layouts')))
  .use(ignore([ 'sass/*', '*/data.json' ]))
  .build(function(err, files) {
    if (err) throw err;
  });
