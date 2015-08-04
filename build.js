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
var watch = require('metalsmith-watch');
var serve = require('metalsmith-serve');
var partials = require('metalsmith-register-partials');
var handlebars = require('handlebars');
var moment = require('moment');

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
  var from = options.from || 'data.json';
  var to = options.to || [];

  return function(files, metalsmith) {
    for (var file in files) {
      if (path.basename(file) === from) {
        var data = files[file].data;
        var dirname = path.dirname(file);

        to.forEach(function(filename) {
          var post = path.join(dirname, filename);
          var key;

          if (files[post]) {
            for (key in data) {
              files[post][key] = data[key];

              if (key === 'append') {
                files[post]['appended'] = append(dirname, files, data[key])
              }
            }
          }
        });
      }
    }
  }
};

var injectCSS = function(options) {
  var from = options.from || 'css/site.css';
  var to = options.to || [];

  return function(files, metalsmith) {
    var css = files[from].contents;

    for (var file in files) {
      if (to.indexOf(path.basename(file)) !== -1) {

        files[file].css = css;
      }
    }
  }
};

Metalsmith(__dirname)
  .metadata({
    site: {
      title: 'Alisdair McDiarmid',
      url: 'http://alisdair.mcdiarmid.org',
      author: 'Alisdair McDiarmid'
    }
  })
  .use(sass({
    outputDir: function(originalPath) {
      return originalPath.replace("sass", "css");
    }
  }))
  .use(json({
    key: 'data'
  }))
  .use(each(function(file, filename) {
    if (path.basename(filename) === 'data.json') {
      file.data.permalink = path.dirname(filename);
    }
  }))
  .use(injectData({
    from: 'data.json',
    to: ['data.json', 'index.md']
  }))
  .use(collections({
    posts: {
      pattern: '*/data.json',
      sortBy: 'date',
      reverse: true
    }
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
    to: ['index.html']
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
    'sass/*',
    '*/data.json'
  ]))
  .use(watch({
    paths: {
      "${source}/**/*": "**/*",
      "layouts/*": "**/*",
      "${source}/sass/*": "sass/site.sass"
    }
  }))
  .use(serve())
  .build(function(err, files) {
    // console.log(files);
    if (err) throw err;
  });
