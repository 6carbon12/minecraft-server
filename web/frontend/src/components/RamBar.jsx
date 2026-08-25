import { ProgressBar } from "./ProgressBar";

export default function RamBar({ usage, total, label }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex w-full justify-between">
        <span className="text-xs">{label}</span>
        <span className="text-xs">{usage.toFixed(2)}G</span>
      </div>
      <ProgressBar progress={(usage / total) * 100} />
    </div>
  );
}
