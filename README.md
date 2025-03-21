# Sourcepoint ES3 QR SDK Usage Documentation

The Sourcepoint ES3 QR SDK is a lightweight, ES3-compliant JavaScript library that simplifies the integration of a GDPR consent banner with QR code functionality for connecting CMP user accounts. It supports two initialization methods and offers an optional parameter to expose helper functions globally.

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Configuration Parameters](#configuration-parameters)
4. [Initialization Methods](#initialization-methods)
5. [Global Exposure of Helper Functions](#global-exposure-of-helper-functions)
6. [Event Callbacks](#event-callbacks)
7. [Dynamic Template Setup](#dynamic-template-setup)
8. [Button Actions](#button-actions)
9. [Outstanding Issues](#outstanding-issues)
10. [License](#license)

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

## 5. Global Exposure of Helper Functions

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
  onConsentReady: function(consentUUID, euconsent, vendorGrants, consentStatus, purposes) {
    console.log("Consent is ready:", consentUUID);
  },
  onMessageComposed: function() {
    console.log("Dynamic message elements have been added to the UI.");
  }
}
```

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

## 8. Button Actions

The SDK includes built-in actions to handle user interactions. For example:

| Action                          | Description                                                                   | Example Code                        |
|---------------------------------|-------------------------------------------------------------------------------|-------------------------------------|
| **Accept All**                  | Accepts all consent options.                                                  | `_sp_.acceptAll();`                 |
| **Continue Without Accepting**  | Proceeds without granting explicit consent.                                   | `_sp_.continue();`                  |
| **Reject All**                  | Rejects all consent options.                                                  | `_sp_.reject();`                    |
| **Open Privacy Manager**        | Opens the privacy manager modal for detailed settings.                        | `_sp_.loadPrivacyManagerModal();`   |
| **Start Messaging**             | Initiates the CMP experience by starting the messaging flow.                  | `_sp_.executeMessaging();`          |
| **Update Consent Status**       | Refreshes consent status, useful if users update settings via the QR code.      | `_sp_.updateConsentStatus();`       |

---

## 9. Outstanding Issues

- **Custom Consent Updates:** Post and revoke custom consent functionality is under development.
- **Text Element Integration:** Further work is in progress to pull text elements from the Sourcepoint portal for enhanced customization.

---

