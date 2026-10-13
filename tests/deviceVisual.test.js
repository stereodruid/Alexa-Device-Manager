import test from "node:test";
import assert from "node:assert/strict";
import { deviceVisual } from "../src/deviceVisual.js";

const typed = (deviceType, displayName = "Test device") => ({
  id: deviceType,
  displayName,
  providerData: { deviceType },
});

test("detail visuals distinguish common Alexa device categories", () => {
  const cases = {
    SCENE_TRIGGER: "scene",
    ACTIVITY_TRIGGER: "scene",
    PRINTER: "printer",
    PROJECTOR: "projector",
    TELEVISION: "tv",
    COMPUTER: "computer",
    LAPTOP: "laptop",
    SCREEN: "screen",
    GAME_CONSOLE: "game-console",
    SECURITY_PANEL: "security-panel",
    HEADPHONES: "headphones",
    STREAMING_DEVICE: "streaming-device",
    MUSIC_SYSTEM: "music-system",
    TABLET: "tablet",
    MOBILE_PHONE: "phone",
    NETWORK_HARDWARE: "hub",
    DOOR: "door",
    CHRISTMAS_TREE: "christmas-tree",
    VEHICLE: "vehicle",
    DOORBELL_CAMERA: "doorbell",
    TEMPERATURE_SENSOR: "temperature-sensor",
    MOTION_SENSOR: "motion-sensor",
    CONTACT_SENSOR: "contact-sensor",
    AIR_CONDITIONER: "air-conditioner",
    AIR_PURIFIER: "air-purifier",
    HUMIDIFIER: "humidifier",
    VACUUM_CLEANER: "vacuum",
    WASHING_MACHINE: "washer",
    CLOTHES_DRYER: "dryer",
    DISHWASHER: "dishwasher",
    REFRIGERATOR: "refrigerator",
    MICROWAVE: "microwave",
    OVEN: "oven",
    COFFEE_MAKER: "coffee-maker",
    GARAGE_DOOR: "garage",
  };
  for (const [type, expected] of Object.entries(cases))
    assert.equal(deviceVisual(typed(type)), expected, type);
});

test("generic switches can use a specific presentation hint from their name", () => {
  assert.equal(deviceVisual(typed("SWITCH", "Living room projector")), "projector");
  assert.equal(deviceVisual(typed("SWITCH", "Coffee maker")), "coffee-maker");
  assert.equal(deviceVisual(typed("SWITCH", "Office printer")), "printer");
  assert.equal(deviceVisual(typed("SWITCH", "Good night scene")), "scene");
  assert.equal(deviceVisual(typed("SWITCH", "Ordinary switch")), "switch");
});
