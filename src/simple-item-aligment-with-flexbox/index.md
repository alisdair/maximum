Aligning things in CSS has always been annoying. Until [flexible boxes], that is.

[flexible boxes]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Using_CSS_flexible_boxes

Here's one of my favourite uses of flexbox: an easy way to distribute and align items from left to right.

<div class="o-flexy u-mrg-b-5">
  <button class="c-button is-success">Success</button>
  <div class="o-flexy__block"></div>
  <span class="u-mrg-r-3">Also:</span>
  <div>
    <button class="c-button is-warning">Warning</button>
    <button class="c-button is-error u-mrg-l-2">Error</button>
  </div>
</div>

```html
<div class="o-flexy u-mrg-b-md">
  <button class="c-button is-success">Success</button>
  <div class="o-flexy__block"></div>
  <span class="u-mrg-r-3">Also:</span>
  <div>
    <button class="c-button is-warning">Warning</button>
    <button class="c-button is-error u-mrg-l-2">Error</button>
  </div>
</div>
```

## What's the deal?

This is the basic idea:

- Wrap your items in a `display: flex` container
- Use `justify-content: space-between` to distribute them evenly
- Set `align-items: center` to keep items in the middle
- Add `flex: 1` children to control spacing

Here's all the CSS you need:

```css
.o-flexy {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.o-flexy__block {
  flex: 1;
}
```

That's it! It's really simple, but useful in so many situations.

## When is it useful?

I use this pattern *all the time*. No more floats & clearfixes, no more fudging vertical alignment with margins and padding. Just put items in a container and you're done.

Here are some examples where it makes sense:

<div class="o-flexy">
  <div class="o-flexy__block">
    <h1>Title With Buttons</h1>
  </div>
  <div>
    <button class="c-button is-warning">Foo</button>
    <button class="c-button is-success">Bar</button>
  </div>
</div>

```html
<div class="o-flexy">
  <div class="o-flexy__block">
    <h1>Title With Buttons</h1>
  </div>
  <div>
    <button class="c-button is-warning">Foo</button>
    <button class="c-button is-success">Bar</button>
  </div>
</div>
```

### Pagination controls

<div class="o-flexy u-mrg-b-5">
  <small>Displaying items 1–20 of 500</small>
  <small class="o-control-group">
    <a class="c-button c-button--sm" href="#">&laquo;</a>
    <a class="c-button c-button--sm" href="#">&lsaquo;</a>
    <a class="c-button c-button--sm" href="#">1</a>
    <a class="c-button c-button--sm" href="#">2</a>
    <span class="c-button c-button--sm is-disabled">…</span>
    <a class="c-button c-button--sm" href="#">24</a>
    <a class="c-button c-button--sm" href="#">25</a>
    <a class="c-button c-button--sm" href="#">&rsaquo;</a>
    <a class="c-button c-button--sm" href="#">&raquo;</a>
  </small>
</div>

```html
<div class="o-flexy u-mrg-b-5">
  <small>Displaying items 1–20 of 500</small>
  <small class="o-control-group">
    <a class="c-button c-button--sm" href="#">&laquo;</a>
    <a class="c-button c-button--sm" href="#">&lsaquo;</a>
    <a class="c-button c-button--sm" href="#">1</a>
    <a class="c-button c-button--sm" href="#">2</a>
    <span class="c-button c-button--sm is-disabled">…</span>
    <a class="c-button c-button--sm" href="#">24</a>
    <a class="c-button c-button--sm" href="#">25</a>
    <a class="c-button c-button--sm" href="#">&rsaquo;</a>
    <a class="c-button c-button--sm" href="#">&raquo;</a>
  </small>
</div>
```

### Form layout

<div class="o-flexy u-mrg-b-5">
  <label class="u-mrg-r-2">Name</label>
  <div class="o-flexy__block">
    <input class="c-input" placeholder="Alisdair McDiarmid">
  </div>
  <div class="u-mrg-l-2">
    <button class="c-button">Cancel</button>
    <button class="c-button c-button--primary">Save</button>
  </div>
</div>

```html
<div class="o-flexy u-mrg-b-5">
  <label class="u-mrg-r-2">Name</label>
  <div class="o-flexy__block">
    <input class="c-input" placeholder="Alisdair McDiarmid">
  </div>
  <div>
    <button class="c-button">Cancel</button>
    <button class="c-button c-button--primary">Save</button>
  </div>
</div>
```

<div class="o-flexy u-mrg-b-5">
  <div class="o-flexy__block">
    <input class="c-input" placeholder="First name">
  </div>
  <div class="o-flexy__block u-mrg-l-2">
    <input class="c-input" placeholder="Last name">
  </div>
  <button class="c-button c-button--primary u-mrg-l-2">Save</button>
</div>

```html
<div class="o-flexy u-mrg-b-5">
  <div class="o-flexy__block">
    <input class="c-input" placeholder="First name">
  </div>
  <div class="o-flexy__block u-mrg-l-2">
    <input class="c-input" placeholder="Last name">
  </div>
  <button class="c-button c-button--primary u-mrg-l-2">Save</button>
</div>
```

### Button grouping

<div class="o-flexy u-mrg-b-5">
  <div>
    <button class="c-button is-success">A</button>
  </div>
  <div>
    <button class="c-button is-warning">B</button>
    <button class="c-button is-warning">C</button>
  </div>
  <div>
    <button class="c-button is-error">D</button>
    <button class="c-button is-error">E</button>
  </div>
</div>

```html
<div class="o-flexy u-mrg-b-5">
  <div>
    <button class="c-button is-success">A</button>
  </div>
  <div>
    <button class="c-button is-warning">B</button>
    <button class="c-button is-warning">C</button>
  </div>
  <div>
    <button class="c-button is-error">D</button>
    <button class="c-button is-error">E</button>
  </div>
</div>
```

## Nothing special

You might not be impressed, which would be fair enough. There's nothing groundbreaking about this. It's just a nice little pattern that I use all the time, and it makes my life easier. Maybe it will be useful for you, too?

## Credits

This pattern was first observed by my friend [Jon Q] while we worked together at [Customer.io]. He's now at [Help Scout], where he has been working on a new way of building shareable CSS packs, called [Seed]. [You should check it out](http://style.helpscout.com/seed/).

I've used a few Seed packs in this post, which have been super useful: [seed-flexy], [seed-button], and [seed-spacing]. Also, [seed-harvester] makes it super easy to bring packs into my project. It's fun!

[Jon Q]: https://github.com/itsjonq
[Customer.io]: https://customer.io/
[Help Scout]: https://www.helpscout.net/
[Seed]: http://developer.helpscout.net/seed-docs/
[seed-flexy]: https://github.com/helpscout/seed-flexy
[seed-button]: https://github.com/helpscout/seed-button
[seed-spacing]: https://github.com/helpscout/seed-spacing
[seed-harvester]: https://github.com/helpscout/seed-harvester
