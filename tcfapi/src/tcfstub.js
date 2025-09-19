// =============================================================================
// tcfStub.js - ES3/TV Compatible TCF API Stub
// =============================================================================

(function() {
    "use strict";
    
    // Simple queue array for storing __tcfapi calls
    var tcfApiQueue = [];

    // Stub implementation of __tcfapi that queues all calls
    window.__tcfapi = function(command, version, callback, parameter) {
        // Store all parameters in the queue
        tcfApiQueue.push({
            command: command,
            version: version,
            callback: callback,
            parameter: parameter
        });
    };

    // When the real implementation loads, it calls this to process the queue
    window.__tcfapi.pushQueue = function(realTcApiFunction) {
        // Process each queued entry
        while (tcfApiQueue.length > 0) {
            var entry = tcfApiQueue.shift();
            try {
                // Forward to the real __tcfapi function
                realTcApiFunction(
                    entry.command,
                    entry.version,
                    entry.callback,
                    entry.parameter
                );
            } catch (e) {
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn('[tcfapi-stub] Error processing queue:', e);
                }
            }
        }
    };

})();