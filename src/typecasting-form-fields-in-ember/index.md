Editing model attributes in Ember is very easy, as long as all your attributes are strings. But if you want to edit other types, the typeless nature of HTML `input` elements means that you need to do a bit more work.

Not too much work, though! All you need is a computed property macro to typecast your form field value correctly.

Here's the tiny bit of code you'd need to make it happen:

```js
import Ember from 'ember';
import integerToString from '../utils/integer-to-string';

const { Controller } = Ember;

export default Controller.extend({
  horses: integerToString('model.horses'),
  chickens: integerToString('model.chickens')
});
```

For more background and examples of the problem, read on.

## Strings, strings everywhere

Here's an example of the problem in the first prototype of my upcoming FarmTech startup, [Horses and Chickens](https://github.com/alisdair/horses-and-chickens):

<iframe src="https://alisdair.github.io/horses-and-chickens/#/v1"></iframe>

As you can see, by default we're able to count our horses and chickens properly. But as soon as you interact with the form, the total stops working properly.

This is because the numbers are being coerced to strings. While `6 + 1` is `7`, JavaScript also uses `+` for string concatenation, so `"6" + 1` is `"61"`.

The code I used to build this version of my app is pretty straightforward. I have [a model](https://github.com/alisdair/horses-and-chickens/blob/master/app/models/model.js) with two attributes and a computed `total` property:

```js
import Ember from 'ember';

const { Object: EmberObject, computed } = Ember;

export default EmberObject.extend({
  horses: 0,
  chickens: 0,

  total: computed('horses', 'chickens', function() {
    return this.get('horses') + this.get('chickens');
  })
});
```

The [application route](https://github.com/alisdair/horses-and-chickens/blob/master/app/routes/application.js) creates an instance of this model and allows you to reset the page (to get back to numbers):

```js
import Ember from 'ember';
import Model from '../models/model';

const { Route } = Ember;

export default Route.extend({
  model() {
    return Model.create({ horses: 6, chickens: 1 });
  },

  actions: {
    refresh() {
      this.refresh();
    }
  }
});
```

And [the template](https://github.com/alisdair/horses-and-chickens/blob/master/app/templates/v1.hbs) binds form fields to the model:

```hbs
<div class="flex">
  <label>
    Horses
    {{input type="number" value=model.horses min=0}}
  </label>
  <label>
    Chickens
    {{input type="number" value=model.chickens min=0}}
  </label>
  <label>
    <strong>Total</strong>
    {{input type="number" value=model.total disabled=true}}
  </label>

  <div class="flex__block"></div>

  <button {{action "refresh"}}>Reset</button>
</div>
```

## Fixing the types

What we want to do is keep our model properties as integers, but wrap them up into strings for use in our form. This is a perfect use case for [two-way computed properties](https://guides.emberjs.com/v2.7.0/object-model/computed-properties/#toc_setting-computed-properties).

Here's my second release of Horses and Chickens (still in exclusive private beta, [follow me on Twitter](https://twitter.com/alisdair) to find out when it's released):

<iframe src="https://alisdair.github.io/horses-and-chickens/#/v2"></iframe>

Yay! You can add horses and chickens to your heart's content and the total works properly.

We don't have to change the route or the model at all. We first [add a controller](https://github.com/alisdair/horses-and-chickens/blob/master/app/controllers/v2.js):

```js
import Ember from 'ember';
import integerToString from '../utils/integer-to-string';

const { Controller } = Ember;

export default Controller.extend({
  horses: integerToString('model.horses'),
  chickens: integerToString('model.chickens')
});
```

This uses a new [`integerToString` two-way computed property macro](https://github.com/alisdair/horses-and-chickens/blob/master/app/utils/integer-to-string.js), which converts between an integer (in your domain model) and a string (for your form):

```js
import Ember from 'ember';

const { computed } = Ember;

export default function integerToString(attribute) {
  return computed(attribute, {
    get() {
      return this.get(attribute).toString();
    },

    set(key, value) {
      this.set(attribute, parseInt(value, 10));

      return value;
    }
  });
}
```

There's weird syntax here, but it's really very simple logic:

- When you `get` this property, convert the target attribute to a string;
- When you `set` this property, convert the input `value` to an integer and set the target attribute…
- …and return the input `value` so that it's cached.

Then finally, we [change the template](https://github.com/alisdair/horses-and-chickens/blob/master/app/templates/v2.hbs) to bind to our controller properties instead of directly to the model:

```hbs
<div class="flex">
  <label>
    Horses
    {{input type="number" value=horses min=0}}
  </label>
  <label>
    Chickens
    {{input type="number" value=chickens min=0}}
  </label>
  <label>
    <strong>Total</strong>
    {{input type="number" value=model.total disabled=true}}
  </label>

  <div class="flex__block"></div>

  <button {{action "refresh"}}>Reset</button>
</div>
```

Now, when we enter values like `"123"` in our input field, the controller converts this to `123` on our model. Therefore our `total` property still works properly. You'll always know how many animals you have with [Horses and Chickens](https://github.com/alisdair/horses-and-chickens) (coming soon).

## Not just integers!

The same pattern applies elsewhere! For example, if you're binding a `<select>` menu to a boolean model attribute, you'll want to create a `booleanToString` computed property to make sure you don't write `"true"` instead of `true`.

This approach works for me. But if there's a better way, I'd love to hear about it. [Let me know what you think on Twitter](https://twitter.com/alisdair), and watch out for Horses and Chickens on TechCrunch. Bye!
