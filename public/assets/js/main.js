(function () {

  //===== Preloader
  window.onload = function () {
    window.setTimeout(fadeout, 500);
  }

  function fadeout() {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      preloader.style.display = 'none';
    }
  }

  /*=====================================
  Sticky
  =======================================*/
  window.onscroll = function () {

    const header_navbar = document.querySelector(".navbar-area");
    if (!header_navbar) return;

    const sticky = header_navbar.offsetTop;

    const backToTo = document.querySelector(".scroll-top");
    if (backToTo) {
      if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        backToTo.style.display = "flex";
      } else {
        backToTo.style.display = "none";
      }
    }
  };

  //===== mobile-menu-btn
  const navbarToggler = document.querySelector(".mobile-menu-btn");
  if (navbarToggler) {
    navbarToggler.addEventListener('click', function () {
      navbarToggler.classList.toggle("active");
    });
  }

})();
