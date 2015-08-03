The best way to build [Ember][ember] apps is to focus on [models, routes, and components][path-to-2.0]. Models and routes are easy to unit test: we can stub out their collaborators and test to the interface.

[ember]: http://www.emberjs.com/
[path-to-2.0]: https://github.com/emberjs/rfcs/pull/15

But components are UI, so unit testing doesn't really work. You need browser events, and controller actions, and other sub-components, and templates. It gets messy.

Good news! As of [a few weeks ago][component-integration-tests], we have a great way to properly test [Ember components][ember-components]. Integration testing lets you render your component in a tiny isolated template, hook it up to its dependencies and collaborators, and test all of its functionality. Now you don't have to resort to acceptance tests to cover complex behaviour, and you can build your app from a collection of well-tested components.

[component-integration-tests]: https://github.com/switchfly/ember-test-helpers/pull/38
[ember-components]: http://guides.emberjs.com/v1.12.0/components/

This post describes how to go about this, including:

* Advantages of integration testing over unit testing;
* How to start integration testing your components;
* [Sample project][sample-project] with [a live demo][alert-banner-demo], [a toy component][alert-banner], and [integration tests][alert-banner-test].

[sample-project]: https://github.com/alisdair/ember-component-integration-tests/
[alert-banner-demo]: http://alisdair.github.io/ember-component-integration-tests/
[alert-banner]: https://github.com/alisdair/ember-component-integration-tests/blob/master/app/components/alert-banner.js
[alert-banner-test]: https://github.com/alisdair/ember-component-integration-tests/blob/master/tests/integration/components/alert-banner-test.js

## Show Me The Code!

