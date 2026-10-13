# Chrome Web Store listing — Aura Device Master v0.7.1

## Product name

Aura Device Master

## English (default locale)

### Summary

Manage Alexa smart-home devices locally with filters, backups, safe actions and Echo voice controls.

### Detailed description

Aura Device Master gives you a clear view of the Alexa smart-home devices in your existing Amazon browser session.

Use search, filters, groups and status information to review large device lists. Inspect device details, create a JSON backup and preview a change before you enable, disable or permanently remove a supported endpoint. Protected targets require explicit approval, and permanent deletion has an additional confirmation step.

Main features:

- German and English interface
- Search, filters, groups, pagination and sortable device information
- Device-specific visuals and a fixed detail panel
- Enable, disable and remove supported Alexa endpoints
- Preview, JSON backup and per-device safety controls
- Direct speech, announcements with a chime and simulated voice commands for uniquely matched Echo devices
- Local operation in the current Amazon session

The extension has no subscription, separate account, analytics service or external backend. It does not request or store separate Amazon credentials. Amazon's private web interfaces can change, so test sensitive actions with one selected device first.

## Deutsch

### Kurzbeschreibung

Alexa-Geräte lokal verwalten: mit Filtern, Sicherungen, sicheren Aktionen und Echo-Sprachsteuerung.

### Ausführliche Beschreibung

Aura Device Master zeigt die Alexa-Smart-Home-Geräte aus deiner bereits im Browser angemeldeten Amazon-Sitzung übersichtlich an.

Mit Suche, Filtern, Gruppen und Statusangaben lassen sich auch große Gerätelisten prüfen. Du kannst Gerätedetails ansehen, eine JSON-Sicherung erstellen und Änderungen zuerst in einer Vorschau kontrollieren, bevor ein unterstützter Endpunkt aktiviert, deaktiviert oder dauerhaft entfernt wird. Geschützte Ziele benötigen eine ausdrückliche Freigabe; dauerhaftes Löschen verlangt eine zusätzliche Bestätigung.

Funktionen:

- Deutsche und englische Oberfläche
- Suche, Filter, Gruppen, Seitennavigation und sortierbare Gerätedaten
- Gerätetyp-spezifische Darstellung und festes Detailfenster
- Unterstützte Alexa-Endpunkte aktivieren, deaktivieren und entfernen
- Vorschau, JSON-Sicherung und Schutzfreigabe pro Gerät
- Direkt sprechen, mit Hinweiston ankündigen und Sprachbefehle auf eindeutig zugeordneten Echo-Geräten simulieren
- Lokale Nutzung innerhalb der aktuellen Amazon-Sitzung

Die Erweiterung hat kein Abo, kein separates Konto, keinen Analysedienst und kein externes Backend. Sie fordert keine zusätzlichen Amazon-Zugangsdaten an und speichert solche Daten nicht. Amazons private Web-Schnittstellen können sich ändern; empfindliche Aktionen sollten deshalb zuerst mit einem einzelnen ausgewählten Gerät getestet werden.

## Category and URLs

- Category: Productivity
- Homepage: https://github.com/stereodruid/Aura-Device-Master
- Support: https://github.com/stereodruid/Aura-Device-Master/issues
- Privacy policy: https://github.com/stereodruid/Aura-Device-Master/blob/main/PRIVACY_POLICY.md

## Privacy and permission declarations

### Single purpose

Display and safely manage Alexa smart-home devices in the Amazon session that is already open in the browser.

### `scripting` justification

The extension injects its manager interface into the Alexa page only after the user clicks **Open manager** in the extension popup.

### Host permission justification

The listed Alexa and Amazon hosts are the regional Alexa web endpoints selected by the user. They are required to load the device inventory and send user-confirmed device actions directly to Amazon in the current browser session.

### Remote code

No. All executable extension code is included in the submitted package.

### Data handling

Device information and user-entered Alexa speech or command text are processed locally. Requested actions are sent directly to Amazon within the user's current browser session. Aura Device Master has no separate backend, analytics or advertising service. Interface preferences remain in local browser storage, and JSON backups are downloaded only when the user requests them.

### User-data disclosures

- Website content: **Yes** — Alexa device names, identifiers, types, status and capabilities are processed locally to display and manage the user's devices.
- Personal communications: **Yes** — text entered for speech, announcements or simulated commands is processed locally and sent directly to Amazon only when the user requests the action.
- Authentication information: **Yes** — Amazon's CSRF session token is processed transiently when required to authenticate a user-requested Alexa action. It is sent only to Amazon and is not stored by the extension.
- Web history: **No** — the extension does not read or collect browsing history.
- Data sale, advertising, creditworthiness and unrelated use: **No**.

## Graphic assets

- Store icon: `assets/store_icon_128x128.png`
- Small promo tile: `assets/chrome_store_promo_440x280.jpg`
- Marquee promo image: `assets/chrome_store_promo_1400x560.jpg`
- German screenshots: `assets/store/de/01-overview.jpg` through `05-install.jpg`
- English screenshots: `assets/store/en/01-feature.jpg` through `05-feature.jpg`

## Promotional videos

The Chrome Web Store accepts YouTube URLs, not local MP4 uploads. Ready-to-upload files:

- English 16:9: `promo-video/out/aura-device-master-youtube-en.mp4`
- German 16:9: `promo-video/out/aura-device-master-youtube-de.mp4`
- English 9:16: `promo-video/out/aura-device-master-vertical-en.mp4`
- German 9:16: `promo-video/out/aura-device-master-vertical-de.mp4`

Add the YouTube URL for each localized 16:9 video after it has been uploaded to YouTube.

## Submission note

Version 0.7.1 removes the unnecessary `tabs` and `activeTab` permissions. The submitted package now requests only `scripting` plus explicit regional Amazon Alexa host permissions.
