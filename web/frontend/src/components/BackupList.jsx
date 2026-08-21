import RestoreIcon from '../assets/restore.svg?react'
import DeleteIcon from '../assets/delete.svg?react'

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const K = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(K));
  return parseFloat((bytes / Math.pow(K, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(date) {
  const dateObj = new Date(date);
  const pad = (num) => num.toString().padStart(2, "0");

  const DD = pad(dateObj.getDate());
  const MM = pad(dateObj.getMonth() + 1);
  const YY = pad(dateObj.getFullYear().toString().slice(-2));

  const hh = pad(dateObj.getHours());
  const mm = pad(dateObj.getMinutes());
  const ss = pad(dateObj.getSeconds());

  return `${DD}-${MM}-${YY} ${hh}:${mm}:${ss}`;
}

export default function BackupList({backupName, setBackupName, backups, createBackup, restoreBackup, deleteBackup}) {
  return (
    <div className="flex w-full h-full justify-center">
      <div className="flex w-full max-w-480 flex-col justify-center gap-2">
        <h1 className="text-tokyo-accent mb-4 text-3xl font-bold sm:hidden">
          Backups
        </h1>
        <div className="bg-tokyo-surface border-tokyo-border flex w-full gap-2 rounded-md border p-2">
          <input
            type="text"
            className="bg-tokyo-bg text-tokyo-fg border-tokyo-border flex-1 rounded-sm border px-4 outline-none"
            placeholder="Name of Backup"
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
          />
          <button
            className="bg-tokyo-accent text-tokyo-bg rounded-sm px-5 py-2"
            onClick={createBackup}
          >
            Create Backup
          </button>
        </div>
        <div className="bg-tokyo-surface border-tokyo-border flex-1 min-h-0 w-full overflow-x-auto rounded-md border">
          <table className="w-full text-left">
            <thead className="border-tokyo-border bg-tokyo-bg/50 text-tokyo-fg/70 border-b uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="w-36 px-6 py-4 text-center font-medium">
                  Created At
                </th>
                <th className="hidden w-36 px-6 py-4 text-center font-medium md:table-caption">
                  Size
                </th>
                <th className="w-36 px-6 py-4 text-center font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="">
              {backups.map((backup) => {
                return (
                  <tr className="hover:bg-tokyo-bg/30 border-tokyo-border border-b transition-colors" key={backup.id}>
                    <td className="text-tokyo-accent max-w-xs px-6 py-4 font-medium">
                      <div className="flex h-full items-center gap-2 overflow-x-hidden wrap-anywhere">
                        {backup.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {formatDate(backup.createdAt)}
                    </td>
                    <td className="hidden h-full w-36 items-center px-6 py-4 text-center md:table-cell">
                      {formatBytes(backup.sizeBytes)}
                    </td>
                    <td className="w-36 px-6 py-4">
                      <div className="flex h-full justify-center gap-2">
                        <button className="bg-tokyo-accent h-10 w-10 rounded-sm flex items-center justify-center" onClick={() => restoreBackup(backup.name)}>
                          <RestoreIcon height="24" width="24" />
                        </button>
                        <button className="bg-tokyo-error text-amber-50 h-10 w-10 rounded-sm flex items-center justify-center" onClick={() => deleteBackup(backup.name)}>
                          <DeleteIcon height="24" width="24" fill="#57101D"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
