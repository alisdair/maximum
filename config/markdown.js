// Use GitHub-flavoured markdown, with tables. Add an "hljs" class to all
// fenced code blocks so that we can use the default distributed highlight.js
// styles, and use our custom highlighter function to do the highlighting.

var highlight = require('../lib/highlight');

module.exports = {
  gfm: true,
  tables: true,
  langPrefix: 'hljs lang-',
  highlight: highlight
};
