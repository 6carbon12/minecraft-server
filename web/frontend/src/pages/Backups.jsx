import { useState, useEffect } from "react";
import BackupList from "../components/BackupList";

async function getBackups() {
  const res = await fetch("/api/backups", { credentials: "include" });
  if (!res.ok) {
    return [];
  }

  const resJson = await res.json();
  return resJson;
}

async function loadBackups(setBackups) {
  const backups = await getBackups();
  setBackups(backups);
}

export default function Backups() {
  const [backups, setBackups] = useState([]);
  const [backupName, setBackupName] = useState("");

  function createBackup() {
    // TODO: Enable/Diable text input and button while backup is being made
    fetch("/api/backups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name: backupName }),
    }).then((res) => {
      if (res.ok) loadBackups(setBackups)
    }).finally(() => {
    })
  }

  function deleteBackup(backupName) {
    fetch(`/api/backups/${backupName}`, {
      method: "DELETE",
      credentials: "include"
    }).then((res) => {
      if (res.ok) loadBackups(setBackups)
    }).finally(() => {
    })
  }

  function restoreBackup(backupName) {
    fetch(`/api/restore/${backupName}`, {
      credentials: "include"
    }).then((res) => {
      if (res.ok) loadBackups(setBackups)
    }).finally(() => {
    })
  }

  useEffect(() => {
    loadBackups(setBackups);
  }, []);

  return (
    <BackupList backups={backups ? backups : []} setBackupName={setBackupName} createBackup={createBackup} deleteBackup={deleteBackup} restoreBackup={restoreBackup}/>
  );
}