To show you what I mean, [I've built a tiny Ember app][alert-banner-demo] ([code on GitHub][sample-project]) with a really simple alert banner component. Here's what one of the tests looks like:

```javascript
test('closing an alert', function(assert) {
  assert.expect(2);

  var alert = Alert.create({ text: 'Hello, world!' });
  this.set('alert', alert);

  this.render(hbs`
    {{alert-banner alert=alert closeAction='assertClosed'}}
  `);

  var $button = this.$('.alert-banner button');
  assert.equal($button.length, 1);

  this.on('assertClosed', a => assert.deepEqual(a, alert));
  $button.click();
});
```

Wait! Look at this bit from the middle of the test:

```javascript
this.render(hbs`
  {{alert-banner alert=alert closeAction='assertClosed'}}
`);
```

It's a tiny Handlebars template, right in your test code! Integration tests let you test your components in almost exactly the same way you'll use them, without booting up your entire application.

## Why Integration Testing Matters

Until recently, there were [two types of tests for Ember modules][ember-testing]: acceptance tests, and unit tests. [Acceptance tests][acceptance-tests] boot your entire application, and allow you to test everything, from URLs to CSS. [Unit tests][unit-tests] load individual modules or functions without the rest of your app, and allow you to test algorithms or computed properties much more easily.

[ember-testing]: http://guides.emberjs.com/v1.12.0/testing/
[acceptance-tests]: http://guides.emberjs.com/v1.12.0/testing/acceptance/
[unit-tests]: http://guides.emberjs.com/v1.12.0/testing/unit-testing-basics/

Recent changes made to the [ember-test-helpers][ember-test-helpers] add a third class of test, which sits between the other two. Integration tests aren't fully isolated, but they don't load your entire app either. They run faster than acceptance tests, yet allow you to render templates and handle actions.

[ember-test-helpers]: https://github.com/switchfly/ember-test-helpers

[Fast tests are important][fast-test-slow-test], but there are other advantages to Ember component integration testing.

[fast-test-slow-test]: https://www.youtube.com/watch?v=RAxiiRPHS9k

### Unit Testing Components is Unrealistic

Unit tests require you to instantiate your Ember components in JavaScript, like [this example from the Ember.js guides][emberjs-guides-testing-components]:

[emberjs-guides-testing-components]: http://guides.emberjs.com/v1.12.0/testing/testing-components/

```javascript
test('changing colors', function(assert) {
  var component = this.subject();

  Ember.run(function() { component.set('name','red'); });
  assert.equal(this.$().attr('style'), 'color: red;');

  Ember.run(function() { component.set('name', 'green'); });
  assert.equal(this.$().attr('style'), 'color: green;');
});
```

You will never use an Ember component like this in your production code. Components are integrated into your app with templates, and you don't set attributes on them directly either. With integration testing, you could write the above test like this:

```javascript
test('changing colors', function(assert) {
  this.set('name', 'red');

  this.render(hbs`{{pretty-color name=name}}`);

  assert.equal(this.$('.pretty-color').attr('style'),
               'color: red;');

  this.set('name', 'green');
  assert.equal(this.$('.pretty-color').attr('style'),
               'color: green;');
});
```

There two small but important differences here:

* We don't have a reference to the component, just like in the app. We're not setting properties on the component, just like in the app. The component's properties are bound to its context, just like in the app.

* There's an example right in the test of how you'd use the component. You render it and bind a `name` attribute. Tests are the best kind of documentation for developers, and having a sample template in the tests is a great way of explaining how to use the component.

### Components Are Never Truly Isolated

No matter how well you design your components, in real apps they will always have subtle interactions with their environments. Maybe via sub-components, maybe other elements on the page. Unit tests can't verify this behaviour, because there is no template, no page, and no other component to collaborate with.

Integration testing can allow you to test components that interact with other parts of the DOM. Testing components that use [the awesome ember-wormhole component][ember-wormhole] would be basically impossible without integration tests. Any component which [takes a block and yields context to its parent][component-yielding] can't be tested without integration testing. These use cases are just as common as simpler components, but now you can test them as well!

[ember-wormhole]: https://github.com/yapplabs/ember-wormhole
[component-yielding]: http://guides.emberjs.com/v1.10.0/components/wrapping-content-in-a-component/

## Quick Start

Convinced? Great! Here's how to get started.

You'll need to be using [ember-cli][ember-cli] and at least [Ember 1.10][ember-1.10]. First, upgrade to [ember-qunit][ember-qunit] 0.4.0, [ember-cli-qunit][ember-cli-qunit] 0.3.14, and install [ember-cli-htmlbars-inline-precompile][ember-cli-htmlbars-inline-precompile] 0.1.1:

[ember-cli]: https://github.com/ember-cli/ember-cli
[ember-1.10]: http://emberjs.com/blog/2015/02/07/ember-1-10-0-released.html
[ember-qunit]: https://github.com/rwjblue/ember-qunit/
[ember-cli-qunit]: https://github.com/ember-cli/ember-cli-qunit
[ember-cli-htmlbars-inline-precompile]: https://github.com/pangratz/ember-cli-htmlbars-inline-precompile

```shell
bower install --save ember-qunit#0.4.0
npm install --save-dev ember-cli-qunit@0.3.14
npm install --save-dev ember-cli-htmlbars-inline-precompile@0.1.1
```

Then create an integration test file for your component. Here's a quick stub for `tests/integration/components/my-component-test.js`:

```javascript
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('my-component', {
  integration: true
});

test('renders text', function(assert) {
  this.render(hbs`{{my-component text="Hello!"}}`);

  var $component = this.$('.my-component');
  assert.equal($component.text(), 'Hello!',);
});
```

## Example: Building an Alert Banner Component

To show in more detail how to write integration tests, [I've published a sample Ember.js project][sample-project] with [a live demo of the component in action][alert-banner-demo]. Below is a walkthrough of how I built it, with three example tests.

(Note: this component is just a teaching toy. If you want an alert banner component, try [ember-cli-flash][ember-cli-flash], which is awesome.)

[ember-cli-flash]: https://github.com/poteto/ember-cli-flash

## First Test

An alert banner is about as simple a component as I could think of. At its simplest, it's just a `<div>` with some text:

```html
<div class="alert-banner">Tweet published!</div>
```

[Here's the commit of the first version of the component][first-commit]. As you can see, there really isn't much to it. This is the component JavaScript:

[first-commit]: https://github.com/alisdair/ember-component-integration-tests/commit/0bcdd3985a680f6e81c907b794af12ccd9b2dff8

```javascript
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['alert-banner'],

  alert: null,
  text: Ember.computed.alias('alert.text'),
});
```

The template is really simple:

```handlebars
{{text}}
```

At this stage, [testing the component][first-test] is also trivial:

[first-test]: https://github.com/alisdair/ember-component-integration-tests/blob/ecada7353017959ac8bb792658ce2de4c71567a6/tests/integration/components/alert-banner-test.js

```javascript
test('renders text', function(assert) {
  this.set('helloAlert', Alert.create({ text: 'Hello, world!' });

  $this.render(hbs`
    {{alert-banner alert=helloAlert}}
  `);

  var $alert = this.$('.alert-banner');
  assert.equal($alert.length, 1);
  assert.equal($alert.text().trim(), 'Hello, world!');
});
```

There are a few things worth noting, though:

* The component is rendered via a template. Thanks to [ember-cli-htmlbars-inline-precompile][ember-cli-htmlbars-inline-precompile], we can specify the HTMLbars template using a [tagged "`hbs`" template string][tagged-template-string]. If you're curious, Clemens Müller [wrote more on how this works under the hood][htmlbars-babel-comment].

[tagged-template-string]: http://tc39wiki.calculist.org/es6/template-strings/
[htmlbars-babel-comment]: https://github.com/switchfly/ember-test-helpers/pull/38#issuecomment-98963675

* We find the component's element using `this.$('.alert-banner')`. This is different from unit tests, where `this.$()` returns a jQuery object for the component element.  Here we're rendering an entire template, so the top level element is a container.

* Our component runs in the context of the test. When we bind `alert=helloAlert` in the HTMLbars template, this means that the component's `alert` property is bound to the `helloAlert` property of the test object.

## Testing Actions

Components that display bound content are fine, but interactive components are much more interesting. Let's add an optional close button to our alert, which will fire an action to its target.

[This commit has the changes for the whole app, including the tests][second-commit]. In our controller, we have this action:

[second-commit]: https://github.com/alisdair/ember-component-integration-tests/commit/4fc33bac033eb21180f6800790c7b651bd80a48c

```javascript
actions: {
  removeAlert(alert) {
    this.get('alerts').removeObject(alert);
  }
}
```

If we want our component to fire this action, we render it like this:

```handlebars
{{alert-banner alert=alert closeAction='removeAlert'}}
```

Our component template now has a conditional close button:

```handlebars
{{#if closeAction}}
  <button {{action 'closeAction'}} aria-label="Close" class="close">
    <span aria-hidden="true">×</span>
  </button>
{{/if}}
{{text}}
```

And its `closeAction` just sends back the configured action to its target, along with the alert object itself of course:

```javascript
actions: {
  closeAction() {
    this.sendAction('closeAction', this.get('alert'));
  }
}
```

Testing this with an integration test is straightforward:

```javascript
test('closing an alert', function(assert) {
  assert.expect(2);

  var alert = Alert.create({ text: 'Hello, world!' });
  this.set('alert', alert);

  this.render(hbs`
    {{alert-banner alert=alert closeAction='assertClosed'}}
  `);

  var $button = this.$('.alert-banner button');
  assert.equal($button.length, 1);

  this.on('assertClosed', a => assert.deepEqual(a, alert));
  $button.click();
});
```

We render the template just as we would in the app, and then set up an action handler on the test object with an assertion inside it. Finally we click the button, and our assertions run.

## Using Blocks

Alert banners are boring if all they can render is plain text. So let's add support for [yielding to a block with the alert as a parameter][component-yielding]. Using the component would look like this:

```handlebars
{{#alert-banner alert=alert as |text|}}
  <h3>Save Failed!</h3>

  <p class="text-warning">{{text}}</p>

  <button {{action 'retry'}}>Retry?</button>
{{/alert-banner}}
```

[Here's the commit with the changes required to support this][third-commit]. The code change for the component is small: just calling `{{yield text}}` from the template.

[third-commit]: https://github.com/alisdair/ember-component-integration-tests/commit/14367960bc7c88318ec5e2d5ea2c2afc3c5be7ea

The test is also really easy to write. We just update the template string in our test according to the real use case, then make some jQuery-selector powered assertions about the DOM:

```javascript
test('with block for rendering text', function(assert) {
  this.set('alert', Alert.create({ text: 'Panic!' });

  this.render(hbs`
    {{#alert-banner alert=alert as |text|}}
      <h3 class="text-danger">Something Went Wrong</h3>

      <p>{{text}}</p>
    {{/alert-banner}}
  `);

  var $h3 = this.$('.alert-banner h3.text-danger');
  assert.equal($h3.text().trim(), 'Something Went Wrong');

  var $p = this.$('.alert-banner p');
  assert.equal($p.text().trim(), 'Panic!');
});
```

You can see [the full source code for this app and component on GitHub][sample-project], and [try out the component at the demo page][alert-banner-demo].

## Limitations

There is one small problem with the current implementation of component integration testing. Because it doesn't boot the entire app, you can't render links with `link-to`. [This is a known issue and is being worked on][link-to-incompatible], so hopefully it will be resolved soon.

[link-to-incompatible]: https://github.com/switchfly/ember-test-helpers/issues/41

## Links and Credits

Finally, a few links and thanks:

* [Edward Faulkner](https://github.com/ef4), who [built the integration testing feature][component-integration-tests];
* [Robert Jackson](https://github.com/rwjblue) and [Dan Gebhardt](https://github.com/dgeb), who maintain [ember-test-helpers][ember-test-helpers];
* [Clemens Müller](https://github.com/pangratz), who built the [Babel plugin][ember-cli-htmlbars-inline-precompile];
* And my coworkers [Justin Brown](https://github.com/jbrown) and [Alvin Crespo](https://github.com/alvincrespo), who introduced this feature to me.

