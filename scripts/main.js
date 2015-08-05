'use strict'

window.$ = window.jQuery = require('jquery');
var easing = require('jquery.easing');
var bootstrap = require('bootstrap-sass');
var WOW = require('wow');


$('document').ready (function() {
    
    new WOW().init();

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeOutExpo');
        event.preventDefault();
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // if ($(window).width() > '1024') {
    //     $(window).stellar();
    // }; 
});
