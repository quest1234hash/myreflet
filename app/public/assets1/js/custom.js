/* Js for Showing and hiding scrolltop button */
$(window).scroll(function () {
    /* Show hide scrolltop button */
    if ($(window).scrollTop() == 0) {
        $('.scroll_top').stop(false, true).fadeOut(600);
    } else {
        $('.scroll_top').stop(false, true).fadeIn(600);
    }
});

/* JS for scroll top */
$(document).on('click', '.scroll_top', function () {
    $('body,html').animate({scrollTop: 0}, 400);
    return false;
});




/*----wow initialization-----*/
wow = new WOW(
        {
            animateClass: 'animated',
            offset: 100,
            callback: function (box) {
                console.log("WOW: animating <" + box.tagName.toLowerCase() + ">")
            }
        }
);
wow.init();
/*----wow end-----*/
























