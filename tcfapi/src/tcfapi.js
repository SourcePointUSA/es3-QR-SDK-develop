// =============================================================================
// tcfapi.js - Complete ES3-compatible version for TV devices
// =============================================================================


// ---- ES3 TCF v2.x Decoder – core (spec order) + TCModel-like bitsets ----
(function (global) {
  var ALPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  var NUM_PURPOSES = 24;
  var NUM_SF = 12;

  function b64ToBytes(s) {
    var arr = [], buf = 0, bc = 0, i, v;
    for (i = 0; i < s.length; i++) {
      v = ALPH.indexOf(s.charAt(i));
      if (v < 0) continue;
      buf = (buf << 6) | v;
      bc += 6;
      if (bc >= 8) { bc -= 8; arr.push((buf >> bc) & 255); }
    }
    return arr;
  }

  function BR(bytes) { this.b = bytes; this.i = 0; }
  BR.prototype.bits = function (n) {
    var r = 0, k, bi, bb, off;
    for (k = 0; k < n; k++) {
      bi = this.i >> 3;
      bb = (bi < this.b.length) ? (this.b[bi] & 255) : 0;
      off = 7 - (this.i & 7);
      r = (r << 1) | ((bb >> off) & 1);
      this.i++;
    }
    return r;
  };
  function readBool(br){ return !!br.bits(1); }
  function readLang(br){
    var a = br.bits(6), b = br.bits(6);
    return String.fromCharCode(65 + a, 65 + b);
  }
  function readBitset(br, count) {
    var map = {}, i;
    for (i = 1; i <= count; i++) map[i] = readBool(br);
    return map;
  }
  function readVendorSection(br, maxId) {
    var isRange = readBool(br);
    var map = {}, i, n, isRangeEntry, startId, endId, id;
    if (isRange) {
      // Range-based encoding
      n = br.bits(12);
      for (i = 0; i < n; i++) {
        isRangeEntry = readBool(br);  // 0=single, 1=range
        startId = br.bits(16);
        if (isRangeEntry) {
          // Bit is 1: It's a range, read end ID
          endId = br.bits(16);
        } else {
          // Bit is 0: Single vendor, end = start
          endId = startId;
        }
        for (id = startId; id <= endId; id++) {
          map[id] = true;
        }
      }
    } else {
      // BitField encoding: one bit per vendor from 1 to maxId
      for (id = 1; id <= maxId; id++) {
        map[id] = readBool(br);
      }
    }
    return map;
  }
  function toTCMBitSet(obj) {
    var max = 0, k, n;
    for (k in obj) {
      if (obj.hasOwnProperty(k) && obj[k]) {  // Only count keys with TRUE value
        n = +k;
        if (n > max) max = n;
      }
    }
    return {
      maxId_: max,
      has: function (id) { return !!obj[id]; }
    };
  }

  function decode(tcString) {
    var parts = String(tcString || '').split('.');
    if (!parts[0]) throw new Error('Empty TCString');
    var br = new BR(b64ToBytes(parts[0]));

    var out = {};
    out.version = br.bits(6);
    if (out.version !== 2) throw new Error('Unsupported TCF version: ' + out.version);

    out.created = br.bits(36);
    out.lastUpdated = br.bits(36);
    out.cmpId = br.bits(12);
    out.cmpVersion = br.bits(12);
    out.consentScreen = br.bits(6);
    out.consentLanguage = readLang(br);
    out.vendorListVersion = br.bits(12);
    out.tcfPolicyVersion = br.bits(6);

    out.isServiceSpecific = readBool(br);
    out.useNonStandardStacks = readBool(br);

    var sfMap = readBitset(br, NUM_SF);
    var pcMap = readBitset(br, NUM_PURPOSES);
    var pliMap = readBitset(br, NUM_PURPOSES);

    out.purposeOneTreatment = readBool(br);
    out.publisherCC = readLang(br);

    var maxVendorId1 = br.bits(16);
    var vcMap = readVendorSection(br, maxVendorId1);

    var maxVendorId2 = br.bits(16);
    var vliMap = readVendorSection(br, maxVendorId2);

    var prCount = br.bits(12), i, j;
    var prs = [];
    for (i = 0; i < prCount; i++) {
      var purposeId = br.bits(6);
      var restrictionType = br.bits(2);
      var numEntries = br.bits(12);
      var ranges = [];
      for (j = 0; j < numEntries; j++) {
        var single = readBool(br);
        var start = br.bits(16);
        var end = single ? start : br.bits(16);
        ranges.push({ start: start, end: end });
      }
      prs.push({ purposeId: purposeId, restrictionType: restrictionType, ranges: ranges });
    }

    out.specialFeatureOptins = toTCMBitSet(sfMap);
    out.purposeConsents = toTCMBitSet(pcMap);
    out.purposeLegitimateInterests = toTCMBitSet(pliMap);
    out.vendorConsents = toTCMBitSet(vcMap);
    out.vendorLegitimateInterests = toTCMBitSet(vliMap);
    out.publisherRestrictions = { 
      getRestrictions: function(){ return prs; }, 
      getVendors: function(){ return []; } 
    };

    out.publisherConsents = toTCMBitSet({});
    out.publisherLegitimateInterests = toTCMBitSet({});
    out.publisherCustomConsents = toTCMBitSet({});
    out.publisherCustomLegitimateInterests = toTCMBitSet({});

    out.gvlVersion = out.vendorListVersion;

    return out;
  }

  global.TCString = { decode: decode };
})(this);


