(function() {
    initScrolljack(MQ, true);
    spaceInit();
    animate(spaceWrapper);
})();

$(document).ready(function(){
    // init jquery smoothscroll and slider
  $('.portfolio__slider-js').slick({
      speed:1000,
      prevArrow:'.portfolio-nav__link--left',
      nextArrow:'.portfolio-nav__link--right'
  });

  $('a[href*="#"]').on('click', function (e) {
      // prevent default action and bubbling
      e.preventDefault();
      e.stopPropagation();
      // set target to anchor's "href" attribute
      var target = $(this).attr('href');
      // scroll to each target
      $(target).velocity('scroll', {
          duration: 1000,
          easing: 'ease-in-out'
      });
  });

});

(function() {
    'use strict';

    var portfolioContainer,
    aboutContainer,
    contactContainer,
    HEIGHT,
    WIDTH;

    init();

    function init(){
        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;

        portfolioContainer = document.querySelector('.portfolio-js');
        aboutContainer = document.querySelector('.about-js');
        contactContainer = document.querySelector('.contact-js');

        portfolioContainer.style.height = HEIGHT;
        aboutContainer.style.height = HEIGHT;
        contactContainer.style.height = HEIGHT;

    }

})();
