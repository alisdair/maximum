var Metalsmith = require('metalsmith');
var collections = require('metalsmith-collections');
var markdown = require('metalsmith-markdown');
var highlight = require('highlight.js');
var layouts = require('metalsmith-layouts');
var json = require('metalsmith-json');
var each = require('metalsmith-each');
var path = require('path');
var sass = require('metalsmith-sass');
var ignore = require('metalsmith-ignore');
var partials = require('metalsmith-register-partials');
var handlebars = require('handlebars');
var moment = require('moment');
var match = require('multimatch');
var autoprefixer = require('metalsmith-autoprefixer');
var feed = require('metalsmith-feed');

handlebars.registerHelper('moment', function(date, format) {
    return moment(date).format(format);
});

var append = function(dirname, files, items) {
  return items.map(function(filename) {
    var file = path.join(dirname, filename);

    return files[file];
  });
};

var injectData = function(options) {
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

var injectCSS = function(options) {
  var from = options.from || 'css/site.css';
  var to = options.to || [];

  return function(files, metalsmith) {
    var css = files[from].contents;

    match(Object.keys(files), to).forEach(function(file) {
      files[file].css = css;
    });
  }
};

Metalsmith(__dirname)
  .metadata({
    site: {
      title: 'Alisdair McDiarmid',
      url: 'http://alisdair.mcdiarmid.org'
    }
  })
  .use(sass({
    outputDir: function(originalPath) {
      return originalPath.replace("sass", "css");
    }
  }))
  .use(autoprefixer())
  .use(json({
    key: 'data'
  }))
  .use(each(function(file, filename) {
    if (path.basename(filename) === 'data.json') {
      file.data.permalink = path.dirname(filename) + '/';
    }
  }))
  .use(injectData({
    from: ['*/data.json'],
    to: ['data.json', '*.md']
  }))
  .use(collections({
    posts: {
      pattern: '*/data.json',
      sortBy: 'date',
      reverse: true
    }
  }))
  .use(feed({
    destination: 'feed.rss',
    collection: 'posts'
  }))
  .use(markdown({
    gfm: true,
    tables: true,
    langPrefix: 'hljs lang-',
    highlight: function (code, lang) {
      if (!lang) {
        return code;
      }

      try {
        return highlight.highlight(lang, code).value;
      } catch (e) {
        return code;
      }
    }
  }))
  .use(injectCSS({
    from: 'css/site.css',
    to: ['*.html', '*/*.html']
  }))
  .use(partials({
    directory: 'partials'
  }))
  .use(layouts({
    default: 'post.hbs',
    engine: 'handlebars',
    pattern: ['*.html', '*/*.html', '!_*.html', '!*/_*.html']
  }))
  .use(ignore([
    'css/*',
    'sass/*',
    '*/data.json'
  ]))
  .build(function(err, files) {
    // console.log(files);
    if (err) throw err;
  });
