# Sourcepoint es3-QR-SDK Usage Documentation

The es3-QR-SDK helper library simplifies the creation of QR codes for connecting to CMP user accounts.

It is available at https://cdn.privacy-mgmt.com/ott/index.js.

The following examples are provided:

- [/hbbtv.html](./hbbtv.html) - An example of how to use the es3-QR-SDK helper library in an HTML file.


## Example

```javascript
    <script type="text/javascript">
        window._sp_ = {
            config: {
                accountId: 22,
                propertyId: 37811,
                propertyHref: "https://ott.es3",
                baseEndpoint: 'https://cdn.privacy-mgmt.com',
                messageDiv: "native_message",
                pmDiv: "pm",
                qrId: "qr",
                pmId: 1196474,
                qrUrl: "https://cdn.privacy-mgmt.com/wrapper/qrcode?text=",
                pmUrl: "https://cdn.privacy-mgmt.com/ott/pm.html",
                events: {
                    onConsentReady: function( consentUUID, euconsent, vendorGrants) {
                        console.log('Custom - onConsentReady');
                        console.log('consentUUID: ' + consentUUID);
                        console.log('euconsent: ' + euconsent);
                        console.log(vendorGrants);
                    },
                    onMessageComposed:function(){
                        console.log("onMessageComposed");
                        //a callback to perform UI actions AFTER dynamic elements are added
                    }
                }
            }
        }
    </script>

```

A complete example has been included in the "example" folder within this repository.

## Script Configuration Parameters

