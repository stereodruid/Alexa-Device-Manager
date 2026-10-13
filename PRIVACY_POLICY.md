# Privacy Policy for Aura Device Master

**Effective date:** October 13, 2026

Aura Device Master is a browser extension for viewing and managing Alexa smart-home devices through the Amazon session that is already open in the user's browser.

## Local processing

The extension runs locally in the browser. The developer does not operate a backend, analytics service, advertising service, or user database for the extension.

To provide its features, the extension processes:

- Alexa device information returned by Amazon, such as device names, identifiers, types, status, groups, and capabilities;
- actions selected by the user, such as enable, disable, power, or removal requests; and
- text entered for direct speech, announcements, or simulated Alexa commands; and
- Amazon's CSRF session token, processed transiently when required to authenticate a user-requested Alexa action.

This information is used only to display the manager interface and perform the action requested by the user. It is not sent to the developer or sold, shared, or used for advertising. Requests are sent directly to Amazon's regional Alexa endpoints using the user's existing authenticated Amazon browser session.

## Local storage and downloads

Interface preferences, such as the selected language and column layout, may be stored locally in the browser. A JSON device backup is created and downloaded only when the user explicitly requests it. The extension does not upload backups.

## Permissions

- **`scripting`:** Used to inject the manager interface into an Alexa page after the user clicks **Open manager** in the extension popup.
- **Amazon/Alexa host permissions:** Used to load the device inventory and send user-confirmed actions directly to the selected regional Amazon Alexa service.

The extension does not request the `tabs` or `activeTab` permission and does not read browser history.

## Data retention and deletion

The developer does not receive or retain Alexa device information, entered text, Amazon account details, authentication tokens, or backups. The Amazon CSRF token is used only for the direct request to Amazon and is not stored by the extension or sent anywhere else. Locally stored interface preferences can be removed by uninstalling the extension or clearing the extension's site data. Downloaded JSON backups remain under the user's control and can be deleted like any other local file.

## Security and limited use

Communication with Amazon uses HTTPS. Aura Device Master's use of information is limited to providing and improving its disclosed device-management features and complies with the Chrome Web Store User Data Policy, including its Limited Use requirements.

## Contact

Questions can be submitted through the [Aura Device Master issue tracker](https://github.com/stereodruid/Aura-Device-Master/issues).
