import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Plus,
  ChevronDown,
  Cpu,
  Zap,
  Brain,
  CheckCircle,
  XCircle,
  ArrowLeft,
  BookOpen,
  RotateCcw,
  Sparkles,
  Clock,
  Award,
  AlertCircle,
  Bot,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import Markdown from "react-markdown";
import { chatApi, quizApi, API_BASE } from "../services/api";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

// ── Mock data ────────────────────────────────────────────────────────────────
const MODELS = [
  {
    id: "gpt-3.5",
    label: "GPT-3.5",
    icon: <Zap size={13} />,
    desc: "Nhanh, tiết kiệm",
  },
  {
    id: "gpt-4",
    label: "GPT-4",
    icon: <Brain size={13} />,
    desc: "Thông minh hơn",
  },
  {
    id: "local",
    label: "Local",
    icon: <Cpu size={13} />,
    desc: "Offline mode",
  },
];
const MOCK_QUIZ = {
  id: "mock-quiz-1",
  topic: "Chương 2 - Biến và kiểu dữ liệu",
  questions: [
    {
      id: 1,
      question: "Kiểu dữ liệu nào dùng để lưu số nguyên trong C?",
      options: ["float", "int", "char", "double"],
      correct: 1,
      explain: "`int` là kiểu số nguyên cơ bản trong C, thường chiếm 4 bytes.",
    },
    {
      id: 2,
      question: "Giá trị của biểu thức `5 % 3` là bao nhiêu?",
      options: ["1", "2", "3", "0"],
      correct: 1,
      explain: "Toán tử `%` trả về phần dư. 5 ÷ 3 = 1 dư **2**.",
    },
    {
      id: 3,
      question: "Khai báo nào sau đây là đúng trong C?",
      options: ["int 1abc;", "int _count;", "int class;", "int for;"],
      correct: 1,
      explain: "Tên biến có thể bắt đầu bằng `_`.",
    },
  ],
};

const streamText = (text, setter, onDone) => {
  let i = 0,
    cur = "";
  setter("");
  const id = setInterval(() => {
    if (i < text.length) {
      cur += text[i];
      setter(cur);
      i++;
    } else {
      clearInterval(id);
      onDone?.();
    }
  }, 12);
  return () => clearInterval(id);
};

const getMockBotReply = (input) => {
  const q = input.toLowerCase();
  if (q.includes("vòng lặp") || q.includes("for") || q.includes("while"))
    return {
      text: 'Vòng lặp **for** trong C:\n\n```c\nfor (init; điều_kiện; update) {\n    // thân vòng lặp\n}\n```\n\nVí dụ in 0–9:\n```c\nfor (int i=0; i<10; i++) printf("%d\\n", i);\n```',
      sources: ["Slide Chương 3 – Trang 15"],
    };
  if (q.includes("con trỏ") || q.includes("pointer"))
    return {
      text: '**Con trỏ (Pointer)** lưu **địa chỉ bộ nhớ** của biến khác.\n\n```c\nint a=10;\nint *p = &a;\nprintf("%d", *p); // 10\n```',
      sources: ["Slide Chương 5"],
    };
  if (q.includes("lịch thi"))
    return {
      text: "📅 **Lịch thi cuối kỳ IT001:**\n\n| Môn | Ngày | Giờ | Phòng |\n|---|---|---|---|\n| IT001 | 15/06/2025 | 7:30 | B4.01 |",
      sources: ["Hệ thống quản lý lịch thi"],
      toolUsed: "SQL Agent",
    };
  return {
    text: "Đây là câu trả lời dựa trên tài liệu môn học. Nếu chưa đủ chi tiết, hãy hỏi cụ thể hơn!",
    sources: ["Giáo trình"],
  };
};