| Parameter         | Type       | Description                                                                                              |
|-------------------|------------|----------------------------------------------------------------------------------------------------------|
| `accountId`       | `integer`  | **Required**. The unique identifier for your account on Sourcepoint.                                      |
| `propertyId`      | `integer`  | **Required**. Maps the implementation to a specific URL as set up in the Sourcepoint dashboard. Use this parameter to spoof messaging campaigns for testing or debugging.                                       |
| `propertyHref`    | `string`   | **Required**. The name or URL of the property to be connected.                                            |
| `pmId`    | `integer`   | **Required**. The ID of the privacy message that should be displayed on the second screen.                   |
| `consentLanguage`    | `string`   | **Required**. TEnforce that the message is delivered in the specified language regardless of an end-user's browser language setting. [Click here](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes) for a list of ISO 639-1 language codes.                                           |
| `baseEndpoint`    | `string`   | **Required**. The API endpoint. Use the default (`https://cdn.privacy-mgmt.com/`) unless a custom CNAME is required. |
| `messageDiv`      | `string`   | **Required**. The ID of the `<div>` element where your consent message will appear.                       |
| `authId`      | `string`   | **optional**. Allows your organization to pass a consent identifier to Sourcepoint to be used with [authenticated consent](https://docs.sourcepoint.com/hc/en-us/articles/4403274791699-Authenticated-consent) .            |
| `pmDiv`           | `string`   | **Required**. The ID of the `<div>` element designated for the privacy manager.                           |
| `qrId`            | `string`   | **Required**. The ID of the `<img>` element where the QR code is displayed.                               |
| `qrUrl`           | `string`   | **optional**. The URL of the QR code generator.        |
| `pmUrl`           | `string`   | **optional**. The URL for the privacy manager's second-layer page  |
| `gdpr`            | `object`   | **Optional**. Adds GDPR TCF or GDPR Standard messaging campaigns to your configuration.                  |
| `isSPA`           | `boolean`  | **Optional**. Set to `true` to implement for a single-page application. Shows messages only when `window._sp_.executeMessaging();` is triggered. |
| `targetingParams` | `object`   | **Optional**. Allows setting arbitrary key/value pairs sent to Sourcepoint servers for decision-making in the scenario builder. Parameters set within U.S. Privacy (Legacy) or GDPR objects override this configuration.  |
| `buildMessageComponents`           | `boolean`   | **Required**. The default is true, if set to false, ui elements won't be repleced                           |


### Optional Event Callbacks

Currently, we have a single event being triggered. Once consent is ready, Sourcepoint offers an optional callback function onConsentReady that allows your organization to read vendor grants. This command can be called with JavaScript code embedded in a webpage: providing the consentUUID, the IAB TCString, and a vendorGrants object.


```javascript
_sp_ = {
    config: {
    	...
    	events: {
			onConsentReady: function( consentUUID, euconsent, vendorGrants, consentStatus) {
			   console.log('Custom - onConsentReady');
			   console.log('consentUUID: ' + consentUUID);
			   console.log('euconsent: ' + euconsent);
			   console.log(vendorGrants);
			}
		}
	}
}
```

## Vendor grants

A vendor grant is a boolean value that is true if an end-user has consented to all purposes assigned to a vendor. The vendor grant value is false if one or more purposes have been disallowed by the end-user. Where the vendor grant has been set to false, your organization should check which purposes have been rejected by the end-user.

The grants section in the JSON response using the TCF API getCustomVendorConsents request lists the consented purposes for each vendor. The variable vendorGrant provides the vendor grant status.

The consented purposes are listed as follows:

| Parameter         | Description                                                                                              |
|-------------------|----------------------------------------------------------------------------------------------------------|
|  `vendor_id` | A unique identifier for each vendor persisiting across all Sourcepoint vendor lists |
|  `purpose_id	` | A unique identifier for each purpose (mind that this ID is changing depending on the Vendor List) |
|  `status	` | Status is  `true` if the purpose applies to an end-user. |
|  `vendorGrant	` | Status is `true` if all purposes for a vendor apply to an end-user. Status is `false` if one or more purposes for a vendor denies consent for one or more purposes. |

## Button Actions

The button actions in this project allow users to interact with the application through predefined functionalities. Each button triggers a specific behavior, enabling seamless integration and user-friendly workflows. Below is a detailed overview of the available actions and their corresponding outcomes.

| Action                  | Description                                                                                  | Code Example                          |
|-------------------------|----------------------------------------------------------------------------------------------|---------------------------------------|
| **Accept All**          | Accept all consent options.                                                                  | ``` _sp_.accept_all() ``` |
| **Continue Without Accepting** | Proceed without explicit consent while maintaining legitimate interest settings if configured. | ```_sp_.continue() ```   |
| **Reject All**          | Reject all consent options.                                                                  | ``` _sp_.reject() ```     |
| **Open Second Layer**   | Open the privacy manager modal for more detailed consent settings.                           | ```_sp_.loadPrivacyManagerModal() ``` |
| **Start Messaging**          | starts the cmp experience                                            | ```_sp_.executeMessaging()``` |
| **Update Consent Status**          | Reload consent status for users that edit their settings via the QR code on returning to TV                                            | ```_sp_.updateConsentStatus()``` |

## Helpers
| Action                  | Description                                                                                  | Code Example                          |
|-------------------------|----------------------------------------------------------------------------------------------|---------------------------------------|
| Consent Status          | Returns the consent status after executeMesaging() has been performed                                                                  | ``` _sp_.consentStatus() ``` |
| Clear User Data          | clears users cookies for the active property                                                                  | ``` _sp_.clearUserData() ``` |
| Get TCString          | returns the gdpr TCF consent String                                                                 | ``` _sp_.getTcString() ``` |
| Get QR Code URL          | returns the url of the QR code image                                                               | ``` _sp_.getQrCodeUrl()``` |
| Get Message Data          | returns the vendor Counts,  stacks and purposes                                                               | ``` _sp_.getMessageData()``` |




# Dynamic Template Setup for Message

This part of the readme explains how to define and use a flexible HTML template to dynamically generate content. The logic allows you to insert data into the template coming from the APIs

## 1. Add Placeholders for Vendor Count in Your HTML

Two types of vendor counts are available:

Total Vendor Count: Includes all vendors.
IAB Vendor Count: Includes only IAB-compliant vendors.
Add one or both of the following elements to your HTML. These placeholders will automatically be replaced with values from the APIs before the message is displayed.
 ```html
<span class="all_vendor_count"></span>
<span class="iab_vendor_count"></span>
 ```

## 2. Define a Template for Stacks and Purposes

Create a hidden HTML element that serves as the template. Use placeholders wrapped in curly braces ({}) to indicate where dynamic data will be inserted. You can include as many placeholders as needed.

 ```html
 <div id="stack_template" style="display: none;">
    <div class="item">
        <h2>{name}</h2>
        <p>{description}</p>
    </div>
</div>
```
```{name}```: Placeholder for the purpose or stack name.
```{description}```: Placeholder for the purpose or stack description.

## 3. Add Containers

Add optional containers to your HTML where the populated content will be placed. Use separate containers for different types of data if needed.

Example:
 ```html
<div class="sp_stacks">
    <!-- Dynamically generated stack items will appear here -->
</div>

<div class="sp_purposes">
    <!-- Dynamically generated purpose items will appear here -->
</div>
 ```


# Outstanding Issues

1. Post and Revoke Custom consent is in progress
2. Pull Text Elements (out of the SP Portal)
