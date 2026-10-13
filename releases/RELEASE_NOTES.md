# Aura Device Master v0.7.0

## English

Aura Device Master v0.7.0 introduces the new bilingual interface and expands the extension from device cleanup into a safer local Alexa device manager.

### New

- Complete German and English interface with persistent language selection.
- Direct speech, chime announcements and simulated voice commands for uniquely matched Echo devices.
- Category-specific device visuals for lights, switches, scenes, printers, sensors, appliances, entertainment devices and more.
- Four new demo videos: English and German in 16:9 and 9:16.
- Compact fixed detail panel, three-line scrolling activity log and improved table/action layout.

### Fixed and improved

- Old ioBroker or integration endpoints that return `Resource does not exist` now use the mapped legacy appliance ID as a narrowly scoped fallback.
- The fallback is never used for authentication failures, permission errors, rate limits or unrelated server errors.
- Action failures stay in the activity log instead of leaving a permanent red banner above the app.
- Echo matching uses stable identifiers first and only accepts a name when it identifies exactly one device.
- Device categories no longer display misleading product photos; unknown categories use a neutral icon.
- Inventory refresh and post-action verification continue to fail safely.

### Install

Download `Aura-Device-Master-v0.7.0.zip`, extract it, open `chrome://extensions/`, enable Developer mode and select **Load unpacked**. Choose the extracted folder containing `manifest.json`.

## Deutsch

Aura Device Master v0.7.0 bringt die neue zweisprachige Oberfläche und erweitert die Chrome-Erweiterung zu einem sicheren lokalen Alexa-Gerätemanager.

### Neu

- Vollständige deutsche und englische Oberfläche mit gespeicherter Sprachauswahl.
- Direktes Sprechen, Ankündigungen mit Hinweiston und simulierte Sprachbefehle für eindeutig erkannte Echo-Geräte.
- Eigene Gerätesymbole für Lampen, Schalter, Szenen, Drucker, Sensoren, Haushalts- und Unterhaltungsgeräte.
- Vier neue Demovideos auf Deutsch und Englisch in 16:9 und 9:16.
- Kompaktes festes Detailfenster, dreizeiliges scrollendes Aktionsprotokoll und verbesserte Tabellen-/Aktionsleiste.

### Repariert und verbessert

- Alte ioBroker- oder Integrationsendpunkte mit `Resource does not exist` verwenden einmalig die sicher zugeordnete Legacy-Appliance-ID.
- Bei Anmelde-, Berechtigungs-, Rate-Limit- und sonstigen Serverfehlern erfolgt kein Rückfallversuch.
- Aktionsfehler erscheinen im Protokoll und bleiben nicht als roter Balken über der App stehen.
- Echo-Zuordnung verwendet zuerst stabile IDs und akzeptiert einen Namen nur bei genau einem Treffer.
- Unpassende Produktbilder wurden durch eindeutige Symbole ersetzt; unbekannte Kategorien erhalten ein neutrales Symbol.
- Laden und Nachkontrolle sperren Aktionen weiterhin sicher, wenn Daten unvollständig sind.

### Installation

`Aura-Device-Master-v0.7.0.zip` herunterladen und entpacken. Danach `chrome://extensions/` öffnen, den Entwicklermodus aktivieren und **Entpackte Erweiterung laden** wählen. Den entpackten Ordner mit `manifest.json` auswählen.
