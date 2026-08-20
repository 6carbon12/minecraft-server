import { useState } from "react";
import AdminHistory from "../components/AdminHistory";

function Admin() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleKeyDown = async (e) => {
    if (e.key != "Enter") return;

    const command = input.trim();
    setInput("");
    if (command == "") {
      setHistory((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "input",
          level: "INFO",
          message: ``,
        },
      ]);
      return;
    }

    setHistory((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "input", message: command },
    ]);

    if (command.toLowerCase() === "clear") {
      setHistory([]);
      return;
    }

    setLoading(true);

    const response = await fetch("/api/minecraft/command", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command }),
    });

    if (!response.ok) {
      setHistory((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "output",
          level: "ERROR",
          message: `Error: Failed to execute command.`,
        },
      ]);
      setLoading(false);
    }

    const outputs = await response.json();
    outputs.forEach((output) => {
      setHistory((prev) => [
        ...prev,
        {
          id: output.id,
          type: "output",
          level: output.level,
          message: output.message,
        },
      ]);
    });
    setLoading(false);
  };

  return (
    <>
    <h1 className="text-tokyo-accent mb-4 text-3xl font-bold sm:hidden">
      Admin Console
    </h1>
    <AdminHistory history={history} loading={loading} input={input} setInput={setInput} handleKeyDown={handleKeyDown} />
    </>
  );
}

export default Admin;
