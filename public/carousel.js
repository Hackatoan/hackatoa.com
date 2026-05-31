(function () {
  var imgs, idx = 0;
  function cycle() {
    imgs[idx].classList.remove('carousel-img--active');
    idx = (idx + 1) % imgs.length;
    imgs[idx].classList.add('carousel-img--active');
  }
  document.addEventListener('DOMContentLoaded', function () {
    imgs = document.querySelectorAll('.avatar-carousel .carousel-img');
    if (imgs.length > 1) setInterval(cycle, 10000);
  });
})();
