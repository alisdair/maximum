// Inject data from the "data.json" file into the "index.md" file in the same
// directory. This includes metadata and other supporting data for the posts.

module.exports = {
  defaults: { stylesheets: ['../sass/site.css'] },
  from: ['data.json', '*/data.json'],
  to: ['index.md']
};
