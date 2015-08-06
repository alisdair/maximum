var expect = require('chai').expect;
var inject = require('../lib/inject');

describe('inject', function() {
  it('injects data from source files to sibling target files', function() {
    var one = { data: { a: 1, b: 2 }, txt: { }, html: { } };
    var two = { data: { c: 3, d: 4 }, txt: { }, html: { } };
    var files = {
      'one/data.json': { data: one.data },
      'one/test.txt': one.txt,
      'one/test.html': one.html,
      'two/data.json': { data: two.data },
      'two/test.txt': two.txt,
      'two/test.html': two.html
    };

    inject({ to: ['*.html'] })(files);

    expect(one.txt.a).to.be.undefined;
    expect(one.txt.b).to.be.undefined;

    expect(one.html.a).to.equal(1);
    expect(one.html.b).to.equal(2);
    expect(one.html.c).to.be.undefined;
    expect(one.html.d).to.be.undefined;

    expect(two.txt.c).to.be.undefined;
    expect(two.txt.d).to.be.undefined;

    expect(two.html.a).to.be.undefined;
    expect(two.html.b).to.be.undefined;
    expect(two.html.c).to.equal(3);
    expect(two.html.d).to.equal(4);
  });

  it('merges data on top of defaults provided', function() {
    var txt = { };
    var html = { };
    var files = {
      'test/data.json': { data: { a: 1, b: 2 } },
      'test/test.txt': txt,
      'test/test.html': html
    };

    inject({
      defaults: { a: 'one', b: 'two', c: 'three' },
      to: ['*.html']
    })(files);

    expect(txt.a).to.be.undefined;
    expect(txt.b).to.be.undefined;
    expect(txt.c).to.be.undefined;

    expect(html.a).to.equal(1);
    expect(html.b).to.equal(2);
    expect(html.c).to.equal('three');
  });

  it('can match multiple source files, merges their data in order', function() {
    var txt = { };
    var html = { };
    var files = {
      'test/2d.json': { data: { x: 1, y: 1 } },
      'test/3d.json': { data: { x: 2, y: 2, z: 2 } },
      'test/test.txt': txt,
      'test/test.html': html,
    };

    inject({
      from: ['*/3d.json', '*/2d.json'],
      to: ['*']
    })(files);

    expect(txt.x).to.equal(1);
    expect(txt.y).to.equal(1);
    expect(txt.z).to.equal(2);

    expect(html.x).to.equal(1);
    expect(html.y).to.equal(1);
    expect(html.z).to.equal(2);
  });

  it('defaults to no targets, so does nothing', function() {
    var txt = { };
    var html = { };
    var files = {
      'test/data.json': { data: { a: 1 } },
      'test/test.txt': txt,
      'test/test.html': html,
    };

    inject()(files);

    expect(txt.a).to.be.undefined;
    expect(html.a).to.be.undefined;
  });
});
