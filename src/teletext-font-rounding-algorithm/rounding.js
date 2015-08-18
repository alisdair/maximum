$(function() {
  var character = [
    [0, 0, 1, 0, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ];

  function setPixel(element, c) {
    if (c === 1) {
      $(element).attr('class', 'active');
    } else {
      $(element).attr('class', '');
    }
  }
  
  function setClickHandler($rect, row, col) {
    $rect.click(function() {
      var c = character[row][col];

      character[row][col] = c = (c === 1 ? 0 : 1);

      setPixel(this, c);

      updateOutput();
    });
  }

  $('#character-input rect').each(function(i) {
    var row = Math.floor(i / 5);
    var col = i % 5;

    setClickHandler($(this), row, col);

    setPixel(this, character[row][col]);
  });

  function updateOutput() {
    var output = [];

    // Doubling
    for (var i = 0; i < character.length; i++) {
      output[i * 2] = [];
      output[i * 2 + 1] = [];

      for (var j = 0; j < character[i].length; j++) {
        output[i * 2][j * 2] = character[i][j];
        output[i * 2][j * 2 + 1] = character[i][j];
        output[i * 2 + 1][j * 2] = character[i][j];
        output[i * 2 + 1][j * 2 + 1] = character[i][j];
      }
    }

    // Rounding
    for (var i = 0; i < output.length - 1; i++) {
      for (var j = 0; j < output[i].length - 1; j++) {
        var a = output[i + 0][j + 0];
        var b = output[i + 0][j + 1];
        var c = output[i + 1][j + 0];
        var d = output[i + 1][j + 1];

        if (a === d && b === c && a !== b) {
          output[i + 0][j + 0] = 1;
          output[i + 0][j + 1] = 1;
          output[i + 1][j + 0] = 1;
          output[i + 1][j + 1] = 1;
        }
      }
    }

    $('#character-output rect').each(function(i) {
      var row = Math.floor(i / 10);
      var col = i % 10;
      setPixel(this, output[row][col]);
    });
  }

  updateOutput();
});
