var env = "prod";
var scriptVersion = "3.0.6";
var scriptType = "nativeqr";

/*Polyfill for JSON*/
if (!window.JSON) {
  window.JSON = {
    stringify: function (obj) {
      var t = typeof obj;
      if (t != "object" || obj === null) {
        // simple data type
        if (t == "string") obj = '"' + obj + '"';
        return String(obj);
      } else {
        // array or object
        var n,
          v,
          json = [],
          arr = obj && obj.constructor == Array;
        for (n in obj) {
          v = obj[n];
          t = typeof v;
          if (t == "string") v = '"' + v + '"';
          else if (t == "object" && v !== null) v = JSON.stringify(v);
          json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
      }
    },
  };
}

JSON.parse = function (text) {
  try {
    return new Function("return " + text)();
  } catch (e) {
    onError("001", "JSON.parse: ungültiges JSON-Format");
    return null;
  }
};

var isArray = function (arr) {
  return Object.prototype.toString.call(arr) === "[object Array]";
};

if (!Object.keys) {
  Object.keys = function (obj) {
    if (obj !== Object(obj)) {
      onError("002", "Object.keys called on a non-object");
    }

    var result = [],
      prop;
    for (prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        result.push(prop);
      }
    }

    return result;
  };
}

function sp_init(config) {
  window._sp_ = window._sp_ || {};
  _sp_.config = config; // Konfiguration speichern
  if (typeof _sp_.init === "function") {
    _sp_.init(config);
  } else {
    onError("003", "No init method found");
  }
}

