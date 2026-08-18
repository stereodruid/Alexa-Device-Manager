# Alexa Device Manager

Lokaler, zweisprachiger Chrome-Manager fuer Alexa-Smart-Home-Geraete. Er arbeitet ausschliesslich in der bereits angemeldeten Amazon-Sitzung im Browser. Es gibt keinen eigenen Server, keinen Upload und keine gespeicherten Zugangsdaten.

English: A local bilingual Chrome manager for Alexa smart-home devices. It only uses the Amazon session already signed in to the browser. There is no separate server, upload, or stored credential.

## Installation / Setup

1. Chrome oeffnen und `chrome://extensions/` aufrufen.
2. `Entwicklermodus` / `Developer mode` einschalten.
3. `Entpackte Erweiterung laden` / `Load unpacked` waehlen.
4. Diesen Ordner auswaehlen: `D:\SoftwareDEV\AlexaDeviceManager\chrome-extension`
5. Das Erweiterungssymbol `Alexa Device Manager` anklicken.
6. `Manager oeffnen` / `Open manager` druecken.

Der Manager oeffnet die normale Alexa-Webseite und blendet seine Bedienoberflaeche darueber ein. F12, Copy/Paste und die rohe JSON-Ansicht sind nicht erforderlich.

The manager opens the normal Alexa website and overlays its interface. No developer tools, copy/paste, or raw JSON page are needed.

## Sprache / Language

Oben rechts im Manager befindet sich die Auswahl `Deutsch` / `English`. Die Wahl wird lokal im Browser fuer den naechsten Start gespeichert. Die Sprache aendert nur Texte und Dialoge, niemals die ausgewaehlten Geraete oder Alexa-Daten.

Use the `Deutsch` / `English` selector in the upper-right corner. The choice is saved locally in the browser for the next launch. It changes text and dialogs only, never selected devices or Alexa data.

## Sicherer Ablauf / Safe Workflow

1. `Geraete laden` / `Load devices` druecken.
2. Sofort `JSON sichern` / `Save JSON` verwenden. Diese Datei ist die lokale Sicherung der sichtbaren Liste.
3. Nach Name, Typ, Quelle oder Gruppe filtern.
4. Mit `Trockenlauf` / `Dry run` die Auswahl pruefen. Die genaue Liste erscheint in der Browser-Konsole; es wird nichts veraendert.
5. Zuerst nur **ein** eindeutig identifiziertes Geraet testen.
6. Erst nach erfolgreicher Nachkontrolle weitere, ausdruecklich gewaehlte Geraete bearbeiten.

Der Manager laedt die Alexa-Liste nach jeder Aenderung erneut und prueft den tatsaechlichen Status. Ein HTTP-Erfolg allein gilt nicht als erfolgreicher Abschluss.

After every change, the manager reloads the Alexa list and verifies the actual state. A successful HTTP status alone is not treated as success.

## Funktionen / Features

| Funktion | Deutsch | English |
| --- | --- | --- |
| Filtern | Name, Beschreibung, Alexa-Typ, Gruppe und vermutete Quelle | Name, description, Alexa type, group, and inferred source |
| Quellen | Home Assistant, ioBroker, Homey, Alexa/Amazon oder Andere | Home Assistant, ioBroker, Homey, Alexa/Amazon, or Other |
| Sicherung | JSON und CSV herunterladen | Download JSON and CSV |
| Trockenlauf | Auswahl ohne Aenderung pruefen | Check selection without making changes |
| Deaktivieren | Reversibel aus Alexa ausblenden | Reversibly hide from Alexa |
| Aktivieren | Zuvor deaktivierte Geraete wieder freigeben | Re-enable previously disabled devices |
| Loeschen | Dauerhaft aus Alexa entfernen | Permanently remove from Alexa |

Die Quellenklassifikation ist eine Bedienhilfe. Alexa liefert kein verlaessliches, einheitliches Herkunftsfeld; deshalb wertet der Manager Namen, Beschreibung und Herstellertext aus.

