import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, ChevronDown, Cpu, Zap, Brain,
  CheckCircle, XCircle, BookOpen, RotateCcw,
  Sparkles, Award, AlertCircle, Bot, GraduationCap
} from 'lucide-react';
import Markdown from 'react-markdown';
import { chatApi, quizApi, API_BASE } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const MODELS = [
  { id: 'gpt-3.5', label: 'GPT-3.5', icon: <Zap size={13} />, desc: 'Nhanh, tiết kiệm' },
  { id: 'gpt-4', label: 'GPT-4', icon: <Brain size={13} />, desc: 'Thông minh hơn' },
  { id: 'local', label: 'Local', icon: <Cpu size={13} />, desc: 'Offline mode' },
];

// ── Helper functions ────────────────────────────────────────────────────────────

const streamText = (text, setter, onDone) => {
  let i = 0, cur = '';
  setter('');
  const id = setInterval(() => {
    if (i < text.length) { cur += text[i]; setter(cur); i++; }
    else { clearInterval(id); onDone?.(); }
  }, 12);
  return () => clearInterval(id);
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
  const score = submitted ? quiz.questions.filter(qu => answers[qu.id] === qu.correct).length : 0;
  const percent = submitted ? Math.round((score / total) * 100) : 0;
  const can = Object.keys(answers).length === total;

  const handleSubmit = async () => {
    if (!can || submitting) return;
    setSubmitting(true); setSubmitted(true);
    try { await quizApi.submitQuiz(quiz.id, answers); setDone(true); }
    catch (e) { console.warn(e); }
    finally { setSubmitting(false); }
  };

  const optStyle = (qu, idx) => {
    const b = { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid', cursor: 'pointer', transition: 'all .12s', fontSize: 13, marginBottom: 6 };
    if (!submitted)
      return answers[qu.id] === idx ? { ...b, borderColor: '#6366f1', background: 'rgba(99,102,241,.15)', color: '#8AB4F8' } : { ...b, borderColor: 'rgba(255,255,255,.1)', background: 'transparent', color: '#9AA0A6' };
    if (idx === qu.correct) return { ...b, borderColor: '#81C995', background: 'rgba(129,201,149,.1)', color: '#81C995', cursor: 'default' };
    if (answers[qu.id] === idx) return { ...b, borderColor: '#F28B82', background: 'rgba(242,139,130,.08)', color: '#F28B82', cursor: 'default' };
    return { ...b, borderColor: 'rgba(255,255,255,.06)', color: '#3C4043', cursor: 'default' };
  };

  return (
    <div style={{ background: '#2D2E36', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
      <div style={{ background: 'rgba(99,102,241,.15)', borderBottom: '1px solid rgba(99,102,241,.2)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={14} color="#8AB4F8" /><span style={{ fontSize: 13, fontWeight: 600, color: '#8AB4F8' }}>Quiz: {quiz.topic}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11.5, color: '#9AA0A6' }}>{current + 1}/{total}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5F6368', display: 'flex', padding: 2 }}><XCircle size={15} /></button>
        </div>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,.06)' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', width: `${((current + 1) / total) * 100}%`, transition: 'width .3s ease' }} />
      </div>
      <div style={{ padding: '14px 16px' }}>
        {!submitted ? (
          <>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#E3E3E3', marginBottom: 12, lineHeight: 1.5 }}>
              <span style={{ color: '#8AB4F8', marginRight: 6 }}>Q{current + 1}.</span>{q.question}
            </p>
            <div>{q.options.map((opt, idx) => <div key={idx} onClick={() => !submitted && setAnswers(p => ({ ...p, [q.id]: idx }))} style={optStyle(q, idx)}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: answers[q.id] === idx ? '#6366f1' : 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{String.fromCharCode(65 + idx)}</span>
              {opt}
            </div>)}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <button onClick={() => setCurrent(p => Math.max(0, p - 1))} disabled={current === 0} style={{ background: 'none', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '6px 12px', color: '#9AA0A6', cursor: 'pointer', fontSize: 12.5, opacity: current === 0 ? .3 : 1, fontFamily: 'inherit' }}>← Câu trước</button>
              {current < total - 1
                ? <button onClick={() => setCurrent(p => p + 1)} disabled={answers[q.id] === undefined} style={{ background: answers[q.id] === undefined ? 'rgba(99,102,241,.2)' : 'rgba(99,102,241,1)', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff', cursor: 'pointer', fontSize: 12.5, opacity: answers[q.id] === undefined ? .4 : 1, fontFamily: 'inherit' }}>Tiếp →</button>
                : <button onClick={handleSubmit} disabled={!can || submitting} style={{ background: 'rgba(99,102,241,.9)', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff', cursor: 'pointer', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit', opacity: !can || submitting ? .4 : 1 }}>
                  {submitting ? <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'ag-spin 1s linear infinite' }} />Nộp...</> : <><CheckCircle size={13} />Nộp bài</>}
                </button>
              }
            </div>
          </>
        ) : (
          <>
            {done && <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 8, marginBottom: 10, background: 'rgba(129,201,149,.1)', border: '1px solid rgba(129,201,149,.2)', color: '#81C995', fontSize: 12 }}><CheckCircle size={12} />Điểm đã được ghi nhận!</div>}
            <div style={{ textAlign: 'center', padding: '14px', borderRadius: 10, marginBottom: 12, background: percent >= 70 ? 'rgba(129,201,149,.08)' : 'rgba(253,214,99,.07)', border: `1px solid ${percent >= 70 ? 'rgba(129,201,149,.2)' : 'rgba(253,214,99,.15)'}` }}>
              <Award size={28} style={{ color: percent >= 70 ? '#81C995' : '#FDD663', margin: '0 auto 6px' }} />
              <p style={{ fontSize: 26, fontWeight: 700, color: percent >= 70 ? '#81C995' : '#FDD663' }}>{score}<span style={{ fontSize: 14, opacity: .6 }}>/{total}</span></p>
              <p style={{ fontSize: 12, color: '#9AA0A6', marginTop: 4 }}>{percent}% — {percent >= 70 ? '🎉 Làm tốt!' : '📚 Ôn tập thêm'}</p>
            </div>
            {quiz.questions.map((qu, qi) => {
              const ok = answers[qu.id] === qu.correct;
              return <div key={qu.id} style={{ background: ok ? 'rgba(129,201,149,.06)' : 'rgba(242,139,130,.06)', border: `1px solid ${ok ? 'rgba(129,201,149,.12)' : 'rgba(242,139,130,.12)'}`, borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 4 }}>
                  {ok ? <CheckCircle size={13} color="#81C995" style={{ flexShrink: 0, marginTop: 2 }} /> : <XCircle size={13} color="#F28B82" style={{ flexShrink: 0, marginTop: 2 }} />}
                  <span style={{ fontSize: 12.5, color: '#E3E3E3' }}>{qu.question}</span>
                </div>
                <div style={{ paddingLeft: 20, fontSize: 11.5, color: '#9AA0A6' }}><Markdown>{qu.explain}</Markdown></div>
              </div>;
            })}
            <button onClick={() => { setAnswers({}); setSubmitted(false); setCurrent(0); setDone(false); }} style={{ width: '100%', marginTop: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '8px', color: '#9AA0A6', cursor: 'pointer', fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}>
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
  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
    <Bot size={13} color="#fff" />
  </div>
);

// ── MessageBubble ─────────────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const { isDark } = useTheme();
  if (msg.role === 'user') return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
      <div style={{ maxWidth: '72%', background: isDark ? 'rgba(99,102,241,.2)' : 'rgba(79,70,229,.12)', border: isDark ? '1px solid rgba(99,102,241,.3)' : '1px solid rgba(99,102,241,.25)', borderRadius: '14px 3px 14px 14px', padding: '10px 14px', fontSize: 13.5, color: isDark ? '#E3E3E3' : '#1A1B2E', lineHeight: 1.6 }}>
        {msg.content}
      </div>
    </div>
  );
  if (msg.type === 'quiz') return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
      <BotAvatar />
      <div style={{ flex: 1, maxWidth: '85%' }}>
        <p style={{ fontSize: 11, color: '#5F6368', marginBottom: 4 }}>Trợ lý AI</p>
        <QuizWidget quiz={msg.quiz} onClose={() => { }} />
      </div>
    </div>
  );
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
      <BotAvatar />
      <div style={{ maxWidth: '75%' }}>
        <p style={{ fontSize: 11, color: '#5F6368', marginBottom: 4 }}>Trợ lý AI</p>
        <div style={{ background: isDark ? '#2D2E36' : '#FFFFFF', border: isDark ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(99,102,241,.15)', borderRadius: '3px 14px 14px 14px', padding: '10px 14px', fontSize: 13.5, color: isDark ? '#E3E3E3' : '#1A1B2E', lineHeight: 1.6 }}>
          {msg.streaming
            ? <span>{msg.content}<span style={{ display: 'inline-block', width: 2, height: 14, background: '#8AB4F8', marginLeft: 2, animation: 'ag-spin 1s linear infinite', borderRadius: 1, verticalAlign: 'middle' }} /></span>
            : <div className="ag-prose"><Markdown>{msg.content}</Markdown></div>
          }
        </div>
        {msg.sources?.length > 0 && !msg.streaming && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
            {msg.sources.map((s, i) => <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8AB4F8', background: 'rgba(138,180,248,.1)', border: '1px solid rgba(138,180,248,.18)', padding: '2px 8px', borderRadius: 99 }}><BookOpen size={10} />{s}</span>)}
          </div>
        )}
        {msg.toolUsed && !msg.streaming && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 11, color: '#BB86FC', background: 'rgba(187,134,252,.1)', border: '1px solid rgba(187,134,252,.18)', padding: '2px 9px', borderRadius: 99, width: 'fit-content' }}>
            🔧 Công cụ: <strong>{msg.toolUsed}</strong>
          </div>
        )}
        {msg.error && <p style={{ marginTop: 5, fontSize: 11, color: '#F28B82', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{msg.error}</p>}
      </div>
    </div>
  );
};

// ── TypingIndicator ───────────────────────────────────────────────────────────
const TypingIndicator = () => {
  const { isDark } = useTheme();
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
      <BotAvatar />
      <div style={{ background: isDark ? '#2D2E36' : '#FFFFFF', border: isDark ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(99,102,241,.18)', borderRadius: '3px 14px 14px 14px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 5, boxShadow: isDark ? 'none' : '0 2px 8px rgba(99,102,241,.06)' }}>
        <div className="ag-typing-dot" /><div className="ag-typing-dot" /><div className="ag-typing-dot" />
      </div>
    </div>
  );
};

// ── Helper ────────────────────────────────────────────────────────────────────
const extractSources = (text) => {
  const sources = [];
  const pats = [/(?:nguồn|source|tài liệu)[:\s]*([^\n]+)/gi, /\(([^)]*?\.(?:pdf|docx|txt|pptx)[^)]*)\)/gi];
  for (const p of pats) { let m; while ((m = p.exec(text)) !== null) { const s = m[1].trim(); if (s && !sources.includes(s)) sources.push(s); } }
  return sources;
};