var TCString = (this && this.TCString) || window.TCString || {};

// -----------------------------------------------------------------------------
// (A) Define initial API function and process stub queue
// -----------------------------------------------------------------------------
var realApi = window.__tcfapi; 

window.__tcfapi = function(command, version, callback, parameter) {
  // Placeholder
};

if (realApi && typeof realApi.pushQueue === 'function') {
  realApi.pushQueue(window.__tcfapi);
}

// =============================================================================
// (B) Helper functions - ES3 compatible
// =============================================================================

function decodeTCString(tcString) {
  try {
    return TCString.decode(tcString);
  } catch (err) {
    throw new Error('Error Decoding the TC-Strings: ' + err.message);
  }
}

window.decodeTCString = decodeTCString;

function stripQuotes(str) {
  if (typeof str === 'string' && str.length >= 2 && str[0] === '"' && str[str.length - 1] === '"') {
    return str.substring(1, str.length - 1);
  }
  return str;
}

function readStoredTCString() {
  try {
    var pid = window._sp_ && window._sp_.config && window._sp_.config.propertyId;
    var key = pid ? ('euconsent-v2_' + pid) : null;

    if (key) {
      if (window.localStorage) {
        var val = localStorage.getItem(key);
        if (val) return stripQuotes(val);
      }
      var name = key + '=';
      var allCookies = document.cookie.split(';');
      for (var i = 0; i < allCookies.length; i++) {
        var cookie = allCookies[i].trim();
        if (cookie.indexOf(name) === 0) {
          var cookieVal = decodeURIComponent(cookie.substring(name.length));
          return stripQuotes(cookieVal);
        }
      }
    }
 
    if (window.localStorage && typeof window.localStorage.length === 'number') {
      for (var j = 0; j < localStorage.length; j++) {
        var k = localStorage.key(j);
        if (k && k.indexOf('euconsent-v2_') === 0) {
          var v = localStorage.getItem(k);
          if (v) return stripQuotes(v);
        }
      }
    }

    var parts = document.cookie.split(';');
    for (var c = 0; c < parts.length; c++) {
      var raw = parts[c].trim();
      if (raw.indexOf('euconsent-v2_') === 0) {
        var spl = raw.split('=');
        if (spl.length >= 2) {
          var val2 = spl.slice(1).join('=');
          return stripQuotes(decodeURIComponent(val2));
        }
      }
    }

    return '';
  } catch (e) {
    return '';
  }
}

function readStoredAddtlConsent() {
  try {
    var pid = window._sp_ && window._sp_.config && window._sp_.config.propertyId;
    if (!pid) return '';
    var key = 'addtl_consent_' + pid;

    if (window.localStorage) {
      var val = localStorage.getItem(key);
      if (val) return stripQuotes(val);
    }

    var name = key + '=';
    var allCookies = document.cookie.split(';');
    for (var i = 0; i < allCookies.length; i++) {
      var cookie = allCookies[i].trim();
      if (cookie.indexOf(name) === 0) {
        var cookieVal = decodeURIComponent(cookie.substring(name.length));
        return stripQuotes(cookieVal);
      }
    }
    return '';
  } catch (e) {
    return '';
  }
}

function storeAddtlConsent(addtlConsent) {
  if (!addtlConsent) return;
  
  try {
    var pid = window._sp_ && window._sp_.config && window._sp_.config.propertyId;
    if (!pid) return;
    var key = 'addtl_consent_' + pid;

    if (window.localStorage) {
      localStorage.setItem(key, addtlConsent);
    } else {
      var d = new Date();
      d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
      document.cookie =
        key + '=' + encodeURIComponent(addtlConsent) +
        ';expires=' + d.toUTCString() + ';path=/';
    }
  } catch (e) {
    console.error('[tcf-bridge] Error storing addtlConsent:', e);
  }
}

