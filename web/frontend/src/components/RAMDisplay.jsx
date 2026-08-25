import RamBar from "./RamBar";

export default function RAMDisplay({ memStats }) {
  return memStats && (
    <div className="flex h-full flex-col justify-between gap-2">
      <RamBar usage={memStats.used} total={memStats.total} label={"Used:"} />
      <RamBar
        usage={memStats.available}
        total={memStats.total}
        label={"Available:"}
      />
      <RamBar
        usage={memStats.cached}
        total={memStats.total}
        label={"Cached:"}
      />
      <RamBar usage={memStats.free} total={memStats.total} label={"Free:"} />
    </div>
  );
}
