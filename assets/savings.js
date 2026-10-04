/* Savings calculator: one process, your numbers, capped at 80%. Used by /savings/ and /flow/. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var f = function (n) { return Math.round(n).toLocaleString('en-US'); };
  function run() {
    var ppl = +$('ppl').value, cost = +$('cost').value, share = +$('share').value / 100, auto = Math.min(80, +$('auto').value) / 100;
    var ar = document.documentElement.lang === 'ar', cur = ar ? ' درهم' : '', pre = ar ? '' : 'AED ';
    $('pplV').textContent = ppl; $('costV').textContent = f(cost); $('shareV').textContent = Math.round(share * 100) + '%'; $('autoV').textContent = Math.round(auto * 100) + '%';
    var oc = ppl * cost * share, sv = oc * auto;
    $('oc').textContent = pre + f(oc) + cur; $('sv').textContent = pre + f(sv) + cur; $('yr').textContent = pre + f(sv * 12) + cur;
    $('hr').textContent = f(ppl * 160 * share * auto);
  }
  ['ppl', 'cost', 'share', 'auto'].forEach(function (id) { $(id).addEventListener('input', run); });
  window.onLangChange = run; run();
})();
