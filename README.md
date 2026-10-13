# Aura Device Master

[![Release](https://img.shields.io/badge/release-v0.7.0-00a3ff)](https://github.com/stereodruid/Alexa-Device-Manager/releases/tag/v0.7.0)
[![License](https://img.shields.io/badge/license-GPL--3.0-00d48a)](LICENSE)

A free, local Chrome extension for viewing and safely managing Alexa smart-home devices through your existing Amazon browser session. No subscription, separate account, server or additional credentials are required.

Deutschsprachige Anleitung: [weiter unten](#deutsch).

![Aura Device Master](<assets/preview pics/FullView.png>)

## Highlights

- German and English interface with a persistent language selector.
- Search, filters, groups, pagination and draggable table/KPI layouts.
- Clear device details with category-specific visuals instead of misleading product images.
- Enable, disable and permanently remove supported Alexa endpoints.
- Safe deletion preview, JSON backup requirement and per-device protection controls.
- Automatic legacy deletion fallback when Amazon still lists an old endpoint but GraphQL reports `Resource does not exist`.
- Direct speech, announcements with a chime and simulated voice commands for unambiguously matched Echo devices.
- Local operation inside the current Amazon session. Device data is not uploaded to a separate service.

## Install v0.7.0

1. Download [Aura Device Master v0.7.0](https://github.com/stereodruid/Alexa-Device-Manager/releases/download/v0.7.0/Aura-Device-Master-v0.7.0.zip).
2. Extract the ZIP file to a permanent folder.
3. Open `chrome://extensions/` in Chrome.
4. Enable **Developer mode**.
5. Select **Load unpacked** and choose the extracted folder containing `manifest.json`.
6. Open the extension, select your Amazon region and choose **Open manager**.

For an update, replace the extracted files and select **Reload** for the extension on `chrome://extensions/`. Close older manager tabs before reopening it.

The extension is planned for the Chrome Web Store. It remains completely free and has no subscriptions.

## Demo videos

- [English · YouTube / 16:9](https://github.com/stereodruid/Alexa-Device-Manager/releases/download/v0.7.0/aura-device-master-youtube-en.mp4)
- [English · vertical / 9:16](https://github.com/stereodruid/Alexa-Device-Manager/releases/download/v0.7.0/aura-device-master-vertical-en.mp4)
- [Deutsch · YouTube / 16:9](https://github.com/stereodruid/Alexa-Device-Manager/releases/download/v0.7.0/aura-device-master-youtube-de.mp4)
- [Deutsch · Hochformat / 9:16](https://github.com/stereodruid/Alexa-Device-Manager/releases/download/v0.7.0/aura-device-master-vertical-de.mp4)

## Safe operation

The visible device list and the actionable Alexa endpoints come from separate Amazon interfaces. Aura Device Master maps them through stable IDs and does not use a displayed name as authorization for destructive actions.

Before changing devices:

1. Reload the inventory.
2. Select the intended devices and review the preview.
3. Download and inspect the JSON snapshot.
4. Approve protected targets individually.
5. For permanent deletion, type `DELETE` and execute the action.

The app reloads the inventory after delete, enable and disable operations. A successful HTTP response alone is not presented as confirmed success. Authentication failures and rate limits stop the remaining batch without automatic retry loops.

If Amazon reports that an endpoint no longer exists, v0.7.0 uses the legacy appliance ID only when Amazon supplied one for the same mapped device. If no safe fallback ID exists, the log explains that the stale device must be removed from its source integration, such as ioBroker or Home Assistant.

## Speech and device commands

Speech actions require one unique Echo match. The manager first uses serial/account identifiers and permits an exact device-name fallback only when that name identifies one and only one Echo. The log reports a requested command; it does not claim that physical playback or switching was observed.

## Development

```text
npm ci
npm test
npm run check
npm run build
```

`npm run build` generates `chrome-extension/content.js`. The browser smoke test in `scripts/test-ui.cjs` uses mocked responses and never changes real Alexa devices.

| Path | Purpose |
| --- | --- |
| `src/alexa.js` | Requests, device mapping, actions and verification |
| `src/hooks/useAlexa.js` | Loading, locking and activity log |
| `src/App.jsx` | React user interface |
| `src/deviceVisual.js` | Device category and icon selection |
| `chrome-extension/` | Ready-to-load Chrome extension |
| `promo-video/` | Remotion source for the German and English demos |
| `tests/` | Automated regression tests with simulated responses |

Amazon uses private web interfaces that may change. Test destructive actions on one explicitly selected device first. Removed devices may be rediscovered by their manufacturer or smart-home integration.

## Privacy

Aura Device Master communicates directly between the extension and Amazon using the session already open in the browser. It has no analytics, subscription service or separate backend. See the [privacy policy](PRIVACY_POLICY.md) for details.

## Deutsch

Aura Device Master ist eine kostenlose, lokale Chrome-Erweiterung zur Anzeige und sicheren Verwaltung von Alexa-Smart-Home-Geräten. Sie verwendet die bereits im Browser angemeldete Amazon-Sitzung. Es gibt kein Abo, kein separates Konto, keinen eigenen Server und keine zusätzlich gespeicherten Zugangsdaten.

### Installation

1. [Aura Device Master v0.7.0 herunterladen](https://github.com/stereodruid/Alexa-Device-Manager/releases/download/v0.7.0/Aura-Device-Master-v0.7.0.zip).
2. ZIP-Datei dauerhaft entpacken.
3. `chrome://extensions/` öffnen und den **Entwicklermodus** aktivieren.
4. **Entpackte Erweiterung laden** wählen und den entpackten Ordner mit `manifest.json` auswählen.
5. Im Erweiterungspopup die passende Amazon-Region wählen und **Manager öffnen** anklicken.

Beim Aktualisieren die Dateien ersetzen, die Erweiterung unter `chrome://extensions/` neu laden und alte Manager-Tabs schließen.

### Bedienung und Sicherheit

- Die Oberfläche lässt sich vollständig zwischen Deutsch und Englisch umschalten.
- Suche, Filter, Gruppen und Status helfen beim Prüfen großer Gerätelisten.
- Für die Gerätetypen werden eindeutige Symbole statt möglicherweise falscher Produktbilder verwendet.
- Vor Änderungen zeigt die App alle Ziele in einer Vorschau.
- Aktivieren, Deaktivieren und Löschen verlangen eine aktuelle JSON-Sicherung.
- Geschützte Ziele müssen einzeln für die konkrete Aktion freigegeben werden.
- Dauerhaftes Löschen verlangt zusätzlich die Eingabe `DELETE`.
- Nach der Aktion lädt die App neu und kontrolliert den tatsächlichen Zielzustand.
- Veraltete ioBroker-/Integrationsgeräte erhalten bei Amazons Meldung `Resource does not exist` einen eng begrenzten Legacy-Löschversuch, sofern eine sichere Appliance-ID vorhanden ist.
- Echo-Geräte unterstützen direktes Sprechen, Ankündigungen mit Hinweiston und simulierte Sprachbefehle.

Die Videos stehen oben im Abschnitt [Demo videos](#demo-videos) in Deutsch und Englisch sowie in 16:9 und 9:16 bereit.

## Support

Problems and feature requests: [GitHub Issues](https://github.com/stereodruid/Alexa-Device-Manager/issues)

If this project helps you, you can support its development:

<a href="https://www.buymeacoffee.com/stereodruid"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="48" alt="Buy Me A Coffee"></a>
