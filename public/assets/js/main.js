(function () {

  window.onload = function () {
    const p = document.querySelector('.preloader');
    if (p) {
      window.setTimeout(() => {
        p.style.opacity = "0";
        p.style.display = "none";
      }, 500);
    }
  }

  window.onscroll = function () {
    const back = document.querySelector('.scroll-top');
    if (back) {
      back.style.display =
        (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50)
          ? 'flex'
          : 'none';
    }
  }

})();
