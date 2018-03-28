(function (global) {
    function dom(tagName, options, content) {
        var result = document.createElement(tagName);
        if (options && typeof options === typeof {}) {
            for (var key in options) {
                if (!options.hasOwnProperty(key)) continue;
                result.setAttribute(key, options[key].toString());
            }
        }
        if (content) {
            appendContent(result, content);
        }
        return result;
    }
    function appendContent(el, content) {
        if (typeof content === typeof '')
            el.innerHTML = content;
        else if (content instanceof HTMLElement)
            el.appendChild(content);
        else if (Array.isArray(content))
            content.forEach(function (c) { appendContent(el, c); });
    }

    global.dom = dom;
})(window);
