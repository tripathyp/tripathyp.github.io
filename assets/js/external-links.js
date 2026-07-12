document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll('a[href]');
    links.forEach(function (link) {
        var href = link.getAttribute('href');
        if (!href || href.indexOf('#') === 0 || href.indexOf('mailto:') === 0 || href.indexOf('javascript:') === 0) {
            return;
        }
        try {
            var url = new URL(href, window.location.href);
            if (url.hostname && url.hostname !== window.location.hostname) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        } catch (e) {
            /* ignore malformed URLs */
        }
    });
});
