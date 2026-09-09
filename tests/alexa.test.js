import test from "node:test";
import assert from "node:assert/strict";
import {
  createAlexaClient,
  mergeDevices,
  runBatch,
  resolveEcho,
  reachability,
  source,
  filterDevices,
  toggleVisible,
  isProtected,
  isEcho,
} from "../src/alexa.js";

test("Echo recognition supports top-level types and GraphQL categories", () => {
  assert.equal(isEcho({ deviceType: "ALEXA_VOICE_ENABLED" }), true);
  assert.equal(isEcho({ providerData: { categoryType: "ALEXA_VOICE_ENABLED" } }), true);
  assert.equal(isEcho({ deviceFamily: "ECHO" }), true);
  assert.equal(isEcho({ displayName: "Echo Lampe", providerData: { deviceType: "LIGHT" } }), false);
});

const d = {
  id: "entity-1",
  displayName: "Lampe",
  _admEndpointId: "ep-1",
  _admApplianceId: "legacy-1",
  _admEnablement: "ENABLED",
};
const response = (body, status = 200) =>
  new Response(body === null ? null : JSON.stringify(body), { status });
const endpoint = {
  endpointId: "ep-1",
  enablement: "ENABLED",
  legacyAppliance: { applianceId: "legacy-1" },
  legacyIdentifiers: { chrsIdentifier: { entityId: d.id } },
};
const noDelay = async () => {};

