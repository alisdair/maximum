var expect = require('chai').expect;
var permalink = require('../lib/permalink');

describe('permalink', function() {
  it('adds permalinks based on the dirname of the files', function() {
    var txt = { };
    var html = { };
    var files = {
      'one/two/three/test.txt': txt,
      'one/two/three/test.html': html
    };
    permalink({ files: ['**/*.html'] })(files);
    expect(txt.permalink).to.be.undefined;
    expect(html.permalink).to.equal('/one/two/three/');
  });

  it('defaults to looking for files matching "*/index.*"', function() {
    var txt = { };
    var other = { };
    var html = { };
    var files = {
      'path-to-files/other.html': other,
      'path-to-files/index.txt': txt,
      'path-to-files/index.html': html
    };
    permalink()(files);
    expect(other.permalink).to.be.undefined;
    expect(txt.permalink).to.equal('/path-to-files/');
    expect(html.permalink).to.equal('/path-to-files/');
  });
});
