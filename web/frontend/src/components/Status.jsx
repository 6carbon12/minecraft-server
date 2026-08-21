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
    <div className="bg-tokyo-surface border-tokyo-border flex h-fit w-full max-w-480 flex-row items-center justify-between rounded-md border px-6 py-4">
      <div className="flex flex-row items-center gap-4">
        <div>
          <img
            src={logo}
            alt="Minecraft Logo"
            className={`h-10 ${statusClasses}`}
          />
        </div>
        <div>
          <p className="text-xl font-bold">{worldName}</p>
          <p className="text-tokyo-border text-sm">
            Last Restored: {lastRestoredBackup}
          </p>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <button
          className={`bg-tokyo-accent rounded-md border p-2 ${powerButtonClasses}`}
          onClick={toggleServer}
        >
        <StartStopIcon height="24" width="24" fill={serverState == "online" ? "#57101D" : "#3F522A"} ></StartStopIcon>
        </button>
        <button
          className="bg-tokyo-accent border-tokyo-border rounded-md border p-2"
          onClick={restartServer}
        >
        <RestartIcon height="24" width="24" ></RestartIcon>
        </button>
      </div>
    </div>
  );
}
