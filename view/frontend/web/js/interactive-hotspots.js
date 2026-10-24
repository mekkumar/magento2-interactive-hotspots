require(['jquery'], function ($) {
    'use strict';

    var hotspotSelector = '.kumar-interactive-hotspots__point';

    $(document).on('click', hotspotSelector, function (event) {
        var $point = $(this);
        var url = $point.attr('data-url') || '';

        if (/^https?:\/\//i.test(url)) {
            event.preventDefault();
            window.open(url, 'noopener,noreferrer');
            return;
        }

        event.preventDefault();

        $(hotspotSelector).not($point).removeClass('is-open');
        $point.toggleClass('is-open');
    });

    $(document).on('click', function (event) {
        if (!$(event.target).closest(hotspotSelector).length) {
            $(hotspotSelector).removeClass('is-open');
        }
    });

    $(document).on('keydown', function (event) {
        if (event.key === 'Escape') {
            $(hotspotSelector).removeClass('is-open');
        }
    });
});