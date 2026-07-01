(function() {
    function getOuterHTMLSnippet(element) {
        const reOpeningTag = /^.*?>/;
        const match = element.outerHTML.match(reOpeningTag);
        return match && match[0];
    };

    function createSelectorsLabel(element) {
        let name = element.localName || '';
        const idAttr = element.getAttribute && element.getAttribute('id');
        if (idAttr) {
            name += `#${idAttr}`;
        }
        // svg elements return SVGAnimatedString for .className, which is an object.
        // Stringify classList instead.
        if (element.classList) {
            const className = element.classList.toString();
            if (className) {
                name += `.${className.trim().replace(/\s+/g, '.')}`;
            }
        } else if (ShadowRoot.prototype.isPrototypeOf(element)) {
            name += '#shadow-root';
        }

        return name;
    };

    function elementPathInDOM(element) {
        const visited = new Set();
        const path = [createSelectorsLabel(element)];
        let node = element;
        while (node) {
            visited.add(node);

            // Anchor elements have a .host property. Be sure we've found a shadow root
            // host and not an anchor.
            if (ShadowRoot.prototype.isPrototypeOf(node)) {
                const isShadowHost = node.host && node.localName !== 'a';
                node = isShadowHost ? node.host : node.parentElement;
            } else {
                const isShadowHost = node.parentNode && node.parentNode.host &&
                    node.parentNode.localName !== 'a';
                node = isShadowHost ? node.parentNode.host : node.parentElement;
            }

            if (visited.has(node)) {
                node = null;
            }

            if (node) {
                path.unshift(createSelectorsLabel(node));
            }
        }
        return path;
    };
    return (function getDOMStats(element, deep = true) {
        let deepestNode = null;
        let maxDepth = 0;
        let maxWidth = 0;
        let parentWithMostChildren = null;

        /**
         * @param {Element} element
         * @param {number} depth
         */
        const _calcDOMWidthAndHeight = function(element, depth = 1) {
            if (depth > maxDepth) {
                deepestNode = element;
                maxDepth = depth;
            }
            if (element.children.length > maxWidth) {
                parentWithMostChildren = element;
                maxWidth = element.children.length;
            }

            let child = element.firstElementChild;
            while (child) {
                _calcDOMWidthAndHeight(child, depth + 1);
                // If node has shadow dom, traverse into that tree.
                if (deep && child.shadowRoot) {
                    _calcDOMWidthAndHeight(child.shadowRoot, depth + 1);
                }
                child = child.nextElementSibling;
            }

            return { maxDepth, maxWidth };
        };

        const result = _calcDOMWidthAndHeight(element);

        return {
            depth: {
                max: result.maxDepth,
                pathToElement: elementPathInDOM(deepestNode),
                snippet: getOuterHTMLSnippet(deepestNode),
            },
            width: {
                max: result.maxWidth,
                pathToElement: elementPathInDOM(parentWithMostChildren),
                snippet: getOuterHTMLSnippet(parentWithMostChildren),
            },
        };
    }(document.documentElement));
})()