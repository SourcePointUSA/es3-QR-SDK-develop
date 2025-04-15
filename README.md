# Sourcepoint ES3 QR SDK Usage Documentation

The Sourcepoint ES3 QR SDK is a lightweight, ES3-compliant JavaScript library that simplifies the integration of a GDPR consent banner with QR code functionality for connecting CMP user accounts. It supports two initialization methods and offers an optional parameter to expose helper functions globally.

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Configuration Parameters](#configuration-parameters)
4. [Initialization Methods](#initialization-methods)
5. [Helper Functions](#global-exposure-of-helper-functions)
6. [Event Callbacks](#event-callbacks)
7. [Dynamic Template Setup](#dynamic-template-setup)

---

## 1. Overview

The ES3 QR SDK enables publishers to quickly implement a GDPR consent banner with QR code support. It supports:

- **Global Configuration:** Define a global configuration object (e.g., `window._sp_.config`) before the SDK is loaded. If present, the SDK automatically initializes.
- **Explicit Initialization:** If no global configuration is present, you can initialize the SDK later by calling `sp_init(config)`.

In both cases, if you set the optional `exposeGlobals` parameter to `true`, key helper functions will also be attached to the global `window` object.

---

## 2. Installation

Include the required JavaScript and CSS files in your HTML. For example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GDPR Banner Example</title>
  <link rel="stylesheet" href="./css/rc-interaction.css">
  <script src="./js/rc-buttons.js" type="text/javascript"></script>
  <script src="./js/rc-interaction.js" type="text/javascript"></script>
</head>
<body>
  <!-- Your application markup here -->

  <!-- Option 1: Global Configuration -->
  <script type="text/javascript">
    window._sp_ = {
      config: {
        accountId: 22,
        propertyId: 37811,
        propertyHref: "https://ott.es3",
        baseEndpoint: "https://cdn.privacy-mgmt.com/",
        messageDiv: "native_message",
        pmDiv: "pm",
        qrId: "qr",
        pmId: 1196474,
        consentLanguage: "de",
        isSPA: false,
        buildMessageComponents: true,
        exposeGlobals: true,  // When true, helper functions will be attached globally
        qrUrl: "https://cdn.privacy-mgmt.com/wrapper/qrcode?text=",
        pmUrl: "https://cdn.privacy-mgmt.com/ott/pm.html",
        events: {
          onConsentReady: function(consentUUID, euconsent, vendorGrants, consentStatus, purposes) {
            console.log("Custom - onConsentReady");
            console.log("consentUUID:", consentUUID);
            console.log("euconsent:", euconsent);
          },
          onMessageComposed: function() {
            console.log("onMessageComposed");
            // Add any UI post-processing here
          }
        }
      }
    };
  </script>

  <!-- Load the SDK -->
  <script src="nativeMessaging.js" type="text/javascript"></script>

  <!-- Option 2: Explicit Initialization (if no global configuration exists) -->
  <!--
  <script type="text/javascript">
    sp_init({
      accountId: 22,
      propertyId: 37811,
      propertyHref: "https://ott.es3",
      baseEndpoint: "https://cdn.privacy-mgmt.com/",
      messageDiv: "native_message",
      pmDiv: "pm",
      qrId: "qr",
      pmId: 1196474,
      consentLanguage: "de",
      isSPA: false,
      buildMessageComponents: true,
      exposeGlobals: true,
      qrUrl: "https://cdn.privacy-mgmt.com/wrapper/qrcode?text=",
      pmUrl: "https://cdn.privacy-mgmt.com/ott/pm.html",
      events: {
        onConsentReady: function(consentUUID, euconsent, vendorGrants, consentStatus, purposes) {
          console.log("Custom - onConsentReady");
        },
        onMessageComposed: function() {
          console.log("onMessageComposed");
        }
      }
    });
  </script>
  -->
</body>
</html>
```


## 3. Configuration Parameters

| Parameter                 | Type      | Required | Description                                                                                                                                          |
|---------------------------|-----------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| **accountId**             | Integer   | Yes      | Unique identifier for your Sourcepoint account.                                                                                                    |
| **propertyId**            | Integer   | Yes      | Identifier mapping the implementation to a specific URL (as configured in the Sourcepoint dashboard).                                                |
| **propertyHref**          | String    | Yes      | The URL or property name to connect.                                                                                                                 |
| **baseEndpoint**          | String    | Yes      | API endpoint; default is `https://cdn.privacy-mgmt.com/`.                                                                                           |
| **messageDiv**            | String    | Yes      | ID of the `<div>` element where the consent message will be displayed.                                                                               |
| **pmDiv**                 | String    | Yes      | ID of the `<div>` element designated for the privacy manager.                                                                                        |
| **qrId**                  | String    | Yes      | ID of the `<img>` element where the QR code will be rendered.                                                                                        |
| **pmId**                  | Integer   | Yes      | ID of the privacy message (for the second layer).                                                                                                    |
| **consentLanguage**       | String    | Yes      | Language code (ISO 639-1) used to force the message into a specific language.                                                                        |
| **isSPA**                 | Boolean   | No       | Set to `true` for single-page applications. Messaging is triggered only when `executeMessaging()` is called.                                           |
| **buildMessageComponents**| Boolean  | No       | If set to `true` (default), dynamic UI components will be built and injected into your page.                                                          |
| **exposeGlobals**         | Boolean   | No       | If `true`, key helper functions (e.g., `executeMessaging`, `acceptAll`, etc.) are attached to the `window` object for global access.                  |
| **disableLocalStorage**         | Boolean   | No       | If `true`, only cookies will be set and no use of the localStorage, if this is not set the script will use cookies if localStorage is not available  |
| **qrUrl**                 | String    | Optional | URL of the QR code generator.                                                                                                                        |
| **pmUrl**                 | String    | Optional | URL for the privacy manager's second-layer page.                                                                                                     |
| **events**                | Object    | Optional | Contains event callback functions such as `onConsentReady` and `onMessageComposed`.                                                                   |

---

## 4. Initialization Methods

### Global Configuration

If you define the configuration globally (as shown in the installation example), the SDK will automatically initialize when it is loaded.

### Explicit Initialization

If no global configuration is present, call the `sp_init(config)` function after the SDK is loaded. This function will set up your configuration and trigger initialization.

---

## 5. CMP methods

| Method                 | Use Case                                                                                     | Return Value                                                                 |
|------------------------|----------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| `_sp_.executeMessaging()`     | Triggers the loading of messaging components (e.g., banners, modals).                        | `void`                                                                       |
| `_sp_.loadPrivacyManagerModal()` | Displays the second layer on demand                                                         | `void`                                                                       |
| `_sp_.consentStatus()`        | Retrieves current consent status for the user.                                               | `<Object>`<br>`{`<br>&nbsp;&nbsp;`rejectedAny: false,`<br>&nbsp;&nbsp;`rejectedLI: false,`<br>&nbsp;&nbsp;`consentedAll: true,`<br>&nbsp;&nbsp;`consentedToAny: true,`<br>&nbsp;&nbsp;`granularStatus: { vendorConsent: 'ALL', vendorLegInt: 'ALL', purposeConsent: 'ALL', purposeLegInt: 'ALL', previousOptInAll: false },`<br>&nbsp;&nbsp;`hasConsentData: true`<br>`}` |
| `_sp_.getTcString()`          | Fetches the IAB Transparency & Consent (TC) string.                                          | `<string>`                                                            |
| `_sp_.getQrCodeUrl()`         | Generates a URL for the second screen QR code.                                               | `<string>`                                                            |
| `_sp_.getMessageData()`       | Retrieves message meta data such as stacks, purposes, and vendor count.                      | `<Object>`<br>`{`<br>&nbsp;&nbsp;`categories: [...],`<br>&nbsp;&nbsp;`language: 'DE',`<br>&nbsp;&nbsp;`iabVendorCount: 3,`<br>&nbsp;&nbsp;`allVendorCount: 5`<br>`}` |
| `_sp_.clearUserData()`        | Clears all consent and identification data for the current user on the device.              | `<boolen>`                                                              |
| `_sp_.updateConsentStatus()`  | Fetches the latest consent status from the Backend.                                          | `<void>`                                                              |
### Button Actions

The SDK includes built-in actions to handle user interactions. For example:

| Action                          | Description                                                                   | Example Code                        |
|---------------------------------|-------------------------------------------------------------------------------|-------------------------------------|
| **Accept All**                  | Accepts all consent options.                                                  | `_sp_.acceptAll();`                 |
| **Continue Without Accepting**  | Proceeds without granting explicit consent.                                   | `_sp_.continue();`                  |
| **Reject All**                  | Rejects all consent options.                                                  | `_sp_.reject();`                    |
| **Open Privacy Manager**        | Opens the privacy manager modal for detailed settings.                        | `_sp_.loadPrivacyManagerModal();`   |
| **Start Messaging**             | Initiates the CMP experience by starting the messaging flow.                  | `_sp_.executeMessaging();`          |
| **Update Consent Status**       | Refreshes consent status, useful if users update settings via the QR code.      | `_sp_.updateConsentStatus();`       |


### Global Exposure of Methods
If `exposeGlobals` is set to `true` in your configuration, the following helper functions will be attached to the `window` object:

- `executeMessaging`
- `loadPrivacyManagerModal`
- `acceptAll`
- `spContinue` *(alias for continue, as "continue" is reserved)*
- `reject`
- `consentStatus`
- `getTcString`
- `getQrCodeUrl`
- `getMessageData`
- `clearUserData`
- `updateConsentStatus`

This allows you to call these functions directly from the global scope.

---

## 6. Event Callbacks

You can provide event callbacks in your configuration. For example:

```js
events: {
  onConsentReady: function( consentUUID, euconsent, vendorGrants, consentStatus, purposes) {
    console.log("OnConsentReady");
  },
  onMessageComposed:function(){
    console.log("onMessageComposed");
    const accordions = document.querySelectorAll(".accordion");
    accordions.forEach(accordion => {
      accordion.addEventListener("click", () => {
        accordion.classList.toggle("active");
        const panel = accordion.nextElementSibling;
        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
      });
    });
  },
  onMetaDataReceived:function(metaData){
      console.log("onMetaDataReceived", metaData)
  },                    
  onConsentStatusReceived:function(consentStatus){
      console.log("onConsentStatusReceived", consentStatus)

  },
  onMessageReceivedData:function(messageMetaData){
      console.log("omMessageReceivedData", messageMetaData)
  },
  firstLayerShown:function(){
      console.log("firstLayerShown")
  },
  secondLayerShown:function(){
      console.log("secondLayerShown");
  },
  firstLayerclosed:function(){
      console.log("firstLayerClosed callback");
  },
  secondLayerClosed:function(){
      console.log("secondLayerClosed");
  },
  onError:function(errorCode, message){
      console.log("OnError" , message);
  },
}
```

### Callback Reference

| **Callback**              | **Description**                                                                 | **Return Values**                                                                                      | **Typical Use Cases**                                                                 |
|---------------------------|---------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| `onConsentReady`          | Fired when the SDK is initialized and consent data is available.                | `consentUUID`, `euConsentString`, `vendorGrants`, `consentStatus`, `consentedPurposes`                 | Initialize consent-based logic, load scripts based on user choices.                   |
| `onMessageComposed`       | Triggered when the message UI has been dynamically rendered.                    | *(none)*                                                                                                | Add interactivity (e.g., accordions), apply custom styling to the message.            |
| `onMetaDataReceived`      | Returns CMP metadata after initialization.                                      | `metaData`                                                                                              | Log CMP config, conditionally render UI components.                                   |
| `onConsentStatusReceived` | Fired when valid consent status is retrieved from the backend.                      | `consentStatus`                                                                                         | Preload behavior based on consent before displaying UI.                               |
| `onMessageReceivedData`   | Provides metadata about the rendered message.    | `messageMetaData`                                                                                       | Log impressions, conditional behavior based on message type.                          |
| `firstLayerShown`         | Called when the first layer of the consent message is displayed.                | *(none)*                                                                                                | Track impressions, modify first layer styling.                                        |
| `secondLayerShown`        | Called when the second layer (detailed preferences) is displayed.               | *(none)*                                                                                                | Track user interaction depth, update UI.                                               |
| `firstLayerClosed`        | Triggered when the first layer is closed.                                       | *(none)*                                                                                                | Trigger conditional loading, log closure action.                                      |
| `secondLayerClosed`       | Triggered when the second layer is closed (if previously visible).              | *(none)*                                                                                                | Reset state, analytics on detailed interaction.                                       |
| `onError`                 | Fired on any SDK execution error.                                               | `errorCode`, `errorText`                                                                                | Log errors, trigger fallback or error reporting.                                      |
                                 |



## 7. Dynamic Template Setup

The SDK supports dynamic UI generation via HTML templates. Follow these steps:

1. **Add Vendor Count Placeholders**

   Insert placeholders in your HTML where vendor counts will be displayed:

   ```html
   <span class="all_vendor_count"></span>
   <span class="iab_vendor_count"></span>
   ```

2. Define a Template
    
    Create a hidden template element with placeholders for dynamic data:
   ```html
    <div id="stack_template" style="display: none;">
      <div class="item">
        <h2>{name}</h2>
        <p>{description}</p>
      </div>
    </div>
   ```

3. Add Containers

    Provide containers where the populated templates will be injected:
   ```html
    <div class="sp_stacks"></div>
    <div class="sp_purposes"></div>
   ```


---

## 8. Outstanding Issues

- **Custom Consent Updates:** Post and revoke custom consent functionality is under development.
- **Text Element Integration:** Further work is in progress to pull text elements from the Sourcepoint portal for enhanced customization.

---

