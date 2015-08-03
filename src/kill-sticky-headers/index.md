There is currently a trend for using sticky headers on websites. There's even [a sticky header web startup][hellobar].

I hate sticky headers. _I want to kill sticky headers._

[hellobar]: http://www.hellobar.com/

So I made this bookmarklet. Drag the link to your bookmarks bar:

<div class="bookmarklet"><a href="javascript:(function()%7B(function%20()%20%7Bvar%20i%2C%20elements%20%3D%20document.querySelectorAll('body%20*')%3Bfor%20(i%20%3D%200%3B%20i%20%3C%20elements.length%3B%20i%2B%2B)%20%7Bif%20(getComputedStyle(elements%5Bi%5D).position%20%3D%3D%3D%20'fixed')%20%7Belements%5Bi%5D.parentNode.removeChild(elements%5Bi%5D)%3B%7D%7D%7D)()%7D)()">Kill Sticky</a></div>

## Why sticky headers annoy me

I use an 11" MacBook Air, which means that I don't have much vertical screen space. The 50 pixels taken up by the sticky header could have been three lines of text.

I also normally scroll down using the space key, which scrolls just less than one full viewport at a time. When you cover up part of your content with a sticky element, that means that the space key scrolls too far down. Then I lose my position and have to scroll back up.

Finally, I just don't care right now about navigating your website, or following you on Twitter. I'm trying to read. Let me focus on that for now, please.

## How the bookmarklet works

It's really simple, because [`querySelectorAll`][querySelectorAll] is awesome. [Here's the source][gist]:

[querySelectorAll]: http://www.w3.org/TR/selectors-api/#examples
[gist]: https://gist.github.com/alisdair/5670341

```javascript
(function () { 
  var i, elements = document.querySelectorAll('body *');

  for (i = 0; i < elements.length; i++) {
    if (getComputedStyle(elements[i]).position === 'fixed') {
      elements[i].parentNode.removeChild(elements[i]);
    }
  }
})();
```

The bookmarklet just finds all fixed-position elements on the page, and removes them. This might remove the navigation, but if you need it back, just hit refresh. That's why I created a bookmarklet and not a custom user-stylesheet or browser plugin: this is the simplest way to solve the problem.
