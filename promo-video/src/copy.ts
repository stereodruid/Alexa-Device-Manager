export type Language = "de" | "en";

const copy = {
  de: {
    introSection: "Aura Device Master", introTitleA: "Deine Alexa-Geräte.", introTitleB: "Endlich unter Kontrolle.", introLead: "Verwalten, prüfen und steuern – direkt in deiner Amazon-Sitzung.",
    installSection: "01 · Installation", installA: "Installiert in", installB: "wenigen Sekunden.", steps: ["Extension in Chrome laden", "Amazon-Region auswählen", "Manager mit einem Klick öffnen"],
    overviewSection: "02 · Überblick", overviewA: "138 Geräte.", overviewB: "Eine klare Übersicht.", search: "Suchen", filter: "Filtern", sort: "Sortieren",
    detailsSection: "03 · Geräteinfos", detailsA: "Jedes Gerät.", detailsB: "Sofort verstanden.", detailsLead: "Status, Quelle, Schutz und Geräte-ID auf einen Blick.", live: "Live-Status", details: "Gerätedetails",
    actionsSection: "04 · Schnellaktionen", actionsTitle: "Kontrolle ohne Umwege.", actionsLead: "Einzelne Geräte oder ganze Auswahlen sicher verwalten.", enable: "Aktivieren", disable: "Deaktivieren", dryRun: "Trockenlauf", remove: "Löschen",
    alexaSection: "05 · Alexa-Aktionen", alexaA: "Text rein.", alexaB: "Alexa reagiert.", speak: "Direkt sprechen", announce: "Ankündigung mit Hinweiston", command: "Sprachbefehl simulieren",
    safetySection: "06 · Sicher & lokal", safetyA: "Volle Übersicht.", safetyB: "Volle Kontrolle.", safetyLead: "Klare Bestätigungen schützen vor versehentlichen Änderungen.", safetyCards: ["Vorschau vor Änderungen", "JSON-Backup mit einem Klick", "Deutsch & English", "Lokal in deiner Amazon-Sitzung"],
    outroSection: "Jetzt ausprobieren", free: "100 % kostenlos · Keine Abos", local: "Lokal · Keine zusätzlichen Anmeldedaten", session: "Nutzt deine bestehende Amazon-Sitzung", store: "Bald auch im Chrome Web Store",
  },
  en: {
    introSection: "Aura Device Master", introTitleA: "Your Alexa devices.", introTitleB: "Finally under control.", introLead: "Manage, review and control them directly in your existing Amazon session.",
    installSection: "01 · Installation", installA: "Ready in", installB: "just a few seconds.", steps: ["Load the extension in Chrome", "Choose your Amazon region", "Open the manager with one click"],
    overviewSection: "02 · Overview", overviewA: "138 devices.", overviewB: "One clear overview.", search: "Search", filter: "Filter", sort: "Sort",
    detailsSection: "03 · Device details", detailsA: "Every device.", detailsB: "Understood instantly.", detailsLead: "See status, source, protection and device ID at a glance.", live: "Live status", details: "Device details",
    actionsSection: "04 · Quick actions", actionsTitle: "Control without detours.", actionsLead: "Safely manage single devices or complete selections.", enable: "Enable", disable: "Disable", dryRun: "Dry run", remove: "Delete",
    alexaSection: "05 · Alexa actions", alexaA: "Type it.", alexaB: "Alexa responds.", speak: "Speak directly", announce: "Announce with chime", command: "Simulate a voice command",
    safetySection: "06 · Safe & local", safetyA: "Full overview.", safetyB: "Full control.", safetyLead: "Clear confirmations protect against accidental changes.", safetyCards: ["Preview before changes", "One-click JSON backup", "Deutsch & English", "Local in your Amazon session"],
    outroSection: "Try it now", free: "100% free · No subscriptions", local: "Local · No additional credentials", session: "Uses your existing Amazon session", store: "Coming soon to the Chrome Web Store",
  },
} as const;

export const getCopy = (language: Language) => copy[language];
