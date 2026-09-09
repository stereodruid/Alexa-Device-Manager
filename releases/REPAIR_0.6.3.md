# Reparatur 0.6.3 – lokaler Stand

- GraphQL-Argument für Aktivieren/Deaktivieren an die vorhandene V1-Implementierung angeglichen.
- Antwortprüfung und Nachkontrolle für Lösch- und Aktivierungsaktionen wiederhergestellt.
- Unvollständige Inventardaten sperren Änderungen; Fehler werden sichtbar angezeigt.
- Gemeinsame Vorschau mit JSON-Sicherungsbestätigung, einzelnen Schutzfreigaben und Löschbestätigung.
- Anfragelimits stoppen Stapel; Mehrfachklicks starten keine parallelen Vorgänge.
- Eindeutige Gerätezuordnung, keine TTS-Zuordnung allein anhand von Namen.
- Filter, Suche, Quellen, Gruppen, Seitennavigation und Auswahlverhalten korrigiert.
- Zustände unbekannt/offline/deaktiviert getrennt; unbestätigte Stromzustände und Aktivitätsdaten entfernt.
- Popup-Fehler, Tab-Laderennen, wiederholte Injektion und Bildfreigaben für alle Regionen korrigiert.
- CSS auf den Manager begrenzt; Schließen stellt das Scrollverhalten der Hostseite wieder her.

Validierung: automatische API-/Daten-/Erweiterungstests, simulierter Chrome-Bedientest und Produktionsbuild. Keine echten Alexa-Geräte verändert. ZIP-Dateien und veröffentlichte Releases sind unverändert.
