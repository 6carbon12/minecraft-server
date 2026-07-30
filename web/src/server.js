import { SCRIPT_DIR } from "./constants.js"
import path from 'path';
import { execFile } from 'child_process';

const fetchServerStatus = () => {
  return new Promise((resolve) => {
    const scriptPath = path.join(SCRIPT_DIR, 'serverctl.sh');
    const args = ["status"];

    execFile(scriptPath, args, (error, stdout, _) => {
      if (error) {
        console.error('Failed to get server status: ', error.message);
        return resolve({ status: 500, message: "Failed to get server status." });
      }

      const outputTrimmed = stdout.trim();
      const serverStatus = outputTrimmed === "true" ? "online" : "offline"; 
      resolve({ status: 200, message: serverStatus });
    });
  });
};

export const getServerStatus = async (_, res) => {
  try {
    const serverStatus = await fetchServerStatus();
    console.log(serverStatus);
    res.status(serverStatus.status).json({ status: serverStatus.message });
  } catch (error) {
    console.error("Critical routing error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const startServer = async (_, res) => {
  const scriptPath = path.join(SCRIPT_DIR, 'serverctl.sh');
  const args = ["start"];

  execFile(scriptPath, args, (error, stdout, _) => {
    if (error) {
      console.error('Failed to start server: ', error.message);
      return res.status(500).json({ error: "Failed to start server.", details: error.message });
    }
    console.log(stdout.trim());
    res.status(200).json({ message: "Server Started." });
  })
};

export const stopServer = (_, res) => {
  const scriptPath = path.join(SCRIPT_DIR, 'serverctl.sh');
  const args = ["stop"];

  execFile(scriptPath, args, (error, stdout, _) => {
    if (error) {
      console.error('Failed to stop server: ', error.message);
      return res.status(500).json({ error: "Failed to stop server.", details: error.message });
    }
    console.log(stdout.trim());
    res.status(200).json({ message: "Server Stopped." });
  })
};

export const restartServer = (_, res) => {
  const scriptPath = path.join(SCRIPT_DIR, 'serverctl.sh');
  const args = ["restart"];

  execFile(scriptPath, args, (error, stdout, _) => {
    if (error) {
      console.error('Failed to restart server: ', error.message);
      return res.status(500).json({ error: "Failed to restart server.", details: error.message });
    }
    console.log(stdout.trim());
    res.status(200).json({ message: "Server Restarted." });
  })
};
