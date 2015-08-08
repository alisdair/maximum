var Metalsmith = require('metalsmith');
var sass = require('metalsmith-sass');
var autoprefixer = require('metalsmith-autoprefixer');
var json = require('metalsmith-json');
var inject = require('./lib/inject');
var permalink = require('./lib/permalink');
var collections = require('metalsmith-collections');
var unlisted = require('metalsmith-unlisted');
var feed = require('metalsmith-feed');
var markdown = require('metalsmith-markdown');
var partials = require('metalsmith-register-partials');
var embed = require('./lib/embed');
var layouts = require('metalsmith-layouts');
var ignore = require('metalsmith-ignore');

require('./lib/moment-helper');

Metalsmith(__dirname)
  // Site metadata, used for RSS feed
  .metadata(require('./config/metadata'))

  // CSS preprocessing
  .use(sass())
  .use(autoprefixer())

  // Parse all JSON files, storing the object tree in the "data" key
  .use(json({ key: 'data' }))

  // Inject the parsed JSON from each "data.json" into its "index.md"
  .use(inject(require('./config/inject')))

  // Add permalinks based on the directory name
  .use(permalink(require('./config/permalink')))

  // Build a collection of posts for the feed and index
  .use(collections(require('./config/collections')))

  // Remove unlisted posts from the index and RSS feed
  .use(unlisted())

  // RSS feed
  .use(feed(require('./config/feed')))

  // Process "*.md" to "*.html"
  .use(markdown(require('./config/markdown')))

  // Set up partials for Handlebars
  .use(partials({ directory: 'partials' }))

  // Map filenames to file references to allow embedding HTML and CSS
  .use(embed(require('./config/embed-appends')))
  .use(embed(require('./config/embed-css')))

  // Wrap all HTML files in appropriate layout
  .use(layouts(require('./config/layouts')))

  // Remove support files from the build output
  .use(ignore([ 'sass/*', '*/data.json' ]))

  .build(function(err) {
    if (err) throw err;
  });
