// Currently, every page of the site is considered a post. This could be
// revised to allow some non-post pages by removing the pattern and adding a
// collection property to each post's "data.json" instead file.

module.exports = {
  posts: {
    pattern: '*/index.md',
    sortBy: 'date',
    reverse: true
  }
};
