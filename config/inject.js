// Inject data from the post data.json file into the sibling Markdown files
module.exports = {
  defaults: { stylesheets: ['../sass/site.css'] },
  from: ['*/data.json'],
  to: ['data.json', '*.md']
};
