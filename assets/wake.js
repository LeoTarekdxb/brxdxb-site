/* BRX wake: the switch and the Signal Bond wall.
   Port of Pattern/Signal_Bond.html (p5) to plain canvas: running-bond bricks, a green signal
   spreads from the switch knob with noise-shaped hesitation. Seeded, deterministic, no deps.
   Untouched bricks are not drawn, so whatever sits behind the canvas (the film) shows through. */
(function () {
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function makeNoise(seed) {
    var rnd = mulberry32(seed * 7919), p = new Float32Array(512);
    for (var i = 0; i < 512; i++) p[i] = rnd();
    function h(x, y) { return p[((x * 73856093) ^ (y * 19349663)) & 511]; }
    function sm(t) { return t * t * (3 - 2 * t); }
    function n1(x, y) {
      var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      var a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
      var u = sm(xf), v = sm(yf);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    return function (x, y) { return (n1(x, y) * 0.65 + n1(x * 2.1, y * 2.1) * 0.35); };
  }
  function mix(a, b, k) { return Math.round(a + (b - a) * k); }

  function Wall(canvas, opt) {
    opt = opt || {};
    this.c = canvas; this.ctx = canvas.getContext('2d');
    this.seed = opt.seed || 12345;
    this.hes = opt.hesitation == null ? 0.55 : opt.hesitation;
    this.mortar = opt.mortar == null ? 0.16 : opt.mortar;
    this.alpha = opt.alpha == null ? 0.92 : opt.alpha;
    this.colsFn = opt.cols || function (w) { return w < 700 ? 22 : 40; };
    this.duration = opt.duration || 2400;
    this.onDone = opt.onDone || null;
    this.state = 'off';
    this.resize();
  }
  Wall.prototype.resize = function () {
    var r = this.c.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
    this.c.width = Math.round(this.w * dpr); this.c.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cols = this.colsFn(this.w);
    this.bw = this.w / this.cols; this.bh = this.bw / 2.1; this.gap = this.bw * this.mortar * 0.5;
    this.rows = Math.ceil(this.h / this.bh) + 1;
    this.build();
    if (this.state === 'done') this.fillNow();
  };
  Wall.prototype.build = function () {
    var noise = makeNoise(this.seed), b = [], idx = {};
    for (var r = 0; r < this.rows; r++) for (var c = -1; c <= this.cols; c++) {
      var o = { r: r, c: c, s: 0, when: 0, res: noise(c * 0.18 + 7, r * 0.18 + 3) };
      idx[r + ':' + c] = o; b.push(o);
    }
    this.bricks = b; this.idx = idx; this.arrival = 0;
  };
  Wall.prototype.nb = function (b) {
    var out = [], odd = b.r % 2, I = this.idx, k;
    // same row
    k = I[b.r + ':' + (b.c - 1)]; if (k && !k.s) out.push(k);
    k = I[b.r + ':' + (b.c + 1)]; if (k && !k.s) out.push(k);
    // rows above/below: running bond touches c and c+1 (odd row) or c-1 and c (even row)
    for (var dr = -1; dr <= 1; dr += 2) {
      var rr = b.r + dr, c1 = odd ? b.c : b.c - 1, c2 = odd ? b.c + 1 : b.c;
      k = I[rr + ':' + c1]; if (k && !k.s) out.push(k);
      k = I[rr + ':' + c2]; if (k && !k.s) out.push(k);
    }
    return out;
  };
  Wall.prototype.draw = function (b) {
    var x = b.c * this.bw + (b.r % 2 ? this.bw / 2 : 0), y = b.r * this.bh, ctx = this.ctx;
    ctx.clearRect(x, y, this.bw, this.bh);
    if (b.s === 2) ctx.fillStyle = 'rgba(67,176,42,' + this.alpha + ')';
    else {
      var k = 1 - 0.02 * (b.when / Math.max(1, this.arrival));
      ctx.fillStyle = 'rgba(' + mix(255, 134, k) + ',' + mix(255, 188, k) + ',' + mix(255, 37, k) + ',' + this.alpha + ')';
    }
    var w = this.bw - 2 * this.gap, h = this.bh - 2 * this.gap, rad = this.bw * 0.06;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x + this.gap, y + this.gap, w, h, rad); else ctx.rect(x + this.gap, y + this.gap, w, h);
    ctx.fill();
  };
  Wall.prototype.start = function (px, py) {
    this.stop(); this.ctx.clearRect(0, 0, this.w, this.h); this.build();
    this.rnd = mulberry32(this.seed);
    var r = Math.max(0, Math.min(this.rows - 1, Math.floor(py / this.bh)));
    var c = Math.max(0, Math.min(this.cols - 1, Math.floor((px - (r % 2 ? this.bw / 2 : 0)) / this.bw)));
    var s = this.idx[r + ':' + c]; s.s = 2; this.front = [s]; this.draw(s);
    this.state = 'running';
    // steps needed ~ distance to the far corner; spread them over `duration`
    var far = Math.max(r, this.rows - r) + Math.max(c, this.cols - c) * 1.2;
    this.stepMs = this.duration / (far * (1 + this.hes));
    this.acc = 0; this.last = performance.now();
    var self = this;
    (function loop(now) {
      if (self.state !== 'running') return;
      self.acc += now - self.last; self.last = now;
      var n = 0;
      while (self.acc >= self.stepMs && n < 8) { self.acc -= self.stepMs; self.step(); n++; }
      if (self.state === 'running') self.raf = requestAnimationFrame(loop);
    })(this.last);
  };
  Wall.prototype.step = function () {
    var next = [], keep = [], rnd = this.rnd, i, j, b, ns;
    for (i = 0; i < this.front.length; i++) {
      b = this.front[i]; ns = this.nb(b);
      for (j = 0; j < ns.length; j++) {
        var n = ns[j];
        if (!n.s && rnd() < 1 - this.hes * n.res) { n.s = 2; this.arrival++; n.when = this.arrival; next.push(n); this.draw(n); }
      }
      if (this.nb(b).length) keep.push(b); else if (b.s === 2) { b.s = 1; this.draw(b); }
    }
    for (i = 0; i < keep.length; i++) if (keep[i].s === 2 && next.indexOf(keep[i]) < 0) { keep[i].s = 1; this.draw(keep[i]); }
    this.front = next.concat(keep);
    if (!this.front.length) {
      for (i = 0; i < this.bricks.length; i++) if (this.bricks[i].s !== 1) { this.bricks[i].s = 1; this.draw(this.bricks[i]); }
      this.state = 'done'; if (this.onDone) this.onDone();
    }
  };
  Wall.prototype.fillNow = function () {
    this.stop(); this.ctx.clearRect(0, 0, this.w, this.h);
    this.arrival = this.bricks.length;
    for (var i = 0; i < this.bricks.length; i++) { var b = this.bricks[i]; b.s = 1; b.when = i; this.draw(b); }
    this.state = 'done';
  };
  Wall.prototype.clear = function () { this.stop(); this.ctx.clearRect(0, 0, this.w, this.h); this.build(); this.state = 'off'; };
  Wall.prototype.stop = function () { if (this.raf) cancelAnimationFrame(this.raf); this.raf = null; };

  /* Switch controller: any button[role=switch][data-wake] flips, the host listens for 'brx:switch'. */
  function Wake(root, opt) {
    opt = opt || {};
    this.root = root;
    this.sw = root.querySelector('[data-wake-switch]');
    this.canvas = root.querySelector('[data-wake-wall]');
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var self = this;
    this.wall = this.canvas ? new Wall(this.canvas, opt) : null;
    this.on = false;
    if (this.sw) this.sw.addEventListener('click', function () { self.set(!self.on, 'tap'); });
    var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { if (self.wall) self.wall.resize(); }, 150); });
  }
  Wake.prototype.set = function (on, why) {
    if (on === this.on) return;
    this.on = on;
    this.sw.setAttribute('aria-checked', String(on));
    this.root.classList.toggle('is-on', on);
    if (this.wall) {
      if (!on) this.wall.clear();
      else if (this.reduce) this.wall.fillNow();
      else {
        var k = this.sw.querySelector('.knob') || this.sw, kr = k.getBoundingClientRect(), cr = this.canvas.getBoundingClientRect();
        this.wall.start(kr.left + kr.width / 2 - cr.left, kr.top + kr.height / 2 - cr.top);
      }
    }
    this.root.dispatchEvent(new CustomEvent('brx:switch', { detail: { on: on, why: why || '' } }));
  };

  window.BRXWall = Wall;
  window.BRXWake = Wake;
})();
