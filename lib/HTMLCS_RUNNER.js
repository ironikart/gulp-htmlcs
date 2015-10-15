/**
 * Dedicated runner and JSON outputter for HTMLCS
 */
/*global HTMLCS*/
'use strict';

/*eslint no-unused-vars: 0*/
window.HTMLCS_RUNNER = new function() {
    function getMessageType(msg) {
        var typeName = 'UNKNOWN';
        switch (msg.type) {
            case HTMLCS.ERROR:
                typeName = 'ERROR';
            break;

            case HTMLCS.WARNING:
                typeName = 'WARNING';
            break;

            case HTMLCS.NOTICE:
                typeName = 'NOTICE';
            break;
        }
        return typeName;
    }

    this.run = function(standard, cb) {
        HTMLCS.process(standard, document, function() {
            var messages = HTMLCS.getMessages()
            .map(function(msg) {
                // Get the nodeName for the element
                if (msg.element) {
                    msg.nodeName = msg.element.nodeName.toLowerCase();
                }
                return msg;
            })
            .map(function(msg) {
                // Gather contextual HTML fragment
                if (msg.element.outerHTML) {
                    var node = msg.element.cloneNode(true);
                    node.innerHTML = '...';
                    msg.contextHTML = node.outerHTML;
                }
                return msg;
            })
            .map(function(msg) {
                msg.type = getMessageType(msg);
                return msg;
            });

            messages.forEach(function(msg) {
                console.log(JSON.stringify({
                    type:     msg.type,
                    code:     msg.code,
                    nodeName: msg.nodeName,
                    html:     msg.contextHTML,
                    msg:      msg.msg
                }, true));
            });

            console.log('done');
            cb();
        }, function() {
            console.log('Something in HTML_CodeSniffer failed to parse. Cannot run.');
            console.log('done');
            cb();
        });
    };
};
