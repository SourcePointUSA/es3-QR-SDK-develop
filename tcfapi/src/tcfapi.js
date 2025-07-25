// =============================================================================
// tcfapi.js - Complete version for TV devices without iFrame support
// =============================================================================

import { TCString } from '@iabtcf/core';

// -----------------------------------------------------------------------------
// (A) Define initial API function and process stub queue
// -----------------------------------------------------------------------------
var realApi = window.__tcfapi; 

// Define base API function (will be overwritten later)
window.__tcfapi = function(command, version, callback, parameter) {
  // Placeholder - will be replaced by real implementation below
};

// Process stub queue if available
if (realApi && typeof realApi.pushQueue === 'function') {
  realApi.pushQueue(window.__tcfapi);
}

// =============================================================================
// (B) Helper functions
// =============================================================================

function decodeTCString(tcString) {
  try {
    return TCString.decode(tcString);
  } catch (err) {
    throw new Error(`Error Decoding the TC-Strings: ${err.message}`);
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
    const pid = window._sp_ && window._sp_.config && window._sp_.config.propertyId;
    if (!pid) return '';
    const key = 'euconsent-v2_' + pid;

    if (window.localStorage) {
      let val = localStorage.getItem(key);
      if (val) return stripQuotes(val);
    }

    const name = key + '=';
    const allCookies = document.cookie.split(';');
    for (let raw of allCookies) {
      const cookie = raw.trim();
      if (cookie.indexOf(name) === 0) {
        let cookieVal = decodeURIComponent(cookie.substring(name.length));
        return stripQuotes(cookieVal);
      }
    }
    return '';
  } catch (e) {
    return '';
  }
}

// Read additional consent string from storage
function readStoredAddtlConsent() {
  try {
    const pid = window._sp_ && window._sp_.config && window._sp_.config.propertyId;
    if (!pid) return '';
    const key = 'addtl_consent_' + pid;

    if (window.localStorage) {
      let val = localStorage.getItem(key);
      if (val) return stripQuotes(val);
    }

    const name = key + '=';
    const allCookies = document.cookie.split(';');
    for (let raw of allCookies) {
      const cookie = raw.trim();
      if (cookie.indexOf(name) === 0) {
        let cookieVal = decodeURIComponent(cookie.substring(name.length));
        return stripQuotes(cookieVal);
      }
    }
    return '';
  } catch (e) {
    return '';
  }
}

