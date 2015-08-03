(function () {
  function rol(n, i) {
    return ((n << i) | (n >>> (32 - i))) >>> 0;
  }

  function ror(n, i) {
    return ((n >>> i) | (n << (32 - i))) >>> 0;
  }

  function hex(n, l) {
    var h = n.toString(16);

    while (h.length < l) {
      h = "0" + h;
    }

    return "0x" + h.toUpperCase();
  };

  function encode(n) {
    var i, m;

    for (i = 0; i < 16; i++) {
      m = rol(n, i * 2);
      if (m < 256) {
        return (i << 8) | m;
      }
    };

    throw "Unencodable constant";
  }

  function modify(f) {
    var input = document.getElementById("input-number");
    input.value = hex(f(parseInt(input.value)), 8);
    update();
  }

  function encoded_bits(n) {
    var i, e, shift = (n >>> 8) & 0xF,
      immediate = n & 0xFF,
      g = document.getElementById("encoded-bits");

    for (i = 0; i < g.childNodes.length; i++) {
      g.childNodes[i].childNodes[0].textContent = ((n >>> (11 - i)) & 1).toString();
    }

    document.getElementById("encoded-shift").textContent = hex(shift, 1);
    document.getElementById("encoded-immediate").textContent = hex(immediate, 1);

    decode = ror(immediate, shift * 2);

    e = document.getElementById("encoder-output");
    e.textContent = hex(immediate, 1) + " ROR " + (shift * 2) + " = " + decode;
    e.className = "";
  }

  function bits(n) {
    var i, g = document.getElementById("decoded-bits");

    for (i = 0; i < 32; i++) {
      g.childNodes[i].childNodes[1].textContent = ((n >>> (31 - i)) & 1).toString();
    }
  }

  function span(shift) {
    var i, bits = ror(0xFF, shift * 2),
      g = document.getElementById("decoded-bits"),
      r;

    for (i = 0; i < 32; i++) {
      r = g.childNodes[i].childNodes[0];

      if (bits & (1 << (31 - i))) {
        r.setAttribute("class", "span");
      } else {
        r.setAttribute("class", "");
      }
    }
  }

  function encode_error() {
    var i, g = document.getElementById("encoded-bits");

    for (i = 0; i < g.childNodes.length; i++) {
      g.childNodes[i].childNodes[0].textContent = " ";
    }

    document.getElementById("encoded-shift").textContent = "---";
    document.getElementById("encoded-immediate").textContent = "-----";
  }

  function display_error(s) {
    var e = document.getElementById("encoder-output");

    e.textContent = s;
    e.className = "error";
  }

  function fill_span(value) {
    var i, b, r = 0,
      m = 0xffffffff,
      n = m;

    for (i = 0; i < 32; i++) {
      n = rol(value, i);

      if (n < m) {
        r = i;
        m = n;
      }
    };

    m--;
    m |= m >>> 1;
    m |= m >>> 2;
    m |= m >>> 4;
    m |= m >>> 8;
    m |= m >>> 16;
    m = m >>> 0;

    if (m > 0xff) {
      display_error("Rotated constant is too wide");
    } else {
      display_error("Constant requires odd rotation");
    }

    return ror(m, r);
  }

  function span_error(value) {
    var i, bits = fill_span(value),
      g = document.getElementById("decoded-bits"),
      r;

    for (i = 0; i < 32; i++) {
      r = g.childNodes[i].childNodes[0];

      if (bits & (1 << (31 - i))) {
        r.setAttribute("class", "error");
      } else {
        r.setAttribute("class", "");
      }
    }
  }

  function update() {
    var input = document.getElementById("input-number");
    var value = parseInt(input.value);

    bits(value);

    try {
      var encoded = encode(value),
        shift = (encoded >>> 8) & 0xF;
      encoded_bits(encoded);
      input.classList.remove("error");
      span(shift);
    } catch (e) {
      input.classList.add("error");
      encode_error();
      span_error(value);
    }
  }

  document.getElementById("form-encoding").onsubmit = function () {
    return false;
  };

  document.getElementById("button-rol").onclick = function () {
    modify(function (n) { return rol(n, 2); });
  };

  document.getElementById("button-ror").onclick = function () {
    modify(function (n) { return ror(n, 2); });
  };

  document.getElementById("button-inc").onclick = function () {
    modify(function (n) { return n + 1; });
  };

  document.getElementById("button-dec").onclick = function () {
    modify(function (n) { return n - 1; });
  };

  document.getElementById("input-number").onchange = update;
  document.getElementById("input-number").onkeyup = update;

  update();

  var examples = document.getElementById("encoding-examples").children;
  var i;

  function example() {
    var output = hex(parseInt(this.textContent), 8);
    document.getElementById("input-number").value = output;
    update();
    return false;
  }

  for (i = 0; i < examples.length; i++) {
    examples[i].onclick = example;
  }
})();
