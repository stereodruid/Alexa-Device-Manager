# Aura Device Master

Lokale Chrome-Erweiterung zur Verwaltung von Alexa-Geräten in deiner bestehenden Amazon-Sitzung. Die aktuelle React-Oberfläche ist deutschsprachig. Es gibt keinen eigenen Server und keine gespeicherten Zugangsdaten.

## Installation und Aktualisierung

1. `chrome://extensions/` öffnen und den Entwicklermodus einschalten.
2. **Entpackte Erweiterung laden** wählen und den Ordner `chrome-extension` auswählen.
3. Bei einer bereits installierten lokalen Version auf das **Neu-laden-Symbol** der Erweiterung klicken.
4. Alte Manager-Tabs schließen. Im Erweiterungspopup die passende Amazon-Region wählen und **Manager öffnen** klicken.

Der fertige Erweiterungsordner enthält Version **0.6.3**. Veröffentlichte ZIP-Dateien unter `releases/` sind historische Pakete und werden durch einen lokalen Build nicht aktualisiert.

## Geräte laden und filtern

**Neu laden** ruft die sichtbare Geräteliste und die GraphQL-Endpoints ab. Erst nach vollständigem, validiertem Laden sind Aktionen möglich. Bei einem Fehler bleiben vorhandene Daten zur Einsicht erhalten, werden aber als möglicherweise veraltet gekennzeichnet.

- Suche nach Name, Beschreibung, Typ, Quelle oder einer der Geräte-IDs.
- Filter für Typ, Quelle, Gruppe, Erreichbarkeit und Alexa-Aktivierungsstatus.
- **Online**, **Offline** und **Unbekannt** sind getrennt. Fehlende Endpoint-IDs bedeuten nicht automatisch ein defektes Gerät.
- Erreichbarkeit und **Aktiviert/Deaktiviert** werden separat angezeigt.
- Quellen wie Home Assistant oder Amazon sind aus den Gerätedaten abgeleitete Schätzungen.
- KPI-Karten setzen zunächst andere Filter zurück. Spalten und KPI-Karten lassen sich verschieben; die Reihenfolge bleibt lokal gespeichert.
- Seitengrößen 10, 50 und 100. Die Kopf-Checkbox betrifft nur die aktuelle Seite. Auswahl außerhalb der aktuellen Seite wird ausdrücklich gezählt.

## Änderungen prüfen und ausführen

1. Aktuelle Daten laden und die gewünschten Geräte auswählen.
2. **Trockenlauf / Vorschau**, **Aktivieren**, **Deaktivieren** oder **Löschen** wählen. Auch Einzelaktionen öffnen diese Vorschau.
3. Alle angezeigten Zielnamen und IDs prüfen. Die Vorschau führt keine Änderung aus.
4. Eine aktuelle **JSON-Sicherung herunterladen**, die gespeicherte Datei prüfen und dies bestätigen. Die JSON-Datei ist ein Datenexport; ein automatischer Wiederherstellungsimport ist nicht enthalten.
5. Geschützte Gruppen und Echo-/Amazon-Geräte müssen in der Vorschau **einzeln für genau diese Aktion** freigegeben werden. Ausblenden ist keine Freigabe.
6. Beim dauerhaften Löschen zusätzlich `DELETE` eingeben und **Jetzt ausführen** wählen.

Löschen und Aktivieren/Deaktivieren prüfen die API-Antwort und anschließend den tatsächlichen Zielzustand durch erneutes Laden. Das Protokoll unterscheidet bestätigte und fehlgeschlagene beziehungsweise unbestätigte Ergebnisse. Während eines Vorgangs werden weitere Vorgänge gesperrt. Anfragelimits und Anmeldefehler stoppen den restlichen Stapel, ohne sofortige Wiederholungen.

Geräte ohne geeignete Ziel-ID bleiben für die entsprechende Aktion gesperrt. Die alte Appliance-ID wird nur für den Legacy-Löschpfad und Ein-/Aus-Befehle verwendet; Entity-IDs werden nicht als Lösch-IDs eingesetzt.

## Ein/Aus und Sprachausgabe

- Ein und Aus senden einen expliziten Befehl an die zugeordnete Appliance-ID. Die App zeigt keinen erfundenen Stromzustand; der tatsächliche Zustand wird nicht gemessen.
- Sprachausgabe benötigt eine eindeutige Übereinstimmung mit der Echo-Geräteliste über Seriennummer oder Geräte-Account-ID. Ein gleicher Name reicht nicht. Fehlt diese Zuordnung, wird nichts gesendet.
- Auch diese Befehle durchlaufen die Vorschau. Eine angeforderte Sprachausgabe bestätigt nicht, dass sie hörbar abgespielt wurde.
- DND und eine angebliche letzte Geräteaktivität werden nicht angezeigt, da dafür keine verifizierte Implementierung beziehungsweise Datenquelle vorhanden ist.

## Entwicklung und Prüfungen

```text
npm ci
npm test
npm run check
npm run build
```

`npm run build` erzeugt `chrome-extension/content.js`. Diese Datei wird nicht von Hand bearbeitet.

| Datei | Aufgabe |
| --- | --- |
| `src/alexa.js` | API-Requests, Datenzuordnung, Status, Filter und Nachkontrolle |
| `src/hooks/useAlexa.js` | Ladezustand, Aktionssperre und Protokoll |
| `src/App.jsx` | Oberfläche und gemeinsame Aktionsvorschau |
| `src/index.css` | Auf den Manager begrenzte Darstellung |
| `chrome-extension/background.js` | Region prüfen, Tab öffnen, Oberfläche laden |
| `tests/*.test.js` | Regressionstests mit simulierten Antworten |
| `scripts/test-ui.cjs` | Browserprüfung mit ausschließlich simulierten Daten |

Die Browserprüfung benötigt Playwright und Chromium/Chrome. Optional `AURA_PLAYWRIGHT` auf das Playwright-Modul und `AURA_BROWSER` auf die Browserdatei setzen; anschließend `node scripts/test-ui.cjs` ausführen. Sie greift nicht auf echte Amazon-Geräte oder das bestehende Browserprofil zu.

Amazon nutzt private Web-Endpunkte. Ein bestandener lokaler Test ersetzt daher keinen gezielten Test eines ausdrücklich gewählten Geräts im eigenen Konto. Entfernte Geräte können durch ihre Herstellerintegration erneut angemeldet werden.

## English

Version 0.6.3 repairs the current German-language React app. Load or reload the unpacked `chrome-extension` folder in Chrome, close old manager tabs, and reopen the manager from the extension popup.

The app validates the complete device inventory, maps devices by IDs, distinguishes unknown reachability from offline status, and verifies delete/enable/disable operations against a fresh inventory. Every action opens a target preview; confirm a saved JSON snapshot and individually authorize protected targets. Deletion also requires typing `DELETE`.

Selections outside the current page are explicitly counted. Failed inventory refreshes block actions. Rate limits stop the remaining batch without immediate retries. Power and speech requests are identified as commands, not verified physical device states. Speech never chooses a device merely because its name matches.

Run `npm test`, `npm run check`, and `npm run build` for local validation. The browser smoke test uses mocked responses only. Historical release ZIPs are not replaced by a local build.
