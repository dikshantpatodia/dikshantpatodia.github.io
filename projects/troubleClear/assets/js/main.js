! function() {
    "use strict";
    var j = function() {
        var a = 0;
        $(".animate-box").waypoint(function(b) {
            "down" !== b || $(this.element).hasClass("animated") || (a++, $(this.element).addClass("item-animate"), setTimeout(function() {
                $("body .animate-box.item-animate").each(function(a) {
                    var b = $(this);
                    setTimeout(function() { b.addClass("fadeInUp animated"), b.removeClass("item-animate") }, 200 * a, "easeInOutExpo")
                })
            }, 100))
        }, { offset: "85%" })
    };
    $(function() { j() })
}();