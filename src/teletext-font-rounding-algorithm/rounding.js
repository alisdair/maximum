$(function() {
  var character = [
    0, 0, 1, 0, 0,
    0, 1, 0, 1, 0,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 1, 1, 1, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0
  ];

  function setPixel(element, c) {
    if (c === 1) {
      $(element).attr('class', 'active');
    } else {
      $(element).attr('class', '');
    }
  }

  function updateOutputForIndex(i, c) {
    var row = Math.floor(i / 5);
    var col = i % 5;
    var rects = $('#character-output rect');

    setPixel(rects[row * 20 + col * 2], c);
    setPixel(rects[row * 20 + col * 2 + 1], c);
    setPixel(rects[row * 20 + 10 + col * 2], c);
    setPixel(rects[row * 20 + 10 + col * 2 + 1], c);
  }
  
  function setClickHandler($rect, i) {
    $rect.click(function() {
      var c = character[i];

      character[i] = c = (c === 1 ? 0 : 1);

      setPixel(this, c);

      updateOutputForIndex(i, c);
    });
  }

  $('#character-input rect').each(function(i) {
    var c = character[i];

    setClickHandler($(this), i);

    setPixel(this, c);
    if (c === 1)
      updateOutputForIndex(i, c);
  });
});
