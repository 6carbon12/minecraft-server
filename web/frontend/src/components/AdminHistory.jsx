import { useEffect, useRef } from "react";

export default function AdminHistory({loading, history, input, setInput, handleKeyDown}) {

  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  return (
    <div className="flex w-full items-center justify-center">
      <div className="bg-tokyo-surface border-tokyo-border w-full max-w-480 rounded-md border p-4">
        {history.map((item) => {
          let textClasses = item.type == "input" ? "font-black" : "font-medium";
          textClasses += item.level == "ERROR" ? " text-tokyo-error" : "";
          return (
            <div key={item.id} className={`w-full`}>
              <span
                className={textClasses + " max-w-full text-wrap wrap-anywhere"}
              >
                {item.type == "input" ? `$ ${item.message}` : item.message}
              </span>
            </div>
          );
        })}
        {loading && <div className="text-tokyo-warning">Processing...</div>}

        <div className="flex w-full">
          <span className="mr-2 font-black">$</span>
          <textarea
            className="field-sizing-content h-fit w-full resize-y text-wrap outline-none"
            type="text"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            spellCheck="false"
            autoComplete="off"
          />
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
