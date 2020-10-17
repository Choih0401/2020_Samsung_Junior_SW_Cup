$(document).ready(function(){

  //-----------------------------
  //SMOOTH SCROLL
  //https://www.paulund.co.uk/smooth-scroll-to-internal-links-with-jquery
  //-----------------------------
  $('a[href^="#"]').on('click',function (e) {
      e.preventDefault();

      var target = this.hash;
      var $target = $(target);

      $('html, body').stop().animate({
          'scrollTop': $target.offset().top
      }, 900, 'swing');
  });

  // WOW.JS //
  new WOW().init();

  
}); /* document.ready */