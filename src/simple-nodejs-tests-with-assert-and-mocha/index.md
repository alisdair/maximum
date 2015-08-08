[I've been writing some Node.js modules recently][npm-alisdair]. Getting started with testing in Node was a bewildering experience. There are so many choices for test runners and assertion libraries, and they all seem really complex. As an Ember developer, I wanted to use [qunit][qunit], but it doesn't really work well with Node modules.

[npm-alisdair]: https://www.npmjs.com/~alisdair
[qunit]: http://qunitjs.com

After trying lots of options, I've settled on something really easy to get started with, and simple to understand. My favourite way to test is using [assert][assert] to write tests, and [mocha][mocha] to run them.

[assert]: http://nodejs.org/api/all.html#all_assert
[mocha]: http://mochajs.org/

## Example

Here's a simple Node module we want to test, in `lib/maybe-first.js`:

```javascript
module.exports = function maybeFirst(array) {
  if (array && array.length) {
    return array[0];
  }
};
```

And here's the corresponding test code, in `test/maybe-first-test.js`:

```javascript
var assert = require('assert');
var maybeFirst = require('../lib/maybe-first');

describe('maybeFirst', function() {
  it('returns the first element of an array', function() {
    var result = maybeFirst([1, 2, 3]);

    assert.equal(result, 1, 'maybeFirst([1, 2, 3]) is 1');
  });
});
```

Install mocha with `npm install -g mocha`, and run the test with `mocha`:

```text
  maybeFirst
    ✓ returns the first element of an array


  1 passing (9ms)
```

Read on for my reasoning for this setup, and a few more example tests. Or [check out the code on GitHub][mocha-assert-example].

[mocha-assert-example]: https://github.com/alisdair/mocha-assert-example

## Why assert?

There are lots of fancy assertion libraries for node. The one I see most commonly used is [chai], which has tons of features, including [Behaviour Driven Development-style assertions][chai-bdd]. This leads to test code that looks like this:

[chai]: http://chaijs.com/
[chai-bdd]: http://chaijs.com/api/bdd/

```javascript
var beverages = { tea: ['chai', 'matcha', 'oolong'] };
beverages.should.have.property('tea').with.length(3);
```

This is really cool! But it's also a lot to learn, and it can be hard to understand when you first come across it.

Here's how I'd write this test in the much simpler [assert][assert] style:

```javascript
var beverages = { tea: ['chai', 'matcha', 'oolong'] };
assert.equal(beverages.tea.length, 3);
```

All you have to learn is the tiny number of assertions, and the rest is simple JavaScript.

## Why not BDD?

I've written a lot of BDD-style tests in my life, most of which were in [rspec][rspec]. They're fun to write, and the resulting tests read almost like English. But I've also found that the tests require much more effort to come back to, and there's a huge context switch between normal code and the domain-specific-language for testing.

[rspec]: http://rspec.info

Switching modes like this between testing and development slows me down. I want to think as little as possible about the language I'm writing my tests in. I'd much rather use that brain energy on coming up with well-thought-through tests, or writing simple and clear production code.

## Why not chai.assert?

Chai also comes with [some neat extensions to the built-in assert module][chai-assert]. I don't want to use these either.

[chai-assert]: http://chaijs.com/api/assert/

The Node assert module is built in, and it has everything you need to write tests. The extra assertions in chai-assert are cute, but they're not necessary. Trying to remember the name of all of these assertions is more work than just writing the equivalent test code yourself.

## Why mocha?

I haven't found any simpler, better test runner than [mocha][mocha]. It automatically finds tests, allows you to describe modules and test cases, has great reporter output, and supports async tests through callbacks or promises.

## More test assertions

There are [a few more useful test assertions provided by the `assert` module][assert-assertions].

[assert-assertions]: http://nodejs.org/api/all.html#all_assert

The simplest assertion is `assert.ok`, which performs a [truthiness][truthy] check on the value. You'll only want to use this when you don't care about the specific value of a result, only that it's not [falsy][falsy].

We've already seen `assert.equal`, which runs a [loose equality][equality] check. `assert.strictEqual` is probably safer, as it runs a [strict equality][identity] check.

For checking arrays or objects, `assert.deepEqual` is really useful. It checks recursively, so you can use this to validate whole trees of JSON, for example. Note that it uses loose equality checking.

Finally, `assert.throws` is for checking for errors raised by functions. It calls the passed function and expects it to throw an exception. You can even assert which exception is thrown by passing a second argument.

And there are also the inverses of most of these: `notEqual`, `notStrictEqual`, `notDeepEqual`, `doesNotThrow`. They do what you'd expect!

[truthy]: https://developer.mozilla.org/en-US/docs/Glossary/Truthy
[falsy]: https://developer.mozilla.org/en-US/docs/Glossary/Falsy
[equality]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators#Equality
[identity]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators#Identity

## Examples

Using assert and mocha is fairly simple once you get started, but it's always helpful to have some examples to crib from. Here are a few more: using `strictEqual`, testing async functions with callbacks, and testing with promises.

### Example: `strictEqual`

What happens when you pass an empty array to `maybeFirst`?

```text
> maybeFirst([])
undefined
```

So let's write a test for that. We're going to use `strictEqual` this time, since we want the test to be equivalent to JavaScript's `===` strict equality operator, not the default coercive `==`.

```javascript
  it('returns undefined if array is empty', function() {
    var result = maybeFirst([]);

    assert.strictEqual(result, undefined, 'maybeFirst([]) is undefined');
  });
```

### Example: async test with callback

Lots of Node functions don't return anything useful, instead giving their results via callback functions. How do we test this?

Here's a ridiculous example:

```javascript
function delayedMap(array, transform, callback) {
  setTimeout(function() {
    callback(array.map(transform));
  }, 100);
}
```

One simple approach is to assert within the callback function:

```javascript
it('eventually returns the results', function() {
  var input = [1, 2, 3];
  var transform = function(x) { return x * 2; };

  delayedMap(input, transform, function(result) {
    assert.deepEqual(result, [2, 4, 6]);
  });
});
```

And it works:

```text
  delayedMap
    ✓ eventually returns the results


  1 passing (8ms)
```

Looks great, right? But wait, how does it complete in only 8ms?

Well, let's be good unit testers and make sure that our test fails if we break our function:

```javascript
function delayedMap(array, transform, callback) {
  setTimeout(function() {
    // callback(array.map(transform));
  }, 100);
}
```

Run mocha:

```text
  delayedMap
    ✓ eventually returns the results


  1 passing (7ms)
```

Uh. Hm. What's happening here?

Mocha is marking the test as passed because no assertions failed. Unfortunately, that's because no assertions ran! So we need to make it wait until we're done.

We do that by using the `done` callback parameter which mocha passes to every test. Let's update our test like this:

```javascript
it('eventually returns the results', function(done) {
  var input = [1, 2, 3];
  var transform = function(x) { return x * 2; };

  delayedMap(input, transform, function(result) {
    assert.deepEqual(result, [2, 4, 6]);
    done();
  });
});
```

Rerunning mocha:

```text
  delayedMap
    1) eventually returns the results


  0 passing (2s)
  1 failing

  1) delayedMap eventually returns the results:
     Error: timeout of 2000ms exceeded. Ensure the done() callback is being called in this test.
```

That's more like it! And now if we fix our code under test again:

```text
  delayedMap
    ✓ eventually returns the results (109ms)


  1 passing (117ms)
```

Awesome.

### Example: async test with promises

But callbacks are so old hat. What about testing promises? Let's rewrite our useless `delayedMap` function into a still-useless `promiseMap` equivalent:

```javascript
function promisedMap(array, transform) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(array.map(transform));
    }, 100);
  });
}
```

To write the test for this, make sure that your `it` block returns a promise, and mocha will take care of the rest:

```javascript
  it('eventually returns the results', function() {
    var input = [1, 2, 3];
    var transform = function(x) { return x * 2; };

    return promisedMap(input, transform).then(function(result) {
      assert.deepEqual(result, [2, 4, 6]);
    });
  });
```

It works!

```text
  promisedMap
    ✓ eventually returns the results (101ms)

  1 passing (106ms)
```

**Careful**: if you accept the `done` parameter in a test which returns a promise, mocha will explode. Here, look:

```javascript
  it('eventually returns the results', function(done) { // <- we accept the done parameter
    var input = [1, 2, 3];
    var transform = function(x) { return x * 2; };

    return promisedMap(input, transform).then(function(result) {
      assert.deepEqual(result, [2, 4, 6]);
    });
  });
```

This puts mocha into "pending" mode, waiting for `done` to be called. The result is a failing test:

```text
  promisedMap
    1) eventually returns the results


  0 passing (2s)
  1 failing

  1) promisedMap eventually returns the results:
     Error: timeout of 2000ms exceeded. Ensure the done() callback is being called in this test.
```

So don't do that.

## Finally!

I'm really happy with this way of writing tests. [mocha][mocha] is a great test runner, requiring hardly any setup, and supporting everything you need to write Node tests. [assert][assert] is the easiest to understand assertion library I know of, and making tests easy to read and write is really important.

Here are some more links for extra learning:

- [All the code from this post is on GitHub][mocha-assert-example]
- [Mocha docs](http://mochajs.org/#table-of-contents)
- [Assert docs][assert]
- [More on ES6 Promises](http://www.2ality.com/2014/10/es6-promises-api.html)