Source classification is a convenience feature. Alexa does not provide one reliable source field, so the manager evaluates name, description, and manufacturer text.

## Deaktivieren oder loeschen? / Disable or Delete?

**Auswahl deaktivieren / Disable selection**

- Setzt den Alexa-Endpunkt auf `DISABLED_BY_CUSTOMER`.
- Ist rueckgaengig zu machen: `Auswahl aktivieren` / `Enable selection`.
- Der empfohlene erste Schritt fuer vermutete Geister- oder Altgeraete.

**Auswahl loeschen / Delete selection**

- Entfernt den Alexa-Endpunkt dauerhaft.
- Kann durch eine Hersteller-, ioBroker-, Homey- oder Home-Assistant-Integration erneut erscheinen, wenn diese Quelle das Geraet wieder meldet.
- Erfordert die explizite Eingabe `DELETE`.

## Schutzregeln / Protection Rules

Gruppen sowie Echo-/Amazon-Geraete sind standardmaessig geschuetzt. Die beiden Schutzschalter im Manager muessen bewusst aktiviert werden, bevor solche Eintraege bearbeitbar sind.

Groups and Echo/Amazon devices are protected by default. The two protection switches must be intentionally enabled before those entries can be edited.

Geraete ohne verknuepfte moderne Alexa-Endpunkt-ID werden ebenfalls gesperrt. Das verhindert, dass ein falscher Identifier fuer eine Aenderung verwendet wird.

Devices without a linked modern Alexa endpoint ID are also blocked. This prevents an incorrect identifier from being used for a change.

## Fehlerbehebung / Troubleshooting

**Der Manager zeigt nur JSON oder startet nicht / The manager only shows JSON or does not start**

1. In `chrome://extensions/` die Erweiterung mit dem Neu-laden-Symbol aktualisieren.
2. Sicherstellen, dass `Alexa Device Manager` aktiviert ist.
3. Bei `alexa.amazon.de` im richtigen Amazon-Konto angemeldet sein.
4. Den Manager ausschliesslich ueber das Erweiterungssymbol und `Manager oeffnen` starten.

**Ein geloeschtes Geraet erscheint wieder / A deleted device returns**

Die urspruengliche Quelle meldet es erneut an. Das Geraet zuerst dort entfernen oder deaktivieren, zum Beispiel in Home Assistant, ioBroker, Homey oder der Hersteller-Cloud.

The original source is publishing it again. Remove or disable it at the source first, such as Home Assistant, ioBroker, Homey, or the manufacturer cloud.

**Eine Aktion wird abgelehnt / An action is rejected**

Amazon verwendet nicht oeffentlich stabil dokumentierte Web-Endpunkte. Nicht wiederholt auf grosse Mengen anwenden. Liste neu laden, einen einzelnen Eintrag pruefen und das Projektprotokoll beachten.

Amazon uses private web endpoints that are not publicly stable. Do not repeat actions across large selections. Reload the list, test one entry, and consult the project handover.

## Dateien / Files

| Pfad / Path | Zweck / Purpose |
| --- | --- |
| `chrome-extension/` | Installierbare Chrome-Erweiterung / installable Chrome extension |
| `chrome-extension/content.js` | Interface, Uebersetzung und Alexa-API-Aufrufe / UI, translations, and Alexa API calls |
| `chrome-extension/background.js` | Oeffnet Alexa und injiziert den Manager / opens Alexa and injects the manager |
| `AGENTS.md` | Technische Uebergabe fuer weitere KI-Agenten / technical handover for future agents |

## Hinweis / Notice

Dieses Projekt greift auf private Amazon-Web-Endpunkte zu, die sich jederzeit aendern koennen. Vor Aenderungen an echten Alexa-Geraeten immer eine Sicherung erstellen und nur die konkret gewuenschte Auswahl bestaetigen.

This project uses private Amazon web endpoints that can change at any time. Always create a backup before changing real Alexa devices and confirm only the specific intended selection.
