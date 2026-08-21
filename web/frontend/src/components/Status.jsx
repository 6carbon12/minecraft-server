import logo from "../assets/logo.png";
import StartStopIcon from "../assets/start-stop.svg?react";
import RestartIcon from "../assets/restart.svg?react";
import { useEffect, useState } from "react";

async function getServerStatus() {
  const res = await fetch("/api/server/status", { credentials: "include" });
  if (!res.ok) {
    console.error("Failed to get server status");
    return "changing";
  }

  const resJson = await res.json();
  return resJson;
}

async function getLastRestored() {
  const res = await fetch("/api/restore/latest", { credentials: "include" });
  if (!res.ok) {
    console.error("Failed to get latest backup file");
    return "";
  }

  const resJson = await res.json();
  return resJson;
}

async function getWorldName() {
  const res = await fetch("/api/minecraft/worldName", {
    credentials: "include",
  });
  if (!res.ok) {
    console.error("Failed to get world name.");
    return "Atlantis";
  }

  const resJson = await res.json();
  return resJson;
}

export default function Status() {
  const [serverState, setServerState] = useState("changing");
  const [worldName, setWorldName] = useState("Atlantis");
  const [lastRestoredBackup, setLastRestoredBackup] = useState(".tar.gz");

  useEffect(() => {
    getServerStatus().then((status) => {
      setServerState(status);
    });
    getLastRestored().then((lastRestoredFile) => {
      setLastRestoredBackup(lastRestoredFile);
    });
    getWorldName().then((worldName) => {
      setWorldName(worldName);
    });
  }, []);

  const toggleServer = async () => {
    const serverStatePrev = serverState;
    setServerState("changing");
    const apiPath =
      serverState === "online" ? "/api/server/stop" : "/api/server/start";
    const res = await fetch(apiPath, { credentials: "include" });

    if (!res.ok) {
      setServerState(serverStatePrev);
      return;
    }

    getServerStatus().then((status) => {
      setServerState(status);
    });
  };

  const restartServer = async () => {
    const serverStatePrev = serverState;
    setServerState("changing");

    const res = await fetch("/api/server/restart", { credentials: "include" });

    if (!res.ok) {
      setServerState(serverStatePrev);
      return;
    }

    getServerStatus().then((status) => {
      setServerState(status);
    });
  };

  let statusClasses = "";
  let powerButtonClasses = "";

  switch (serverState) {
    case "online":
      statusClasses = "grayscale-0 scale-100";
      powerButtonClasses = "bg-tokyo-error border-tokyo-error/50";
      break;
    case "offline":
      statusClasses = "grayscale scale-100";
      powerButtonClasses = "bg-tokyo-success";
      break;
    case "changing":
      statusClasses = "grayscale-0 animate-pulse";
      powerButtonClasses = "grayscale";
      break;
  }
  return (
    <div className="bg-tokyo-surface border-tokyo-border flex h-fit w-full max-w-480 flex-row items-center justify-between gap-1 rounded-md border px-2 py-2 sm:px-4 sm:py-3">
      <div className="flex flex-3/4 flex-row items-center gap-1">
        <div className="flex flex-0.9 items-center justify-start sm:flex-none">
          <img
            src={logo}
            alt="Minecraft Logo"
            className={`h-10 w-10 ${statusClasses}`}
          />
        </div>
        <div className="flex-4 ml-1 sm:flex-none">
          <p className="flex items-center gap-2 text-lg font-bold">
            {worldName}{" "}
            <div className="flex items-center">
              <span
                className={
                  "animate-pulse " +
                  (serverState === "online"
                    ? "text-tokyo-success"
                    : serverState === "offline"
                      ? "text-tokyo-error"
                      : "text-tokyo-fg")
                }
              >
                &middot;
              </span>{" "}
              <span
                className={
                  "text-xs " +
                  (serverState === "online"
                    ? "text-tokyo-success"
                    : serverState === "offline"
                      ? "text-tokyo-error"
                      : "text-tokyo-fg")
                }
              >
                {serverState}
              </span>
            </div>
          </p>
          <p className="text-tokyo-border text-xs text-wrap wrap-anywhere">
            <span className="hidden sm:inline">Last Resored: </span>
            {lastRestoredBackup.replace(".tar.gz", "")}
          </p>
        </div>
      </div>
      <div className="flex flex-1/4 flex-row items-end gap-2 sm:flex-none">
        <button
          className={`bg-tokyo-accent rounded-md border p-3 ${powerButtonClasses}`}
          onClick={toggleServer}
        >
          <StartStopIcon
            height="16"
            width="16"
            fill={serverState == "online" ? "#57101D" : "#3F522A"}
          ></StartStopIcon>
        </button>
        <button
          className="bg-tokyo-accent border-tokyo-border rounded-md border p-3"
          onClick={restartServer}
        >
          <RestartIcon height="16" width="16"></RestartIcon>
        </button>
      </div>
    </div>
  );
}
