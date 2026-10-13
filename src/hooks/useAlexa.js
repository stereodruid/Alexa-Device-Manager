import { useState, useCallback, useRef } from "react";
import { createAlexaClient, runBatch, deviceName, isProtected } from "../alexa";
import { localizeMessage, tr } from "../i18n";

const client = createAlexaClient();
export function useAlexa(language = "de") {
  const [devices, setDevices] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const [loadedAt, setLoadedAt] = useState(null);
  const [logs, setLogs] = useState([{ text: tr(language, "cliReady"), level: "info" }]);
  const lock = useRef(false);
  const latest = useRef([]);
  const readyRef = useRef(false);
  const logger = useCallback(
    (message, level = "info") =>
      setLogs((prev) => [
        ...prev.slice(-299),
        {
          text: `[${new Date().toLocaleTimeString(language === "de" ? "de-DE" : "en-US")}] ${message}`,
          level,
        },
      ]),
    [language],
  );
  const publish = (data) => {
    latest.current = data;
    setDevices(data);
    setLoadedAt(new Date());
    readyRef.current = true;
    setReady(true);
  };
  const fetchDevices = useCallback(async () => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    readyRef.current = false;
    setReady(false);
    try {
      const data = await client.load();
      publish(data);
      logger(tr(language, "loaded", { count: data.length }));
    } catch (e) {
      const message = localizeMessage(language, e.message);
      setError(tr(language, "stale", { message }));
      logger(message, "error");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }, [logger, language]);
  const execute = async (list, action, approval) => {
    if (lock.current || !readyRef.current) return false;
    const voiceAction = ["speak", "announce", "command"].includes(action);
    if ((!voiceAction && !approval?.backup) || !approval?.preview) {
      logger(tr(language, "safeguardsMissing"), "error");
      return false;
    }
    const current = list.map((d) => latest.current.find((x) => x.id === d.id));
    if (
      !voiceAction &&
      current.some(
        (d, i) =>
          !d ||
          d._admEndpointId !== list[i]._admEndpointId ||
          d._admApplianceId !== list[i]._admApplianceId,
      )
    ) {
      logger(tr(language, "staleSelection"), "error");
      return false;
    }
    if (
      !voiceAction &&
      current.some(
        (d) => isProtected(d) && !approval.allowProtectedIds?.includes(d.id),
      )
    ) {
      logger(tr(language, "protectedMissing"), "error");
      return false;
    }
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      if (["on", "off", "speak", "announce", "command"].includes(action)) {
        if (current.length !== 1)
          throw new Error(tr(language, "exactlyOne"));
        if (["speak", "announce", "command"].includes(action))
          await client.sendAlexaAction(current[0], approval.text || "", action, approval.locale || (language === "de" ? "de-DE" : "en-US"));
        else await client.power(current[0], action === "on");
        const actionLabel = action === "speak" ? tr(language, "speechOutput") : action === "announce" ? tr(language, "announcementOutput") : action === "command" ? tr(language, "commandOutput") : tr(language, "switchCommand");
        logger(
          tr(language, "requested", { name: deviceName(current[0]), action: actionLabel }),
        );
        return true;
      }
      const outcome = await runBatch(client, current, action, {
        allowProtectedIds: approval.allowProtectedIds,
        logger: (message, level) => logger(localizeMessage(language, message), level),
      });
      if (outcome.devices) publish(outcome.devices);
      if (!outcome.verified) {
        readyRef.current = false;
        setReady(false);
        throw new Error(
          tr(language, "verificationFailed"),
        );
      }
      const failed = outcome.results.filter((r) => !r.success);
      for (const r of failed)
        logger(
          `${deviceName(r.device)}: ${r.error ? localizeMessage(language, r.error) : tr(language, "targetNotReached")}`,
          "error",
        );
      logger(
        tr(language, "changesConfirmed", { success: outcome.results.length - failed.length, total: outcome.results.length }),
      );
      if (failed.length)
        logger(tr(language, "actionsFailed", { count: failed.length }), "error");
      return !failed.length;
    } catch (e) {
      const message = localizeMessage(language, e.message);
      setError(null);
      logger(message, "error");
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return {
    devices,
    busy,
    error,
    ready,
    loadedAt,
    logs,
    logger,
    fetchDevices,
    execute,
  };
}