export default function ChatComponent({ activeChatId, onChatCreated, selectedCourseForChat }) {
  const { isDark } = useTheme();

  // ── Derived theme values ──
  const pageBg = isDark ? 'transparent' : 'rgba(249,250,255,.6)';
  const pageColor = isDark ? '#E3E3E3' : '#1A1B2E';
  const sidebarBg = isDark ? '#1B1B1F' : '#FFFFFF';
  const sidebarBorder = isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.12)';
  const subTextColor = isDark ? '#9AA0A6' : 'rgba(90,95,125,.75)';
  const dimTextColor = isDark ? '#5F6368' : '#C8CCE0';
  const inputBg = isDark ? '#28292F' : '#FFFFFF';
  const inputBorder = isDark ? 'rgba(255,255,255,.12)' : 'rgba(99,102,241,.2)';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-3.5');

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const stopStream = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const loadChatSession = useCallback(async (chatId) => {
    stopStream.current?.();
    setTyping(false);
    if (!chatId) {
      setMessages([{ id: crypto.randomUUID() , role: 'bot', content: 'Xin chào! Tôi là **CourseAI** — trợ lý học tập thông minh.' }]);
      return;
    }

    try {
      const res = await chatApi.getMessages(chatId);
      if (res.ok && res.data) {
        const loaded = [{ id: 0, role: 'bot', content: 'Xin chào! Tôi là **CourseAI** — trợ lý học tập thông minh.' }];
        res.data.messages?.forEach((m, i) => {
          loaded.push({ id: i * 2 + 1, role: 'user', content: m.query });
          loaded.push({ id: i * 2 + 2, role: 'bot', content: m.response });
        });
        setMessages(loaded);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    loadChatSession(activeChatId);
  }, [activeChatId]);

  const currentModel = MODELS.find(m => m.id === selectedModel);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || typing) return;
    setMessages(prev => [...prev, { id: crypto.randomUUID() , role: 'user', content: text }]);
    setInput(''); setTyping(true);
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }

    try {
      let cid = activeChatId;
      // Triggers automatically string manipulation without modifying Backend
      const apiQuery = (!cid && selectedCourseForChat) ? `[Môn: ${selectedCourseForChat.name}] ${text}` : text;

      if (!cid) {
        const sr = await chatApi.createSession(apiQuery.slice(0, 50));
        if (sr.ok && sr.data?.chatId) {
          cid = sr.data.chatId;
          if (onChatCreated) onChatCreated(cid, text.slice(0, 28) + (text.length > 28 ? '…' : ''));
        } else throw new Error('Không thể tạo phiên chat');
      }

      const botId = crypto.randomUUID();
      setMessages(prev => [...prev, { id: botId, role: 'bot', content: '', streaming: true, sources: [] }]);
      setTyping(false);
      let sseHandled = false;
      try {
        const streamRes = await fetch(`${API_BASE}/api/chat/${cid}`, {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',  
            'X-CSRFToken': document.cookie.split('csrftoken=')[1]
          },
          body: JSON.stringify({ query: text, model: selectedModel }),
        });

        if (streamRes.ok) {
          sseHandled = true;
          const reader = streamRes.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let fullText = '';
          let sources = [];

          while (true) {
            const { value, done } = await reader.read();

            if (done) break;
            buffer += decoder.decode(value, {stream: true});
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6);

              if (data === '[DONE]') { console.log('END'); reader.cancel(); break; }

              try {
                fullText += data;
                setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: fullText } : m));
              } catch {
                if (data) {
                  fullText += data;
                  setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: fullText } : m));
                }
              }
            }
          }

          setMessages(prev => prev.map(m => m.id === botId ? { ...m, streaming: false, sources } : m));
          loadChatSession(cid)
        }
      } catch (e) { console.info('SSE fallback:', e.message); }

      if (!sseHandled) {
        const res = await chatApi.sendMessage(cid, apiQuery, selectedModel);
        if (res.ok) {
          const mr = await chatApi.getMessages(cid);
          if (mr.ok && mr.data?.messages) {
            const last = mr.data.messages[mr.data.messages.length - 1];
            const rt = last?.response || 'Không có phản hồi.';
            setMessages(prev => prev.map(m => m.id === botId ? { ...m, sources: extractSources(rt), toolUsed: last?.tool_used ?? null } : m));
            stopStream.current = streamText(rt, chunk => setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: chunk } : m)), () => setMessages(prev => prev.map(m => m.id === botId ? { ...m, streaming: false } : m)));
          }
        } else throw new Error(res.data?.error || 'API error');
      }
    } catch (err) {
      setTyping(false);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'bot', content: 'Xin lỗi, đã có lỗi kết nối tới hệ thống AI.', error: err.message }]);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const SUGGESTIONS = ['Tạo quiz chương 2', 'Giải thích về vòng lặp', 'OOP là gì?', 'Tóm tắt chương 1'];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
      {/* Settings / Model selection header could go here if needed */}
      <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 20px', borderBottom: isDark ? '1px solid rgba(255,255,255,.05)' : '1px solid rgba(99,102,241,.1)', flexShrink: 0 }}>
        <div style={{ fontSize: 11.5, color: dimTextColor }}>
          <AlertCircle size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} /> AI có thể mắc sai sót.
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: pageBg }}>
        {messages.length === 1 && messages[0].role === 'bot' && (
          <div style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 20 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 0 32px rgba(99,102,241,.4)' }}>
              <GraduationCap size={28} color="#fff" />
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: pageColor, marginBottom: 6, letterSpacing: '-.02em' }}>Xin chào! Tôi là CourseAI 👋</p>
            <p style={{ fontSize: 13.5, color: subTextColor, marginBottom: 4 }}>Trợ lý học tập thông minh — hỗ trợ <strong style={{ color: isDark ? '#8AB4F8' : '#4F46E5' }}>tất cả môn học</strong></p>
            <p style={{ fontSize: 12, color: dimTextColor }}>Hỏi bất cứ điều gì về bài giảng, hoặc gõ <em>"tạo quiz"</em> để luyện tập</p>
            {!activeChatId && selectedCourseForChat && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.2)', padding: '6px 12px', borderRadius: 99, color: '#34D399', fontSize: 12, fontWeight: 500 }}>
                <BookOpen size={14} /> Đoạn chat này sẽ lấy tài liệu từ môn: <strong style={{ color: '#E8E9F4' }}>{selectedCourseForChat.name}</strong>
              </div>
            )}
          </div>
        )}

        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ padding: '6px 24px 0', display: 'flex', gap: 6, flexWrap: 'wrap', background: 'transparent' }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }}
              style={{ fontSize: 12, padding: '4px 10px', borderRadius: 99, background: isDark ? 'rgba(255,255,255,.05)' : 'rgba(99,102,241,.06)', border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : 'rgba(99,102,241,.15)'}`, color: subTextColor, cursor: 'pointer', transition: 'all .12s', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(138,180,248,.3)' : 'rgba(79,70,229,.4)'; e.currentTarget.style.color = isDark ? '#8AB4F8' : '#4F46E5'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.1)' : 'rgba(99,102,241,.15)'; e.currentTarget.style.color = subTextColor; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '10px 20px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 14, padding: '10px 14px', transition: 'border-color .2s' }}
          onMouseOver={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.22)' : 'rgba(99,102,241,.4)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = inputBorder; }}
        >
          <textarea ref={el => { inputRef.current = el; textareaRef.current = el; }}
            rows={1} value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi về môn học... (Enter gửi, Shift+Enter xuống dòng)"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13.5, color: pageColor, resize: 'none', minHeight: 24, maxHeight: 120, lineHeight: 1.6, fontFamily: 'inherit' }}
          />
          <button onClick={handleSend} disabled={!input.trim() || typing}
            style={{ width: 34, height: 34, borderRadius: 9, background: input.trim() && !typing ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : (isDark ? 'rgba(255,255,255,.06)' : 'rgba(99,102,241,.08)'), border: 'none', cursor: input.trim() && !typing ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .2s', color: '#fff' }}
          >
            <Send size={16} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: dimTextColor, textAlign: 'center', marginTop: 5 }}>CourseAI có thể mắc sai sót. Kiểm tra thông tin quan trọng.</p>
      </div>
    </div>
  );
}
