import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, ArrowUp, Paperclip, Mic, Square, LoaderCircle } from "lucide-react";
type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: { title: string; url: string }[];
};
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! What would you like to build, automate, or grow?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [attachment, setAttachment] = useState<{ id: string; name: string } | null>(null);
  const [recording, setRecording] = useState(false);
  const session = useRef("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => {
    session.current = crypto.randomUUID();
    return () => {
      abort.current?.abort();
      stream.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  useEffect(() => {
    if (open) {
      field.current?.focus();
      end.current?.scrollIntoView({ block: "nearest" });
    }
  }, [open, messages.length]);
  async function send(value = input) {
    if (!value.trim() || busy) return;
    setInput("");
    setError("");
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text: value }, { role: "assistant", text: "" }]);
    abort.current = new AbortController();
    try {
      const res = await fetch("/api/v1/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.current.signal,
        body: JSON.stringify({
          message: value,
          sessionId: session.current,
          attachmentId: attachment?.id,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail || body.error || "The assistant is unavailable.");
      }
      setAttachment(null);
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Unable to open the response.");
      const decoder = new TextDecoder();
      let pending = "";
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        pending += decoder.decode(chunk.value, { stream: true });
        const lines = pending.split("\n");
        pending = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const event = JSON.parse(line.slice(6));
          if (event.error) throw new Error(event.error);
          setMessages((all) =>
            all.map((m, i) =>
              i === all.length - 1
                ? {
                    ...m,
                    text: m.text + (event.delta || ""),
                    ...(event.sources ? { sources: event.sources } : {}),
                  }
                : m,
            ),
          );
        }
      }
    } catch (e) {
      setError((e as Error).message);
      setMessages((m) => m.filter((x) => x.text));
    } finally {
      setBusy(false);
    }
  }
  async function attach(file: File) {
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("sessionId", session.current);
      const res = await fetch("/api/v1/chatbot/attachments", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Unable to upload this file.");
      setAttachment(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function voice() {
    if (recording) {
      recorder.current?.stop();
      setRecording(false);
      return;
    }
    setError("");
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream.current);
      recorder.current = rec;
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => {
        stream.current?.getTracks().forEach((t) => t.stop());
        setBusy(true);
        try {
          const fd = new FormData();
          fd.append("file", new Blob(chunks, { type: rec.mimeType }), "recording.webm");
          const res = await fetch("/api/v1/chatbot/transcribe", { method: "POST", body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || "Transcription is unavailable.");
          setInput(data.text);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      };
      rec.start();
      setRecording(true);
      window.setTimeout(() => {
        if (rec.state === "recording") {
          rec.stop();
          setRecording(false);
        }
      }, 60_000);
    } catch {
      setError("Microphone access was unavailable. You can type your question instead.");
    }
  }
  return (
    <>
      <button
        className="chat-launcher"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="lab-chat"
      >
        {open ? (
          <X size={20} />
        ) : (
          <>
            <MessageCircle size={19} />
            <span>Ask FangScript</span>
            <span className="live-dot" />
          </>
        )}
      </button>
      {open && (
        <section
          className="chat-panel"
          id="lab-chat"
          aria-label="FangScript Assistant"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <header>
            <div className="chat-avatar">
              <MessageCircle size={22} />
            </div>
            <div>
              <strong>FangScript Assistant</strong>
              <small>AI guide · Services & projects</small>
            </div>
            <button aria-label="Close assistant" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </header>
          <div className="chat-messages" aria-live="polite">
            {messages.map((m, i) => (
              <div className={"chat-message " + m.role} key={i}>
                <p>{m.text || "Thinking…"}</p>
                {m.sources?.map((s) => (
                  <a key={s.url} href={s.url} className="chat-source">
                    {s.title} ↗
                  </a>
                ))}
              </div>
            ))}
            {messages.length === 1 && (
              <div className="chat-prompts">
                {["Explore your services", "Can you automate customer support?"].map((q) => (
                  <button key={q} onClick={() => void send(q)}>
                    {q} ↗
                  </button>
                ))}
                <a href="/book">Book a discovery call ↗</a>
              </div>
            )}
            <div ref={end} />
          </div>
          {error && (
            <div role="alert" className="chat-error">
              {error} <a href="/contact">Contact the team</a>
            </div>
          )}
          {attachment && (
            <div className="attachment-chip">
              {attachment.name}
              <button onClick={() => setAttachment(null)} aria-label="Remove attachment">
                <X size={14} />
              </button>
            </div>
          )}
          <form
            className="chat-compose"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <textarea
              ref={field}
              rows={1}
              aria-label="Your message"
              placeholder="Ask a question…"
              maxLength={4000}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <div className="compose-actions">
              <input
                ref={upload}
                hidden
                type="file"
                accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void attach(f);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                disabled={busy}
                aria-label="Attach a document or image"
                onClick={() => upload.current?.click()}
              >
                <Paperclip size={17} />
              </button>
              <button
                type="button"
                disabled={busy}
                aria-label={recording ? "Stop recording" : "Record a voice message"}
                onClick={() => void voice()}
              >
                {recording ? <Square size={16} /> : <Mic size={17} />}
              </button>
              <small>{recording ? "Recording · max 60s" : "AI can make mistakes."}</small>
              <button
                className="chat-send"
                disabled={busy || !input.trim()}
                aria-label="Send message"
              >
                {busy ? <LoaderCircle className="spin" size={17} /> : <ArrowUp size={19} />}
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