// Store additional consent string
function storeAddtlConsent(addtlConsent) {
  if (!addtlConsent) return;
  
  try {
    const pid = window._sp_ && window._sp_.config && window._sp_.config.propertyId;
    if (!pid) return;
    const key = 'addtl_consent_' + pid;

    if (window.localStorage) {
      localStorage.setItem(key, addtlConsent);
    } else {
      const d = new Date();
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
  const result = {};
  if (!bitField || typeof bitField.has !== 'function') {
    for (let i = 1; i <= maxId; i++) {
      result[i] = false;
    }
    return result;
  }
  for (let i = 1; i <= maxId; i++) {
    result[i] = !!bitField.has(i);
  }
  return result;
}

function decodePublisherRestrictions(pubRestrictions) {
  const decoded = [];
  if (!pubRestrictions || typeof pubRestrictions.getRestrictions !== 'function') {
    return decoded;
  }
  const allRestrictions = pubRestrictions.getRestrictions();
  allRestrictions.forEach((purposeRestriction) => {
    const vendors = pubRestrictions.getVendors(purposeRestriction);
    decoded.push({
      purposeId: purposeRestriction.purposeId,
      restrictionType: purposeRestriction.restrictionType,
      vendors: vendors
    });
  });
  return decoded;
}

// Check if UI is visible
function isUIVisible() {
  const config = window._sp_ && window._sp_.config;
  if (!config) return false;
  
  const messageDiv = config.messageDiv && document.getElementById(config.messageDiv);
  const pmDiv = config.pmDiv && document.getElementById(config.pmDiv);
  
  const isMessageVisible = messageDiv && 
    messageDiv.style.display !== 'none' && 
    messageDiv.offsetParent !== null;
    
  const isPMVisible = pmDiv && 
    pmDiv.style.display !== 'none' && 
    pmDiv.offsetParent !== null;
    
  return isMessageVisible || isPMVisible;
}

// Get CMP data from config
function getCMPInfo() {
  const tcString = readStoredTCString();
  let decoded = null;
  
  if (tcString) {
    try {
      decoded = decodeTCString(tcString);
    } catch (err) {
      console.warn('[tcf-bridge] Failed to decode TCString for CMP info');
    }
  }
  
  return {
    cmpId: (decoded && decoded.cmpId) || 6, // Default CMP ID
    cmpVersion: (decoded && decoded.cmpVersion) || 1,
    tcfPolicyVersion: (decoded && decoded.tcfPolicyVersion) || 2,
    gvlVersion: (decoded && decoded.gvlVersion) || 2, // Global Vendor List Version
    gdprApplies: window._sp_ && window._sp_.config && 
                 window._sp_.metaData && window._sp_.metaData.gdpr && 
                 window._sp_.metaData.gdpr.applies !== undefined ? 
                 window._sp_.metaData.gdpr.applies : true
  };
}

function buildTCData(overrides) {
  const tcString = readStoredTCString();
  const addtlConsent = readStoredAddtlConsent();
  let decoded = null;

  if (tcString && window.decodeTCString) {
    try {
      decoded = window.decodeTCString(tcString);
    } catch (err) {
      console.warn('[tcf-bridge] Decoding failed:', err);
      decoded = null;
    }
  }

  if (!decoded) {
    const cmpInfo = getCMPInfo();
    const baseMinimal = {
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
    return Object.assign({}, baseMinimal, overrides || {});
  }

  const m = decoded;
  const maxPurposeId = (m.purposeConsents && m.purposeConsents.maxId_) || 0;
  const maxPurposes = Math.max(
    maxPurposeId,
    (m.purposeLegitimateInterests && m.purposeLegitimateInterests.maxId_) || 0
  );


 // Definieren Sie separate max-IDs für Consent und Legitimate Interest
const maxConsentVendorId = (m.vendorConsents && m.vendorConsents.maxId_) || 0;
const maxLegIntVendorId = (m.vendorLegitimateInterests && m.vendorLegitimateInterests.maxId_) || 0;

 


  const maxPublisherCustom = (m.publisherCustomConsents && m.publisherCustomConsents.maxId_) || 0;

  const base = {
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

  return Object.assign({}, base, overrides || {});
}

// =============================================================================
// (C) Main TCF API implementation
// =============================================================================

(function() {
  const listeners = new Map();
  let nextListenerNumericId = 0;
  
  function generateListenerId() {
    nextListenerNumericId += 1;
    return nextListenerNumericId; // Numeric ID for TCF v2.0 compatibility
  }

  function notifyAllListeners(overrides) {
    listeners.forEach((callback, listenerId) => {
      const payload = buildTCData({
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
      const pid = window._sp_.config.propertyId;
      const key = 'euconsent-v2_' + pid;
      if (window.localStorage) {
        localStorage.setItem(key, newString);
      } else {
        const d = new Date();
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

  // Main __tcfapi implementation
  window.__tcfapi = function(command, version, callback, parameter) {
    // Version check (TCF v2.0 requires version === 2)
    if (version !== 2 && command !== 'ping') {
      callback(null, false);
      return;
    }

    switch (command) {
      case 'getTCData': {
        const vendorIds = parameter; // Array of vendor IDs or undefined
        let resp = buildTCData({
          eventStatus: 'tcloaded',
          cmpStatus: 'loaded'
        });
        
        // Filter by specific vendor IDs if requested
        if (vendorIds && Array.isArray(vendorIds) && vendorIds.length > 0) {
          const filteredVendorConsents = {};
          const filteredVendorLegitimateInterests = {};
          
          vendorIds.forEach(id => {
            if (resp.vendor.consents[id] !== undefined) {
              filteredVendorConsents[id] = resp.vendor.consents[id];
            }
            if (resp.vendor.legitimateInterests[id] !== undefined) {
              filteredVendorLegitimateInterests[id] = resp.vendor.legitimateInterests[id];
            }
          });
          
          resp.vendor.consents = filteredVendorConsents;
          resp.vendor.legitimateInterests = filteredVendorLegitimateInterests;
        }
        
        callback(resp, true);
        break;
      }
      
      case 'addEventListener': {
        const listenerId = generateListenerId();
        listeners.set(listenerId, callback);

        // Determine initial event status
        const tcString = readStoredTCString();
        // Always start with tcloaded to prevent duplicate cmpuishown events
        const eventStatus = 'tcloaded';
        
        // Create TCData object with listenerId
        const initialPayload = buildTCData({
          listenerId: listenerId,
          eventStatus: eventStatus,
          cmpStatus: 'loaded'
        });
        
        // Send initial callback with TCData
        setTimeout(() => {
          try {
            callback(initialPayload, true);
          } catch (err) {
            console.warn('[tcf-bridge] Listener callback error:', err);
          }
        }, 0);
        
        break;
      }
      
      case 'removeEventListener': {
        // Parameter can be either an object with listenerId or the ID directly
        const lid = (parameter && typeof parameter === 'object') ? parameter.listenerId : parameter;
        
        if (lid && listeners.has(lid)) {
          listeners.delete(lid);
          callback(true, true); // Success
        } else {
          callback(false, false); // Error
        }
        break;
      }
      
      case 'emitEvent': {
        const eventStatus = parameter && parameter.eventStatus;
        const cmpStatus = parameter && parameter.cmpStatus;
        const tcString = parameter && parameter.tcString;
        const addtlConsent = parameter && parameter.addtlConsent;
        
        if (eventStatus) {
          // If a new tcString is provided, update storage first
          if (tcString && tcString !== readStoredTCString()) {
            setTCString(tcString);
          }
          
          // If addtlConsent is provided, store it
          if (addtlConsent) {
            storeAddtlConsent(addtlConsent);
          }
          
          // Notify all listeners with the event
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
        const tcString = readStoredTCString();
        const cmpInfo = getCMPInfo();
        const uiVisible = isUIVisible();
        
        // Dynamic ping response based on current status
        const response = {
          gdprApplies: cmpInfo.gdprApplies,
          cmpLoaded: true, // CMP is always loaded when this function is called
          cmpStatus: uiVisible ? 'visible' : 'loaded', // 'visible' when UI is shown
          displayStatus: uiVisible ? 'visible' : 'hidden', // UI status
          apiVersion: '2.0', // TCF v2.0
          cmpVersion: cmpInfo.cmpVersion,
          cmpId: cmpInfo.cmpId,
          gvlVersion: cmpInfo.gvlVersion,
          tcfPolicyVersion: cmpInfo.tcfPolicyVersion
        };
        callback(response, true);
        break;
      }
      
      case 'getVendorList': {
        // Optional: Return vendor list
        // TODO: Implement when vendor list is needed
        callback(null, false);
        break;
      }
      
      case 'getInAppTCData': {
        // For mobile apps - not implemented for TV
        callback(null, false);
        break;
      }
      
      default: {
        callback(null, false);
      }
    }
  };

  // Helper function to manually set TC String
  window.__tcfapi.setTCString = setTCString;
  
  // Helper function to manually trigger events
  window.__tcfapi.notifyListeners = notifyAllListeners;
  
  // Debug helper functions
  if (window.location.href.indexOf('debug=tcf') > -1) {
    window.__tcfapi.debug = {
      getListeners: () => Array.from(listeners.keys()),
      getListenerCount: () => listeners.size,
      getCurrentTCString: readStoredTCString,
      getAddtlConsent: readStoredAddtlConsent,
      isUIVisible: isUIVisible,
      getCMPInfo: getCMPInfo
    };
  }
})();