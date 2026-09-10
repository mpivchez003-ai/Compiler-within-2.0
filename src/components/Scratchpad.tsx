import React, { useState } from "react";
import { ListChecks, Table, Send, Sparkles, AlertCircle } from "lucide-react";

interface ScratchpadProps {
  onInsertToChat: (text: string) => void;
  currentPhase: number;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ onInsertToChat, currentPhase }) => {
  const [activeTab, setActiveTab] = useState<"logic" | "boundaries" | "trace">("logic");
  const [logicText, setLogicText] = useState(
    "1. Read input data\n2. Track left and right boundaries\n3. Compare elements while moving inwards"
  );
  const [boundaries, setBoundaries] = useState([
    { id: 1, name: "Empty input / null", handled: false, note: "Should return default or early false" },
    { id: 2, name: "Single element", handled: true, note: "No comparison needed, trivially true" },
    { id: 3, name: "All identical elements", handled: false, note: "Pointers meet in center" },
    { id: 4, name: "Odd vs Even length", handled: true, note: "Left < Right handles both" },
  ]);

  const [traceRows, setTraceRows] = useState([
    { step: "1", left: "0 (A)", right: "4 (A)", condition: "Match", action: "left++, right--" },
    { step: "2", left: "1 (b)", right: "3 (b)", condition: "Match", action: "left++, right--" },
    { step: "3", left: "2 (c)", right: "2 (c)", condition: "left == right", action: "Stop loop, return True" },
  ]);

  const handleToggleBoundary = (id: number) => {
    setBoundaries((prev) =>
      prev.map((b) => (b.id === id ? { ...b, handled: !b.handled } : b))
    );
  };

  const handleSendLogic = () => {
    onInsertToChat(`My Plain Logic Articulation:\n${logicText}`);
  };

  const handleSendBoundaries = () => {
    const list = boundaries
      .map((b) => `- ${b.name}: ${b.handled ? "Handled (" + b.note + ")" : "Not yet (" + b.note + ")"}`)
      .join("\n");
    onInsertToChat(`Boundary Condition Check:\n${list}`);
  };

  const handleSendTrace = () => {
    const tableText = traceRows
      .map((r) => `Step ${r.step}: Left=${r.left}, Right=${r.right} -> ${r.condition} -> ${r.action}`)
      .join("\n");
    onInsertToChat(`Mental Trace Walkthrough:\n${tableText}`);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
      <div className="flex items-center justify-between px-4 py-2 border-b border-stone-200 bg-stone-50">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("logic")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === "logic"
                ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Plain Logic</span>
          </button>
          <button
            onClick={() => setActiveTab("boundaries")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === "boundaries"
                ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <ListChecks className="w-3 h-3 text-amber-600" />
            <span>Boundaries</span>
          </button>
          <button
            onClick={() => setActiveTab("trace")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === "trace"
                ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Table className="w-3 h-3 text-amber-600" />
            <span>Dry-Run Trace</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-stone-500">Cognitive Scratchpad</span>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {activeTab === "logic" && (
          <div className="h-full flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-700">
                Phase 1: Articulate your approach in plain human words (no code syntax):
              </label>
              <button
                onClick={handleSendLogic}
                className="text-xs text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition"
              >
                <Send className="w-3 h-3" />
                <span>Send to Coach</span>
              </button>
            </div>
            <textarea
              id="scratchpad-logic-input"
              value={logicText}
              onChange={(e) => setLogicText(e.target.value)}
              placeholder="What do you want to do first in plain words? Break it into numbered steps..."
              className="flex-1 w-full p-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed"
            />
            <p className="text-[11px] text-stone-500">
              Tip: Explaining logic in natural language builds the neural pathway before syntactic translation.
            </p>
          </div>
        )}

        {activeTab === "boundaries" && (
          <div className="h-full flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-700">
                Phase 2: Boundary & Edge Condition Audit:
              </label>
              <button
                onClick={handleSendBoundaries}
                className="text-xs text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition"
              >
                <Send className="w-3 h-3" />
                <span>Send to Coach</span>
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-auto">
              {boundaries.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleToggleBoundary(b.id)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer text-xs flex items-start gap-2.5 ${
                    b.handled
                      ? "bg-emerald-50/70 border-emerald-200 text-stone-900"
                      : "bg-stone-50 border-stone-200 text-stone-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={b.handled}
                    onChange={() => handleToggleBoundary(b.id)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-stone-900">{b.name}</p>
                    <p className="text-[11px] text-stone-500">{b.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 bg-stone-100 p-2 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>A robust algorithm explicitly covers boundaries before writing loop condition statements.</span>
            </div>
          </div>
        )}

        {activeTab === "trace" && (
          <div className="h-full flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-700">
                Mental Execution Dry-Run (Step-by-step state):
              </label>
              <button
                onClick={handleSendTrace}
                className="text-xs text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition"
              >
                <Send className="w-3 h-3" />
                <span>Send to Coach</span>
              </button>
            </div>

            <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left font-mono">
                <thead className="bg-stone-100 text-stone-700 border-b border-stone-200">
                  <tr>
                    <th className="p-2">Step</th>
                    <th className="p-2">Left</th>
                    <th className="p-2">Right</th>
                    <th className="p-2">Condition</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {traceRows.map((r, i) => (
                    <tr key={i} className="hover:bg-stone-50">
                      <td className="p-2 font-semibold text-stone-500">{r.step}</td>
                      <td className="p-2 text-stone-800">{r.left}</td>
                      <td className="p-2 text-stone-800">{r.right}</td>
                      <td className="p-2 text-stone-700">{r.condition}</td>
                      <td className="p-2 text-amber-900 bg-amber-50/40">{r.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-stone-500">
              Traces verify loop bounds (<code className="font-mono bg-stone-100 px-1 rounded">&lt;</code> vs{" "}
              <code className="font-mono bg-stone-100 px-1 rounded">&lt;=</code>) before you commit to syntax.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