test("merge keeps IDs, adds GraphQL-only devices and clears unmatched metadata", () => {
  const result = mergeDevices(
    [{ id: d.id }, { id: "unknown", _admEndpointId: "stale" }, { id: "short" }],
    [
      endpoint,
      { endpointId: "amzn1.alexa.endpoint.short" },
      { endpointId: "gql-only" },
    ],
  );
  assert.equal(result.length, 4);
  assert.equal(result[0]._admApplianceId, "legacy-1");
  assert.equal(result[1]._admEndpointId, null);
  assert.equal(result[2]._admEndpointId, "amzn1.alexa.endpoint.short");
  assert.equal(result[3].id, "gql-only");
});
test("merge fails closed on ambiguous identities and malformed lists", () => {
  assert.throws(() => mergeDevices([], null));
  assert.throws(() =>
    mergeDevices([], [endpoint, { ...endpoint, endpointId: "other" }]),
  );
  assert.throws(() => mergeDevices([{ id: "same" }, { id: "same" }], []));
});
test("load rejects HTTP errors, GraphQL errors and missing endpoints", async () => {
  for (const failure of [
    () => response({}, 403),
    () => response({ errors: [{ message: "Denied" }] }),
    () => response({ data: {} }),
  ]) {
    const client = createAlexaClient(async (url) =>
      url.includes("entities") ? response([]) : failure(),
    );
    await assert.rejects(client.load());
  }
});
test("enable request uses V1 input argument and verifies identity and state", async () => {
  let sent;
  const client = createAlexaClient(async (_url, options) => {
    sent = JSON.parse(options.body);
    return response({
      data: {
        setEndpointEnablement: {
          endpoint: { endpointId: "ep-1", enablement: "DISABLED_BY_CUSTOMER" },
        },
      },
    });
  });
  await client.mutate(d, "disable");
  assert.match(sent.query, /setEndpointEnablement\(input: \$input\)/);
  assert.equal(sent.variables.input.endpointId, "ep-1");
});
test("mutations reject GraphQL errors delivered with HTTP 200", async () => {
  const client = createAlexaClient(async () =>
    response({ errors: [{ message: "Denied" }] }),
  );
  await assert.rejects(client.mutate(d, "disable"));
  await assert.rejects(client.mutate(d, "delete"));
});
test("enable rejects nested errors, wrong identity and wrong state", async () => {
  for (const result of [
    { error: { __typename: "Failure" } },
    { endpoint: { endpointId: "wrong", enablement: "ENABLED" } },
    { endpoint: { endpointId: "ep-1", enablement: "DISABLED_BY_CUSTOMER" } },
  ]) {
    const client = createAlexaClient(async () =>
      response({ data: { setEndpointEnablement: result } }),
    );
    await assert.rejects(client.mutate(d, "enable"));
  }
});
test("delete checks returned ID and accepts successful legacy 204", async () => {
  await assert.rejects(
    createAlexaClient(async () =>
      response({ data: { forgetEndpoint: { endpointId: "wrong" } } }),
    ).mutate(d, "delete"),
  );
  await createAlexaClient(async () => response(null, 204)).mutate(
    { ...d, _admEndpointId: null },
    "delete",
  );
});
test("batch cannot change protected devices without per-target authorization", async () => {
  let calls = 0;
  const echo = { ...d, providerData: { deviceType: "ALEXA_VOICE_ENABLED" } };
  assert(isProtected(echo));
  await assert.rejects(
    runBatch({ mutate: async () => calls++ }, [echo], "delete"),
  );
  assert.equal(calls, 0);
});
test("batch verifies deletion against fresh data including lingering entities", async () => {
  for (const remaining of [[d], [{ id: d.id }]]) {
    const result = await runBatch(
      { mutate: async () => {}, load: async () => remaining },
      [d],
      "delete",
      { delay: noDelay },
    );
    assert.equal(result.results[0].success, false);
  }
  const result = await runBatch(
    { mutate: async () => {}, load: async () => [] },
    [d],
    "delete",
    { delay: noDelay },
  );
  assert.equal(result.results[0].success, true);
});
test("batch does not report unchanged enablement as successful", async () => {
  const result = await runBatch(
    { mutate: async () => {}, load: async () => [d] },
    [d],
    "disable",
    { delay: noDelay },
  );
  assert.equal(result.results[0].success, false);
});
test("failed verification remains unconfirmed", async () => {
  const result = await runBatch(
    {
      mutate: async () => {},
      load: async () => {
        throw Error("offline");
      },
    },
    [d],
    "delete",
    { delay: noDelay },
  );
  assert.equal(result.verified, false);
  assert.equal(result.devices, null);
});
test("rate limit stops remaining commands and avoids an immediate reload", async () => {
  let calls = 0;
  const result = await runBatch(
    {
      mutate: async () => {
        calls++;
        throw Object.assign(Error("limit"), { status: 429 });
      },
      load: async () => {
        throw Error("must not load");
      },
    },
    [d, { ...d, id: "second", _admEndpointId: "second" }],
    "delete",
    { delay: noDelay },
  );
  assert.equal(calls, 1);
  assert.equal(result.results.length, 2);
  assert.equal(result.verified, false);
});
test("duplicate endpoint targets are executed once", async () => {
  let calls = 0;
  await runBatch(
    { mutate: async () => calls++, load: async () => [] },
    [d, { ...d, id: "alias" }],
    "delete",
    { delay: noDelay },
  );
  assert.equal(calls, 1);
});
test("unknown reachability is not offline and modern state takes precedence", () => {
  assert.equal(reachability({}), "Unbekannt");
  assert.equal(
    reachability({ _admReachability: "UNAVAILABLE", availability: "ONLINE" }),
    "Offline",
  );
  assert.equal(source({ id: "x", displayName: "Third party" }), "Andere");
});
test("filter toggles protection and supports group membership and all searchable IDs", () => {
  const group = {
    id: "g",
    providerData: { categoryType: "GROUP", groupMembers: [d.id] },
  };
  assert.equal(filterDevices([d, group], { hideProtected: true }).length, 1);
  assert.equal(filterDevices([d, group], { hideProtected: false }).length, 2);
  assert.equal(filterDevices([d, group], { group: "g" }).length, 2);
  assert.equal(filterDevices([d], { search: "legacy-1 Lampe" }).length, 1);
  assert.equal(filterDevices([d], { status: "Offline" }).length, 0);
});
test("select visible compares identities, retains explicit hidden selection", () => {
  const checked = new Set(["a", "b"]);
  const visible = [{ id: "c" }, { id: "d" }];
  assert.deepEqual([...toggleVisible(checked, visible)], ["a", "b", "c", "d"]);
  assert.deepEqual(
    [...toggleVisible(new Set(["a", "b", "c", "d"]), visible)],
    ["a", "b"],
  );
});
test("Echo matching prioritizes exact IDs and never guesses by name", () => {
  const echoes = ["FIRST", "SECOND"].map((serialNumber) => ({
    serialNumber,
    deviceType: "TYPE",
    deviceOwnerCustomerId: "CUSTOMER",
    accountName: "Echo",
  }));
  assert.equal(
    resolveEcho({ id: "SECOND", displayName: "Echo" }, echoes).serialNumber,
    "SECOND",
  );
  assert.throws(() =>
    resolveEcho({ id: "unrelated", displayName: "Echo" }, echoes),
  );
});
test("TTS sends one request and stops on HTTP 429 without fallback attempts", async () => {
  let previews = 0;
  const client = createAlexaClient(async (url) => {
    if (url.includes("devices-v2"))
      return response({
        devices: [
          {
            serialNumber: "SECOND",
            deviceType: "TYPE",
            deviceOwnerCustomerId: "CUSTOMER",
          },
        ],
      });
    previews++;
    return response({}, 429);
  });
  await assert.rejects(client.speak({ id: "SECOND" }, "Test"));
  assert.equal(previews, 1);
});
test("power rejects guessed endpoint IDs", async () => {
  let calls = 0;
  const client = createAlexaClient(async () => {
    calls++;
    return response({});
  });
  await assert.rejects(client.power({ ...d, _admApplianceId: null }, true));
  assert.equal(calls, 0);
});
