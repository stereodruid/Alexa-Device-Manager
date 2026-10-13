import { deviceName, isEcho, isGroup } from "./alexa.js";

// Presentation only: never use name-based hints for API targets or protection.
export function deviceVisual(d) {
  if (isEcho(d)) return "echo";
  if (isGroup(d)) return "group";
  const type = [
    d.providerData?.deviceType,
    d.providerData?.categoryType,
    d.deviceType,
    d.icon?.value,
    d.deviceFamily,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const name = String(deviceName(d) || "").toLowerCase();
  // Specific categories take precedence; generic switch/endpoint devices can
  // represent a projector, TV, or other appliance named by the user.
  if (/scene|activity.?trigger|routine/.test(type)) return "scene";
  if (/printer/.test(type)) return "printer";
  if (/projector|projection/.test(type)) return "projector";
  if (/television|\btv\b/.test(type)) return "tv";
  if (/game.?console/.test(type)) return "game-console";
  if (/streaming|apple.?tv/.test(type)) return "streaming-device";
  if (/headphones?/.test(type)) return "headphones";
  if (/music.?system/.test(type)) return "music-system";
  if (/laptop/.test(type)) return "laptop";
  if (/computer/.test(type)) return "computer";
  if (/tablet/.test(type)) return "tablet";
  if (/mobile.?phone|smartphone|\bphone\b/.test(type)) return "phone";
  if (/screen|display|monitor/.test(type)) return "screen";
  if (/security.?panel/.test(type)) return "security-panel";
  if (/network.?hardware|\bhub\b/.test(type)) return "hub";
  if (/vehicle|\bcar\b/.test(type)) return "vehicle";
  if (/christmas.?tree/.test(type)) return "christmas-tree";
  if (/doorbell/.test(type)) return "doorbell";
  if (/camera/.test(type)) return "camera";
  if (/thermostat/.test(type)) return "thermostat";
  if (/temperature.?sensor/.test(type)) return "temperature-sensor";
  if (/motion.?sensor/.test(type)) return "motion-sensor";
  if (/contact.?sensor/.test(type)) return "contact-sensor";
  if (/sensor/.test(type)) return "sensor";
  if (/lock/.test(type)) return "lock";
  if (/garage/.test(type)) return "garage";
  if (/\bdoor\b/.test(type)) return "door";
  if (/air.?conditioner|air.?conditioning/.test(type)) return "air-conditioner";
  if (/air.?freshener/.test(type)) return "air-freshener";
  if (/air.?purifier/.test(type)) return "air-purifier";
  if (/dehumidifier/.test(type)) return "dehumidifier";
  if (/humidifier/.test(type)) return "humidifier";
  if (/water.?heater/.test(type)) return "water-heater";
  if (/heater/.test(type)) return "heater";
  if (/fan/.test(type)) return "fan";
  if (/blind|shade|curtain/.test(type)) return "blind";
  if (/vacuum/.test(type)) return "vacuum";
  if (/dishwasher/.test(type)) return "dishwasher";
  if (/washing.?machine|washer/.test(type)) return "washer";
  if (/dryer/.test(type)) return "dryer";
  if (/refrigerator|fridge/.test(type)) return "refrigerator";
  if (/microwave/.test(type)) return "microwave";
  if (/oven|cooker/.test(type)) return "oven";
  if (/coffee/.test(type)) return "coffee-maker";
  if (/router|network/.test(type)) return "router";
  if (/light/.test(type)) return "light";
  if (/\b(beamer|projektor|projector)\b/.test(name)) return "projector";
  if (/\b(tv|fernseher|television)\b/.test(name)) return "tv";
  if (/\b(drucker|printer)\b/.test(name)) return "printer";
  if (/\b(szene|scene|routine)\b/.test(name)) return "scene";
  if (/\b(türklingel|doorbell)\b/.test(name)) return "doorbell";
  if (/\b(staubsauger|vacuum|roomba)\b/.test(name)) return "vacuum";
  if (/\b(klimaanlage|air conditioner)\b/.test(name)) return "air-conditioner";
  if (/\b(kaffeemaschine|coffee maker)\b/.test(name)) return "coffee-maker";
  if (/plug|outlet/.test(type)) return "plug";
  if (/switch/.test(type)) return "switch";
  if (/speaker|audio/.test(type)) return "speaker";
  return "device";
}
