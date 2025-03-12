(function() {

	var hasLocalData = false;
	var	granularStatus = null;
	var	consentAllRef = null;

	var console = window.console || { log: function() {return true}, error: function() {document.write(v)} };

	if (typeof _sp_ === 'undefined') {
		console.error("_sp_ - object undefined");
	}

	var env = "prod";
	var scriptVersion = "2.0.0";
	var scriptType = "nativeqr";
	var consentUUID = getCookieValue("consentUUID");
	var sampledUser = getCookieValue("sp_su");
	var authId = getCookieValue("authId") || _sp_.config.authId;
	var cb = Math.floor(Math.random() * 1000000);

	var mmsDomain = _sp_.config.baseEndpoint;

	var propertyHref = _sp_.config.propertyHref;
	var propertyId = _sp_.config.propertyId;
	var accountId = _sp_.config.accountId;
	var consentLanguage = _sp_.config.consentLanguage || "EN";
	var isSPA = _sp_.config.isSPA;
	var isJSONp = _sp_.config.isJSONp;
	var baseEndpoint = _sp_.config.baseEndpoint.replace(/\/+$/, "");

	var dateCreated = getCookieValue("consentDate_"+propertyId);
	var euConsentString = getItem("euconsent-v2_"+propertyId);

	var consentStatus = getItem("consentStatus_"+propertyId) || null
	var localState = getItem("localState_"+propertyId);
	getMetaData();

	var metaData = getItem("metaData_"+propertyId);
	var	gdprApplies = metaData.gdpr.applies;

	var vendorGrants = getItem("vendorGrants_"+propertyId);
	var nonKeyedLocalState = getItem("nonKeyedLocalState_"+propertyId);

	var consentedPurposes = getItem("consentedPurposes_"+propertyId);

	var messageDiv = _sp_.config.messageDiv;
	var pmDiv = _sp_.config.pmDiv;
	var pmId = _sp_.config.pmId;

	var messageId = null;
	var messageMetaData = null; 
	var localState = null;

	var messageElementsAdded = false; 
 
    if (consentUUID == null) {
        consentUUID = generateUUID();
        setCookie("consentUUID", consentUUID, 365);
    } 

    if (authId == null) {
        authId = generateUUID();
        setCookie("authId", authId, 365);
    } 

    /*Polyfill for JSON*/
	if (!window.JSON) {
	    window.JSON = {
	        stringify: function(obj) {
	            var t = typeof(obj);
	            if (t != "object" || obj === null) {
	                // simple data type
	                if (t == "string") obj = '"' + obj + '"';
	                return String(obj);
	            } else {
	                // array or object
	                var n, v, json = [],
	                    arr = (obj && obj.constructor == Array);
	                for (n in obj) {
	                    v = obj[n];
	                    t = typeof(v);
	                    if (t == "string") v = '"' + v + '"';
	                    else if (t == "object" && v !== null) v = JSON.stringify(v);
	                    json.push((arr ? "" : '"' + n + '":') + String(v));
	                }
	                return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
	            }
	        }
	    };
	}

	// Polyfill für JSON.parse
	if (typeof JSON.parse !== 'function') {
	    JSON.parse = function(text) {
	        try {
	            return (new Function('return ' + text))();
	        } catch (e) {
	            throw new SyntaxError('JSON.parse: ungültiges JSON-Format');
	        }
	    };
	}

    function extendSpObject() {	
        _sp_.executeMessaging = function() {+
        	hideElement(pmDiv);
       		hideElement(messageDiv);
			getMessages();
            console.log('Messaging executed!');
        };

        _sp_.loadPrivacyManagerModal = function() {
        	showElement(pmDiv);
       		hideElement(messageDiv);
        };

        _sp_.acceptAll = function(){
        	hideElement(pmDiv);
        	hideElement(messageDiv);
        	acceptAll();
        }

        _sp_.continue = function(){
        	hideElement(pmDiv);
        	hideElement(messageDiv);
        	liOnly();
        }

        _sp_.reject = function(){
        	hideElement(pmDiv);
        	hideElement(messageDiv);
        	rejectAll();
        } 
        _sp_.consentStatus = function(){
        	return consentStatus;
        }

        _sp_.getTcString = function(){
        	return euConsentString;
        }

        _sp_.clearUserData = function(){
        	deleteCookie("authId");
        	deleteCookie("consentUUID");
        	deleteItem("metaData_"+propertyId);
        	deleteCookie("consentDate_"+propertyId);
        	deleteItem("consentStatus_"+propertyId);
        	deleteItem("euconsent-v2_"+propertyId);
        	deleteItem("localState_"+propertyId);
        	deleteItem("nonKeyedLocalState_"+propertyId);
        	deleteItem("vendorGrants_"+propertyId);
        	deleteCookie("sp_su");
        	return true; 
        }

        _sp_.updateConsentStatus = function(){
        	hideElement(pmDiv);
        	hideElement(messageDiv);
        	getConsentStatus();
			getMessages();
        }     
    }

	window._sp_.config.events = window._sp_.config.events || {};

	var triggerEvent = function(eventName, args) {
	    var event = window._sp_.config.events[eventName];
	    if (typeof event === 'function') {
	        event.apply(null, args || []); // Event mit Parametern ausführen
	    }
	};

	function onConsentReady(){
		triggerEvent('onConsentReady', [consentUUID,euConsentString,vendorGrants,consentStatus, consentedPurposes]);
	}

	function onMessageComposed(){
		triggerEvent('onMessageComposed');
	}

	function showElement(elementId) {
	    var element = document.getElementById(elementId); // Hol das Element mit der ID
	    if (element) {
	        element.style.display = 'block'; // Setzt display auf block, um das Element anzuzeigen
	    }
	}

	function hideElement(elementId) {
	    var element = document.getElementById(elementId); // Hol das Element mit der ID
	    if (element) {
	        element.style.display = 'none'; // Setzt display auf block, um das Element anzuzeigen
	    }
	}

	function httpGet(theUrl) {
	    var xmlHttp = new XMLHttpRequest();
	    xmlHttp.open("GET", theUrl, false); // false for synchronous request
	    xmlHttp.send(null);
	    return xmlHttp.responseText;
	}

	function compareDates(date1, date2) {
	    var d1 = (typeof date1 === "object" && date1 instanceof Date) ? date1 : new Date(date1);
	    var d2 = (typeof date2 === "object" && date2 instanceof Date) ? date2 : new Date(date2);

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
	      paramArray.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
	    }
	  }

	  return url + paramArray.join("&");
	}

	function generateUUID() {
	    var chars = '0123456789abcdef'.split('');
	    var uuid = [],
	        rnd = Math.random,
	        r;

	    for (var i = 0; i < 36; i++) {
	        if (i === 8 || i === 13 || i === 18 || i === 23) {
	            uuid[i] = '-';
	        } else if (i === 14) {
	            uuid[i] = '4';  
	        } else {
	            r = 0 | rnd() * 16;  
	            uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
	        }
	    }

	    return uuid.join('');
	}

	function setCookie(name, value, days) {
	    var expires = "";
	    if (days) {
	        var date = new Date();
	        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); 
	        expires = "; expires=" + date.toUTCString();
	    }
	    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
	}

	function checkMessageJson(response) {
	    if (response.campaigns && Array.isArray(response.campaigns)) {
	        for (var i = 0; i < response.campaigns.length; i++) {
	            var campaign = response.campaigns[i];

	            if (campaign.message && campaign.message.message_json) {
	            	messageMetaData = campaign.messageMetaData
	            	messageId = campaign.messageMetaData.messageId;
	                return campaign.message.message_json;
	            }
	        }
	    }
		return false;
	}


	function shouldCallMessagesEndpoint(){
		var shouldCall = false;

		if ((consentStatus === null)|| (!consentStatus.consentedAll)) {
			return true
		}
		
		if (dateCreated !== null) {
		    if (compareDates(metaData.gdpr.legalBasisChangeDate, dateCreated) === 1) {
		        consentStatus.legalBasisChanges = true;
		        shouldCall = true;
		    }
		    if (compareDates(metaData.gdpr.additionsChangeDate, dateCreated) === 1) {
		        consentStatus.vendorListAdditions = true;
		        shouldCall = true
		    }
		} 

		return shouldCall;
	}
 
	function getMessages() {
		console.log("startGetMessages");
		if (shouldCallMessagesEndpoint()) {
    		console.log("notconsentedTOAll requesting message")
 
    		var baseURL = baseEndpoint + '/wrapper/v2/messages';
	    	var queryParams = '?hasCsp=true&env=prod';

		    var body = {    
		        accountId: accountId,
		        campaignEnv: "prod",
		        campaigns: {
		            gdpr: {
		                consentStatus: consentStatus,
		                hasLocalData: hasLocalData,
		                targetingParams: {},
		            }
		        },
		        clientMMSOrigin: baseEndpoint,
		        hasCSP: true,
		        includeData: {
		            localState: {
		                type: "string"
		            },
		            actions: {
		                type: "RecordString"
		            },
		            cookies: {
		                type: "RecordString"
		            }
		        },
		        propertyHref: propertyHref,
		        propertyId: propertyId,
		        authId: authId,

		    };
 
		    var fullURL = baseURL + queryParams +
		        '&body=' + json2QueryParam(body) +
		        '&localState=' + json2QueryParam(localState) +
		        '&metadata=' +json2QueryParam(metaData) +
		        '&nonKeyedLocalState=' + json2QueryParam(nonKeyedLocalState)+
		        '&ch=' + cb +
		        '&scriptVersion='+scriptVersion+'&scriptType='+scriptType;


			    var res = JSON.parse(httpGet(fullURL));

			    localState = res.localState;
			    setItem("localState_" + propertyId, JSON.parse(res.localState), 365);
			    nonKeyedLocalState = res.nonKeyedLocalState;
			    setItem("nonKeyedLocalState_" + propertyId, JSON.parse(res.nonKeyedLocalState), 365);

			    if (checkMessageJson(res)) {
			        showElement(messageDiv);
			    }
			    else{
	    			onConsentReady()
	    		}
    		}else{
    			    	onConsentReady()
    		}

		sendReportingData();
	}

	function json2QueryParam(jsonObject){
 
		if( typeof(jsonObject) == "string"){
			return  encodeURIComponent(jsonObject);
		}else{
			return encodeURIComponent(JSON.stringify(jsonObject))
		}
		 
	}

	function updateQrUrl(newUrl) {
	    var image = document.getElementById(_sp_.config.qrId);

	    if (image) {
	        var timestamp = new Date().getTime(); 
	        var separator = newUrl.indexOf('?') === -1 ? '?' : '&'; 
	        image.src = newUrl + separator + 't=' + timestamp;
	    }
	}

	function acceptAll() {
	    var baseUrl = _sp_.config.baseEndpoint + '/wrapper/v2/choice/consent-all';
	    var queryParams = {
	        hasCsp: 'true',
	        authId: authId,
	        accountId: accountId,
	        env: 'prod',
	        includeCustomVendorsRes: 'true',
	        metadata: JSON.stringify(metaData),
	        propertyId: propertyId,
	        withSiteActions: 'true',
	        ch: cb,
	        scriptVersion: scriptVersion,
	        scriptType: scriptType
	    };

	    var queryString = [];
	    for (var key in queryParams) {
	        if (queryParams.hasOwnProperty(key)) {
	            queryString.push(encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key]));
	        }
	    }

	    var consentdata = httpGet(baseUrl + '?' + queryString.join('&'));

	    sendAcceptAllRequest(JSON.parse(consentdata));
	    hideElement(messageDiv);
	}

	function liOnly(){

	    /*get LI only Purposes and vendors*/
	    var liURL = baseEndpoint + '/consent/tcfv2/consent/v3/' + propertyId + '/li-only';
	    sendGranularChoiceRequest(JSON.parse(httpGet(liURL)));
	}



	function rejectAll(){
	    var baseUrl = baseEndpoint + '/wrapper/v2/choice/reject-all';
	    var queryParams = {
	        hasCsp: 'true',
	        authId: authId,
	        accountId: accountId,
	        env: 'prod',
	        includeCustomVendorsRes: 'true',
	        metadata: JSON.stringify(metaData), // URL-encoded JSON
	        propertyId: propertyId,
	        withSiteActions: 'true',
	        ch: cb,
	        scriptVersion: scriptVersion,
	        scriptType: scriptType
	    };

	    var queryString = [];
	    for (var key in queryParams) {
	        if (queryParams.hasOwnProperty(key)) {
	            queryString.push(encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key]));
	        }
	    }

	    var consentdata = httpGet(baseUrl + '?' + queryString.join('&'));

	    sendRejectAllChoiceRequest(JSON.parse(consentdata));
	    hideElement(messageDiv);
	}



	function sendGranularChoiceRequest(pmSaveAndExitVariables){

	    var url = baseEndpoint + '/wrapper/v2/choice/gdpr/1?hasCsp=true&env=prod&ch='+cb+'&scriptVersion='+scriptVersion+'&scriptType='+scriptType;
	    var req = createPostRequest(url);
	    
	    var data = {
	        accountId: accountId,
	        applies: gdprApplies,
	        authId: authId,
	        messageId: messageId,
	        mmsDomain: baseEndpoint,
	        propertyId: propertyId,
	        pubData: {},
	        includeData: {
	            actions: {type: "RecordString"},
	            customVendorsResponse: {type: "RecordString"}
	        },
	        uuid: consentUUID,
	        sampleRate: metaData.gdpr.sampleRate,
	        sendPVData: getSampleUser(),
	        pmSaveAndExitVariables : pmSaveAndExitVariables
	    };

	    req.onreadystatechange = function() {
	        if (req.readyState === 4 && req.status === 200) {
	            var res = JSON.parse(req.responseText);
	            storeConsentResponse(res.consentStatus, res.uuid, res.dateCreated, res.euconsent, res.grants, res.categories);
	        }else{
	            console.error('error:', req.responseText);
	        }
	    };
	    req.send(JSON.stringify(data));
	}

	function sendRejectAllChoiceRequest(consentdata){
	    granularStatus = consentdata.gdpr.consentStatus.granularStatus;
	    consentAllRef =  consentdata.gdpr.consentAllRef;
	    gdprApplies = consentdata.gdpr.gdprApplies;
	 
	    var url = baseEndpoint + '/wrapper/v2/choice/gdpr/13?hasCsp=true&env=prod&ch='+cb+'&scriptVersion='+scriptVersion+'&scriptType='+scriptType;

	    var req = createPostRequest(url);
 
	    var data = {
	        accountId: accountId,
	        applies: gdprApplies,
	        authId: authId,
	        messageId: messageId,
	        mmsDomain: baseEndpoint,
	        propertyId: propertyId,
	        pubData: {},
	        includeData: {
	            actions: {type: "RecordString"},
	            customVendorsResponse: {type: "RecordString"}
	        },
	        uuid: consentUUID,
	        sampleRate: metaData.gdpr.sampleRate,
	        sendPVData: getSampleUser()
		};

	    req.onreadystatechange = function() {
	        if (req.readyState === 4 && req.status === 200) {
	            var res = JSON.parse(req.responseText);
	            storeConsentResponse(res.consentStatus , res.uuid, res.dateCreated, res.euconsent, res.grants, res.categories);
	        }else{
	            console.error('error:', req.responseText);
	        }
	    };

	    req.send(JSON.stringify(data));
	}

	function sendAcceptAllRequest(consentdata) {
		granularStatus = consentdata.gdpr.consentStatus.granularStatus;
		consentAllRef =  consentdata.gdpr.consentAllRef;
		gdprApplies = consentdata.gdpr.gdprApplies;
		euConsentString = consentdata.gdpr.euconsent;
		consentedPurposes = consentdata.gdpr.categories;
	 
	    var url = baseEndpoint + '/wrapper/v2/choice/gdpr/11?hasCsp=true&env=prod&ch='+cb+'&scriptVersion='+scriptVersion+'&scriptType='+scriptType;

	    var data = {
	        accountId: accountId,
	        applies: gdprApplies,
	        authId: authId,
	        messageId: messageId,
	        mmsDomain: baseEndpoint,
	        propertyId: propertyId,
	        pubData: {},
	        includeData: {
	            actions: {type: "RecordString"},
	            customVendorsResponse: {type: "RecordString"}
	        },
	        uuid: consentUUID,
	        sampleRate: metaData.gdpr.sampleRate,
	        sendPVData: getSampleUser(),
	        consentAllRef: consentAllRef,
	        granularStatus:consentStatus,
	        vendorListId: consentdata.gdpr.vendorListId
	    };

	    var req = createPostRequest(url);

	    req.onreadystatechange = function() {
	        if (req.readyState === 4 && req.status === 200) {
	        	var res = JSON.parse(req.responseText);
	        	storeConsentResponse(consentdata.gdpr.consentStatus, res.uuid, res.dateCreated, euConsentString, consentdata.gdpr.grants, consentedPurposes)	
	        }else{
	        	console.error('error:', req.responseText);
	        }
	    };

	    req.send(JSON.stringify(data));
	}


	function setItem(key, value) {
 
	    if (typeof window.localStorage !== "undefined") {
	        try {
	            window.localStorage.setItem(key, JSON.stringify(value));
	        } catch (e) {
	            setCookie(key,JSON.stringify(value), 365);
	        }
	    } else {
	    	 setCookie(key,JSON.stringify(value), 365);
	    }
	}

	function getItem(key) {
 
	    if (typeof window.localStorage !== "undefined") {
	        try {
	            return JSON.parse(window.localStorage.getItem(key));
	        } catch (e) {
	            return JSON.parse(decodeURIComponent(getCookieValue(key)));
	        }
	    } else {
	        return  JSON.parse(decodeURIComponent(getCookieValue(key)));
	    }
	}

	function getCookieValue(name) {
 
	    var cookies = document.cookie.split(';');
	    for (var i = 0; i < cookies.length; i++) {
	        var cookie = cookies[i].trim(); 
	        if (cookie.indexOf(name + "=") === 0) {
	            return cookie.substring((name + "=").length, cookie.length);
	        }
	    }
	    return null; 
	}

	function deleteCookie(name) {
    	document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	}

	function deleteItem(key) {
	    if (typeof window.localStorage !== "undefined") {
	        try {
	            window.localStorage.removeItem(key);
	        } catch (e) {
	            deleteCookie(key);
	        }
	    } else {
	        deleteCookie(key);
	    }
	}




	function storeConsentResponse(conStatus, uuid, cDate, euconsent, vGrants, purposes){	    
	    consentStatus = conStatus;
	    setItem("consentStatus_"+propertyId, conStatus,365);
	    consentUUID = uuid;
		setCookie("consentUUID", uuid, 365);
	    consentDate = cDate;
		setCookie("consentDate_"+propertyId, cDate, 365);   	
	   	euConsentString = euconsent;
	    setItem("euconsent-v2_"+propertyId, euconsent, 365);
		setItem("vendorGrants_"+propertyId,vGrants,365);
	    vendorGrants = vGrants;
		setItem("consentedPurposes_"+propertyId,purposes ,365);
	   	consentedPurposes = purposes
	   	onConsentReady();	
	}

	function getConsentStatus(){
		console.log(consentStatus);
		if (consentStatus !== null) {
			if(consentStatus.consentedAll){
				return;
 			}
		}



	    var baseUrl = baseEndpoint +'/wrapper/v2/consent-status';
	    var params = {
	      hasCsp: 'true',
	      accountId: accountId,
	      env: 'prod',
	      localState: localState,
	      nonKeyedLocalState: nonKeyedLocalState, 
	      metadata: JSON.stringify(metaData),
	      propertyId: propertyId,
	      withSiteActions: 'true',
	      authId: authId,
	      ch: cb,
	      scriptVersion: scriptVersion,
	      scriptType: scriptType
	    
	   };

	   console.log(params);

	    var res = JSON.parse(httpGet(buildUrl(baseUrl, params)));

	    console.log(res);

	    if(typeof(res.consentStatusData.gdpr) !== undefined){
	    	hasLocalData = true;
	    	storeConsentResponse(res.consentStatusData.gdpr.consentStatus, res.consentStatusData.gdpr.consentUUID, res.consentStatusData.gdpr.dateCreated, res.consentStatusData.gdpr.euconsent, res.consentStatusData.gdpr.grants, res.consentStatusData.gdpr.categories);	     
	    }
	}

	function createPostRequest(url){
		var req = new XMLHttpRequest();
	    req.open('POST', url, false);
	    req.setRequestHeader('accept', '*/*');
	    req.setRequestHeader('accept-language', 'de,en;q=0.9');
	    req.setRequestHeader('content-type', 'application/json');
	    return req;
	}

	function buildMessage() {
    	var data = JSON.parse(httpGet(baseEndpoint + "/consent/tcfv2/vendor-list/categories?siteId=" + propertyId + "&consentLanguage="+consentLanguage));
    	
    	updateQrUrl(_sp_.config.qrUrl + encodeURIComponent(_sp_.config.pmUrl +
    		"?authid="+authId + 
			"&consentlanguage="+consentLanguage + 
			"&propertyid="+propertyId +
			"&propertyhref="+propertyHref +
			"&accountid="+accountId +
			"&pmid="+pmId)
		);

	
	    var allVendorCountElements = document.getElementsByClassName("all_vendor_count");
	    for (var i = 0; i < allVendorCountElements.length; i++) {
	        allVendorCountElements[i].innerHTML = data.allVendorCount;
	    }

	    var iabVendorCountElements = document.getElementsByClassName("iab_vendor_count");
	    for (var i = 0; i < iabVendorCountElements.length; i++) {
	        iabVendorCountElements[i].innerHTML = data.iabVendorCount;
	    }

	    // Template and containers
	    var stackTemplate = document.getElementById("stack_template");
	    if (!stackTemplate) {
	        console.error("Template with ID 'stack_template' not found.");
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
	        newHTML = newHTML.replace("{name}", category.name || "")
	                         .replace("{description}", category.description || "")
	                         
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

	function sampleUser(sampleRate) {
		if(!sampledUser){
			var randomValue = Math.random();
			sampledUser = randomValue < sampleRate;
			setCookie("sp_su", JSON.stringify(sampledUser), 365);
		}

		return sampledUser
	}

	function getSampleUser(){
		if(sampledUser === "true"){  
			return true
		}else{
			return false
		}
	}


	function sendReportingData() {
 
	 	sampleUser(metaData.gdpr.sampleRate);
	 	if(sampledUser === "true"){       
	        var data = {
	        	gdpr:{
	        		applies: true,
	        		consentStatus,
	        		accountId: accountId,
		        	euconsent : euConsentString,
		        	mmsDomain: baseEndpoint,
		        	propertyId: propertyId,
		        	siteId: propertyId,
		        	pubData: {},
		        	uuid: consentUUID,
		        	sampleRate: metaData.gdpr.sampleRate,
		        	withSiteActions: true
	        	}
			};

			if (messageMetaData) {
			    data.gdpr.categoryId = messageMetaData.categoryId;
			    data.gdpr.subCategoryId = messageMetaData.subCategoryId;
			    data.gdpr.msgId = messageMetaData.messageId;
			    data.gdpr.prtnUUID = messageMetaData.prtnUUID;
			}

		    var url = baseEndpoint + '/wrapper/v2/pv-data?hasCsp=true&env=prod&ch='+cb+'&scriptVersion='+scriptVersion+'&scriptType='+scriptType;

			var req = createPostRequest(url);

		    req.onreadystatechange = function() {
		        if (req.readyState === 4 && req.status === 200) {
		            var res = JSON.parse(req.responseText);
		        }else{
		            console.error('error:', req.responseText);
		        }
		    };

		    req.send(JSON.stringify(data));
	 	}  
	}

	function getMetaData(){
		var baseUrl = baseEndpoint + '/wrapper/v2/meta-data';
	    var params = {
	      hasCsp: 'true',
	      accountId: accountId,
	      //hardcode PROD ENV
	      env: 'prod',
	      //hardcode GDPR Campaign
	      metadata: '{"gdpr":{}}',
	      propertyId: propertyId,
	      scriptVersion: scriptVersion,
	      scriptType: scriptType
	    };

	    var res = JSON.parse(httpGet(buildUrl(baseUrl, params)));
	    metaData = res;
	    console.log(metaData);


	    setItem("metaData_"+propertyId, metaData,365);
	}

	extendSpObject();
	
	if(!isSPA){
		_sp_.executeMessaging();
	}
	        
    if(!messageElementsAdded){
   		buildMessage();
    }

})();
