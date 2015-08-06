// Each post is included in the RSS feed. This plugin uses the title,
// excerpt, date, and permalink property of the post. The filename chosen is
// "feed.rss", which is in order to distinguish its MIME type from generic XML.

module.exports = {
  destination: 'feed.rss',
  collection: 'posts'
};
