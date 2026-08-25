export function ProgressBar({ progress }) {
  return (
    <div className="bg-tokyo-bg border-tokyo-border h-4 w-full overflow-clip rounded-sm border">
      <div
        className="bg-tokyo-accent h-full"
        style={{ width: progress.toString() + "%" }}
      ></div>
    </div>
  );
}