function bitFieldToObject(bitField, maxId) {
  var result = {};
  if (!bitField || typeof bitField.has !== 'function') {
    for (var i = 1; i <= maxId; i++) {
      result[i] = false;
    }
    return result;
  }
  for (var i = 1; i <= maxId; i++) {
    result[i] = !!bitField.has(i);
  }
  return result;
}

function decodePublisherRestrictions(pubRestrictions) {
  var decoded = [];
  if (!pubRestrictions || typeof pubRestrictions.getRestrictions !== 'function') {
    return decoded;
  }
  var allRestrictions = pubRestrictions.getRestrictions();
  
  // ES3: Replace forEach with for loop
  for (var i = 0; i < allRestrictions.length; i++) {
    var purposeRestriction = allRestrictions[i];
    var vendors = pubRestrictions.getVendors(purposeRestriction);
    decoded.push({
      purposeId: purposeRestriction.purposeId,
      restrictionType: purposeRestriction.restrictionType,
      vendors: vendors
    });
  }
  return decoded;
}

function isUIVisible() {
  var config = window._sp_ && window._sp_.config;
  if (!config) return false;
  
  var messageDiv = config.messageDiv && document.getElementById(config.messageDiv);
  var pmDiv = config.pmDiv && document.getElementById(config.pmDiv);
  
  var isMessageVisible = messageDiv && 
    messageDiv.style.display !== 'none' && 
    messageDiv.offsetParent !== null;
    
  var isPMVisible = pmDiv && 
    pmDiv.style.display !== 'none' && 
    pmDiv.offsetParent !== null;
    
  return isMessageVisible || isPMVisible;
}

function getCMPInfo() {
  var tcString = readStoredTCString();
  var decoded = null;
  
  if (tcString) {
    try {
      decoded = decodeTCString(tcString);
    } catch (err) {
      console.warn('[tcf-bridge] Failed to decode TCString for CMP info');
    }
  }
  
  return {
    cmpId: (decoded && decoded.cmpId) || 6,
    cmpVersion: (decoded && decoded.cmpVersion) || 1,
    tcfPolicyVersion: (decoded && decoded.tcfPolicyVersion) || 2,
    gvlVersion: (decoded && decoded.gvlVersion) || 2,
    gdprApplies: window._sp_ && window._sp_.config && 
                 window._sp_.metaData && window._sp_.metaData.gdpr && 
                 window._sp_.metaData.gdpr.applies !== undefined ? 
                 window._sp_.metaData.gdpr.applies : true
  };
}

// ES3: Manual object merge function (replaces Object.assign)
function mergeObjects(target, source1, source2) {
  var result = {}, key;
  
  for (key in target) {
    if (target.hasOwnProperty(key)) {
      result[key] = target[key];
    }
  }
  
  if (source1) {
    for (key in source1) {
      if (source1.hasOwnProperty(key)) {
        result[key] = source1[key];
      }
    }
  }
  
  if (source2) {
    for (key in source2) {
      if (source2.hasOwnProperty(key)) {
        result[key] = source2[key];
      }
    }
  }
  
  return result;
}

