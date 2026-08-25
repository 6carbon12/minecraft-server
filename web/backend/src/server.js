import { SCRIPT_DIR } from "./constants.js"
import path from 'path';
import { execFile } from 'child_process';
import { getCpuUtilization, getMemUtilization } from "./utils.js";

const fetchServerStatus = () => {
  return new Promise((resolve) => {
    const scriptPath = path.join(SCRIPT_DIR, 'serverctl.sh');
    const args = ["status"];

    execFile(scriptPath, args, (error, stdout, _) => {
      if (error) {
        console.error('Failed to get server status: ', error.message);
        return resolve({ status: 500, error: "Failed to get server status." });
      }

      const outputTrimmed = stdout.trim();
      const serverStatus = outputTrimmed === "true" ? "online" : "offline";
      resolve({ status: 200, serverStatus: serverStatus });
    });
  });
};

export const getServerStatus = async (_, res) => {
  try {
    const serverStatus = await fetchServerStatus();
    res.status(serverStatus.status).json(serverStatus.serverStatus);
  } catch (error) {
    console.error("Critical routing error:", error);
    res.status(500).json({ error: "Failed to get server status." });
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
    res.status(200).json({ message: "Server Restarted." });
  })
};

const clients = new Set();

setInterval(async () => {
  if (clients.size === 0) return;

  try {
    const [cpu, mem] = await Promise.all([
      getCpuUtilization(),
      getMemUtilization(),
    ]);

    const payload = `event: metrics\ndata: ${JSON.stringify({ cpu, mem })}\n\n`;

    for (const res of clients)
      res.write(payload);

  } catch (err) {
    console.error('Failed to collect/broadcast metrics:', err);
  }
}, 2000);

export const streamMetrics = async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders?.();
  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });
}
