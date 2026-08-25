import { useEffect, useState } from "react";
import CpuIcon from "../assets/cpu.svg?react";
import RamIcon from "../assets/ram.svg?react";
import CPUDisplay from "./CPUDisplay";
import RAMDisplay from "./RAMDisplay";

export default function Performance() {
  const [currentPage, SetCurrentPage] = useState("CPU"); // can be CPU or MEM
  const [cpuStats, setCpuStats] = useState([]);
  const [memStats, setMemStats] = useState();

  useEffect(() => {
    const stream = new EventSource("/api/server/metrics/stream", {
      withCredentials: true,
    });
    stream.addEventListener("metrics", (event) => {
      const metrics = JSON.parse(event.data);
      if (cpuStats.length == 10) setCpuStats((p) => p.slice(1));
      setCpuStats((p) => [...p, metrics.cpu]);
      setMemStats(metrics.mem);
    });
    return () => stream.close();
  });

  return (
    <div className="border-tokyo-border bg-tokyo-surface flex min-h-57.5 flex-col gap-2 rounded-md border p-2 transition-all duration-300">
      <div className="mb-2 flex max-h-6 gap-2 sm:hidden">
        <button
          className={
            "border-tokyo-accent flex items-center rounded-sm border px-2 py-1 text-xs transition-colors" +
            (currentPage == "CPU"
              ? " text-tokyo-bg bg-tokyo-accent font-bold"
              : " text-tokyo-accent")
          }
          onClick={() => SetCurrentPage("CPU")}
        >
          <div className="flex items-center gap-1">
            <CpuIcon
              className={
                "w-4 " +
                (currentPage == "CPU" ? "fill-tokyo-bg" : "fill-tokyo-accent")
              }
            />{" "}
            {cpuStats[cpuStats.length - 1]
              ? cpuStats[cpuStats.length - 1].cpu
              : 0}
            %
          </div>
        </button>
        <button
          className={
            "border-tokyo-accent flex items-center rounded-sm border px-2 py-1 text-xs transition-colors" +
            (currentPage == "MEM"
              ? " text-tokyo-bg bg-tokyo-accent font-bold"
              : " text-tokyo-accent")
          }
          onClick={() => SetCurrentPage("MEM")}
        >
          <div className="flex items-center gap-1">
            <RamIcon
              className={
                "w-4 " +
                (currentPage == "MEM" ? "fill-tokyo-bg" : "fill-tokyo-accent")
              }
            />{" "}
            {memStats ? memStats.used.toFixed(2) : 0}
            G/{memStats ? memStats.total.toFixed(2) : "0"}G
          </div>
        </button>
      </div>

      <div className="h-full w-full sm:hidden">
        {currentPage === "CPU" ? (
          <CPUDisplay cpuStats={cpuStats} />
        ) : (
          <RAMDisplay memStats={memStats} />
        )}
      </div>
      <div className="hidden h-full w-full gap-2 sm:flex">
        <div className="flex-1/2">
          <CPUDisplay cpuStats={cpuStats} />
        </div>
        <div className="border-tokyo-border h-full w-0 border" />
        <div className="h-full flex-1/2">
          <RAMDisplay memStats={memStats} />
        </div>
      </div>
    </div>
  );
}
