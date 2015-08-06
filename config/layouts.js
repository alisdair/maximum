// All HTML files need a Handlebars layout. Posts use the simple "post.hbs"
// layout, which is overridden for the index file.
//
// We ignore any partials, which begin with underscores.

module.exports = {
  default: 'post.hbs',
  engine: 'handlebars',
  pattern: ['*.html', '*/*.html', '!_*.html', '!*/_*.html']
};
