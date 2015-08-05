var highlight = require('highlight.js');

module.exports = function (code, lang) {
  if (!lang) {
    return code;
  }

  try {
    return highlight.highlight(lang, code).value;
  } catch (e) {
    return code;
  }
};
