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
  if (/projector|projection/.test(type)) return "projector";
  if (/television|\btv\b/.test(type)) return "tv";
  if (/camera/.test(type)) return "camera";
  if (/thermostat/.test(type)) return "thermostat";
  if (/sensor/.test(type)) return "sensor";
  if (/lock/.test(type)) return "lock";
  if (/fan/.test(type)) return "fan";
  if (/blind|shade/.test(type)) return "blind";
  if (/light/.test(type)) return "light";
  if (/\b(beamer|projektor|projector)\b/.test(name)) return "projector";
  if (/\b(tv|fernseher|television)\b/.test(name)) return "tv";
  if (/plug|outlet/.test(type)) return "plug";
  if (/switch/.test(type)) return "switch";
  if (/speaker|audio/.test(type)) return "speaker";
  return "device";
}
