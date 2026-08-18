# Alexa Device Manager

*🇬🇧 [English version below](#english-version)*

## 🇩🇪 Deutsch

Lokaler, zweisprachiger Chrome-Manager für Alexa-Smart-Home-Geräte. Er arbeitet ausschließlich in der bereits angemeldeten Amazon-Sitzung im Browser. Es gibt keinen eigenen Server, keinen Upload und keine gespeicherten Zugangsdaten.

### Installation

1. Chrome öffnen und `chrome://extensions/` aufrufen.
2. `Entwicklermodus` einschalten.
3. `Entpackte Erweiterung laden` wählen.
4. Den Ordner `chrome-extension` aus diesem Projekt auswählen.
5. Das Erweiterungssymbol `Alexa Device Manager` anklicken.
6. `Manager öffnen` drücken.

Der Manager öffnet die normale Alexa-Webseite und blendet seine Bedienoberfläche darüber ein. F12, Copy/Paste und die rohe JSON-Ansicht sind nicht erforderlich.

### Sprache

Oben rechts im Manager befindet sich die Auswahl `Deutsch` / `English`. Die Wahl wird lokal im Browser für den nächsten Start gespeichert. Die Sprache ändert nur Texte und Dialoge, niemals die ausgewählten Geräte oder Alexa-Daten.

### Sicherer Ablauf

1. `Geräte laden` drücken.
2. Sofort `JSON sichern` verwenden. Diese Datei ist die lokale Sicherung der sichtbaren Liste.
3. Nach Name, Typ, Quelle oder Gruppe filtern.
4. Mit `Trockenlauf` die Auswahl prüfen. Die genaue Liste erscheint in der Browser-Konsole; es wird nichts verändert.
5. Zuerst nur **ein** eindeutig identifiziertes Gerät testen.
6. Erst nach erfolgreicher Nachkontrolle weitere, ausdrücklich gewählte Geräte bearbeiten.

Der Manager lädt die Alexa-Liste nach jeder Änderung erneut und prüft den tatsächlichen Status. Ein HTTP-Erfolg allein gilt nicht als erfolgreicher Abschluss.

### Funktionen

| Funktion | Beschreibung |
| --- | --- |
| **Filtern** | Name, Beschreibung, Alexa-Typ, Gruppe und vermutete Quelle |
| **Quellen** | Home Assistant, ioBroker, Homey, Alexa/Amazon oder Andere |
| **Sicherung** | JSON und CSV herunterladen |
| **Trockenlauf** | Auswahl ohne Änderung prüfen |
| **Deaktivieren** | Reversibel aus Alexa ausblenden |
| **Aktivieren** | Zuvor deaktivierte Geräte wieder freigeben |
| **Löschen** | Dauerhaft aus Alexa entfernen |

Die Quellenklassifikation ist eine Bedienhilfe. Alexa liefert kein verlässliches, einheitliches Herkunftsfeld; deshalb wertet der Manager Namen, Beschreibung und Herstellertext aus.

### Deaktivieren oder löschen?

**Auswahl deaktivieren**
- Setzt den Alexa-Endpunkt auf `DISABLED_BY_CUSTOMER`.
- Ist rückgängig zu machen: `Auswahl aktivieren`.
- Der empfohlene erste Schritt für vermutete Geister- oder Altgeräte.

**Auswahl löschen**
- Entfernt den Alexa-Endpunkt dauerhaft.
- Kann durch eine Hersteller-, ioBroker-, Homey- oder Home-Assistant-Integration erneut erscheinen, wenn diese Quelle das Gerät wieder meldet.
- Erfordert die explizite Eingabe von `DELETE`.

### Schutzregeln

Gruppen sowie Echo-/Amazon-Geräte sind standardmäßig geschützt. Die beiden Schutzschalter im Manager müssen bewusst aktiviert werden, bevor solche Einträge bearbeitbar sind.

Geräte ohne verknüpfte moderne Alexa-Endpunkt-ID werden ebenfalls gesperrt. Das verhindert, dass ein falscher Identifier für eine Änderung verwendet wird.

### Fehlerbehebung

**Der Manager zeigt nur JSON oder startet nicht**
1. In `chrome://extensions/` die Erweiterung mit dem Neu-laden-Symbol aktualisieren.
2. Sicherstellen, dass `Alexa Device Manager` aktiviert ist.
3. Bei `alexa.amazon.de` im richtigen Amazon-Konto angemeldet sein.
4. Den Manager ausschließlich über das Erweiterungssymbol und `Manager öffnen` starten.

**Ein gelöschtes Gerät erscheint wieder**
Die ursprüngliche Quelle meldet es erneut an. Das Gerät zuerst dort entfernen oder deaktivieren, zum Beispiel in Home Assistant, ioBroker, Homey oder der Hersteller-Cloud.

**Eine Aktion wird abgelehnt**
Amazon verwendet nicht öffentlich stabil dokumentierte Web-Endpunkte. Nicht wiederholt auf große Mengen anwenden. Liste neu laden, einen einzelnen Eintrag prüfen und das Projektprotokoll beachten.

### Dateien

| Pfad | Zweck |
| --- | --- |
| `chrome-extension/` | Installierbare Chrome-Erweiterung |
| `chrome-extension/content.js` | Interface, Übersetzung und Alexa-API-Aufrufe |
| `chrome-extension/background.js` | Öffnet Alexa und injiziert den Manager |
| `AGENTS.md` | Technische Übergabe für weitere KI-Agenten |

### Hinweis

Dieses Projekt greift auf private Amazon-Web-Endpunkte zu, die sich jederzeit ändern können. Vor Änderungen an echten Alexa-Geräten immer eine Sicherung erstellen und nur die konkret gewünschte Auswahl bestätigen.

---

<a name="english-version"></a>
## 🇬🇧 English

A local, bilingual Chrome manager for Alexa smart-home devices. It only uses the Amazon session already signed in to the browser. There is no separate server, upload, or stored credential.

### Setup

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable `Developer mode`.
3. Select `Load unpacked`.
4. Choose the `chrome-extension` folder from this project.
5. Click the `Alexa Device Manager` extension icon.
6. Click `Open manager`.

The manager opens the normal Alexa website and overlays its interface. No developer tools, copy/paste, or raw JSON page are needed.

### Language

Use the `Deutsch` / `English` selector in the upper-right corner. The choice is saved locally in the browser for the next launch. It changes text and dialogs only, never selected devices or Alexa data.

### Safe Workflow

1. Click `Load devices`.
2. Immediately use `Save JSON`. This file is the local backup of the visible list.
3. Filter by name, type, source, or group.
4. Use `Dry run` to check your selection. The exact list appears in the browser console; nothing is changed.
5. First, test with only **one** clearly identified device.
6. Only process further explicitly chosen devices after a successful follow-up check.

After every change, the manager reloads the Alexa list and verifies the actual state. A successful HTTP status alone is not treated as success.

### Features

| Feature | Description |
| --- | --- |
| **Filter** | Name, description, Alexa type, group, and inferred source |
| **Sources** | Home Assistant, ioBroker, Homey, Alexa/Amazon, or Other |
| **Backup** | Download JSON and CSV |
| **Dry run** | Check selection without making changes |
| **Disable** | Reversibly hide from Alexa |
| **Enable** | Re-enable previously disabled devices |
| **Delete** | Permanently remove from Alexa |

Source classification is a convenience feature. Alexa does not provide one reliable source field, so the manager evaluates name, description, and manufacturer text.

### Disable or Delete?

**Disable selection**
- Sets the Alexa endpoint to `DISABLED_BY_CUSTOMER`.
- Can be reversed: `Enable selection`.
- The recommended first step for suspected ghost or legacy devices.

**Delete selection**
- Permanently removes the Alexa endpoint.
- Might return through a manufacturer, ioBroker, Homey, or Home Assistant integration if that source publishes the device again.
- Requires explicit confirmation by typing `DELETE`.

### Protection Rules

Groups and Echo/Amazon devices are protected by default. The two protection switches must be intentionally enabled before those entries can be edited.

Devices without a linked modern Alexa endpoint ID are also blocked. This prevents an incorrect identifier from being used for a change.

### Troubleshooting

**The manager only shows JSON or does not start**
1. In `chrome://extensions/`, refresh the extension using the reload icon.
2. Ensure `Alexa Device Manager` is enabled.
3. Be signed into the correct Amazon account on `alexa.amazon.com` (or your local equivalent).
4. Only start the manager using the extension icon and `Open manager`.

**A deleted device returns**
The original source is publishing it again. Remove or disable it at the source first, such as Home Assistant, ioBroker, Homey, or the manufacturer cloud.

**An action is rejected**
Amazon uses private web endpoints that are not publicly stable. Do not repeat actions across large selections. Reload the list, test one entry, and consult the project handover.

### Files

| Path | Purpose |
| --- | --- |
| `chrome-extension/` | Installable Chrome extension |
| `chrome-extension/content.js` | UI, translations, and Alexa API calls |
| `chrome-extension/background.js` | Opens Alexa and injects the manager |
| `AGENTS.md` | Technical handover for future agents |

### Notice

This project uses private Amazon web endpoints that can change at any time. Always create a backup before changing real Alexa devices and confirm only the specific intended selection.
