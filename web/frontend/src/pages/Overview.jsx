import Logs from "../components/Logs";
import Performance from "../components/Performance";
import Status from "../components/Status";

export default function Overview() {
  return (
    <div className="flex h-full w-full justify-center">
      <div className="flex w-full max-w-480 flex-col justify-center gap-2">
        <Status />
        <Performance />
        <Logs />
      </div>
    </div>
  );
}
