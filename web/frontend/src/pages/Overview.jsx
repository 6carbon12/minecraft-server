import Logs from "../components/Logs";
import Status from "../components/Status";

export default function Overview() {
  return (
    <div className="w-full h-full flex justify-center">
      <div className="flex w-full max-w-480 flex-col justify-center gap-2">
        <h1 className="text-tokyo-accent text-3xl font-bold mb-4 sm:hidden"> Overview </h1>
        <Status />
        <Logs />
      </div>
    </div>
  );
}
