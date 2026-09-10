import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, PhaseNumber } from "../types";
import { Send, Sparkles, HelpCircle, Terminal, Check, Bot, User, ArrowRight, CornerDownLeft } from "lucide-react";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string, isStuckOrError?: boolean) => void;
  currentPhase: PhaseNumber;
  onOpenFadedWorkbench: (snippet: string) => void;
  targetTask: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isLoading,
  onSendMessage,
  currentPhase,
  onOpenFadedWorkbench,
  targetTask,
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim(), false);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTriggerErrorPsychology = () => {
    const errorPrompt = inputText.trim()
      ? `I am confused / getting an error: ${inputText.trim()}`
      : "I'm feeling stuck / confused with this step.";
    onSendMessage(errorPrompt, true);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
      {/* Top chat banner */}
      <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="font-medium text-stone-800">Socratic Cognitive Session</span>
          <span className="text-stone-400 font-mono">|</span>
          <span className="text-stone-600 truncate max-w-[220px] font-mono">{targetTask}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-100 text-amber-900 border border-amber-200">
            Phase {currentPhase} Active
          </span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isCoach = msg.role === "coach";

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isCoach ? "justify-start" : "justify-end"}`}
            >
              {isCoach && (
                <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Terminal className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 shadow-xs ${
                  isCoach
                    ? "bg-stone-50/90 text-stone-900 border border-stone-200/90"
                    : "bg-stone-900 text-stone-50 ml-auto"
                }`}
              >
                {/* Meta header for Coach replies */}
                {isCoach && (
                  <div className="flex items-center justify-between gap-2 border-b border-stone-200/70 pb-1.5 text-[10px] font-mono text-stone-500">
                    <span className="font-semibold text-stone-700 flex items-center gap-1">
                      <Bot className="w-3 h-3 text-amber-600" /> Compiler Within
                    </span>
                    <div className="flex items-center gap-2">
                      {msg.phase && (
                        <span className="px-1.5 py-0.2 rounded bg-stone-200/80 text-stone-700">
                          Phase {msg.phase}
                        </span>
                      )}
                      {msg.wordCount !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded ${
                            msg.wordCount <= 80
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                          title="Cognitive constraint: under 80 words"
                        >
                          {msg.wordCount} words
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Main Content */}
                <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {msg.content}
                </div>

                {/* Diagnostic Question callout */}
                {isCoach && msg.diagnosticQuestion && (
                  <div className="mt-2 p-2.5 bg-amber-50/90 border border-amber-200 rounded-xl text-[11px] text-amber-950 font-medium space-y-1">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-amber-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Diagnostic Question:
                    </div>
                    <div className="italic">"{msg.diagnosticQuestion}"</div>
                  </div>
                )}

                {/* Faded Code Snippet Callout */}
                {msg.fadedSnippet && (
                  <div className="mt-2 p-2.5 bg-stone-950 text-stone-100 rounded-xl font-mono text-[11px] border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between text-stone-400 text-[10px]">
                      <span>Faded Syntax Template</span>
                      <button
                        onClick={() => onOpenFadedWorkbench(msg.fadedSnippet!)}
                        className="text-amber-400 hover:text-amber-300 font-sans font-medium underline flex items-center gap-1"
                      >
                        Open in Workbench <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <pre className="overflow-x-auto p-1 text-amber-200/90">
                      {msg.fadedSnippet}
                    </pre>
                  </div>
                )}

                <div className="text-[10px] text-right font-mono opacity-50">
                  {msg.timestamp}
                </div>
              </div>

              {!isCoach && (
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <Terminal className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-xs text-stone-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="font-mono text-[11px] pl-1">Formulating Socratic inquiry (&lt;80 words)...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Cognitive Action Helpers & Input */}
      <div className="p-3 bg-stone-50 border-t border-stone-200 space-y-2">
        {/* Quick Socratic Prompts */}
        <div className="flex items-center flex-wrap gap-1.5 text-[11px]">
          <button
            id="hesitation-stuck-button"
            type="button"
            onClick={handleTriggerErrorPsychology}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80 transition font-medium cursor-pointer"
            title="Triggers: 'What did you expect this operator/logic to do versus what it actually does?'"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>I'm stuck / I have an error</span>
          </button>

          <button
            type="button"
            onClick={() => setInputText("In plain words, the first step is ")}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition font-mono text-[10px]"
          >
            Phase 1: "In plain words..."
          </button>

          <button
            type="button"
            onClick={() => setInputText("Boundary conditions to handle: ")}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition font-mono text-[10px]"
          >
            Phase 2: "Boundary cases..."
          </button>
        </div>

        {/* Input Textarea & Send Button */}
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="relative flex-1">
            <textarea
              id="coach-user-input"
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                currentPhase === 1
                  ? "Describe what you want to do first in plain words (no code syntax)..."
                  : currentPhase === 2
                  ? "Describe sequence, loop conditions, and boundary edge cases..."
                  : "State your syntax prediction or fill in the blanks..."
              }
              className="w-full p-2.5 pr-8 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 resize-none font-sans"
            />
            <span className="absolute right-2.5 bottom-2 text-[10px] text-stone-400 font-mono pointer-events-none hidden sm:inline">
              ↵ Enter
            </span>
          </div>

          <button
            id="coach-send-button"
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-stone-900 text-stone-50 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
            aria-label="Send message to coach"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
