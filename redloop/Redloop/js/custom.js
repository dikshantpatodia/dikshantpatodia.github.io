/* -- Full Screen Viewport Container
 ---------------------------- */
fullScreenContainer();

$(document).ready(function() {

    //owlCarousel();
    //magnificPopup();
    init();

    var trigger = $('.hamburger'),
        overlay = $('.overlay'),
        isClosed = false;

    trigger.click(function() {
        hamburger_cross();
    });

    function hamburger_cross() {

        if (isClosed == true) {
            overlay.hide();
            trigger.removeClass('is-open');
            trigger.addClass('is-closed');
            isClosed = false;
        } else {
            overlay.show();
            trigger.removeClass('is-closed');
            trigger.addClass('is-open');
            isClosed = true;
        }
    }

    $('[data-toggle="offcanvas"]').click(function() {
        $('#wrapper').toggleClass('toggled');
    });

    $('.overlay').click(function() {
        $('#wrapper').toggleClass('toggled');
        hamburger_cross();
    });

    $('#contactForm').on('submit', function(e) {
        e.preventDefault();
        var name = $("input#name").val();
        var phone = $("input#phone").val();
        var email = $("input#email").val();
        var message = $("textarea#message").val();

        var $btn = $('button', '.submit-button');

        $btn.attr('disabled', true);

        sendMail({
            name: name,
            phone: phone,
            from_email: email,
            message: message
        }).then(function(response) {
            console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
            // Success message
            $('#success').html("<div class='alert alert-success'>");
            $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                .append("</button>");
            $('#success > .alert-success')
                .append("<strong>Your message has been sent. </strong>");
            $('#success > .alert-success')
                .append('</div>');

            //clear all fields
            $('#contactForm').trigger("reset");
            $btn.attr('disabled', false);
        }, function(err) {
            console.log("FAILED. error=", err);
            // Fail message
            $('#success').html("<div class='alert alert-danger'>");
            $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                .append("</button>");
            $('#success > .alert-danger').append("<strong>Sorry " + name + " it seems that my mail server is not responding...</strong>");
            $('#success > .alert-danger').append('</div>');
            //clear all fields
            $('#contactForm').trigger("reset");
            $btn.attr('disabled', false)
        });

    })

});


/* --- initialize functions on window load here -------------- */

function init() {
    //tooltips();
    scrollAnchor();
    toggleContactForm();
}

function sendMail(data) {
    return emailjs.send("gmail", "template_78ZXkLdA", data);
}

/* --- Full Screen Container ------------- */

function fullScreenContainer() {

    // Set Initial Screen Dimensions

    var screenWidth = $(window).width() + "px";
    var screenHeight = $(window).height() + "px";

    $("#intro, #intro .item, #intro-video").css({
        width: screenWidth,
        height: screenHeight
    });

    // Every time the window is resized...

    $(window).resize(function() {

        // Fetch Screen Dimensions

        var screenWidth = $(window).width() + "px";
        var screenHeight = $(window).height() + "px";

        // Set Slides to new Screen Dimensions

        $("#intro, #intro .item, #intro-video, #intro-video .item").css({
            width: screenWidth,
            height: screenHeight
        });

    });

}


/* --- Show/Hide Contact Form ------------------- */

function toggleContactForm() {
    $('.contact-button').click(function() {
        $(this).toggleClass('active');
        $('.contact-form').slideToggle(300);
    });
}


/* --- Scroll to Anchor ------------------- */

function scrollAnchor() {

    // scroll to specific anchor
    $('.scroll').click(function() {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 350);
                return false;
            }
        }
    });

}


/*When clicking on Full hide fail/success boxes */
$('#name').focus(function() {
    $('#success').html('');
});