// ── QuizWidget ────────────────────────────────────────────────────────────────
const QuizWidget = ({ quiz, onClose }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const q = quiz.questions[current];
  const total = quiz.questions.length;
  const score = submitted
    ? quiz.questions.filter((q) => answers[q.id] === q.correct).length
    : 0;
  const percent = submitted ? Math.round((score / total) * 100) : 0;
  const can = Object.keys(answers).length === total;

  const handleSubmit = async () => {
    if (!can || submitting) return;
    setSubmitting(true);
    setSubmitted(true);
    try {
      await quizApi.submitQuiz(quiz.id, answers);
      setDone(true);
    } catch (e) {
      console.warn(e);
    } finally {
      setSubmitting(false);
    }
  };

  const optStyle = (q, idx) => {
    const b = {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 12px",
      borderRadius: 8,
      border: "1px solid",
      cursor: "pointer",
      transition: "all .12s",
      fontSize: 13,
      marginBottom: 6,
    };
    if (!submitted)
      return answers[q.id] === idx
        ? {
            ...b,
            borderColor: "#6366f1",
            background: "rgba(99,102,241,.15)",
            color: "#8AB4F8",
          }
        : {
            ...b,
            borderColor: "rgba(255,255,255,.1)",
            background: "transparent",
            color: "#9AA0A6",
          };
    if (idx === q.correct)
      return {
        ...b,
        borderColor: "#81C995",
        background: "rgba(129,201,149,.1)",
        color: "#81C995",
        cursor: "default",
      };
    if (answers[q.id] === idx)
      return {
        ...b,
        borderColor: "#F28B82",
        background: "rgba(242,139,130,.08)",
        color: "#F28B82",
        cursor: "default",
      };
    return {
      ...b,
      borderColor: "rgba(255,255,255,.06)",
      color: "#3C4043",
      cursor: "default",
    };
  };

  return (
    <div
      style={{
        background: "#2D2E36",
        border: "1px solid rgba(255,255,255,.12)",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 4,
      }}
    >
      <div
        style={{
          background: "rgba(99,102,241,.15)",
          borderBottom: "1px solid rgba(99,102,241,.2)",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={14} color="#8AB4F8" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#8AB4F8" }}>
            Quiz: {quiz.topic}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11.5, color: "#9AA0A6" }}>
            {current + 1}/{total}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#5F6368",
              display: "flex",
              padding: 2,
            }}
          >
            <XCircle size={15} />
          </button>
        </div>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,.06)" }}>
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
            width: `${((current + 1) / total) * 100}%`,
            transition: "width .3s ease",
          }}
        />
      </div>
      <div style={{ padding: "14px 16px" }}>
        {!submitted ? (
          <>
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#E3E3E3",
                marginBottom: 12,
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: "#8AB4F8", marginRight: 6 }}>
                Q{current + 1}.
              </span>
              {q.question}
            </p>
            <div>
              {q.options.map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    !submitted && setAnswers((p) => ({ ...p, [q.id]: idx }))
                  }
                  style={optStyle(q, idx)}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background:
                        answers[q.id] === idx
                          ? "#6366f1"
                          : "rgba(255,255,255,.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <button
                onClick={() => setCurrent((p) => Math.max(0, p - 1))}
                disabled={current === 0}
                style={{
                  background: "none",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  color: "#9AA0A6",
                  cursor: "pointer",
                  fontSize: 12.5,
                  opacity: current === 0 ? 0.3 : 1,
                  fontFamily: "inherit",
                }}
              >
                ← Câu trước
              </button>
              {current < total - 1 ? (
                <button
                  onClick={() => setCurrent((p) => p + 1)}
                  disabled={answers[q.id] === undefined}
                  style={{
                    background:
                      answers[q.id] === undefined
                        ? "rgba(99,102,241,.2)"
                        : "rgba(99,102,241,1)",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 14px",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 12.5,
                    opacity: answers[q.id] === undefined ? 0.4 : 1,
                    fontFamily: "inherit",
                  }}
                >
                  Tiếp →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!can || submitting}
                  style={{
                    background: "rgba(99,102,241,.9)",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 14px",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 12.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontFamily: "inherit",
                    opacity: !can || submitting ? 0.4 : 1,
                  }}
                >
                  {submitting ? (
                    <>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          border: "2px solid rgba(255,255,255,.2)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          animation: "ag-spin 1s linear infinite",
                        }}
                      />
                      Nộp...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={13} />
                      Nộp bài
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {done && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 10px",
                  borderRadius: 8,
                  marginBottom: 10,
                  background: "rgba(129,201,149,.1)",
                  border: "1px solid rgba(129,201,149,.2)",
                  color: "#81C995",
                  fontSize: 12,
                }}
              >
                <CheckCircle size={12} />
                Điểm đã được ghi nhận!
              </div>
            )}
            <div
              style={{
                textAlign: "center",
                padding: "14px",
                borderRadius: 10,
                marginBottom: 12,
                background:
                  percent >= 70
                    ? "rgba(129,201,149,.08)"
                    : "rgba(253,214,99,.07)",
                border: `1px solid ${percent >= 70 ? "rgba(129,201,149,.2)" : "rgba(253,214,99,.15)"}`,
              }}
            >
              <Award
                size={28}
                style={{
                  color: percent >= 70 ? "#81C995" : "#FDD663",
                  margin: "0 auto 6px",
                }}
              />
              <p
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: percent >= 70 ? "#81C995" : "#FDD663",
                }}
              >
                {score}
                <span style={{ fontSize: 14, opacity: 0.6 }}>/{total}</span>
              </p>
              <p style={{ fontSize: 12, color: "#9AA0A6", marginTop: 4 }}>
                {percent}% — {percent >= 70 ? "🎉 Làm tốt!" : "📚 Ôn tập thêm"}
              </p>
            </div>
            {quiz.questions.map((q, qi) => {
              const ok = answers[q.id] === q.correct;
              return (
                <div
                  key={q.id}
                  style={{
                    background: ok
                      ? "rgba(129,201,149,.06)"
                      : "rgba(242,139,130,.06)",
                    border: `1px solid ${ok ? "rgba(129,201,149,.12)" : "rgba(242,139,130,.12)"}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 7,
                      marginBottom: 4,
                    }}
                  >
                    {ok ? (
                      <CheckCircle
                        size={13}
                        color="#81C995"
                        style={{ flexShrink: 0, marginTop: 2 }}
                      />
                    ) : (
                      <XCircle
                        size={13}
                        color="#F28B82"
                        style={{ flexShrink: 0, marginTop: 2 }}
                      />
                    )}
                    <span style={{ fontSize: 12.5, color: "#E3E3E3" }}>
                      {q.question}
                    </span>
                  </div>
                  <div
                    style={{
                      paddingLeft: 20,
                      fontSize: 11.5,
                      color: "#9AA0A6",
                    }}
                  >
                    <Markdown>{q.explain}</Markdown>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
                setCurrent(0);
                setDone(false);
              }}
              style={{
                width: "100%",
                marginTop: 8,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: 8,
                padding: "8px",
                color: "#9AA0A6",
                cursor: "pointer",
                fontSize: 12.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontFamily: "inherit",
              }}
            >
              <RotateCcw size={13} /> Làm lại
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ── BotAvatar ─────────────────────────────────────────────────────────────────
const BotAvatar = () => (
  <div
    style={{
      width: 26,
      height: 26,
      borderRadius: "50%",
      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      marginTop: 2,
    }}
  >
    <Bot size={13} color="#fff" />
  </div>
);

// ── MessageBubble ─────────────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const { isDark } = useTheme();
  if (msg.role === "user")
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            maxWidth: "72%",
            background: isDark ? "rgba(99,102,241,.2)" : "rgba(79,70,229,.12)",
            border: isDark
              ? "1px solid rgba(99,102,241,.3)"
              : "1px solid rgba(99,102,241,.25)",
            borderRadius: "14px 3px 14px 14px",
            padding: "10px 14px",
            fontSize: 13.5,
            color: isDark ? "#E3E3E3" : "#1A1B2E",
            lineHeight: 1.6,
          }}
        >
          {msg.content}
        </div>
      </div>
    );
  if (msg.type === "quiz")
    return (
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <BotAvatar />
        <div style={{ flex: 1, maxWidth: "85%" }}>
          <p style={{ fontSize: 11, color: "#5F6368", marginBottom: 4 }}>
            Trợ lý AI
          </p>
          <QuizWidget quiz={msg.quiz} onClose={() => {}} />
        </div>
      </div>
    );
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
      <BotAvatar />
      <div style={{ maxWidth: "75%" }}>
        <p style={{ fontSize: 11, color: "#5F6368", marginBottom: 4 }}>
          Trợ lý AI
        </p>
        <div
          style={{
            background: isDark ? "#2D2E36" : "#FFFFFF",
            border: isDark
              ? "1px solid rgba(255,255,255,.1)"
              : "1px solid rgba(99,102,241,.15)",
            borderRadius: "3px 14px 14px 14px",
            padding: "10px 14px",
            fontSize: 13.5,
            color: isDark ? "#E3E3E3" : "#1A1B2E",
            lineHeight: 1.6,
          }}
        >
          {msg.streaming ? (
            <span>
              {msg.content}
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 14,
                  background: "#8AB4F8",
                  marginLeft: 2,
                  animation: "ag-spin 1s linear infinite",
                  borderRadius: 1,
                  verticalAlign: "middle",
                }}
              />
            </span>
          ) : (
            <div className="ag-prose">
              <Markdown>{msg.content}</Markdown>
            </div>
          )}
        </div>
        {msg.sources?.length > 0 && !msg.streaming && (
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}
          >
            {msg.sources.map((s, i) => (
              <span
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "#8AB4F8",
                  background: "rgba(138,180,248,.1)",
                  border: "1px solid rgba(138,180,248,.18)",
                  padding: "2px 8px",
                  borderRadius: 99,
                }}
              >
                <BookOpen size={10} />
                {s}
              </span>
            ))}
          </div>
        )}
        {msg.toolUsed && !msg.streaming && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginTop: 5,
              fontSize: 11,
              color: "#BB86FC",
              background: "rgba(187,134,252,.1)",
              border: "1px solid rgba(187,134,252,.18)",
              padding: "2px 9px",
              borderRadius: 99,
              width: "fit-content",
            }}
          >
            🔧 Công cụ: <strong>{msg.toolUsed}</strong>
          </div>
        )}
        {msg.error && (
          <p
            style={{
              marginTop: 5,
              fontSize: 11,
              color: "#F28B82",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <AlertCircle size={11} />
            {msg.error}
          </p>
        )}
      </div>
    </div>
  );
};

// ── TypingIndicator ───────────────────────────────────────────────────────────
const TypingIndicator = () => {
  const { isDark } = useTheme();
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
      <BotAvatar />
      <div
        style={{
          background: isDark ? "#2D2E36" : "#FFFFFF",
          border: isDark
            ? "1px solid rgba(255,255,255,.1)"
            : "1px solid rgba(99,102,241,.18)",
          borderRadius: "3px 14px 14px 14px",
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 5,
          boxShadow: isDark ? "none" : "0 2px 8px rgba(99,102,241,.06)",
        }}
      >
        <div className="ag-typing-dot" />
        <div className="ag-typing-dot" />
        <div className="ag-typing-dot" />
      </div>
    </div>
  );
};

// ── Helper ────────────────────────────────────────────────────────────────────
const extractSources = (text) => {
  const sources = [];
  const pats = [
    /(?:nguồn|source|tài liệu)[:\s]*([^\n]+)/gi,
    /\(([^)]*?\.(?:pdf|docx|txt|pptx)[^)]*)\)/gi,
  ];
  for (const p of pats) {
    let m;
    while ((m = p.exec(text)) !== null) {
      const s = m[1].trim();
      if (s && !sources.includes(s)) sources.push(s);
    }
  }
  return sources;
};

// ══════════════════════════════════════════════════════════════════════════════
export default function ChatPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isDark } = useTheme();
  const isMockMode = !user;

  // ── Derived theme values ──
  const pageBg = isDark ? "#1B1B1F" : "#F4F5FF";
  const pageColor = isDark ? "#E3E3E3" : "#1A1B2E";
  const sidebarBg = isDark ? "#1B1B1F" : "#FFFFFF";
  const sidebarBorder = isDark
    ? "rgba(255,255,255,.08)"
    : "rgba(99,102,241,.12)";
  const subTextColor = isDark ? "#9AA0A6" : "rgba(90,95,125,.75)";
  const dimTextColor = isDark ? "#5F6368" : "#C8CCE0";
  const inputBg = isDark ? "#28292F" : "#FFFFFF";
  const inputBorder = isDark ? "rgba(255,255,255,.12)" : "rgba(99,102,241,.2)";
  const userBubbleBg = isDark ? "rgba(99,102,241,.2)" : "rgba(79,70,229,.12)";
  const userBubbleBorder = isDark
    ? "rgba(99,102,241,.3)"
    : "rgba(99,102,241,.25)";
  const botBubbleBg = isDark ? "#2D2E36" : "#FFFFFF";
  const botBubbleBorder = isDark
    ? "rgba(255,255,255,.1)"
    : "rgba(99,102,241,.15)";
  const modelBtnBg = isDark ? "#2D2E36" : "#EEF2FF";
  const modelBtnBorder = isDark
    ? "rgba(255,255,255,.1)"
    : "rgba(99,102,241,.18)";
  const historyActive = isDark
    ? "rgba(255,255,255,.08)"
    : "rgba(99,102,241,.1)";
  const historyHover = isDark
    ? "rgba(255,255,255,.05)"
    : "rgba(99,102,241,.06)";

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      content: "Xin chào! Tôi là **CourseAI** — trợ lý học tập thông minh.\n",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-3.5");
  const [showModel, setShowModel] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const stopStream = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (isMockMode) {
      setLoadingHistory(false);
      setChatHistory([
        { id: 1, title: "Hỏi về vòng lặp For" },
        { id: 2, title: "Khái niệm OOP là gì?" },
        { id: 3, title: "Lịch thi cuối kỳ IT001" },
      ]);
      return;
    }
    const load = async () => {
      setLoadingHistory(true);
      try {
        const res = await chatApi.getSessions();
        if (res.ok && res.data?.chatSession)
          setChatHistory(
            res.data.chatSession.map((s) => ({
              id: s.id,
              title: s.title,
              createdAt: s.created_at,
            })),
          );
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingHistory(false);
      }
    };
    load();
  }, [isMockMode]);

  const loadChatSession = useCallback(
    async (chatId) => {
      if (isMockMode) {
        setActiveChatId(chatId);
        setMessages([
          {
            id: 0,
            role: "bot",
            content:
              "Xin chào! Tôi là **CourseAI** — trợ lý học tập thông minh.",
          },
        ]);
        return;
      }
      try {
        const res = await chatApi.getMessages(chatId);
        if (res.ok && res.data) {
          setActiveChatId(chatId);
          const loaded = [
            {
              id: 0,
              role: "bot",
              content:
                "Xin chào! Tôi là **CourseAI** — trợ lý học tập thông minh.",
            },
          ];
          res.data.messages?.forEach((m, i) => {
            loaded.push({ id: i * 2 + 1, role: "user", content: m.query });
            loaded.push({ id: i * 2 + 2, role: "bot", content: m.response });
          });
          setMessages(loaded);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [isMockMode],
  );

  const currentModel = MODELS.find((m) => m.id === selectedModel);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || typing) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: text },
    ]);
    setInput("");
    setTyping(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    if (/quiz|trắc nghiệm|tạo quiz/i.test(text)) {
      setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: "bot", type: "quiz", quiz: MOCK_QUIZ },
        ]);
      }, 900);
      return;
    }
    
    try {
      let cid = activeChatId;
      if (!cid) {
        const sr = await chatApi.createSession(text.slice(0, 50));
        if (sr.ok && sr.data?.chatId) {
          cid = sr.data.chatId;
          setActiveChatId(cid);
          setChatHistory((prev) => [
            {
              id: cid,
              title: text.slice(0, 28) + (text.length > 28 ? "…" : ""),
            },
            ...prev,
          ]);
        } else throw new Error("Không thể tạo phiên chat");
      }
      const botId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        { id: botId, role: "bot", content: "", streaming: true, sources: [] },
      ]);
      setTyping(false);
      let sseHandled = false;
      console.log('here')
      try {
        const sr2 = await fetch(`${API_BASE}/api/chat/${cid}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: text, model: selectedModel }),
        });

        console.log(sr2)
        
        if (
          sr2.ok &&
          sr2.headers.get("content-type")?.includes("text/event-stream")
        ) {
          console.log('here')
          sseHandled = true;
          const reader = sr2.body.getReader();
          const dec = new TextDecoder();
          let buf = "",
            fullText = "",
            sources = [];
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() ?? "";
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") {
                reader.cancel();
                break;
              }
              try {
                const p = JSON.parse(data);
                if (p.chunk !== undefined) {
                  fullText += p.chunk;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === botId ? { ...m, content: fullText } : m,
                    ),
                  );
                }
                if (p.sources) sources = p.sources;
              } catch {
                if (data) {
                  fullText += data;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === botId ? { ...m, content: fullText } : m,
                    ),
                  );
                }
              }
            }
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botId ? { ...m, streaming: false, sources } : m,
            ),
          );
        }
      } catch (e) {
        console.info("SSE fallback:", e.message);
      }
      
    } catch (err) {
      console.log(err.message)
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          content: "Xin lỗi, đã có lỗi kết nối tới hệ thống AI.",
          error: err.message,
        },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleNewChat = () => {
    stopStream.current?.();
    setActiveChatId(null);
    setMessages([
      {
        id: Date.now(),
        role: "bot",
        content:
          "Xin chào! Tôi là **CourseAI** — trợ lý học tập thông minh.\nGõ câu hỏi về bất kỳ môn học nào.",
      },
    ]);
  };
  const userName = user?.email?.split("@")[0] || "Sinh viên";

  const SUGGESTIONS = [
    "Tạo quiz chương 2",
    "Giải thích về vòng lặp",
    "OOP là gì?",
    "Tóm tắt chương 1",
  ];

  return (
    <div
      style={{
        display: "flex",
        minheight: "100vh",
        background: pageBg,
        fontFamily: "'Inter',sans-serif",
        color: pageColor,
        overflow: "hidden",
        transition: "background .3s, color .3s",
      }}
    >
      {/* ═══ SIDEBAR ═══ */}
      <div
        style={{
          width: 240,
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "background .3s",
            position:'sticky',   // 🔥 sửa ở đây
  top:0,   
          
          top: 0,
          
          height: "100vh",
          overflowY: "auto",
          
        }}
      >
        {/* Header — Brand */}
        <div
          style={{
            padding: "14px 14px 10px",
            borderBottom: `1px solid ${sidebarBorder}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 0 16px rgba(99,102,241,.35)",
              }}
            >
              <GraduationCap size={15} color="#fff" />
            </div>
            <div>
              <p
                style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  letterSpacing: "-.02em",
                  background: "linear-gradient(90deg,#4F46E5,#7C3AED)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  margin: 0,
                }}
              >
                CourseAI
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: dimTextColor,
                  fontWeight: 500,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Trợ lý thông minh
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: subTextColor,
              fontSize: 12.5,
              padding: "4px 6px",
              borderRadius: 6,
              transition: "color .15s",
              fontFamily: "inherit",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = pageColor)}
            onMouseOut={(e) => (e.currentTarget.style.color = subTextColor)}
          >
            <ArrowLeft size={13} /> Về trang chủ
          </button>
        </div>

        {/* New Chat */}
        <div style={{ padding: "10px 10px 6px" }}>
          <button
            onClick={handleNewChat}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(138,180,248,.1)",
              border: "1px solid rgba(138,180,248,.2)",
              borderRadius: 9,
              padding: "8px 12px",
              color: "#8AB4F8",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 500,
              transition: "background .15s",
              fontFamily: "inherit",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(138,180,248,.18)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "rgba(138,180,248,.1)")
            }
          >
            <Plus size={14} /> Chat mới
          </button>
        </div>

        {/* History */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 6px" }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: dimTextColor,
              padding: "8px 10px 6px",
            }}
          >
            Lịch sử
          </p>
          {loadingHistory ? (
            <p
              style={{ fontSize: 12, color: dimTextColor, padding: "6px 10px" }}
            >
              Đang tải...
            </p>
          ) : chatHistory.length === 0 ? (
            <p
              style={{ fontSize: 12, color: dimTextColor, padding: "6px 10px" }}
            >
              Chưa có cuộc hội thoại
            </p>
          ) : (
            chatHistory.map((h) => (
              <button
                key={h.id}
                onClick={() => loadChatSession(h.id)}
                style={{
                  width: "calc(100% - 0px)",
                  textAlign: "left",
                  padding: "8px 10px",
                  fontSize: 13,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  transition: "background .12s",
                  fontFamily: "inherit",
                  background:
                    activeChatId === h.id ? historyActive : "transparent",
                  color: activeChatId === h.id ? pageColor : subTextColor,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
                onMouseOver={(e) => {
                  if (activeChatId !== h.id) {
                    e.currentTarget.style.background = historyHover;
                    e.currentTarget.style.color = pageColor;
                  }
                }}
                onMouseOut={(e) => {
                  if (activeChatId !== h.id) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = subTextColor;
                  }
                }}
              >
                <MessageSquare
                  size={12}
                  style={{
                    display: "inline",
                    marginRight: 6,
                    verticalAlign: "middle",
                  }}
                />
                {h.title}
              </button>
            ))
          )}
        </div>

        {/* Model selector */}
        <div
          style={{
            padding: "8px 10px",
            borderTop: `1px solid ${sidebarBorder}`,
            position: "relative",
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: dimTextColor,
              marginBottom: 5,
            }}
          >
            Model AI
          </p>
          <button
            onClick={() => setShowModel((p) => !p)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: modelBtnBg,
              border: `1px solid ${modelBtnBorder}`,
              borderRadius: 8,
              padding: "7px 10px",
              color: pageColor,
              fontSize: 12.5,
              cursor: "pointer",
              transition: "all .15s",
              fontFamily: "inherit",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.borderColor = isDark
                ? "rgba(255,255,255,.18)"
                : "rgba(99,102,241,.35)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.borderColor = modelBtnBorder)
            }
          >
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {currentModel.icon}
              {currentModel.label}
            </span>
            <ChevronDown
              size={12}
              color={dimTextColor}
              style={{
                transform: showModel ? "rotate(180deg)" : "none",
                transition: "transform .2s",
              }}
            />
          </button>
          {showModel && (
            <div
              style={{
                position: "absolute",
                bottom: 60,
                left: 8,
                right: 8,
                background: isDark ? "#28292F" : "#FFFFFF",
                border: `1px solid ${sidebarBorder}`,
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: isDark
                  ? "0 8px 24px rgba(0,0,0,.6)"
                  : "0 8px 24px rgba(99,102,241,.12)",
                zIndex: 20,
              }}
            >
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedModel(m.id);
                    setShowModel(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background:
                      selectedModel === m.id
                        ? isDark
                          ? "rgba(138,180,248,.1)"
                          : "rgba(79,70,229,.07)"
                        : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "background .12s",
                    fontFamily: "inherit",
                  }}
                  onMouseOver={(e) => {
                    if (selectedModel !== m.id)
                      e.currentTarget.style.background = historyHover;
                  }}
                  onMouseOut={(e) => {
                    if (selectedModel !== m.id)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    style={{
                      color:
                        selectedModel === m.id
                          ? isDark
                            ? "#8AB4F8"
                            : "#4F46E5"
                          : subTextColor,
                    }}
                  >
                    {m.icon}
                  </span>
                  <div style={{ textAlign: "left" }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color:
                          selectedModel === m.id
                            ? isDark
                              ? "#8AB4F8"
                              : "#4F46E5"
                            : pageColor,
                        margin: 0,
                      }}
                    >
                      {m.label}
                    </p>
                    <p style={{ fontSize: 11, color: dimTextColor, margin: 0 }}>
                      {m.desc}
                    </p>
                  </div>
                  {selectedModel === m.id && (
                    <CheckCircle
                      size={13}
                      color={isDark ? "#8AB4F8" : "#4F46E5"}
                      style={{ marginLeft: "auto" }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User info + ThemeToggle */}
        <div
          style={{
            padding: "10px",
            borderTop: `1px solid ${sidebarBorder}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: 12,
                color: pageColor,
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userName}
            </p>
            <p style={{ fontSize: 10, color: dimTextColor, margin: 0 }}>
              {user?.role || "student"}
            </p>
          </div>
          <ThemeToggle size="sm" />
        </div>
      </div>

      {/* ═══ MAIN CHAT ═══ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Chat header */}
        <div
          style={{
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            borderBottom: `1px solid ${sidebarBorder}`,
            background: sidebarBg,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "linear-gradient(135deg,#4f46e5,#8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bot size={14} color="#fff" />
            </div>
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: pageColor,
                  margin: 0,
                }}
              >
                Trợ lý AI — Tất cả môn học
              </p>
              <p style={{ fontSize: 11, color: dimTextColor, margin: 0 }}>
                Model: {currentModel.label}
              </p>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11.5,
              color: dimTextColor,
            }}
          >
            <AlertCircle size={12} /> AI có thể mắc sai sót. Kiểm tra nguồn
            thông tin.
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            background: isDark ? "transparent" : "rgba(249,250,255,.6)",
          }}
        >
          {messages.length === 1 && messages[0].role === "bot" && (
            <div
              style={{ textAlign: "center", paddingTop: 40, paddingBottom: 20 }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#4f46e5,#8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  boxShadow: "0 0 32px rgba(99,102,241,.4)",
                }}
              >
                <GraduationCap size={28} color="#fff" />
              </div>
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: pageColor,
                  marginBottom: 6,
                  letterSpacing: "-.02em",
                }}
              >
                Xin chào! Tôi là CourseAI 👋
              </p>
              <p
                style={{ fontSize: 13.5, color: subTextColor, marginBottom: 4 }}
              >
                Trợ lý học tập thông minh — hỗ trợ{" "}
                <strong style={{ color: isDark ? "#8AB4F8" : "#4F46E5" }}>
                  tất cả môn học
                </strong>
              </p>
              <p style={{ fontSize: 12, color: dimTextColor }}>
                Hỏi bất cứ điều gì về bài giảng, hoặc gõ <em>"tạo quiz"</em> để
                luyện tập
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {typing && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div
          style={{
            padding: "6px 24px 0",
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            background: sidebarBg,
          }}
        >
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setInput(s);
                inputRef.current?.focus();
              }}
              style={{
                fontSize: 12,
                padding: "4px 10px",
                borderRadius: 99,
                background: isDark
                  ? "rgba(255,255,255,.05)"
                  : "rgba(99,102,241,.06)",
                border: `1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(99,102,241,.15)"}`,
                color: subTextColor,
                cursor: "pointer",
                transition: "all .12s",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = isDark
                  ? "rgba(138,180,248,.3)"
                  : "rgba(79,70,229,.4)";
                e.currentTarget.style.color = isDark ? "#8AB4F8" : "#4F46E5";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = isDark
                  ? "rgba(255,255,255,.1)"
                  : "rgba(99,102,241,.15)";
                e.currentTarget.style.color = subTextColor;
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div
          style={{
            padding: "10px 20px 14px",
            borderTop: `1px solid ${sidebarBorder}`,
            background: sidebarBg,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-end",
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              borderRadius: 14,
              padding: "10px 14px",
              transition: "border-color .2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = isDark
                ? "rgba(255,255,255,.22)"
                : "rgba(99,102,241,.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = inputBorder;
            }}
          >
            <textarea
              ref={(el) => {
                inputRef.current = el;
                textareaRef.current = el;
              }}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi về môn học... (Enter gửi, Shift+Enter xuống dòng)"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 13.5,
                color: pageColor,
                resize: "none",
                minHeight: 24,
                maxHeight: 120,
                lineHeight: 1.6,
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || typing}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background:
                  input.trim() && !typing
                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                    : isDark
                      ? "rgba(255,255,255,.06)"
                      : "rgba(99,102,241,.08)",
                border: "none",
                cursor: input.trim() && !typing ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background .2s",
                color: "#fff",
              }}
            >
              <Send size={16} />
            </button>
          </div>
          <p
            style={{
              fontSize: 11,
              color: dimTextColor,
              textAlign: "center",
              marginTop: 5,
            }}
          >
            CourseAI có thể mắc sai sót. Kiểm tra thông tin quan trọng.
          </p>
        </div>
      </div>
    </div>
  );
}
