// All stylesheets are embedded in the header of the site. Posts by default
// use only the site CSS, but this can be overridden by setting a "stylesheet"
// property to an array of relative pathnames to stylesheets. For example:
//
// "stylesheets": ["../css/site.css", "stylesheet.css"]

module.exports = {
  from: 'stylesheets',
  to: 'stylesheets',
  targets: ['*.html', '*/*.html']
};