function buildTCData(overrides) {
  var tcString = readStoredTCString();
  var addtlConsent = readStoredAddtlConsent();
  var decoded = null;

  if (tcString && window.decodeTCString) {
    try {
      decoded = window.decodeTCString(tcString);
    } catch (err) {
      console.warn('[tcf-bridge] Decoding failed:', err);
      decoded = null;
    }
  }

  if (!decoded) {
    var cmpInfo = getCMPInfo();
    var baseMinimal = {
      cmpId: cmpInfo.cmpId,
      cmpVersion: cmpInfo.cmpVersion,
      gdprApplies: cmpInfo.gdprApplies,
      tcfPolicyVersion: cmpInfo.tcfPolicyVersion,
      tcString: tcString || '',
      isServiceSpecific: false,
      useNonStandardTexts: false,
      publisherCC: window._sp_ && window._sp_.config && window._sp_.config.consentLanguage || 'EN',
      purposeOneTreatment: false,
      outOfBand: { allowedVendors: {}, disclosedVendors: {} },
      purpose: { consents: {}, legitimateInterests: {} },
      vendor: { consents: {}, legitimateInterests: {} },
      specialFeatureOptins: {},
      publisher: {
        consents: {},
        legitimateInterests: {},
        customPurpose: { consents: {}, legitimateInterests: {} },
        restrictions: []
      },
      addtlConsent: addtlConsent || '',
      enableAdvertiserConsentMode: false
    };
    return mergeObjects(baseMinimal, overrides || {});
  }

  var m = decoded;
  var maxPurposeId = (m.purposeConsents && m.purposeConsents.maxId_) || 0;
  var maxPurposes = Math.max(
    maxPurposeId,
    (m.purposeLegitimateInterests && m.purposeLegitimateInterests.maxId_) || 0
  );

  var maxConsentVendorId = (m.vendorConsents && m.vendorConsents.maxId_) || 0;
  var maxLegIntVendorId = (m.vendorLegitimateInterests && m.vendorLegitimateInterests.maxId_) || 0;
  var maxPublisherCustom = (m.publisherCustomConsents && m.publisherCustomConsents.maxId_) || 0;

  var base = {
    cmpId: m.cmpId || 6,
    cmpVersion: m.cmpVersion || 1,
    gdprApplies: m.gdprApplies !== undefined ? m.gdprApplies : true,
    tcfPolicyVersion: m.tcfPolicyVersion || 2,
    tcString: tcString,
    isServiceSpecific: m.isServiceSpecific || false,
    useNonStandardTexts: m.useNonStandardTexts || false,
    publisherCC: m.publisherCC || 'EN',
    purposeOneTreatment: m.purposeOneTreatment || false,
    outOfBand: {
      allowedVendors: m.outOfBandAllowedVendors || {},
      disclosedVendors: m.outOfBandDisclosedVendors || {}
    },
    purpose: {
      consents: bitFieldToObject(m.purposeConsents, 11),
      legitimateInterests: bitFieldToObject(m.purposeLegitimateInterests, 11)
    },
    vendor: {
      consents: bitFieldToObject(m.vendorConsents, maxConsentVendorId),
      legitimateInterests: bitFieldToObject(m.vendorLegitimateInterests, maxLegIntVendorId)
    },
    specialFeatureOptins: bitFieldToObject(
      m.specialFeatureOptins,
      (m.specialFeatureOptins && m.specialFeatureOptins.maxId_) || 0
    ),
    publisher: {
      consents: bitFieldToObject(
        m.publisherConsents,
        (m.publisherConsents && m.publisherConsents.maxId_) || 0
      ),
      legitimateInterests: bitFieldToObject(
        m.publisherLegitimateInterests,
        (m.publisherLegitimateInterests && m.publisherLegitimateInterests.maxId_) || 0
      ),
      customPurpose: {
        consents: bitFieldToObject(m.publisherCustomConsents, maxPublisherCustom),
        legitimateInterests: bitFieldToObject(m.publisherCustomLegitimateInterests, maxPublisherCustom)
      },
      restrictions: decodePublisherRestrictions(m.publisherRestrictions)
    },
    addtlConsent: addtlConsent || m.addtlConsent || '',
    enableAdvertiserConsentMode: !!m.enableAdvertiserConsentMode
  };

  return mergeObjects(base, overrides || {});
}

// =============================================================================
// (C) Main TCF API implementation - ES3 compatible
// =============================================================================

