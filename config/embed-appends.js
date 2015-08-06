// HTML files can have content appended at the end. This configuration takes
// all relative filenames from the "appends" array property, and maps them to
// the files from the Metalsmith tree. These are then embedded in the post.hbs
// template.

module.exports = {
  from: 'appends',
  to: 'appends',
  targets: ['*/*.html']
};
