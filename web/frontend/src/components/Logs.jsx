import { useEffect, useState } from "react";

async function getLogs() {
  const res = await fetch("/api/minecraft/logs", { credentials: "include" });
  if (!res.ok) {
    return [];
  }

  const resJson = await res.json();
  return resJson;
}

export default function Logs() {
  // Mock data representing standard system and network events
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const loadLogs = async () => {
      const logs = await getLogs();
      setLogs(logs);
    };

    loadLogs();
  }, []);

  // Color mapping for different log severities
  const levelColors = {
    INFO: "text-tokyo-fg", // Green
    WARN: "text-tokyo-warning", // Yellow
    ERROR: "text-tokyo-error", // Red
  };

  return (
    <div className="border-tokyo-border bg-tokyo-surface flex flex-1 w-full max-w-480 flex-col overflow-hidden rounded-md border font-mono text-sm">
      {/* Scrollable Log Container */}
      <div className="text-tokyo-fg text-xs h-full space-y-1 overflow-y-auto p-1">
        {logs.toReversed().map((log) => {
          const dateStr = log.time.substring(0, 10);
          const timeStr = log.time.substring(11, 19);
          const msStr = log.time.substring(19);
          return (
            <div
              key={log.id}
              className="flex gap-2 rounded sm:px-2 sm:py-1 px-1 py-0.5 transition-colors"
            >
              <span className="shrink-0 text-[#565f89] mr-1">
                <span className="hidden sm:inline">{dateStr}</span>
                <span className="sm:ml-2">{timeStr}</span>
                <span className="hidden md:inline">{msStr}</span>
              </span>
              <span className={"wrap-anywhere " + levelColors[log.level]}>{log.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
