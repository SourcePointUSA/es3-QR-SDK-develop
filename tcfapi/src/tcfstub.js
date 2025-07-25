// tcfapi-stub.js

(function() {
  // --------------------------------------------------------------------------------
  // 1) Wir legen ein einfaches Array an, in dem alle __tcfapi-Aufrufe zwischengespeichert werden:
  // --------------------------------------------------------------------------------
  var tcfApiQueue = [];

  // --------------------------------------------------------------------------------
  // 2) Stub-Implementierung von __tcfapi, die nur in die Queue schreibt:
  // --------------------------------------------------------------------------------
  window.__tcfapi = function(command, version, callback, parameter) {
    // Alle Parameter in die Queue packen
    tcfApiQueue.push({
      command:   command,
      version:   version,
      callback:  callback,
      parameter: parameter
    });
  };

  // --------------------------------------------------------------------------------
  // 3) Sobald die „echte“ Implementierung von __tcfapi geladen ist, soll sie uns
  //    das Queue-Array übergeben – damit die Aufrufe nachträglich abgearbeitet werden:
  // --------------------------------------------------------------------------------
  window.__tcfapi.pushQueue = function(realTcApiFunction) {
    // 'realTcApiFunction' ist später der Verweis auf die echte __tcfapi-Funktion
    // Wir leiten jeden einzelnen gespeicherten Eintrag weiter:
    while (tcfApiQueue.length) {
      var entry = tcfApiQueue.shift();
      try {
        // Aufruf an die echte __tcfapi-Funktion:
        realTcApiFunction(
          entry.command,
          entry.version,
          entry.callback,
          entry.parameter
        );
      } catch (e) {
        console.warn('[tcfapi-stub] Fehler beim Abarbeiten der Queue:', e);
      }
    }
  };

  // --------------------------------------------------------------------------------
  // 4) Falls später die echte __tcfapi‐Implementierung lädt und sich meldet, wird
  //    sie diese pushQueue()-Methode aufrufen:
  // --------------------------------------------------------------------------------
})();
