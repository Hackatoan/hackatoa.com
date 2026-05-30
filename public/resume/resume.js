document.addEventListener("DOMContentLoaded", function() {
  var btn = document.getElementById("dl-btn");
  if (btn) btn.addEventListener("click", function() { window.print(); });
});