(function() {
  // ES3: Replace Map with plain object
  var listeners = {};
  var nextListenerNumericId = 0;
  
  function generateListenerId() {
    nextListenerNumericId += 1;
    return nextListenerNumericId;
  }

  // ES3: Manual forEach replacement for listeners object
  function forEachListener(callback) {
    var key;
    for (key in listeners) {
      if (listeners.hasOwnProperty(key)) {
        callback(listeners[key], key);
      }
    }
  }

  function notifyAllListeners(overrides) {
    forEachListener(function(callback, listenerId) {
      var payload = buildTCData({
        listenerId: listenerId,
        eventStatus: overrides.eventStatus || 'tcloaded',
        cmpStatus: overrides.cmpStatus || 'loaded'
      });
      
      try {
        callback(payload, true);
      } catch (err) {
        console.warn('[tcf-bridge] Listener callback error:', err);
      }
    });
  }

  function setTCString(newString) {
    try {
      var pid = window._sp_.config.propertyId;
      var key = 'euconsent-v2_' + pid;
      if (window.localStorage) {
        localStorage.setItem(key, newString);
      } else {
        var d = new Date();
        d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
        document.cookie =
          key + '=' + encodeURIComponent(newString) +
          ';expires=' + d.toUTCString() + ';path=/';
      }
      notifyAllListeners({ eventStatus: 'useractioncomplete', cmpStatus: 'loaded' });
    } catch (e) {
      console.error('[tcf-bridge] Error setting TCString:', e);
    }
  }

  window.__tcfapi = function(command, version, callback, parameter) {
    if (version !== 2 && command !== 'ping') {
      callback(null, false);
      return;
    }

    switch (command) {
      case 'getTCData': {
        var vendorIds = parameter;
        var resp = buildTCData({
          eventStatus: 'tcloaded',
          cmpStatus: 'loaded'
        });
        
        // ES3: Replace forEach with for loop
        if (vendorIds && vendorIds.length && vendorIds.length > 0) {
          var filteredVendorConsents = {};
          var filteredVendorLegitimateInterests = {};
          
          for (var i = 0; i < vendorIds.length; i++) {
            var id = vendorIds[i];
            if (resp.vendor.consents[id] !== undefined) {
              filteredVendorConsents[id] = resp.vendor.consents[id];
            }
            if (resp.vendor.legitimateInterests[id] !== undefined) {
              filteredVendorLegitimateInterests[id] = resp.vendor.legitimateInterests[id];
            }
          }
          
          resp.vendor.consents = filteredVendorConsents;
          resp.vendor.legitimateInterests = filteredVendorLegitimateInterests;
        }
        
        callback(resp, true);
        break;
      }
      
      case 'addEventListener': {
        var listenerId = generateListenerId();
        listeners[listenerId] = callback;

        var uiVisible = isUIVisible();
        var eventStatus = uiVisible ? 'cmpuishown' : 'tcloaded';
        var cmpStatus = uiVisible ? 'visible' : 'loaded';
        var existingTC = readStoredTCString();

        var initialPayload = buildTCData({
          listenerId: listenerId,
          eventStatus: eventStatus,
          cmpStatus: cmpStatus,
          tcString: existingTC || ''
        });

        setTimeout(function(){
          try { 
            callback(initialPayload, true); 
          } catch (err) { 
            console.warn('[tcf-bridge] Listener callback error:', err); 
          }
        }, 0);

        break;
      }
      
      case 'removeEventListener': {
        var lid = (parameter && typeof parameter === 'object') ? parameter.listenerId : parameter;
        
        if (lid && listeners[lid]) {
          delete listeners[lid];
          callback(true, true);
        } else {
          callback(false, false);
        }
        break;
      }
      
      case 'emitEvent': {
        var eventStatus = parameter && parameter.eventStatus;
        var cmpStatus = parameter && parameter.cmpStatus;
        var tcString = parameter && parameter.tcString;
        var addtlConsent = parameter && parameter.addtlConsent;
        
        if (eventStatus) {
          if (tcString && tcString !== readStoredTCString()) {
            setTCString(tcString);
          }
          
          if (addtlConsent) {
            storeAddtlConsent(addtlConsent);
          }
          
          notifyAllListeners({ 
            eventStatus: eventStatus, 
            cmpStatus: cmpStatus || 'loaded'
          });
          
          callback({ success: true }, true);
        } else {
          callback({ success: false }, false);
        }
        break;
      }
      
      case 'ping': {
        var tcString = readStoredTCString();
        var cmpInfo = getCMPInfo();
        var uiVisible = isUIVisible();
        
        var response = {
          gdprApplies: cmpInfo.gdprApplies,
          cmpLoaded: true,
          cmpStatus: uiVisible ? 'visible' : 'loaded',
          displayStatus: uiVisible ? 'visible' : 'hidden',
          apiVersion: '2.0',
          cmpVersion: cmpInfo.cmpVersion,
          cmpId: cmpInfo.cmpId,
          gvlVersion: cmpInfo.gvlVersion,
          tcfPolicyVersion: cmpInfo.tcfPolicyVersion
        };
        callback(response, true);
        break;
      }
      
      case 'getVendorList': {
        callback(null, false);
        break;
      }
      
      case 'getInAppTCData': {
        callback(null, false);
        break;
      }
      
      default: {
        callback(null, false);
      }
    }
  };

  window.__tcfapi.setTCString = setTCString;
  window.__tcfapi.notifyListeners = notifyAllListeners;
  
  if (window.location.href.indexOf('debug=tcf') > -1) {
    window.__tcfapi.debug = {
      getListeners: function() {
        var keys = [];
        var key;
        for (key in listeners) {
          if (listeners.hasOwnProperty(key)) {
            keys.push(key);
          }
        }
        return keys;
      },
      getListenerCount: function() {
        var count = 0;
        var key;
        for (key in listeners) {
          if (listeners.hasOwnProperty(key)) {
            count++;
          }
        }
        return count;
      },
      getCurrentTCString: readStoredTCString,
      getAddtlConsent: readStoredAddtlConsent,
      isUIVisible: isUIVisible,
      getCMPInfo: getCMPInfo
    };
  }
})();