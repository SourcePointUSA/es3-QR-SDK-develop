# Sourcepoint QR Code SDK<!-- omit in toc -->

The Sourcepoint QR Code SDK is a lightweight JavaScript library that allows your to surface a GDPR message with QR code functionality on OTT devices that utilize ES3+.

## Table of Content<!-- omit in toc -->

- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Install with Global Configuration](#install-with-global-configuration)
  - [Install with Explicit Initialization](#install-with-explicit-initialization)
- [Configure client parameters](#configure-client-parameters)
  - [Required client configuration parameters](#required-client-configuration-parameters)
  - [Optional client configuration parameters](#optional-client-configuration-parameters)
- [CMP methods](#cmp-methods)
- [Button actions](#button-actions)
- [Global exposure of CMP methods](#global-exposure-of-cmp-methods)
- [Event callbacks](#event-callbacks)
- [Dynamic Template Setup](#dynamic-template-setup)
- [Enable TCF Support](#enable-tcf-support)
- [Support devices that require HTTP](#support-devices-that-require-http)
- [Support devices that require JSONP](#support-devices-that-require-jsonp)

## Prerequisites

Before continuing with the technical configuration of Sourcepoint's QR Code SDK please ensure that you have met the following requirements:

- [Completed Sourcepoint portal configurations for your property](https://docs.sourcepoint.com/hc/en-us/articles/41092772357907-QR-Code)
- OTT device that utilizes ES3+

## Installation

Sourcepoint supports two methods that your organization can use to initialize the QR Code SDK:

| **Method**              | **Description**                                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Global Configuration    | Define a global configuration object (e.g., `window._sp_.config`) before the SDK is loaded. If present, the SDK automatically initializes. Review [Install with Global Configuration](#install-with-global-configuration) for more details. |
| Explicit Initialization | If no global configuration is present, you can initialize the SDK later by calling `sp_init(config)`. Review [Install with Explicit Initialization](#install-with-explicit-initialization) for more details.                                |


### Install with Global Configuration

When installing the QR Code SDK using Global Configuration, in addition to the required Javascript and CSS files your organization will also need to include:

| **Method**                         | **Description**                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Global Configuration client script | The client configuration script contains your organization's specific account configuration parameters. This configuration includes the necessary and optional parameters for your property to communicate with the Sourcepoint messaging platform and consent service libraries. The majority of customizations made to your implementation will be implemented in this script. |
| Native Messaging script            | Points to Sourcepoint native messaging script. This script should be called after the Global Configuration client script.                                                                                                                                                                                                                                                        |

If the configuration is defined globally (as shown in the example below), the QR Code SDK will automatically initialize when it is loaded.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>GDPR Banner Example</title>
    <link rel="stylesheet" href="./css/rc-interaction.css" />
    <script src="./js/rc-buttons.js" type="text/javascript"></script>
    <script src="./js/rc-interaction.js" type="text/javascript"></script>
  </head>
  <body>
    <!-- Your application markup here -->

    <!-- Global Configuration client script-->
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
          exposeGlobals: true, // When true, helper functions will be attached globally
          qrUrl: "https://cdn.privacy-mgmt.com/wrapper/qrcode?text=",
          pmUrl: "https://cdn.privacy-mgmt.com/ott/pm.html",
          events: {
            onConsentReady: function (
              consentUUID,
              euconsent,
              vendorGrants,
              consentStatus,
              purposes
            ) {
              console.log("Custom - onConsentReady");
              console.log("consentUUID:", consentUUID);
              console.log("euconsent:", euconsent);
            },
            onMessageComposed: function () {
              console.log("onMessageComposed");
              // Add any UI post-processing here
            },
          },
        },
      };
    </script>

    <!-- Native Messaging script -->
    <script src="nativeMessaging.js" type="text/javascript"></script>
  </body>
</html>
```

### Install with Explicit Initialization

When installing the QR Code SDK using Explicit Initalization, in addition to the required Javascript and CSS files your organization will also need to include:

| **Method**                           | **Description**                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native Messaging script              | Points to Sourcepoint native messaging script. This script should be called before the Explicit Initialization client script.                                                                                                                                                                                                                                                    |
| Explicit Initalization client script | The client configuration script contains your organization's specific account configuration parameters. This configuration includes the necessary and optional parameters for your property to communicate with the Sourcepoint messaging platform and consent service libraries. The majority of customizations made to your implementation will be implemented in this script. |

If the configuration is defined using Explicit Initialization (as shown in the example below), the `sp_init(config)` function will set up your configuration and trigger initialization after the SDK has loaded:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>GDPR Banner Example</title>
    <link rel="stylesheet" href="./css/rc-interaction.css" />
    <script src="./js/rc-buttons.js" type="text/javascript"></script>
    <script src="./js/rc-interaction.js" type="text/javascript"></script>
  </head>
  <body>
    <!-- Your application markup here -->

    <!-- Native Messaging script -->
    <script src="nativeMessaging.js" type="text/javascript"></script>

    <!-- Explicit Initialization client script -->
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
          onConsentReady: function (
            consentUUID,
            euconsent,
            vendorGrants,
            consentStatus,
            purposes
          ) {
            console.log("Custom - onConsentReady");
          },
          onMessageComposed: function () {
            console.log("onMessageComposed");
          },
        },
      });
    </script>
  </body>
</html>
```

## Configure client parameters

Please refer to the following sections for required and option configuration parameters within your client initialization script (either Global Configuration or Explicit Initialization):

### Required client configuration parameters

The following parameters must be included in your client initialization script:

| Parameter           | Type    | Description                                                                                           |
| ------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| **accountId**       | Integer | Unique identifier for your Sourcepoint account.                                                       |
| **propertyId**      | Integer | Identifier mapping the implementation to a specific URL (as configured in the Sourcepoint dashboard). |
| **propertyHref**    | String  | The URL or property name to connect.                                                                  |
| **baseEndpoint**    | String  | API endpoint; default is `https://cdn.privacy-mgmt.com/`.                                             |
| **messageDiv**      | String  | ID of the ` ` element where the consent message will be displayed.                                    |
| **pmDiv**           | String  | ID of the ` ` element designated for the privacy manager.                                             |
| **qrId**            | String  | ID of the `#` element where the QR code will be rendered.                                             |
| **pmId**            | Integer | ID of the privacy message (for the second layer).                                                     |
| **consentLanguage** | String  | Language code (ISO 639-1) used to force the message into a specific language.                         |

### Optional client configuration parameters

The following parameters can be included in your client initialization script to customize your implementation:

| Parameter                  | Type    | Description                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **cookieDomain**           | String  | Custom cookie domain; default sets the cookies on the sub domain.                                                                                                                                                                                                                                                                                                                                                                 |
| **isSPA**                  | Boolean | Set to `true` for single-page applications. Messaging is triggered only when `executeMessaging()` is called.                                                                                                                                                                                                                                                                                                                      |
| **buildMessageComponents** | Boolean | If set to `true` (default), dynamic UI components will be built and injected into your page.                                                                                                                                                                                                                                                                                                                                      |
| **exposeGlobals**          | Boolean | If `true`, key helper functions (e.g., `executeMessaging`, `acceptAll`, etc.) are attached to the `window` object for global access. See [Global exposure of CMP methods](#global-exposure-of-cmp-methods) for more information.                                                                                                                                                                                                  |
| **disableLocalStorage**    | Boolean | If `true`, only cookies will be set and no use of the localStorage, if this is not set the script will use cookies if localStorage is not available                                                                                                                                                                                                                                                                               |
| **qrUrl**                  | String  | URL of the QR code generator.                                                                                                                                                                                                                                                                                                                                                                                                     |
| **pmUrl**                  | String  | URL for the privacy manager's second-layer page.                                                                                                                                                                                                                                                                                                                                                                                  |
| **secondScreenTimeOut**    | integer | Specifies the duration (in milliseconds) after which the second screen will automatically timeout. If this value is set, the second screen will be dismissed after the specified interval.                                                                                                                                                                                                                                        |
| **expirationInDays**                | Integer | Sets the cookie expiration time in days, default is 365                                                                                                                                                                                                                                                                                                                                                                     |
| **isJSONp**                | Boolean | Enables JSONP requests, if set a `proxyEndpoint` is required.                                                                                                                                                                                                                                                                                                                                                                     |
| **proxyEndpoint**          | String  | proxy url for jsonp                                                                                                                                                                                                                                                                                                                                                                                                               |
| **targetingParams**        | Object  | Targeting params allow a developer to set arbitrary key/value pairs. These key/value pairs are sent to Sourcepoint servers where they can be used to take a decision within the scenario builder. [Click here](https://docs.sourcepoint.com/hc/en-us/articles/4404822445587-Key-value-pair-targeting) to learn more.<br>Targeting parameters can be set in your client configuration or when `_sp_.executeMessaging()` is called. |
| **events**                 | Object  | Contains event callback functions such as `onConsentReady` and `onMessageComposed`. See [Event callbacks](#event-callbacks) for more information.                                                                                                                                                                                                                                                                                 |

## CMP methods

Sourcepoint's QR Code SDK supports the following methods:

> When the client configuration parameter `exposeGlobals` is set to `true`, some of these methods will be attached to the `window` object and these functions can be called directly from the global scope.

| Method                           | Use Case                                                                                                                                                                                     | Return Value                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_sp_.executeMessaging()`        | Triggers the loading of messaging components (e.g., banners, modals). Can also be used to define or override targeting parameters for example `_sp_.executeMessaging({ mode: "nomessage" })` | `<void>`                                                                                                                                                                                                                                                                                                                                                                  |
| `_sp_.loadPrivacyManagerModal()` | Displays the second layer on demand                                                                                                                                                          | `<void>`                                                                                                                                                                                                                                                                                                                                                                  |
| `_sp_.consentStatus()`           | Retrieves current consent status for the user.                                                                                                                                               | `<Object>`<br>`{`<br>&nbsp;&nbsp;`rejectedAny: false,`<br>&nbsp;&nbsp;`rejectedLI: false,`<br>&nbsp;&nbsp;`consentedAll: true,`<br>&nbsp;&nbsp;`consentedToAny: true,`<br>&nbsp;&nbsp;`granularStatus: { vendorConsent: 'ALL', vendorLegInt: 'ALL', purposeConsent: 'ALL', purposeLegInt: 'ALL', previousOptInAll: false },`<br>&nbsp;&nbsp;`hasConsentData: true`<br>`}` |
| `_sp_.getTcString()`             | Fetches the IAB Transparency & Consent (TC) string.                                                                                                                                          | `<string>`                                                                                                                                                                                                                                                                                                                                                                |
| `_sp_.getQrCodeUrl()`            | Generates a URL for the second screen QR code.                                                                                                                                               | `<string>`                                                                                                                                                                                                                                                                                                                                                                |
| `_sp_.getMessageData()`          | Retrieves message meta data such as stacks, purposes, and vendor count.                                                                                                                      | `<Object>`<br>`{`<br>&nbsp;&nbsp;`categories: [...],`<br>&nbsp;&nbsp;`language: 'DE',`<br>&nbsp;&nbsp;`iabVendorCount: 3,`<br>&nbsp;&nbsp;`allVendorCount: 5`<br>`}`                                                                                                                                                                                                      |
| `_sp_.clearUserData()`           | Clears all consent and identification data for the current user on the device.                                                                                                               | `<boolean>`                                                                                                                                                                                                                                                                                                                                                               |
| `_sp_.updateConsentStatus()`     | Fetches the latest consent status from the Backend.                                                                                                                                          | `<void>`                                                                                                                                                                                                                                                                                                                                                                  |

## Button actions

The following methods are built-in actions to handle user interactions:

> When the client configuration parameter `exposeGlobals` is set to `true`, some of these methods will be attached to the `window` object and these functions can be called directly from the global scope.

| Action                         | Description                                                                | Example Code                      |
| ------------------------------ | -------------------------------------------------------------------------- | --------------------------------- |
| **Accept All**                 | Accepts all consent options.                                               | `_sp_.acceptAll();`               |
| **Continue Without Accepting** | Proceeds without granting explicit consent.                                | `_sp_.continue();`                |
| **Reject All**                 | Rejects all consent options.                                               | `_sp_.reject();`                  |
| **Open Privacy Manager**       | Opens the privacy manager modal for detailed settings.                     | `_sp_.loadPrivacyManagerModal();` |
| **Start Messaging**            | Initiates the CMP experience by starting the messaging flow.               | `_sp_.executeMessaging();`        |
| **Update Consent Status**      | Refreshes consent status, useful if users update settings via the QR code. | `_sp_.updateConsentStatus();`     |

## Global exposure of CMP methods

If `exposeGlobals` is set to `true` in your configuration, the following helper functions will be attached to the `window` object:

- `executeMessaging`
- `loadPrivacyManagerModal`
- `acceptAll`
- `spContinue` _(alias for continue, as "continue" is reserved)_
- `reject`
- `consentStatus`
- `getTcString`
- `getQrCodeUrl`
- `getMessageData`
- `clearUserData`
- `updateConsentStatus`

This allows you to call these functions directly from the global scope.

## Event callbacks

Sourcepoint provides the following event callbacks that can be utilized by your organization to execute custom code in response to key events (e.g. when an end user closes the first layer message).

| **Callback**              | **Description**                                                    | **Return Values**                                                                      | **Typical Use Cases**                                                      |
| ------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `onConsentReady`          | Fired when the SDK is initialized and consent data is available.   | `consentUUID`, `euConsentString`, `vendorGrants`, `consentStatus`, `consentedPurposes` | Initialize consent-based logic, load scripts based on user choices.        |
| `onMessageComposed`       | Triggered when the message UI has been dynamically rendered.       | _(none)_                                                                               | Add interactivity (e.g., accordions), apply custom styling to the message. |
| `onMetaDataReceived`      | Returns CMP metadata after initialization.                         | `metaData`                                                                             | Log CMP config, conditionally render UI components.                        |
| `onConsentStatusReceived` | Fired when valid consent status is retrieved from the backend.     | `consentStatus`                                                                        | Preload behavior based on consent before displaying UI.                    |
| `onMessageReceivedData`   | Provides metadata about the rendered message.                      | `messageMetaData`                                                                      | Log impressions, conditional behavior based on message type.               |
| `firstLayerShown`         | Called when the first layer of the consent message is displayed.   | _(none)_                                                                               | Track impressions, modify first layer styling.                             |
| `secondLayerShown`        | Called when the second layer (detailed preferences) is displayed.  | _(none)_                                                                               | Track user interaction depth, update UI.                                   |
| `firstLayerClosed`        | Triggered when the first layer is closed.                          | _(none)_                                                                               | Trigger conditional loading, log closure action.                           |
| `secondLayerClosed`       | Triggered when the second layer is closed (if previously visible). | _(none)_                                                                               | Reset state, analytics on detailed interaction.                            |
| `onError`                 | Fired on any SDK execution error.                                  | `errorCode`, `errorText`                                                               | Log errors, trigger fallback or error reporting.                           |
|                           |

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
  readyToExecute: function() {
    console.log("📡 Ready to Execute - Starting messaging...");
    console.log('📡 Registering TCF Listener...');
  },
  onInfo: function(text, data) {
      console.log("✓ oninfo");
      console.log(text, data)
  },
}
```

## Dynamic Template Setup

The SDK supports dynamic UI generation via HTML templates. Follow these steps:

1. **Add Vendor Count Placeholders**

   Insert placeholders in your HTML where vendor counts will be displayed:

   ```html
   <span class="all_vendor_count"></span> <span class="iab_vendor_count"></span>
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

## Enable TCFAPI Support
1. Set  ```tcfEnabled: true``` in the config
2. add the content of tcfstub.js in the <head> section of the application
3. include tcfBridge.js after you load the nativeMessaging.js

## Support devices that require HTTP

If your organization plans to support OTT devices that utilizes HTTP, you will need to:

1. Set up and maintain a proxy
2. Replace value of `baseEndpoint` parameter with your proxy endpoint (using `http://` in the endpoint)

## Support devices that require JSONP

If your organization plans to support OTT devices that require JSONP, you will need to:

1. Set up and maintain a proxy
2. Set optional client configuration parameter `isJSONp` to `true`
3. Comment out or remove the `baseEndpoint` client configuration parameter
4. Add `proxyEndpoint` to client configuration and set value to your proxy endpoint