(function () {
  window.handleMetaDataForJsonP = handleMetaDataForJsonP;
  window.handleMessageDataForJsonP = handleMessageDataForJsonP;
  window.handleGetMessagesForJsonP = handleGetMessagesForJsonP;
  window.handleGetConsentStatusForJsonP = handleGetConsentStatusForJsonP;
  window.handlePvResponse = handlePvResponse;

  window.handleAcceptAllResponse = handleAcceptAllResponse;
  window.handleJsonpAcceptAllCall = handleJsonpAcceptAllCall;

  window.handleLiOnlyResponse = handleLiOnlyResponse;
  window.handleLiOnlyCall = handleLiOnlyCall;

  window.handleRejectAllResponse = handleRejectAllResponse;
  window.handleRejectAllCall = handleRejectAllCall;

  var triggerEvent = function (eventName, args) {
    var event = window._sp_.config.events[eventName];
    if (typeof event === "function") {
      event.apply(null, args || []); // Event mit Parametern ausführen
    }
  };

  var baseEndpoint,
    consentUUID,
    sampledUser,
    authId,
    accountId,
    propertyId,
    propertyHref,
    consentLanguage,
    isSPA,
    isJSONp,
    dateCreated,
    euConsentString,
    pmDiv,
    pmId,
    messageDiv,
    gdprApplies,
    buildMessageComponents,
    euConsentString,
    consentStatus,
    acceptedCategories,
    legIntCategories,
    legIntVendors,
    acceptedVendors,
    nonKeyedLocalState,
    vendorGrants,
    metaData,
    exposeGlobals,
    cookieDomain,
    secondScreenTimeOut,
    jsonPProxyEndpoint,
    messageCategoryData,
    expirationDate;

  var isMetaDataAvailable = false,
    isSpObjectReady = false,
    isReadyToExectute = false;

  var hasLocalData = false;
  var granularStatus = null;
  var consentAllRef = null;
  var cb = Math.floor(Math.random() * 1000000);

  var messageId = null;
  var messageMetaData = null;
  var localState = null;
  var messageElementsAdded = false;

  function init(config) {
    _sp_.config = config;
    config = config || (_sp_ && _sp_.config);
    triggerEvent("initReceivedData", [config]);
    _sp_.config.events = _sp_.config.events || {};
    _sp_.version = scriptVersion;

    accountId = _sp_.config.accountId;
    consentLanguage = _sp_.config.consentLanguage || "EN";
    expirationInDays = _sp_.config.expirationInDays || 365;
    isSPA = _sp_.config.isSPA;
    isJSONp = _sp_.config.isJSONp;

    if (isJSONp) {
      proxyEndpoint = _sp_.config.proxyEndpoint;
      if (typeof proxyEndpoint === "undefined") {
        onError("004", "jsonPProxyEndpoint is undefined");
        return;
      }
      proxyEndpoint = _sp_.config.proxyEndpoint.replace(/\/+$/, "");
    }

    baseEndpoint = _sp_.config.baseEndpoint.replace(/\/+$/, "");
    exposeGlobals = _sp_.config.exposeGlobals;
    disableLocalStorage = _sp_.config.disableLocalStorage;
    cookieDomain = _sp_.config.cookieDomain;
    secondScreenTimeOut = _sp_.config.secondScreenTimeOut;

    propertyHref = _sp_.config.propertyHref;
    propertyId = _sp_.config.propertyId;
    targetingParams = _sp_.config.targetingParams;

    dateCreated = getCookieValue("consentDate_" + propertyId);
    euConsentString = getItem("euconsent-v2_" + propertyId);

    consentStatus = getItem("consentStatus_" + propertyId) || null;
    localState = getItem("localState_" + propertyId);
    metaData = getItem("metaData_" + propertyId);
    vendorGrants = getItem("vendorGrants_" + propertyId);
    nonKeyedLocalState = getItem("nonKeyedLocalState_" + propertyId);

    acceptedCategories = getItem("acceptedCategories_" + propertyId);
    acceptedVendors = getItem("acceptedVendors_" + propertyId);
    legIntCategories = getItem("legIntCategories_" + propertyId);
    legIntVendors = getItem("legIntVendors_" + propertyId);

    if (!config) {
      onError("005", "No Configuration Found");
      return;
    }

    getMetaData();

    consentUUID = getCookieValue("consentUUID");
    sampledUser = getCookieValue("sp_su");
    authId = getCookieValue("authId") || _sp_.config.authId;

    if (consentUUID == null) {
      consentUUID = generateUUID();
      setCookie("consentUUID", consentUUID, expirationInDays);
    }

    if (authId == null) {
      authId = generateUUID();
      setCookie("authId", authId, expirationInDays);
    }

    messageDiv = _sp_.config.messageDiv;
    pmDiv = _sp_.config.pmDiv;
    pmId =
      typeof _sp_ !== "undefined" && _sp_.config && _sp_.config.pmId
        ? _sp_.config.pmId
        : 1196474;
    buildMessageComponents =
      typeof _sp_ !== "undefined" &&
      _sp_.config &&
      _sp_.config.buildMessageComponents === true
        ? true
        : false;

    extendSpObject();

    if (!isSPA) {
      _sp_.executeMessaging();
    }

    if (!messageElementsAdded) {
      getMessageData();
    }

    isReadyToExecute();
  }

  window._sp_ = window._sp_ || {};
  window._sp_.init = init;

  if (_sp_.config) {
    init(_sp_.config);
  } else {
    console.log("No Global Config found – waiting for sp_init(config)...");
  }

  function extendSpObject() {
    var executeMessagingFunc = function (targeting) {
      if (targeting) targetingParams = targeting;
      hideElement(pmDiv);
      hideElement(messageDiv);
      getMessages();
      onInfo("Messaging executed!");
    };

    var loadPrivacyManagerModalFunc = function () {
      updateQrUrl(getQrCodeUrl());
      showElement(pmDiv);
      hideElement(messageDiv);
    };

    var acceptAllFunc = function () {
      hideElement(pmDiv);
      hideElement(messageDiv);
      acceptAll();
    };

    var continueFunc = function () {
      hideElement(pmDiv);
      hideElement(messageDiv);
      liOnly();
    };

    var rejectFunc = function () {
      hideElement(pmDiv);
      hideElement(messageDiv);
      rejectAll();
    };

    var consentStatusFunc = function () {
      return consentStatus;
    };

    var getTcStringFunc = function () {
      return euConsentString;
    };

    var getQrCodeUrlFunc = function () {
      return getQrCodeUrl();
    };

    var getMessageDataFunc = function () {
      return messageCategoryData;
    };

    var clearUserDataFunc = function () {
      deleteCookie("authId");
      deleteCookie("consentUUID");
      deleteItem("metaData_" + propertyId);
      deleteCookie("consentDate_" + propertyId);
      deleteItem("consentStatus_" + propertyId);
      deleteItem("euconsent-v2_" + propertyId);
      deleteItem("localState_" + propertyId);
      deleteItem("nonKeyedLocalState_" + propertyId);
      deleteItem("vendorGrants_" + propertyId);
      deleteItem("acceptedVendors_" + propertyId);
      deleteItem("acceptedCategories_" + propertyId);
      deleteItem("legIntVendors_" + propertyId);
      deleteItem("legIntCategories_" + propertyId);
      deleteCookie("sp_su");
      deleteCookie("consent-sync-expiry");
      hideElement(pmDiv);
      hideElement(messageDiv);

      consentDate = null;
      consentUUID = null;
      sampledUser = null;
      authId = null;
      dateCreated = null;
      euConsentString = null;
      consentStatus = null;
      acceptedCategories = null;
      legIntCategories = null;
      legIntVendors = null;
      acceptedVendors = null;
      nonKeyedLocalState = null;
      vendorGrants = null;
      localState = null;

      return true;
    };

    var updateConsentStatusFunc = function () {
      // hideElement(pmDiv);
      // hideElement(messageDiv);
      getConsentStatus("true");
      // getMessages();
    };

    _sp_.executeMessaging = executeMessagingFunc;
    _sp_.loadPrivacyManagerModal = loadPrivacyManagerModalFunc;
    _sp_.acceptAll = acceptAllFunc;
    _sp_.continue = continueFunc;
    _sp_.reject = rejectFunc;
    _sp_.consentStatus = consentStatusFunc;
    _sp_.getTcString = getTcStringFunc;
    _sp_.getQrCodeUrl = getQrCodeUrlFunc;
    _sp_.getMessageData = getMessageDataFunc;
    _sp_.clearUserData = clearUserDataFunc;
    _sp_.updateConsentStatus = updateConsentStatusFunc;

    if (exposeGlobals === true) {
      window.executeMessaging = executeMessagingFunc;
      window.loadPrivacyManagerModal = loadPrivacyManagerModalFunc;
      window.acceptAll = acceptAllFunc;
      window.spContinue = continueFunc;
      window.reject = rejectFunc;
      window.consentStatus = consentStatusFunc;
      window.getTcString = getTcStringFunc;
      window.getQrCodeUrl = getQrCodeUrlFunc;
      window.getMessageData = getMessageDataFunc;
      window.clearUserData = clearUserDataFunc;
      window.updateConsentStatus = updateConsentStatusFunc;
    }

    triggerEvent("spObjectReady");
    isSpObjectReady = true;
  }

  function onConsentReady() {
    triggerEvent("onConsentReady", [
      consentUUID,
      euConsentString,
      vendorGrants,
      consentStatus,
      acceptedCategories,
    ]);
  }

  function onMessageComposed() {
    triggerEvent("onMessageComposed");
  }

  function onMetaDataReceived() {
    isMetaDataAvailable = true;
    triggerEvent("onMetaDataReceived", [metaData]);
  }

  function onConsentStatusReceived() {
    triggerEvent("onConsentStatusReceived", [consentStatus]);
  }

  function onMessageReceivedData() {
    triggerEvent("onMessageReceivedData", [messageMetaData]);
  }

  function firstLayerShown() {
    triggerEvent("firstLayerShown");
  }

  function secondLayerShown() {
    triggerEvent("secondLayerShown");
  }

  function firstLayerClosed() {
    triggerEvent("firstLayerClosed");
  }

  function secondLayerClosed() {
    triggerEvent("secondLayerClosed");
  }

  function onError(errorCode, errorText, errorData) {
    triggerEvent("onError", [errorCode, errorText, errorData]);
  }

  function onInfo(infoText, infoData) {
    triggerEvent("onInfo", [infoText, infoData]);
  }

  function showElement(elementId) {
    var element = document.getElementById(elementId);
    if (element) {
      element.style.display = "block";
      if (elementId == pmDiv) secondLayerShown();
      if (elementId == messageDiv) firstLayerShown();
    }
  }

  function hideElement(elementId) {
    var element = document.getElementById(elementId);
    if (element) {
      var wasVisible =
        element.style.display !== "none" && element.offsetParent !== null;
      element.style.display = "none";
      if (elementId === pmDiv && wasVisible) {
        secondLayerClosed();
      }

      if (elementId === messageDiv && wasVisible) {
        firstLayerClosed();
      }
    }
  }

  function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
  }

  function httpGet(theUrl) {
    try {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("GET", theUrl, false);
      xmlHttp.send(null);

      if (xmlHttp.status === 200) {
        return xmlHttp.responseText;
      } else {
        onError(xmlHttp.status, xmlHttp.statusText);
        return null;
      }
    } catch (e) {
      onError("404", "Request failed:", e);
      return null;
    }
  }

  function jsonpGet(url, callbackName, timeout) {
    var script = document.createElement("script");
    var timedOut = false;
    var head = document.getElementsByTagName("head")[0] || document.body;
    var timeoutId;
    if (timeout) {
      timeoutId = setTimeout(function () {
        timedOut = true;
        window[callbackName] = function () {};
        head.removeChild(script);
        // Du kannst hier ein globales onError aufrufen oder ein weiteres Event feuern
      }, timeout);
    }

    var separator = url.indexOf("?") >= 0 ? "&" : "?";
    script.src = url + separator + "callback=" + callbackName;

    script.onerror = function () {
      if (timeoutId) clearTimeout(timeoutId);
      window[callbackName] = function () {};
      head.removeChild(script);
      onError(
        "009",
        "Script-Error while processing JSONP-Request for " + callbackName
      );
    };

    head.appendChild(script);
  }

  function compareDates(date1, date2) {
    var d1 =
      typeof date1 === "object" && date1 instanceof Date
        ? date1
        : new Date(date1);
    var d2 =
      typeof date2 === "object" && date2 instanceof Date
        ? date2
        : new Date(date2);

    var time1 = d1.getTime();
    var time2 = d2.getTime();

    if (time1 < time2) {
      return -1;
    } else if (time1 > time2) {
      return 1;
    } else {
      return 0;
    }
  }

  function buildUrl(baseUrl, params) {
    var url = baseUrl + "?";
    var paramArray = [];

    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        paramArray.push(
          encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
        );
      }
    }

    return url + paramArray.join("&");
  }

  function generateUUID() {
    var chars = "0123456789abcdef".split("");
    var uuid = [],
      rnd = Math.random,
      r;

    for (var i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        uuid[i] = "-";
      } else if (i === 14) {
        uuid[i] = "4";
      } else {
        r = 0 | (rnd() * 16);
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
      }
    }

    return uuid.join("");
  }

  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
      if (typeof cookieDomain !== "undefined") {
        domain = "; domain=" + cookieDomain;
      } else {
        domain = "";
      }
    }

    document.cookie =
      name + "=" + encodeURIComponent(value) + expires + domain + "; path=/";
  }

  function checkMessageJson(response) {
    if (response.campaigns && Array.isArray(response.campaigns)) {
      for (var i = 0; i < response.campaigns.length; i++) {
        var campaign = response.campaigns[i];

        if (campaign.message && campaign.message.message_json) {
          messageMetaData = campaign.messageMetaData;
          messageId = campaign.messageMetaData.messageId;
          onMessageReceivedData();
          return campaign.message.message_json;
        }
      }
    }
    return false;
  }

  function shouldCallMessagesEndpoint() {
    var shouldCall = false;

    if (consentStatus === null || !consentStatus.consentedAll) {
      return true;
    }

    if (dateCreated !== null) {
      if (compareDates(metaData.gdpr.legalBasisChangeDate, dateCreated) === 1) {
        consentStatus.legalBasisChanges = true;
        shouldCall = true;
      }
      if (compareDates(metaData.gdpr.additionsChangeDate, dateCreated) === 1) {
        consentStatus.vendorListAdditions = true;
        shouldCall = true;
      }
    }

    return shouldCall;
  }

  function getMessages() {
    if (shouldCallMessagesEndpoint()) {
      var baseURL = "/wrapper/v2/messages";
      var queryParams = "?hasCsp=true&env=prod";

      var body = {
        accountId: accountId,
        campaignEnv: "prod",
        campaigns: {
          gdpr: {
            consentStatus: consentStatus,
            hasLocalData: hasLocalData,
            targetingParams: targetingParams,
          },
        },
        clientMMSOrigin: baseEndpoint,
        hasCSP: true,
        includeData: {
          localState: {
            type: "string",
          },
          actions: {
            type: "RecordString",
          },
          cookies: {
            type: "RecordString",
          },
        },
        propertyHref: propertyHref,
        propertyId: propertyId,
      };

      var fullURL =
        (isJSONp ? proxyEndpoint + "/jsonp" : baseEndpoint) +
        baseURL +
        queryParams +
        "&body=" +
        json2QueryParam(body) +
        "&localState=" +
        json2QueryParam(localState) +
        "&metadata=" +
        json2QueryParam(metaData) +
        "&nonKeyedLocalState=" +
        json2QueryParam(nonKeyedLocalState) +
        "&ch=" +
        cb +
        "&scriptVersion=" +
        scriptVersion +
        "&scriptType=" +
        scriptType;

      if (isJSONp) {
        var res = jsonpGet(fullURL, "handleGetMessagesForJsonP");
      } else {
        var res = JSON.parse(httpGet(fullURL));

        localState = res.localState;
        setItem(
          "localState_" + propertyId,
          JSON.parse(res.localState),
          expirationInDays
        );
        nonKeyedLocalState = res.nonKeyedLocalState;
        setItem(
          "nonKeyedLocalState_" + propertyId,
          JSON.parse(res.nonKeyedLocalState),
          expirationInDays
        );

        if (checkMessageJson(res)) {
          showElement(messageDiv);
        } else {
          onConsentReady();
        }
      }
    } else {
      onConsentReady();
    }

    sendReportingData();
  }

  function json2QueryParam(jsonObject) {
    if (typeof jsonObject == "string") {
      return encodeURIComponent(jsonObject);
    } else {
      return encodeURIComponent(JSON.stringify(jsonObject));
    }
  }

  function useJsonpPostRequest(endpoint, data, callbackName) {
    var base = proxyEndpoint + "/post" + endpoint;
    var params = {
      hasCsp: true,
      env: env,
      ch: cb,
      scriptVersion: scriptVersion,
      scriptType: scriptType,
    };

    const fullUrl =
      base +
      "?body=" +
      encodeURIComponent(JSON.stringify(data)) +
      "&" +
      toQueryParams(params);
    jsonpGet(fullUrl, callbackName);
  }

  function updateQrUrl(newUrl) {
    if (_sp_.config.qrId) {
      var image = document.getElementById(_sp_.config.qrId);

      if (image) {
        var timestamp = new Date().getTime();
        var separator = newUrl.indexOf("?") === -1 ? "?" : "&";
        image.src = newUrl + separator + "t=" + timestamp;
      } else {
        onError("010", "qr ID is missing in config");
      }
    }
  }

  function acceptAll() {
    var path = "/wrapper/v2/choice/consent-all";
    var baseUrl = isJSONp
      ? proxyEndpoint + "/jsonp" + path
      : baseEndpoint + path;

    var queryParams = {
      hasCsp: "true",
      authId: authId,
      accountId: accountId,
      env: "prod",
      includeCustomVendorsRes: "true",
      metadata: JSON.stringify(metaData),
      propertyId: propertyId,
      withSiteActions: "true",
      ch: cb,
      scriptVersion: scriptVersion,
      scriptType: scriptType,
    };

    var queryString = toQueryParams(queryParams);
    var fullUrl = baseUrl + "?" + queryString;

    if (isJSONp) {
      jsonpGet(fullUrl, "handleAcceptAllResponse");
    } else {
      var consentdata = httpGet(fullUrl);
      sendAcceptAllRequest(JSON.parse(consentdata));
    }
  }

  function liOnly() {
    if (isJSONp) {
      jsonpGet(
        proxyEndpoint +
          "/jsonp/consent/tcfv2/consent/v3/" +
          propertyId +
          "/li-only",
        "handleLiOnlyResponse"
      );
    } else {
      sendGranularChoiceRequest(
        JSON.parse(
          httpGet(
            baseEndpoint +
              "/consent/tcfv2/consent/v3/" +
              propertyId +
              "/li-only"
          )
        )
      );
    }
  }

  function rejectAll() {
    var path = "/wrapper/v2/choice/reject-all";
    var baseUrl = isJSONp
      ? proxyEndpoint + "/jsonp" + path
      : baseEndpoint + path;

    var queryParams = {
      hasCsp: "true",
      authId: authId,
      accountId: accountId,
      env: "prod",
      includeCustomVendorsRes: "true",
      metadata: JSON.stringify(metaData), // URL-encoded JSON
      propertyId: propertyId,
      withSiteActions: "true",
      ch: cb,
      scriptVersion: scriptVersion,
      scriptType: scriptType,
    };

    var queryString = toQueryParams(queryParams);
    var fullUrl = baseUrl + "?" + queryString;

    if (isJSONp) {
      jsonpGet(fullUrl, "handleRejectAllResponse");
    } else {
      var consentdata = httpGet(baseUrl + "?" + queryString);
      sendRejectAllChoiceRequest(JSON.parse(consentdata));
    }
  }

  function sendGranularChoiceRequest(pmSaveAndExitVariables) {
    var data = {
      accountId: accountId,
      applies: gdprApplies,
      authId: authId,
      messageId: messageId,
      mmsDomain: baseEndpoint,
      propertyId: propertyId,
      pubData: {},
      includeData: {
        actions: { type: "RecordString" },
        customVendorsResponse: { type: "RecordString" },
      },
      uuid: consentUUID,
      sampleRate: metaData.gdpr.sampleRate,
      sendPVData: getSampleUser(),
      pmSaveAndExitVariables: pmSaveAndExitVariables,
    };

    if (isJSONp) {
      useJsonpPostRequest(
        "/wrapper/v2/choice/gdpr/1",
        data,
        "handleLiOnlyCall"
      );
    } else {
      var url =
        baseEndpoint +
        "/wrapper/v2/choice/gdpr/1?hasCsp=true&env=prod&ch=" +
        cb +
        "&scriptVersion=" +
        scriptVersion +
        "&scriptType=" +
        scriptType;
      var req = createPostRequest(url);

      req.onreadystatechange = function () {
        if (req.readyState !== 4) return;
        if (req.status === 200) {
          var res = JSON.parse(req.responseText);

          storeConsentResponse(
            res.consentStatus,
            res.uuid,
            res.dateCreated,
            res.euconsent,
            res.grants,
            res.categories,
            res.vendors,
            res.legIntVendors,
            res.legIntCategories
          );
        } else {
          onError(req.status, req.responseText);
        }
      };
      req.send(JSON.stringify(data));
    }
  }

  function sendRejectAllChoiceRequest(consentdata) {
    granularStatus = consentdata.gdpr.consentStatus.granularStatus;
    consentAllRef = consentdata.gdpr.consentAllRef;
    gdprApplies = consentdata.gdpr.gdprApplies;
    euConsentString = consentdata.gdpr.euconsent;
    acceptedCategories = consentdata.gdpr.categories;
    consentStatus = consentdata.gdpr.consentStatus;
    vendorGrants = consentdata.gdpr.grants;
    acceptedVendors = consentdata.gdpr.vendors;
    legIntVendors = consentdata.gdpr.legIntVendors;
    legIntCategories = consentdata.gdpr.legIntCategories;

    var data = {
      accountId: accountId,
      applies: gdprApplies,
      authId: authId,
      messageId: messageId,
      mmsDomain: baseEndpoint,
      propertyId: propertyId,
      pubData: {},
      includeData: {
        actions: { type: "RecordString" },
        customVendorsResponse: { type: "RecordString" },
      },
      uuid: consentUUID,
      sampleRate: metaData.gdpr.sampleRate,
      sendPVData: getSampleUser(),
    };

    var endpoint = "/wrapper/v2/choice/gdpr/13";
    var url =
      baseEndpoint +
      "/wrapper/v2/choice/gdpr/13?hasCsp=true&env=prod&ch=" +
      cb +
      "&scriptVersion=" +
      scriptVersion +
      "&scriptType=" +
      scriptType;

    if (isJSONp) {
      useJsonpPostRequest(endpoint, data, "handleRejectAllCall");
    } else {
      var url =
        baseEndpoint +
        endpoint +
        "?hasCsp=true&env=prod&ch=" +
        cb +
        "&scriptVersion=" +
        scriptVersion +
        "&scriptType=" +
        scriptType;
      var req = createPostRequest(url);

      req.onreadystatechange = function () {
        if (req.readyState !== 4) return;
        if (req.status === 200) {
          var res = JSON.parse(req.responseText);
          storeConsentResponse(
            res.consentStatus,
            res.uuid,
            res.dateCreated,
            res.euconsent,
            res.grants,
            res.categories,
            res.vendors,
            res.legIntVendors,
            res.legIntCategories
          );
        } else {
          onError("error:", req.responseText);
        }
      };

      req.send(JSON.stringify(data));
    }
  }

  function sendAcceptAllRequest(consentdata) {
    granularStatus = consentdata.gdpr.consentStatus.granularStatus;
    consentAllRef = consentdata.gdpr.consentAllRef;
    gdprApplies = consentdata.gdpr.gdprApplies;
    euConsentString = consentdata.gdpr.euconsent;
    acceptedCategories = consentdata.gdpr.categories;
    consentStatus = consentdata.gdpr.consentStatus;
    vendorGrants = consentdata.gdpr.grants;
    acceptedVendors = consentdata.gdpr.vendors;
    legIntVendors = consentdata.gdpr.legIntVendors;
    legIntCategories = consentdata.gdpr.legIntCategories;

    var endpoint = "/wrapper/v2/choice/gdpr/11";

    var data = {
      accountId: accountId,
      applies: gdprApplies,
      authId: authId,
      messageId: messageId,
      mmsDomain: baseEndpoint,
      propertyId: propertyId,
      pubData: {},
      includeData: {
        actions: { type: "RecordString" },
        customVendorsResponse: { type: "RecordString" },
      },
      uuid: consentUUID,
      sampleRate: metaData.gdpr.sampleRate,
      sendPVData: getSampleUser(),
      consentAllRef: consentAllRef,
      granularStatus: granularStatus,
      vendorListId: consentdata.gdpr.vendorListId,
    };

    if (isJSONp) {
      useJsonpPostRequest(endpoint, data, "handleJsonpAcceptAllCall");
    } else {
      var url =
        baseEndpoint +
        endpoint +
        "?hasCsp=true&env=prod&ch=" +
        cb +
        "&scriptVersion=" +
        scriptVersion +
        "&scriptType=" +
        scriptType;
      var req = createPostRequest(url);
      req.onreadystatechange = function () {
        if (req.readyState !== 4) return;
        if (req.status === 200) {
          var res = JSON.parse(req.responseText);
          storeConsentResponse(
            consentdata.gdpr.consentStatus,
            res.uuid,
            res.dateCreated,
            euConsentString,
            consentdata.gdpr.grants,
            consentdata.gdpr.categories,
            consentdata.gdpr.vendors,
            consentdata.gdpr.legIntVendors,
            consentdata.gdpr.legIntCategories
          );
        } else {
          onError("error:", req);
        }
      };
      req.send(JSON.stringify(data));
    }
  }

  function setItem(key, value) {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (typeof value === "object" && Object.keys(value).length === 0)
    ) {
      return;
    }

    if (typeof window.localStorage == "undefined" || disableLocalStorage) {
      setCookie(key, JSON.stringify(value), expirationInDays);
    } else {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        setCookie(key, JSON.stringify(value), expirationInDays);
      }
    }
  }

  function getItem(key) {
    if (typeof window.localStorage == "undefined" || disableLocalStorage) {
      return JSON.parse(decodeURIComponent(getCookieValue(key)));
    } else {
      try {
        return JSON.parse(window.localStorage.getItem(key));
      } catch (e) {
        return JSON.parse(decodeURIComponent(getCookieValue(key)));
      }
    }
  }

  function getCookieValue(name) {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.indexOf(name + "=") === 0) {
        return decodeURIComponent(
          cookie.substring((name + "=").length, cookie.length)
        );
      }
    }
    return null;
  }

  function deleteCookie(name) {
    var domain = "";

    if (typeof cookieDomain !== "undefined") {
      domain = "; domain=" + cookieDomain;
    }

    document.cookie =
      name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC" + domain + "; path=/;";
  }

  function deleteItem(key) {
    if (typeof window.localStorage == "undefined" || disableLocalStorage) {
      deleteCookie(key);
    } else {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        deleteCookie(key);
      }
    }
  }

  function storeConsentResponse(
    conStatus,
    uuid,
    cDate,
    euconsent,
    vGrants,
    purposes,
    vendors,
    legIntV,
    legIntP
  ) {
    consentStatus = conStatus;
    setItem("consentStatus_" + propertyId, conStatus, expirationInDays);
    consentUUID = uuid;
    setCookie("consentUUID", uuid, expirationInDays);
    consentDate = cDate;
    setCookie("consentDate_" + propertyId, cDate, expirationInDays);
    euConsentString = euconsent;
    setItem("euconsent-v2_" + propertyId, euconsent, expirationInDays);
    setItem("vendorGrants_" + propertyId, vGrants, expirationInDays);
    vendorGrants = vGrants;
    setItem("acceptedCategories_" + propertyId, purposes, expirationInDays);
    acceptedCategories = purposes;
    setItem("acceptedVendors_" + propertyId, vendors, expirationInDays);
    acceptedVendors = vendors;
    setItem("legIntCategories_" + propertyId, legIntP, expirationInDays);
    legIntCategories = legIntP;
    setItem("legIntVendors_" + propertyId, legIntV, expirationInDays);
    legIntVendors = legIntV;
    onConsentStatusReceived();
    onConsentReady();
  }

  function getConsentStatus(forced) {
    if (consentStatus !== null && !forced) {
      if (consentStatus.consentedAll) {
        return;
      }
    }

    var baseUrl =
      (isJSONp ? proxyEndpoint + "/jsonp" : baseEndpoint) +
      "/wrapper/v2/consent-status";
    var params = {
      hasCsp: "true",
      accountId: accountId,
      env: "prod",
      localState: localState,
      nonKeyedLocalState: nonKeyedLocalState,
      metadata: JSON.stringify(metaData),
      propertyId: propertyId,
      withSiteActions: "true",
      authId: authId,
      ch: cb,
      scriptVersion: scriptVersion,
      scriptType: scriptType,
    };

    if (isJSONp) {
      jsonpGet(buildUrl(baseUrl, params), "handleGetConsentStatusForJsonP");
    } else {
      var res = JSON.parse(httpGet(buildUrl(baseUrl, params)));

      if (typeof res.consentStatusData.gdpr !== undefined) {
        hasLocalData = true;
        storeConsentResponse(
          res.consentStatusData.gdpr.consentStatus,
          res.consentStatusData.gdpr.consentUUID,
          res.consentStatusData.gdpr.dateCreated,
          res.consentStatusData.gdpr.euconsent,
          res.consentStatusData.gdpr.grants,
          res.consentStatusData.gdpr.acceptedVendors,
          res.consentStatusData.gdpr.legIntVendors,
          res.consentStatusData.gdpr.legIntCategories
        );
      }
    }
  }

  function createPostRequest(url) {
    var req = new XMLHttpRequest();
    req.open("POST", url, true);
    req.setRequestHeader("accept", "*/*");
    req.setRequestHeader("accept-language", "de,en;q=0.9");
    req.setRequestHeader("content-type", "application/json");
    return req;
  }

  function getQrCodeUrl() {
    let additionalParams = "";

    // Prüfen, ob secondScreenTimeOut definiert ist und einen gültigen Wert hat
    if (
      typeof secondScreenTimeOut !== "undefined" &&
      secondScreenTimeOut !== null
    ) {
      // Aktuelles Datum mit Uhrzeit im ISO-Format
      const timestamp = new Date().toISOString();

      // Parameter ergänzen
      additionalParams += "&timestamp=" + encodeURIComponent(timestamp);
      additionalParams +=
        "&second_screen_timeout=" + encodeURIComponent(secondScreenTimeOut);
    }

    return (
      _sp_.config.qrUrl +
      encodeURIComponent(
        _sp_.config.pmUrl +
          "?authid=" +
          authId +
          "&consentlanguage=" +
          consentLanguage +
          "&propertyid=" +
          propertyId +
          "&propertyhref=" +
          propertyHref +
          "&accountid=" +
          accountId +
          "&pmid=" +
          pmId +
          additionalParams
      )
    );
  }

  function getMessageData() {
    if (isJSONp) {
      var baseUrl =
        proxyEndpoint +
        "/jsonp/consent/tcfv2/vendor-list/categories?siteId=" +
        propertyId +
        "&consentLanguage=" +
        consentLanguage;
      jsonpGet(baseUrl, "handleMessageDataForJsonP");
    } else {
      messageCategoryData = JSON.parse(
        httpGet(
          baseEndpoint +
            "/consent/tcfv2/vendor-list/categories?siteId=" +
            propertyId +
            "&consentLanguage=" +
            consentLanguage
        )
      );
      buildMessage();
    }
  }

  function buildMessage() {
    if (buildMessageComponents) {
      var data = messageCategoryData;
      updateQrUrl(getQrCodeUrl());

      var allVendorCountElements =
        document.getElementsByClassName("all_vendor_count");
      for (var i = 0; i < allVendorCountElements.length; i++) {
        allVendorCountElements[i].innerHTML = data.allVendorCount;
      }

      var iabVendorCountElements =
        document.getElementsByClassName("iab_vendor_count");
      for (var i = 0; i < iabVendorCountElements.length; i++) {
        iabVendorCountElements[i].innerHTML = data.iabVendorCount;
      }

      // Template and containers
      var stackTemplate = document.getElementById("stack_template");
      if (!stackTemplate) {
        onError("099", "Template with ID 'stack_template' not found.");
        return;
      }
      var templateHTML = stackTemplate.innerHTML;

      var stacksContainers = document.getElementsByClassName("sp_stacks");
      var purposesContainers = document.getElementsByClassName("sp_purposes");

      // Use DocumentFragment for batch updates
      var stacksFragment = document.createDocumentFragment();
      var purposesFragment = document.createDocumentFragment();

      for (var j = 0; j < data.categories.length; j++) {
        var category = data.categories[j];

        // Populate template
        var newHTML = templateHTML;
        newHTML = newHTML
          .replace("{name}", category.name || "")
          .replace("{description}", category.description || "");

        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = newHTML;

        while (tempDiv.firstChild) {
          if (category.type === "IAB_STACK") {
            stacksFragment.appendChild(tempDiv.firstChild);
          } else if (category.type === "IAB_PURPOSE") {
            purposesFragment.appendChild(tempDiv.firstChild);
          }
        }
      }

      for (var k = 0; k < stacksContainers.length; k++) {
        stacksContainers[k].appendChild(stacksFragment.cloneNode(true));
      }
      for (var k = 0; k < purposesContainers.length; k++) {
        purposesContainers[k].appendChild(purposesFragment.cloneNode(true));
      }

      messageElementsAdded = true;
      onMessageComposed();
    }
  }

  function sampleUser(sampleRate) {
    if (!sampledUser) {
      var randomValue = Math.random();
      sampledUser = randomValue < sampleRate;
      setCookie("sp_su", JSON.stringify(sampledUser), expirationInDays);
    }

    return sampledUser;
  }

  function getSampleUser() {
    if (sampledUser === "true") {
      return true;
    } else {
      return false;
    }
  }

  function toQueryParams(obj, prefix) {
    const str = [];

    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;

      const value = obj[key];
      const k = prefix ? `${prefix}[${key}]` : key;

      if (value !== null && typeof value === "object") {
        if (Array.isArray(value)) {
          value.forEach((val, index) => {
            str.push(toQueryParams(val, `${k}[${index}]`));
          });
        } else {
          str.push(toQueryParams(value, k));
        }
      } else {
        str.push(`${encodeURIComponent(k)}=${encodeURIComponent(value)}`);
      }
    }
    return str.join("&");
  }

  function sendReportingData() {
    sampleUser(metaData.gdpr.sampleRate);
    if (sampledUser === "true") {
      var data = {
        gdpr: {
          applies: true,
          consentStatus,
          accountId: accountId,
          euconsent: euConsentString,
          mmsDomain: baseEndpoint,
          propertyId: propertyId,
          siteId: propertyId,
          pubData: {},
          uuid: consentUUID,
          sampleRate: metaData.gdpr.sampleRate,
          withSiteActions: true,
        },
      };

      if (messageMetaData) {
        data.gdpr.categoryId = messageMetaData.categoryId;
        data.gdpr.subCategoryId = messageMetaData.subCategoryId;
        data.gdpr.msgId = messageMetaData.messageId;
        data.gdpr.prtnUUID = messageMetaData.prtnUUID;
      }

      if (isJSONp) {
        useJsonpPostRequest("/wrapper/v2/pv-data", data, "handlePvResponse");
      } else {
        var fullUrl =
          baseEndpoint +
          "/wrapper/v2/pv-data?hasCsp=true&env=prod&ch=" +
          cb +
          "&scriptVersion=" +
          scriptVersion +
          "&scriptType=" +
          scriptType;
        var req = createPostRequest(fullUrl);
        req.onreadystatechange = function () {
          if (req.readyState !== 4) return;
          if (req.status === 200) {
            onInfo("PV-Daten send:", req.responseText);
          } else if (req.readyState === 4) {
            onError("PV-ERROR:" + req.status, req.responseText);
          }
        };
        req.send(JSON.stringify(data));
      }
    }
  }

  function getMetaData() {
    var params = {
      hasCsp: "true",
      accountId: accountId,
      //hardcode PROD ENV
      env: "prod",
      //hardcode GDPR Campaign
      metadata: '{"gdpr":{}}',
      propertyId: propertyId,
      scriptVersion: scriptVersion,
      scriptType: scriptType,
    };

    if (isJSONp) {
      var baseUrl = proxyEndpoint + "/jsonp/wrapper/v2/meta-data";
      var res = jsonpGet(buildUrl(baseUrl, params), "handleMetaDataForJsonP");
    } else {
      var baseUrl = baseEndpoint + "/wrapper/v2/meta-data";
      var res = JSON.parse(httpGet(buildUrl(baseUrl, params)));
      if (res === undefined) {
        onError("010", "MetaDataCall failed");
      } else {
        metaData = res;
        gdprApplies = metaData.gdpr.applies;
        onMetaDataReceived();
      }
      setItem("metaData_" + propertyId, metaData, expirationInDays);
    }
  }

  function handleMetaDataForJsonP(data) {
    gdprApplies = data.gdpr.applies;
    metaData = data;
    setItem("metaData_" + propertyId, metaData, expirationInDays);
    onMetaDataReceived(); // Event triggern
  }

  function handleMessageDataForJsonP(data) {
    messageCategoryData = data;
    buildMessage();
  }

  function handleGetMessagesForJsonP(data) {
    localState = data.localState;
    setItem(
      "localState_" + propertyId,
      JSON.parse(data.localState),
      expirationInDays
    );
    nonKeyedLocalState = data.nonKeyedLocalState;
    setItem(
      "nonKeyedLocalState_" + propertyId,
      JSON.parse(data.nonKeyedLocalState),
      expirationInDays
    );

    if (checkMessageJson(data)) {
      showElement(messageDiv);
    } else {
      onConsentReady();
    }
  }

  function handleGetConsentStatusForJsonP(data) {
    if (typeof data.consentStatusData.gdpr !== undefined) {
      hasLocalData = true;
      storeConsentResponse(
        data.consentStatusData.gdpr.consentStatus,
        data.consentStatusData.gdpr.uuid,
        data.consentStatusData.gdpr.dateCreated,
        data.consentStatusData.gdpr.euconsent,
        data.consentStatusData.gdpr.grants,
        data.consentStatusData.gdpr.acceptedCategories,
        data.consentStatusData.gdpr.acceptedVendors,
        data.consentStatusData.gdpr.legIntVendors,
        data.consentStatusData.gdpr.legIntCategories
      );
    }
  }

  function handlePvResponse(data) {
    return true;
  }

  function handleJsonpAcceptAllCall(data) {
    if (data) {
      storeConsentResponse(
        consentStatus,
        data.uuid,
        data.dateCreated,
        euConsentString,
        vendorGrants,
        acceptedCategories,
        acceptedVendors,
        legIntVendors,
        legIntCategories
      );
    } else {
      onError("Invalid response in handleJsonpAcceptAllCall");
    }
  }

  function handleAcceptAllResponse(data) {
    if (data && data.gdpr) {
      sendAcceptAllRequest(data);
    } else {
      onError("Invalid response in handleAcceptAllResponse");
    }
  }

  function handleLiOnlyResponse(data) {
    sendGranularChoiceRequest(data);
  }

  function handleLiOnlyCall(data) {
    storeConsentResponse(
      data.consentStatus,
      data.uuid,
      data.dateCreated,
      data.euconsent,
      data.grants,
      data.acceptedCategories,
      data.acceptedVendors,
      data.legIntVendors,
      data.legIntCategories
    );
  }

  function handleRejectAllResponse(data) {
    sendRejectAllChoiceRequest(data);
  }

  function handleRejectAllCall(data) {
    storeConsentResponse(
      data.consentStatus,
      data.uuid,
      data.dateCreated,
      data.euconsent,
      data.grants,
      data.acceptedCategories,
      data.acceptedVendors,
      data.legIntVendors,
      data.legIntCategories
    );
  }

  function isReadyToExecute({
    timeout = 5000,
    interval = 200,
    startTime = Date.now(),
  } = {}) {
    if (isMetaDataAvailable && isSpObjectReady) {
      triggerEvent("readyToExecute");
      isReadyToExectute = true;
      return true;
    }

    if (Date.now() - startTime >= timeout) {
      if (typeof onError === "function") {
        onError("Timeout in isReadyToExecute");
      }
      return false;
    }
    isReadyToExectute = false;
    setTimeout(() => {
      isReadyToExecute({ timeout, interval, startTime });
    }, interval);

    return false;
  }
})();
