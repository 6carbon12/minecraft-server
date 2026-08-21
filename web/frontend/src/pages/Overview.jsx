import Logs from "../components/Logs";
import Status from "../components/Status";

export default function Overview() {
  return (
    <div className="w-full h-full flex justify-center">
      <div className="flex w-full max-w-480 flex-col justify-center gap-2">
        <Status />
        <Logs />
      </div>
    </div>
  );
}
