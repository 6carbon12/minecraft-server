import ArrayGraph from "./ArrayGraph";

export default function CPUDisplay({ cpuStats }) {
  return (
    <div className="relative flex h-full gap-1">
      <div className="absolute z-10 flex h-full w-full flex-col justify-between pt-1 pl-1">
        <span className="w-7/8 border-b-white text-[8px]">100%</span>
        <span className="text-[8px]">80%</span>
        <span className="text-[8px]">60%</span>
        <span className="text-[8px]">40%</span>
        <span className="text-[8px]">20%</span>
        <span className="text-[8px]">0%</span>
      </div>
      {cpuStats[1] && (
        <div className="relative h-full flex-3/5">
          <div className="absolute top-1 right-1 z-10 flex w-[3em] flex-col justify-center">
            <span className="text-right text-[9px]">MC</span>
            <span className="text-right text-[9px]">
              {cpuStats[cpuStats.length - 1]
                ? cpuStats[cpuStats.length - 1].mcCpu * 4
                : "0"}
              %
            </span>
          </div>
          <ArrayGraph
            className="rounded-tl-md rounded-bl-md"
            data={cpuStats.map((cpuStats) => cpuStats.mcCpu * 4)}
          />
        </div>
      )}
      <div className="flex flex-2/5 flex-col gap-1">
        {cpuStats[1] &&
          [...cpuStats[0].cores].map((_, idx) => {
            return (
              <div
                id={crypto.randomUUID ? crypto.randomUUID() : idx}
                className="relative flex-1/4 overflow-clip"
              >
                <div className="absolute top-1 right-1 z-10 flex w-[3em] flex-col justify-center">
                  <span className="text-right text-[9px]">C{idx}</span>
                  <span className="text-right text-[9px]">
                    {cpuStats[cpuStats.length - 1].cores[idx]}%
                  </span>
                </div>
                <ArrayGraph
                  className={"rounded-tr-md"}
                  data={cpuStats.map((cpuStat) => cpuStat.cores[idx])}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}
