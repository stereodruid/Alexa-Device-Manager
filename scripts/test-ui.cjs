const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require(process.env.AURA_PLAYWRIGHT || "playwright");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.AURA_BROWSER
      ? { executablePath: process.env.AURA_BROWSER }
      : {}),
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 1600, height: 1000 },
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    let mutations = 0,
      failLoad = false;
    const entities = Array.from({ length: 65 }, (_, i) => ({
      id: `entity-${i}`,
      displayName: `Lampe ${String(i).padStart(2, "0")}`,
      providerData: { deviceType: "LIGHT" },
      description: "via Home Assistant",
    }));
    entities.push({
      id: "echo",
      displayName: "Echo Test",
      providerData: { deviceType: "ALEXA_VOICE_ENABLED" },
    });
    const endpoints = entities.map((d, i) => ({
      endpointId: `ep-${i}`,
      enablement: "ENABLED",
      legacyAppliance: { applianceId: `legacy-${i}` },
      legacyIdentifiers: { chrsIdentifier: { entityId: d.id } },
      features: [
        {
          name: "connectivity",
          properties: [
            {
              name: "reachability",
              reachabilityStatusValue: i % 2 ? "OK" : "UNAVAILABLE",
            },
          ],
        },
      ],
    }));
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === "/api/behaviors/entities")
        return route.fulfill({ json: entities });
      if (url.pathname === "/nexus/v1/graphql") {
        const body = route.request().postDataJSON();
        if (body.operationName === "getDevicesBaseData")
          return failLoad
            ? route.fulfill({ status: 403, json: {} })
            : route.fulfill({ json: { data: { allDevices: { endpoints } } } });
        mutations++;
        if (body.operationName === "setEndpointEnablement") {
          const d = endpoints.find(
            (d) => d.endpointId === body.variables.input.endpointId,
          );
          d.enablement = body.variables.input.enablement;
          return route.fulfill({
            json: {
              data: {
                setEndpointEnablement: {
                  endpoint: {
                    endpointId: d.endpointId,
                    enablement: d.enablement,
                  },
                },
              },
            },
          });
        }
        return route.fulfill({ json: { errors: [{ message: "Denied" }] } });
      }
      if (/\.(png|jpg)$/.test(url.pathname))
        return route.fulfill({
          body: fs.readFileSync(
            path.join("chrome-extension", path.basename(url.pathname)),
          ),
          contentType: url.pathname.endsWith(".png")
            ? "image/png"
            : "image/jpeg",
        });
      return route.fulfill({
        contentType: "text/html",
        body: '<html><head></head><body style="overflow:scroll"><h1>Host page</h1></body></html>',
      });
    });
    await page.goto("http://aura.test");
    await page.evaluate(() => {
      window.chrome = {
        runtime: { getURL: (name) => `http://aura.test/${name}` },
      };
      localStorage.setItem("aura_kpi_order", '{"invalid":true}');
      localStorage.setItem("aura_col_order", '["invalid","name","name"]');
    });
    const bundle = fs.readFileSync("chrome-extension/content.js", "utf8");
    await page.addScriptTag({ content: bundle });
    await page.getByText("66 Geräte vollständig geladen.").waitFor();
    assert.equal(await page.locator("tbody tr").count(), 50);
    assert.equal(await page.locator(".kpi-icon svg").count(), 10);
    await page.getByLabel("Geschützte ausblenden").uncheck();
    await page.getByRole("button", { name: /Gesamt/ }).click();
    await page.getByLabel("Einträge pro Seite").selectOption("100");
    assert.equal(await page.locator("tbody tr").count(), 66);
    await page.getByLabel("Geschützte ausblenden").check();
    assert.equal(await page.locator("tbody tr").count(), 65);
    await page.getByRole("button", { name: /Echos/ }).click();
    assert.equal(await page.locator("tbody tr").count(), 1);
    await page.getByRole("button", { name: /Echo Test/ }).click();
    await page.getByLabel("Alexa Sprachausgabe").fill("Hallo Alexa");
    await page
      .locator(".speech-row")
      .getByRole("button", { name: "Senden", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Sprachausgabe – Vorschau" })
      .waitFor();
    assert.equal(await page.locator("blockquote").innerText(), "Hallo Alexa");
    await page.getByRole("button", { name: "Abbrechen" }).click();
    assert.equal(await page.locator(".detail-toolbar button svg").count(), 6);
    assert.equal(await page.locator(".detail-toolbar").innerText(), "");
    await page.setViewportSize({ width: 1600, height: 900 });
    const layout = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar');
      const log = sidebar.querySelector('.log > div');
      const name = sidebar.querySelector('.detail-heading h2').getBoundingClientRect();
      const picture = sidebar.querySelector('.detail-heading img').getBoundingClientRect();
      const before = sidebar.getBoundingClientRect().height; const originalCount = log.children.length;
      for(let i=0;i<30;i++) { const p=document.createElement('p'); p.textContent='Layout-Test '+i; log.appendChild(p); }
      const result = { noSidebarScroll: sidebar.scrollHeight <= sidebar.clientHeight,
        fixedSidebar: sidebar.getBoundingClientRect().height === before,
        logScrolls: log.scrollHeight > log.clientHeight,
        logFillsSpace: Math.abs(sidebar.getBoundingClientRect().bottom - sidebar.querySelector('.log').getBoundingClientRect().bottom - 13) < 2,
        centeredName: Math.abs(name.y + name.height / 2 - picture.y - picture.height / 2) < 2,
        filterBelow: document.querySelector('.filters').getBoundingClientRect().top >= document.querySelector('.device-list').getBoundingClientRect().bottom };
      while(log.children.length > originalCount) log.lastChild.remove();
      return result;
    });
    assert.deepEqual(layout, { noSidebarScroll:true, fixedSidebar:true, logScrolls:true, logFillsSpace:true, centeredName:true, filterBelow:true });
    await page.screenshot({
      path: path.join(process.env.TEMP || ".", "aura-restored-echo.png"),
    });
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.getByRole("button", { name: "Löschen prüfen" }).click();
    await page
      .getByLabel(
        "Ich habe die aktuelle JSON-Sicherung gespeichert und die Ziele geprüft.",
      )
      .check();
    await page.getByLabel("DELETE bestätigen").fill("DELETE");
    assert(
      await page.getByRole("button", { name: "Jetzt ausführen" }).isDisabled(),
    );
    await page
      .getByLabel("Dieses geschützte Ziel für diese Aktion freigeben")
      .check();
    assert(
      await page.getByRole("button", { name: "Jetzt ausführen" }).isEnabled(),
    );
    await page.getByRole("button", { name: "Abbrechen" }).click();
    assert.equal(mutations, 0);
    await page.getByRole("button", { name: /Gesamt/ }).click();
    await page.getByLabel("Geräte suchen").fill("Lampe 00");
    await page.getByLabel("Lampe 00 auswählen").check();
    await page.getByLabel("Geräte suchen").fill("Lampe 01");
    await page.getByLabel("Alle auf dieser Seite auswählen").check();
    assert(
      await page.getByText("2 Geräte ausgewählt", { exact: true }).isVisible(),
    );
    await page
      .locator(".action-footer")
      .getByRole("button", { name: "Deaktivieren", exact: true })
      .click();
    assert.equal(await page.locator(".plan-item").count(), 2);
    await page
      .getByLabel(
        "Ich habe die aktuelle JSON-Sicherung gespeichert und die Ziele geprüft.",
      )
      .check();
    await page.getByRole("button", { name: "Jetzt ausführen" }).dblclick();
    await page
      .getByText("2 von 2 Änderungen bestätigt.", { exact: false })
      .waitFor();
    assert.equal(mutations, 2);
    await page.getByRole("button", { name: /Gesamt/ }).click();
    await page.getByRole("button", { name: "Lampe 00", exact: true }).click();
    await page.screenshot({
      path: path.join(process.env.TEMP || ".", "aura-review-desktop.png"),
    });
    await page.setViewportSize({ width: 900, height: 800 });
    await page.screenshot({
      path: path.join(process.env.TEMP || ".", "aura-review-narrow.png"),
    });
    assert.equal(
      await page
        .locator(".aura-app")
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      true,
    );
    failLoad = true;
    await page.getByRole("button", { name: "Neu laden" }).click();
    await page.getByRole("alert").waitFor();
    assert.match(await page.getByRole("alert").innerText(), /403/);
    assert(
      await page
        .locator(".sidebar")
        .getByRole("button", { name: "Aktivieren", exact: true })
        .isDisabled(),
    );
    await page.addScriptTag({ content: bundle });
    assert.equal(await page.locator("#aura-root").count(), 1);
    await page.getByRole("button", { name: "Manager schließen" }).click();
    assert.equal(await page.locator("#aura-root").count(), 0);
    assert.equal(
      await page.evaluate(() => document.body.style.overflow),
      "scroll",
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: UI filters, pagination, protected preview, hidden selection, double click lock, mutation verification, failed reload, repeated injection and close.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
