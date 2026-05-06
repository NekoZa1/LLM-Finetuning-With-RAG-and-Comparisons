import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, LogOut, ChevronRight, ClipboardList,
  Sparkles, CheckCircle, XCircle, RotateCcw, Award, X,
  GraduationCap, Clock, Bot, LayoutDashboard, MessageSquare, Loader,
  Zap, TrendingUp, Star, Menu, PanelLeftClose, PanelLeftOpen, Plus, Search, Edit,
  User, Settings, HelpCircle, Camera
} from 'lucide-react';
import Markdown from 'react-markdown';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { userApi, quizApi, chatApi } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import ChatComponent from '../components/ChatComponent';


/* ── Premium Quiz Modal ── */
const QuizModal = ({ quiz, onClose }) => {
  const [answers,    setAnswers]    = useState({});
  const [submitted,  setSubmitted]  = useState(false);
  const [current,    setCurrent]    = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);

  const q       = quiz.questions[current];
  const total   = quiz.questions.length;
  const score   = quiz.questions.filter(qu => answers[qu.id] === qu.correct).length;
  const percent = submitted ? Math.round((score/total)*100) : 0;
  const canSubmit = Object.keys(answers).length === total;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true); setSubmitted(true);
    try { await quizApi.submitQuiz(quiz.id, answers); setDone(true); }
    catch(e) { console.warn(e); }
    finally { setSubmitting(false); }
  };

  const optStyle = (qu, idx) => {
    const base = {
      display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
      borderRadius:12, border:'1px solid', cursor:'pointer', transition:'all .2s ease', fontSize:14,
    };
    if (!submitted) {
      return answers[qu.id]===idx
        ? { ...base, borderColor:'rgba(99,102,241,.5)', background:'rgba(99,102,241,.15)', color:'#8B9EFF', fontWeight:500,
            boxShadow:'0 0 16px rgba(99,102,241,.1)' }
        : { ...base, borderColor:'rgba(255,255,255,.07)', background:'rgba(18,19,30,.8)', color:'rgba(139,147,176,.8)' };
    }
    if (idx===qu.correct) return { ...base, borderColor:'rgba(52,211,153,.4)', background:'rgba(52,211,153,.1)', color:'#34D399', fontWeight:600, cursor:'default', boxShadow:'0 0 12px rgba(52,211,153,.08)' };
    if (answers[qu.id]===idx) return { ...base, borderColor:'rgba(248,113,113,.4)', background:'rgba(248,113,113,.1)', color:'#F87171', fontWeight:500, cursor:'default' };
    return { ...base, borderColor:'rgba(255,255,255,.04)', background:'transparent', color:'#2E3048', cursor:'default', opacity:.5 };
  };

  return (
    <div style={{
      position:'fixed', inset:0,
      background:'rgba(0,0,0,.85)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:50, padding:16,
    }}>
      <div className="ag-modal-in" style={{
        background: 'linear-gradient(135deg, #181929 0%, #12131F 100%)',
        border:'1px solid rgba(255,255,255,.08)',
        borderRadius:22, width:'100%', maxWidth:580, maxHeight:'90vh',
        display:'flex', flexDirection:'column', overflow:'hidden',
        boxShadow:'0 32px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(139,158,255,.05)',
        position:'relative',
      }}>
        {/* Top glow line */}
        <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:1, background:'linear-gradient(90deg,transparent,rgba(139,158,255,.35),transparent)' }}/>

        {/* Header */}
        <div style={{
          padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,.06)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'rgba(13,14,20,.5)', flexShrink:0, backdropFilter:'blur(12px)',
        }}>
          <div>
            <div style={{
              fontSize:10, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase',
              color:'#8B9EFF', marginBottom:4,
              background:'rgba(139,158,255,.1)', border:'1px solid rgba(139,158,255,.18)',
              display:'inline-block', padding:'2px 8px', borderRadius:6,
            }}>{quiz.courseName}</div>
            <div style={{ fontSize:15, fontWeight:700, color:'#E8E9F4', letterSpacing:'-.01em' }}>{quiz.title}</div>
          </div>
          <button onClick={onClose} style={{
            background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)',
            borderRadius:9, color:'rgba(139,147,176,.7)', cursor:'pointer', width:32, height:32,
            display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s',
          }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(248,113,113,.1)'; e.currentTarget.style.color='#F87171'; }}
            onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.color='rgba(139,147,176,.7)'; }}
          >
            <X size={16}/>
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height:3, background:'rgba(255,255,255,.05)', flexShrink:0 }}>
          <div style={{
            height:'100%',
            background:'linear-gradient(90deg,#4f46e5,#8b5cf6,#a855f7)',
            width:`${((current+1)/total)*100}%`,
            transition:'width .45s cubic-bezier(.22,1,.36,1)',
            boxShadow:'0 0 12px rgba(99,102,241,.4)',
          }}/>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:24 }}>
          {!submitted ? (
            <div className="ag-fade-in">
              <div style={{ fontSize:12, color:'#4E5268', fontWeight:600, marginBottom:14, letterSpacing:'.02em' }}>
                Câu <span style={{ color:'#8B9EFF', fontWeight:700 }}>{current+1}</span> / {total}
              </div>
              <p style={{
                fontSize:16, fontWeight:700, color:'#E8E9F4',
                marginBottom:22, lineHeight:1.5, letterSpacing:'-.01em',
              }}>{q.question}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:24 }}>
                {q.options.map((opt, idx) => (
                  <div key={idx} onClick={()=>!submitted&&setAnswers(p=>({...p,[q.id]:idx}))} style={optStyle(q,idx)}>
                    <span style={{
                      width:26, height:26, borderRadius:7, flexShrink:0,
                      background: answers[q.id]===idx
                        ? 'linear-gradient(135deg,#4f46e5,#8b5cf6)'
                        : 'rgba(255,255,255,.06)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:11, fontWeight:700, color:'#fff',
                      boxShadow: answers[q.id]===idx ? '0 0 12px rgba(99,102,241,.4)' : 'none',
                      transition:'all .2s',
                    }}>
                      {String.fromCharCode(65+idx)}
                    </span>
                    {opt}
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', paddingTop:16, borderTop:'1px solid rgba(255,255,255,.05)' }}>
                <button onClick={()=>setCurrent(p=>Math.max(0,p-1))} disabled={current===0}
                  style={{
                    display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, fontSize:13, fontWeight:500,
                    background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.09)',
                    color: current===0 ? '#2E3048' : 'rgba(139,147,176,.8)',
                    cursor: current===0 ? 'not-allowed' : 'pointer', fontFamily:'inherit',
                    transition:'all .15s',
                  }}
                >
                  ← Quay lại
                </button>
                {current<total-1
                  ? <button onClick={()=>setCurrent(p=>p+1)} disabled={answers[q.id]===undefined}
                      style={{
                        display:'flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:10, fontSize:13, fontWeight:600,
                        background: answers[q.id]!==undefined ? 'linear-gradient(135deg,#4f46e5,#8b5cf6)' : 'rgba(99,102,241,.2)',
                        border:'none', color:'#fff', cursor: answers[q.id]!==undefined ? 'pointer' : 'not-allowed',
                        fontFamily:'inherit', boxShadow: answers[q.id]!==undefined ? '0 4px 16px rgba(99,102,241,.35)' : 'none',
                        transition:'all .2s',
                      }}
                    >Tiếp theo →</button>
                  : <button onClick={handleSubmit} disabled={!canSubmit||submitting}
                      style={{
                        display:'flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:10, fontSize:13, fontWeight:600,
                        background: canSubmit&&!submitting ? 'linear-gradient(135deg,#34d399,#059669)' : 'rgba(52,211,153,.2)',
                        border:'none', color:'#fff', cursor: canSubmit&&!submitting ? 'pointer' : 'not-allowed',
                        fontFamily:'inherit', boxShadow: canSubmit&&!submitting ? '0 4px 16px rgba(52,211,153,.3)' : 'none',
                        transition:'all .2s',
                      }}
                    >
                      {submitting ? <><div style={{ width:14,height:14,border:'2px solid rgba(255,255,255,.2)',borderTopColor:'#fff',borderRadius:'50%',animation:'ag-spin 1s linear infinite' }}/> Đang nộp...</> : <><CheckCircle size={15}/> Nộp bài</>}
                    </button>
                }
              </div>
            </div>
          ) : (
            <div className="ag-fade-in">
              {done && (
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:12, marginBottom:16, background:'rgba(52,211,153,.08)', border:'1px solid rgba(52,211,153,.18)', color:'#34D399', fontSize:13 }}>
                  <CheckCircle size={15}/> Kết quả đã được ghi nhận!
                </div>
              )}
              <div style={{
                background: percent>=70 ? 'rgba(52,211,153,.06)' : 'rgba(251,191,36,.06)',
                border:`1px solid ${percent>=70 ? 'rgba(52,211,153,.2)' : 'rgba(251,191,36,.2)'}`,
                borderRadius:16, padding:'28px 24px', textAlign:'center', marginBottom:20,
                boxShadow: percent>=70 ? '0 0 40px rgba(52,211,153,.06)' : '0 0 40px rgba(251,191,36,.05)',
              }}>
                <Award size={44} style={{ color:percent>=70?'#34D399':'#FBBF24', margin:'0 auto 12px', filter:`drop-shadow(0 0 12px ${percent>=70?'rgba(52,211,153,.4)':'rgba(251,191,36,.4)'})` }}/>
                <p style={{ fontSize:48, fontWeight:800, color:percent>=70?'#34D399':'#FBBF24', lineHeight:1, letterSpacing:'-.03em' }}>
                  {score}<span style={{ fontSize:24, opacity:.5 }}>/{total}</span>
                </p>
                <p style={{ fontSize:14, color:'rgba(139,147,176,.7)', marginTop:10, fontWeight:500 }}>
                  {percent}% — {percent>=70 ? 'Xuất sắc! 🎉' : 'Cần ôn tập thêm 📚'}
                </p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {quiz.questions.map((qu,i) => {
                  const ok = answers[qu.id]===qu.correct;
                  return (
                    <div key={qu.id} style={{
                      background: ok ? 'rgba(52,211,153,.05)' : 'rgba(248,113,113,.05)',
                      border:`1px solid ${ok ? 'rgba(52,211,153,.15)' : 'rgba(248,113,113,.15)'}`,
                      borderRadius:12, padding:'13px 15px',
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        {ok ? <CheckCircle size={14} color="#34D399"/> : <XCircle size={14} color="#F87171"/>}
                        <span style={{ fontSize:13, fontWeight:600, color:'#E8E9F4' }}>Q{i+1}. {qu.question}</span>
                      </div>
                      <div style={{ paddingLeft:22, fontSize:12, color:'rgba(139,147,176,.7)' }}>
                        <Markdown>{qu.explain}</Markdown>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={()=>{setAnswers({});setSubmitted(false);setCurrent(0);setDone(false);}}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                  width:'100%', marginTop:16, padding:'12px', borderRadius:12, fontSize:13, fontWeight:500,
                  background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.09)',
                  color:'rgba(139,147,176,.8)', cursor:'pointer', fontFamily:'inherit', transition:'all .15s',
                }}
                onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,.07)'; e.currentTarget.style.color='#E8E9F4'; }}
                onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.color='rgba(139,147,176,.8)'; }}
              >
                <RotateCcw size={14}/> Làm lại
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════ */
const COURSE_COLORS = ['#8B9EFF','#34D399','#FBBF24','#C084FC','#67E8F9','#FB923C'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { isDark } = useTheme();
  const userName = user?.name || user?.email?.split('@')[0] || 'Sinh viên';

  const [courses,        setCourses]        = useState([]);
  const [quizzes,        setQuizzes]        = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [chatHistory,    setChatHistory]    = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedQuiz,   setSelectedQuiz]   = useState(null);
  const [activeNav,      setActiveNav]      = useState('dashboard');
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(true);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [activeChatId,   setActiveChatId]   = useState(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileDisplayName, setProfileDisplayName] = useState(userName);
  const [profileUsername, setProfileUsername] = useState('dinhthuan2005.tk');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(null);
  
  const filteredHistory = chatHistory.filter(h => h.title.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    const load = async () => {
      try {
        const res = await userApi.getStudentCourses();
        const data = res.ok && res.data?.courses?.length ? res.data.courses : [];
        setCourses(data.map((c,i) => ({ ...c, iconColor: c.iconColor||COURSE_COLORS[i%COURSE_COLORS.length] })));
      } catch(err) { console.error(err); }
      finally  { setLoadingCourses(false); }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoadingHistory(true);
      try {
        const res = await chatApi.getSessions();
        if (res.ok && res.data?.chatSession)
          setChatHistory(res.data.chatSession.map(s=>({ id:s.id, title:s.title, createdAt:s.created_at })));
      } catch(e) { console.error(e); }
      finally { setLoadingHistory(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!courses.length) return;
    setLoadingQuizzes(true);
    Promise.all(courses.map(c => quizApi.getQuizzesByCourse(c.id)))
      .then(results => {
        const all = results.flatMap((res,i) =>
          (res.ok && res.data?.quizzes ? res.data.quizzes : []).map(q=>({...q, courseId:courses[i].id, courseName:courses[i].name})));
        setQuizzes(all);
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingQuizzes(false));
  }, [courses]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileAvatarUrl(url);
    }
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: isDark ? '#0D0E14' : '#F4F5FF',
      fontFamily: "'Inter', 'Outfit', sans-serif", color: 'var(--text-primary)',
    }}>
      {selectedQuiz && <QuizModal quiz={selectedQuiz} onClose={()=>setSelectedQuiz(null)}/>}

      {/* ═══ SIDEBAR ═══ */}
      <div className="ag-sidebar" style={{
        width: isSidebarOpen ? 260 : 68,
        minWidth: isSidebarOpen ? 260 : 68,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRight: isDark ? '1px solid rgba(255,255,255,.05)' : '1px solid rgba(99,102,241,.1)',
        flexShrink: 0,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', background: isDark ? '#0D0E14' : '#F4F5FF', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          {/* Sidebar inner glow */}
          <div style={{
            position: 'absolute', top: -80, left: -40,
            width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(79,70,229,.12) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 0,
          }}/>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo & Toggle */}
            <div style={{
              padding: isSidebarOpen ? '18px 16px 14px' : '18px 0 14px',
              display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center',
              borderBottom: isDark ? '1px solid rgba(255,255,255,.05)' : '1px solid rgba(99,102,241,.1)',
              marginBottom: 8,
              flexDirection: isSidebarOpen ? 'row' : 'column',
              gap: isSidebarOpen ? 0 : 12
            }}>
              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)} 
                  title="Mở sidebar"
                  style={{ background:'none', border:'none', color: isDark ? '#4E5268' : '#9CA3C0', cursor: 'pointer', display: 'flex', padding: 8, borderRadius: 8, transition: 'all 0.2s' }} 
                  onMouseOver={e=>{e.currentTarget.style.background=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)'; e.currentTarget.style.color=isDark?'#E8E9F4':'#1A1B2E'}} 
                  onMouseOut={e=>{e.currentTarget.style.background='none'; e.currentTarget.style.color=isDark?'#4E5268':'#9CA3C0'}}>
                  <PanelLeftOpen size={20}/>
                </button>
              )}

              {isSidebarOpen && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, boxShadow: '0 0 20px rgba(99,102,241,.35)',
                  }}>
                    <GraduationCap size={16} color="#fff"/>
                  </div>
                  <div className="ag-fade-in">
                    <div style={{
                      fontSize: 13.5, fontWeight: 700, letterSpacing: '-.02em',
                      background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>CourseAI</div>
                    <div style={{ fontSize: 10, color: isDark ? '#4E5268' : '#9CA3C0', fontWeight: 500, letterSpacing: '.03em', textTransform: 'uppercase' }}>Sinh viên</div>
                  </div>
                </div>
              )}

              {isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  title="Đóng sidebar"
                  style={{ background:'none', border:'none', color: isDark ? '#4E5268' : '#9CA3C0', cursor: 'pointer', display: 'flex', padding: 6, borderRadius: 8, transition: 'all 0.2s' }} 
                  onMouseOver={e=>{e.currentTarget.style.background=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)'; e.currentTarget.style.color=isDark?'#E8E9F4':'#1A1B2E'}} 
                  onMouseOut={e=>{e.currentTarget.style.background='none'; e.currentTarget.style.color=isDark?'#4E5268':'#9CA3C0'}}>
                  <PanelLeftClose size={18}/>
                </button>
              )}
            </div>

          {/* Nav items */}
          <div style={{ flex: 1, padding: '8px 0', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: isSidebarOpen ? 'stretch' : 'center' }}>
            <div style={{ padding: isSidebarOpen ? '0 12px 12px' : '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 4, width: isSidebarOpen ? '100%' : 'auto', alignItems: 'center' }}>
              <button className="ag-fade-in" onClick={() => { setActiveNav('chat'); setActiveChatId(null); }} title="Đoạn chat mới" style={{ width: isSidebarOpen ? '100%' : 44, height: isSidebarOpen ? 'auto' : 44, display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', gap: 8, background: 'transparent', border: 'none', borderRadius: 8, padding: isSidebarOpen ? '8px 12px' : 0, color: isDark ? '#E8E9F4' : '#1A1B2E', fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: 'background .15s' }} onMouseOver={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                <Edit size={18}/> {isSidebarOpen && "Đoạn chat mới"}
              </button>
              <button className="ag-fade-in" onClick={() => setIsSearchModalOpen(true)} title="Tìm kiếm đoạn chat" style={{ width: isSidebarOpen ? '100%' : 44, height: isSidebarOpen ? 'auto' : 44, display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', gap: 8, background: 'transparent', border: 'none', borderRadius: 8, padding: isSidebarOpen ? '8px 12px' : 0, color: isDark ? '#E8E9F4' : '#1A1B2E', fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: 'background .15s' }} onMouseOver={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                <Search size={18}/> {isSidebarOpen && "Tìm kiếm"}
              </button>
            </div>

            <div style={{ padding: isSidebarOpen ? '0 12px 6px' : '10px 0', fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: isDark ? '#2E3048' : '#C8CCE0' }}>
              {isSidebarOpen ? "Điều hướng" : ""}
            </div>
            
            <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 4, width: '100%', alignItems: 'center' }}>
              <button onClick={()=>setActiveNav('dashboard')} className={`ag-fade-in`} title="Tổng quan" style={{ width: isSidebarOpen ? '100%' : 44, height: isSidebarOpen ? 'auto' : 44, display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', gap: 8, background: activeNav==='dashboard' ? (isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)') : 'transparent', border: 'none', borderRadius: 8, padding: isSidebarOpen ? '8px 12px' : 0, color: activeNav==='dashboard' ? (isDark?'#E8E9F4':'#4F46E5') : (isDark ? '#9CA3C0' : '#4E5268'), fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: 'all .15s' }} onMouseOver={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'} onMouseOut={e=>e.currentTarget.style.background=activeNav==='dashboard'?(isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'):'transparent'}>
                <LayoutDashboard size={18}/> {isSidebarOpen && "Tổng quan"}
              </button>
              <button onClick={()=>setActiveNav('quizzes')} className={`ag-fade-in`} title="Bài tập luyện" style={{ width: isSidebarOpen ? '100%' : 44, height: isSidebarOpen ? 'auto' : 44, display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', gap: 8, background: activeNav==='quizzes' ? (isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)') : 'transparent', border: 'none', borderRadius: 8, padding: isSidebarOpen ? '8px 12px' : 0, color: activeNav==='quizzes' ? (isDark?'#E8E9F4':'#4F46E5') : (isDark ? '#9CA3C0' : '#4E5268'), fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: 'all .15s' }} onMouseOver={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'} onMouseOut={e=>e.currentTarget.style.background=activeNav==='quizzes'?(isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'):'transparent'}>
                <ClipboardList size={18}/> {isSidebarOpen && "Bài tập luyện"}
              </button>
            </div>

            <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,.04)' : 'rgba(99,102,241,.08)', margin: isSidebarOpen ? '10px 12px' : '10px 0', width: isSidebarOpen ? 'auto' : 30 }}/>
            
            {isSidebarOpen && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px 6px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: isDark ? '#2E3048' : '#C8CCE0' }}>Lịch sử chat</div>
              </div>
            )}
            
            {isSidebarOpen && (
              <>
                {loadingHistory ? (
                  <div style={{ padding: '4px 12px', fontSize: 12, color: isDark ? '#4E5268' : '#9CA3C0' }}>Đang tải...</div>
                ) : chatHistory.length === 0 ? (
                  <div style={{ padding: '4px 12px', fontSize: 12, color: isDark ? '#4E5268' : '#9CA3C0' }}>Chưa có lịch sử</div>
                ) : chatHistory.map(h => (
                  <button key={h.id} title={h.title} onClick={() => { setActiveNav('chat'); setActiveChatId(h.id); }} className="ag-sidebar-item" style={{ justifyContent: 'flex-start', paddingLeft: 22, fontSize: 13, background: activeNav==='chat'&&activeChatId===h.id?(isDark?'rgba(255,255,255,.08)':'rgba(99,102,241,.1)'):undefined, color: activeNav==='chat'&&activeChatId===h.id?(isDark?'#E8E9F4':'#4F46E5'):undefined }}>
                    <MessageSquare size={16} style={{ flexShrink: 0, color: activeNav==='chat'&&activeChatId===h.id?(isDark?'#E8E9F4':'#4F46E5'):(isDark ? '#4E5268' : '#9CA3C0') }}/>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</span>
                  </button>
                ))}
              </>
            )}
          </div>

          {/* User info */}
          <div style={{ padding: isSidebarOpen ? '10px 10px 16px' : '10px 0 16px', borderTop: isDark ? '1px solid rgba(255,255,255,.05)' : '1px solid rgba(99,102,241,.1)', display: 'flex', justifyContent: 'center', position: 'relative' }}>
            
            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <>
                <div style={{position: 'fixed', inset: 0, zIndex: 40}} onClick={(e) => { e.stopPropagation(); setIsProfileMenuOpen(false); }}/>
                <div className="ag-fade-up" style={{
                  position: 'absolute', bottom: 'calc(100% + 5px)', left: isSidebarOpen ? 10 : 60, width: 240,
                  background: isDark ? '#2D2E36' : '#FFFFFF',
                  borderRadius: 12, padding: '8px 0',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                  zIndex: 50,
                  border: isDark ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(0,0,0,.08)',
                  display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px 12px' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#F472B6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, overflow: 'hidden' }}>
                      {profileAvatarUrl ? <img src={profileAvatarUrl} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isDark?'#E8E9F4':'#1A1B2E', letterSpacing: '-.01em', marginBottom: 2 }}>{userName}</div>
                      <div style={{ fontSize: 11, color: isDark?'#9CA3C0':'#6B7280'}}>Free</div>
                    </div>
                  </div>
                  
                  <button onClick={() => { setIsProfileMenuOpen(false); setIsProfileModalOpen(true); }} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#E8E9F4' : '#1A1B2E', fontSize: 13, fontWeight: 500 }} onMouseOver={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'} onMouseOut={e=>e.currentTarget.style.background='none'}>
                    <User size={16} style={{ color: isDark ? '#9CA3C0' : '#6B7280' }}/> Hồ sơ
                  </button>
                  <button style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#E8E9F4' : '#1A1B2E', fontSize: 13, fontWeight: 500 }} onMouseOver={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'} onMouseOut={e=>e.currentTarget.style.background='none'}>
                    <Settings size={16} style={{ color: isDark ? '#9CA3C0' : '#6B7280' }}/> Cài đặt
                  </button>
                  
                  <div style={{ height: 1, background: isDark?'rgba(255,255,255,.08)':'rgba(0,0,0,.06)', margin: '6px 0'}}/>
                  
                  <button style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#E8E9F4' : '#1A1B2E', fontSize: 13, fontWeight: 500 }} onMouseOver={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'} onMouseOut={e=>e.currentTarget.style.background='none'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <HelpCircle size={16} style={{ color: isDark ? '#9CA3C0' : '#6B7280' }}/> Trợ giúp
                    </div>
                    <ChevronRight size={14} style={{ color: isDark ? '#9CA3C0' : '#6B7280' }}/>
                  </button>
                  
                  <button onClick={handleLogout} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#E8E9F4' : '#1A1B2E', fontSize: 13, fontWeight: 500 }} onMouseOver={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'} onMouseOut={e=>e.currentTarget.style.background='none'}>
                    <LogOut size={16} style={{ color: isDark ? '#9CA3C0' : '#6B7280' }}/> Đăng xuất
                  </button>
                </div>
              </>
            )}

            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: isSidebarOpen ? 10 : 0, padding: isSidebarOpen ? '10px 11px' : '8px',
                borderRadius: isSidebarOpen ? 12 : '50%',
                background: 'transparent',
                border: 'none',
                width: isSidebarOpen ? 'calc(100% - 20px)' : 40,
                height: isSidebarOpen ? 'auto' : 40,
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background .15s'
              }}
              onMouseOver={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.05)'}
              onMouseOut={e=>e.currentTarget.style.background='transparent'}
            >
              <div title={userName} style={{
                width: 30, height: 30, borderRadius: '50%',
                background: '#F472B6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
                flexShrink: 0, boxShadow: '0 0 12px rgba(244,114,182,.4)',
                overflow: 'hidden'
              }}>
                {profileAvatarUrl ? <img src={profileAvatarUrl} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : userName.charAt(0).toUpperCase()}
              </div>
              {isSidebarOpen && (
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#E8E9F4' : '#1A1B2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-.01em' }}>{userName}</div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>


      {/* Search Modal */}
      {isSearchModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '10vh', zIndex: 100,
        }} onClick={() => setIsSearchModalOpen(false)}>
          <div style={{
            width: '100%', maxWidth: 540, background: isDark ? '#202123' : '#FFFFFF',
            borderRadius: 12, border: isDark ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(0,0,0,.1)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
            maxHeight: '70vh', overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: isDark ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(0,0,0,.1)' }}>
              <input 
                autoFocus
                type="text" 
                placeholder="Tìm kiếm đoạn chat..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: isDark ? '#E8E9F4' : '#1A1B2E', fontSize: 16 }}
              />
              <button onClick={() => setIsSearchModalOpen(false)} style={{ background: 'none', border: 'none', color: isDark ? '#9CA3C0' : '#4E5268', cursor: 'pointer', display: 'flex', padding: 4 }}>
                <X size={20}/>
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
              <button 
                onClick={() => { setIsSearchModalOpen(false); setActiveNav('chat'); setActiveChatId(null); }}
                style={{ width: '100%', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#E8E9F4' : '#1A1B2E', fontSize: 14 }}
                onMouseOver={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.05)'}
                onMouseOut={e=>e.currentTarget.style.background='none'}
              >
                <Plus size={16}/> Đoạn chat mới
              </button>
              
              <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)', margin: '8px 20px' }}/>
              
              <div style={{ padding: '8px 20px 4px', fontSize: 12, fontWeight: 600, color: isDark ? '#9CA3C0' : '#4E5268' }}>Kết quả</div>
              
              {filteredHistory.length === 0 ? (
                <div style={{ padding: '12px 20px', fontSize: 13, color: isDark ? '#9CA3C0' : '#4E5268' }}>Không tìm thấy đoạn chat nào.</div>
              ) : filteredHistory.map(h => (
                <button 
                  key={h.id} 
                  onClick={() => { setIsSearchModalOpen(false); setActiveNav('chat'); setActiveChatId(h.id); }}
                  style={{ width: '100%', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#E8E9F4' : '#1A1B2E', fontSize: 14 }}
                  onMouseOver={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.05)'}
                  onMouseOut={e=>e.currentTarget.style.background='none'}
                >
                  <MessageSquare size={16} color={isDark ? '#9CA3C0' : '#4E5268'}/>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
        }} onClick={() => setIsProfileModalOpen(false)}>
          <div style={{
            width: '100%', maxWidth: 400, background: isDark ? '#202123' : '#FFFFFF',
            borderRadius: 16, border: isDark ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(0,0,0,.1)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
            padding: 24, paddingBottom: 20
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? '#E8E9F4' : '#1A1B2E', marginBottom: 24 }}>
              Chỉnh sửa hồ sơ
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
              <div style={{ position: 'relative', width: 100, height: 100 }}>
                <div onClick={() => document.getElementById('avatarUpload').click()} style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#F472B6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 40, fontWeight: 500, overflow: 'hidden', cursor: 'pointer' }}>
                  {profileAvatarUrl ? (
                    <img src={profileAvatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    profileDisplayName ? profileDisplayName.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <button 
                  title="Đổi ảnh đại diện" 
                  onClick={() => document.getElementById('avatarUpload').click()}
                  style={{ position: 'absolute', bottom: 0, right: 0, background: isDark ? '#2D2E36' : '#FFFFFF', border: isDark ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(0,0,0,.1)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .2s', zIndex: 10 }} 
                  onMouseOver={e=>e.currentTarget.style.background=isDark?'#3F4148':'#F3F4F6'} 
                  onMouseOut={e=>e.currentTarget.style.background=isDark?'#2D2E36':'#FFFFFF'}
                >
                  <Camera size={16} color={isDark ? '#E8E9F4' : '#1A1B2E'} />
                </button>
                <input type="file" id="avatarUpload" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ position: 'relative', border: isDark ? '1px solid rgba(255,255,255,.15)' : '1px solid rgba(0,0,0,.15)', borderRadius: 8, padding: '6px 12px', background: isDark ? 'transparent' : '#fff' }}>
                <div style={{ fontSize: 11, color: isDark ? '#9CA3C0' : '#6B7280', fontWeight: 500, marginBottom: 2 }}>Tên hiển thị</div>
                <input type="text" value={profileDisplayName} onChange={(e) => setProfileDisplayName(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: isDark ? '#E8E9F4' : '#1A1B2E', fontSize: 14 }} />
              </div>
              
              <div style={{ position: 'relative', border: isDark ? '1px solid rgba(255,255,255,.15)' : '1px solid rgba(0,0,0,.15)', borderRadius: 8, padding: '6px 12px', background: isDark ? 'transparent' : '#fff' }}>
                <div style={{ fontSize: 11, color: isDark ? '#9CA3C0' : '#6B7280', fontWeight: 500, marginBottom: 2 }}>Tên người dùng</div>
                <input type="text" value={profileUsername} onChange={(e) => setProfileUsername(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: isDark ? '#E8E9F4' : '#1A1B2E', fontSize: 14 }} />
              </div>
            </div>

            <p style={{ margin: '16px 0 24px', fontSize: 12, color: isDark ? '#9CA3C0' : '#6B7280', lineHeight: 1.5, textAlign: 'center' }}>
              Hồ sơ của bạn giúp người khác nhận ra bạn. Tên và tên người dùng của bạn cũng được sử dụng trong ứng dụng CourseAI.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setIsProfileModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 20, background: isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.05)', color: isDark ? '#E8E9F4' : '#1A1B2E', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'background .2s' }} onMouseOver={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,.15)':'rgba(0,0,0,.1)'} onMouseOut={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,.1)':'rgba(0,0,0,.05)'}>Hủy</button>
              <button onClick={() => setIsProfileModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 20, background: isDark ? '#fff' : '#1A1B2E', color: isDark ? '#1A1B2E' : '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'opacity .2s' }} onMouseOver={e=>e.currentTarget.style.opacity=.9} onMouseOut={e=>e.currentTarget.style.opacity=1}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MAIN ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Navbar */}
        <div style={{
          height: 56, display: 'flex', alignItems: 'center', padding: '0 24px',
          borderBottom: isDark ? '1px solid rgba(255,255,255,.05)' : '1px solid rgba(99,102,241,.1)',
          background: isDark ? 'rgba(13,14,20,.85)' : 'rgba(255,255,255,.9)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: isDark ? 'none' : '0 1px 12px rgba(99,102,241,.08)',
          position: 'sticky', top: 0, zIndex: 40, gap: 12,
        }}>
          <h1 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-.01em', flex: 1 }}>
            {activeNav==='dashboard' ? 'Tổng quan' : activeNav==='quizzes' ? 'Bài tập luyện' : 'Trợ lý học tập AI'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle size="sm"/>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 99,
              background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.15)',
            }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#34D399', boxShadow:'0 0 6px rgba(52,211,153,.6)' }}/>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#34D399', letterSpacing: '.03em' }}>Online</span>
            </div>
          </div>
        </div>

        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', overflowY: activeNav==='chat' ? 'hidden' : 'auto', padding: activeNav==='chat' ? 0 : 28,
          background: isDark ? 'linear-gradient(180deg, rgba(9,10,16,.6) 0%, transparent 30%)' : 'none',
        }}>

          {/* ─ Chat ─ */}
          {activeNav === 'chat' && (
            <ChatComponent 
              activeChatId={activeChatId}
              user={user}
              onChatCreated={(id, title) => {
                setChatHistory(prev => [{ id, title, created_at: new Date().toISOString() }, ...prev]);
              }}
            />
          )}

          {/* ─ Dashboard ─ */}
          {activeNav==='dashboard' && (
            <>
              {/* Hero greeting */}
              <div className="ag-fade-up" style={{ marginBottom: 28 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '4px 12px', borderRadius: 99, marginBottom: 14,
                  background: isDark ? 'rgba(139,158,255,.08)' : 'rgba(79,70,229,.08)',
                  border: isDark ? '1px solid rgba(139,158,255,.15)' : '1px solid rgba(79,70,229,.2)',
                  fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
                  color: isDark ? '#8B9EFF' : '#4F46E5',
                }}>
                  <Sparkles size={11}/> Dashboard
                </div>
                <h2 style={{
                  fontSize: 28, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 8,
                  color: isDark ? '#E8E9F4' : '#1A1B2E',
                }}>
                  Xin chào, {userName} 👋
                </h2>
                <p style={{ fontSize: 14, color: isDark ? 'rgba(139,147,176,.7)' : 'rgba(90,95,125,.75)', letterSpacing: '-.01em' }}>
                  Bạn có <strong style={{ color: isDark ? '#8B9EFF' : '#4F46E5', fontWeight: 700 }}>{chatHistory.length}</strong> cuộc hội thoại và{' '}
                  <strong style={{ color: isDark ? '#34D399' : '#059669', fontWeight: 700 }}>{quizzes.length}</strong> bài tập đang chờ.
                </p>
              </div>

              {/* Stats row */}
              <div className="ag-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
                {[
                  { label: 'Lịch sử chat', value: chatHistory.length, color: isDark ? '#8B9EFF' : '#4F46E5', icon: <MessageSquare size={16}/>, glow: 'rgba(139,158,255,.12)' },
                  { label: 'Bài tập', value: quizzes.length, color: isDark ? '#34D399' : '#059669', icon: <ClipboardList size={16}/>, glow: 'rgba(52,211,153,.1)' },
                  { label: 'Điểm TB', value: '—', color: isDark ? '#FBBF24' : '#D97706', icon: <Star size={16}/>, glow: 'rgba(251,191,36,.08)' },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(24,25,40,.9) 0%, rgba(16,17,28,.95) 100%)'
                      : 'linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(248,249,255,.98) 100%)',
                    border: isDark ? '1px solid rgba(255,255,255,.07)' : '1px solid rgba(99,102,241,.1)',
                    borderRadius: 16, padding: '18px 20px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    position: 'relative', overflow: 'hidden',
                    transition: 'transform .2s ease, box-shadow .2s ease',
                    cursor: 'default',
                  }}
                    onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 32px ${isDark ? 'rgba(0,0,0,.5)' : 'rgba(99,102,241,.1)'}, 0 0 20px ${stat.glow}`; }}
                    onMouseOut={e  => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
                  >
                    <div style={{
                      position: 'absolute', top: 0, right: 0, bottom: 0, width: '40%',
                      background: `radial-gradient(ellipse at 80% 50%, ${stat.glow} 0%, transparent 70%)`,
                      pointerEvents: 'none',
                    }}/>
                    <div style={{
                      width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                      background: `${stat.color}18`, border: `1px solid ${stat.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: stat.color, boxShadow: `0 0 16px ${stat.color}20`,
                    }}>{stat.icon}</div>
                    <div style={{ position: 'relative' }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, letterSpacing: '-.02em', lineHeight: 1 }}>{stat.value}</div>
                      <div style={{ fontSize: 11.5, color: isDark ? '#4E5268' : '#9CA3C0', fontWeight: 600, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat History section header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={15} color={isDark ? '#8B9EFF' : '#4F46E5'}/>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: isDark ? '#E8E9F4' : '#1A1B2E', letterSpacing: '-.01em' }}>Lịch sử chat gần đây</span>
                </div>
                <span style={{
                  fontSize: 11, color: isDark ? '#4E5268' : '#9CA3C0', fontWeight: 600, letterSpacing: '.04em',
                  background: isDark ? 'rgba(255,255,255,.04)' : 'rgba(99,102,241,.06)',
                  border: isDark ? '1px solid rgba(255,255,255,.07)' : '1px solid rgba(99,102,241,.1)',
                  padding: '2px 8px', borderRadius: 6,
                }}>{chatHistory.length} cuộc hội thoại</span>
              </div>

              {/* Chat History grid */}
              {loadingHistory ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '20px',
                  borderRadius: 14,
                  background: isDark ? 'rgba(18,19,30,.8)' : 'rgba(255,255,255,.9)',
                  color: isDark ? 'rgba(139,147,176,.7)' : 'rgba(90,95,125,.7)',
                  fontSize: 13, marginBottom: 24,
                  border: isDark ? '1px solid rgba(255,255,255,.06)' : '1px solid rgba(99,102,241,.1)',
                }}>
                  <Loader size={16} style={{ animation: 'ag-spin 1s linear infinite', color: isDark ? '#8B9EFF' : '#4F46E5' }}/> Đang tải lịch sử chat...
                </div>
              ) : chatHistory.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 20px', borderRadius:16, marginBottom:24,
                  background: isDark ? 'rgba(18,19,30,.6)' : 'rgba(255,255,255,.8)',
                  border: isDark ? '1px dashed rgba(255,255,255,.06)' : '1px dashed rgba(99,102,241,.15)' }}>
                  <MessageSquare size={32} style={{ color: isDark ? '#2E3048' : '#C8CCE0', margin:'0 auto 10px' }}/>
                  <p style={{ fontSize:13, color: isDark ? '#4E5268' : '#9CA3C0', fontWeight:500 }}>Chưa có cuộc hội thoại nào</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12, marginBottom: 28 }}>
                  {chatHistory.slice(0, 6).map((h,i) => (
                    <div key={h.id} onClick={() => { setActiveNav('chat'); setActiveChatId(h.id); }}
                      className="ag-fade-up"
                      style={{
                        background: isDark
                          ? 'linear-gradient(135deg, rgba(24,25,40,.9) 0%, rgba(16,17,28,.95) 100%)'
                          : 'linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(248,249,255,.98) 100%)',
                        border: isDark ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(99,102,241,.1)',
                        borderRadius: 16, padding: '18px 16px', cursor: 'pointer',
                        animationDelay: `${i*.07}s`,
                        position: 'relative', overflow: 'hidden',
                        transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform='translateY(-3px)';
                        e.currentTarget.style.boxShadow=isDark
                          ? `0 12px 40px rgba(0,0,0,.6), 0 0 24px rgba(139,158,255,.1)`
                          : `0 12px 40px rgba(99,102,241,.12), 0 0 24px rgba(79,70,229,.1)`;
                        e.currentTarget.style.borderColor=isDark ? 'rgba(139,158,255,.3)' : 'rgba(79,70,229,.3)';
                      }}
                      onMouseOut={e  => {
                        e.currentTarget.style.transform='translateY(0)';
                        e.currentTarget.style.boxShadow='none';
                        e.currentTarget.style.borderColor=isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.1)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative' }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          background: isDark ? 'rgba(139,158,255,.1)' : 'rgba(79,70,229,.08)', 
                          border: isDark ? '1px solid rgba(139,158,255,.2)' : '1px solid rgba(79,70,229,.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <MessageSquare size={16} color={isDark ? '#8B9EFF' : '#4F46E5'}/>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13.5, fontWeight: 700, color: isDark ? '#E8E9F4' : '#1A1B2E', lineHeight: 1.35, marginBottom: 5, letterSpacing: '-.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.title}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                             <Clock size={10} color={isDark ? '#4E5268' : '#9CA3C0'}/>
                             <p style={{ fontSize: 11, color: isDark ? '#4E5268' : '#9CA3C0', fontWeight: 500 }}>
                               {h.createdAt ? new Date(h.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                             </p>
                          </div>
                        </div>
                        <ChevronRight size={16} color={isDark ? '#2E3048' : '#C8CCE0'} style={{ flexShrink: 0, marginTop: 3 }}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat CTA */}
              <div className="ag-fade-up delay-2" style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(79,70,229,.12) 0%, rgba(139,92,246,.08) 100%)'
                  : 'linear-gradient(135deg, rgba(79,70,229,.06) 0%, rgba(139,92,246,.04) 100%)',
                border: isDark ? '1px solid rgba(139,158,255,.18)' : '1px solid rgba(99,102,241,.15)',
                borderRadius: 16, padding: '18px 20px',
                display: 'flex', alignItems: 'center', gap: 16,
                position: 'relative', overflow: 'hidden',
                boxShadow: isDark ? '0 0 40px rgba(99,102,241,.06)' : '0 4px 16px rgba(99,102,241,.08)',
              }}>
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: 200, height: '100%',
                  background: 'radial-gradient(ellipse at 80% 50%, rgba(168,85,247,.08) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}/>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: isDark
                    ? 'linear-gradient(135deg,rgba(79,70,229,.25),rgba(139,92,246,.2))'
                    : 'linear-gradient(135deg,rgba(79,70,229,.12),rgba(139,92,246,.1))',
                  border: isDark ? '1px solid rgba(139,158,255,.2)' : '1px solid rgba(99,102,241,.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: '0 0 20px rgba(99,102,241,.15)',
                }}>
                  <Bot size={20} color={isDark ? '#8B9EFF' : '#4F46E5'}/>
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#E8E9F4' : '#1A1B2E', marginBottom: 3, letterSpacing: '-.01em' }}>Hỏi AI về bài học</p>
                  <p style={{ fontSize: 12.5, color: isDark ? 'rgba(139,147,176,.7)' : 'rgba(90,95,125,.75)' }}>Nhấn <strong style={{ color: isDark ? '#8B9EFF' : '#4F46E5' }}>Chat AI</strong> để trò chuyện với AI về tất cả môn học</p>
                </div>
                <Zap size={18} color={isDark ? '#8B9EFF' : '#4F46E5'} style={{ flexShrink: 0, opacity: .6 }}/>
              </div>
            </>
          )}

          {/* ─ Quizzes ─ */}
          {activeNav==='quizzes' && (
            <>
              <div className="ag-fade-up" style={{ marginBottom: 24 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '4px 12px', borderRadius: 99, marginBottom: 14,
                  background: isDark ? 'rgba(52,211,153,.08)' : 'rgba(5,150,105,.08)',
                  border: isDark ? '1px solid rgba(52,211,153,.15)' : '1px solid rgba(5,150,105,.2)',
                  fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
                  color: isDark ? '#34D399' : '#059669',
                }}>
                  <ClipboardList size={11}/> Luyện tập
                </div>
                <h2 style={{
                  fontSize: 24, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 6,
                  color: isDark ? '#E8E9F4' : '#1A1B2E',
                }}>Bài tập luyện</h2>
                <p style={{ fontSize: 13.5, color: isDark ? 'rgba(139,147,176,.65)' : 'rgba(90,95,125,.7)' }}>Hoàn thành để củng cố kiến thức</p>
              </div>

              {loadingQuizzes ? (
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:20, borderRadius:14,
                  background: isDark ? 'rgba(18,19,30,.8)' : 'rgba(255,255,255,.9)',
                  color: isDark ? 'rgba(139,147,176,.7)' : 'rgba(90,95,125,.7)',
                  fontSize:13, border: isDark ? '1px solid rgba(255,255,255,.06)' : '1px solid rgba(99,102,241,.1)' }}>
                  <Loader size={16} style={{ animation:'ag-spin 1s linear infinite', color: isDark ? '#34D399' : '#059669' }}/> Đang tải bài tập...
                </div>
              ) : quizzes.length===0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', borderRadius:18,
                  background: isDark ? 'rgba(18,19,30,.6)' : 'rgba(255,255,255,.8)',
                  border: isDark ? '1px dashed rgba(255,255,255,.06)' : '1px dashed rgba(99,102,241,.15)' }}>
                  <Sparkles size={44} style={{ color: isDark ? '#2E3048' : '#C8CCE0', margin:'0 auto 14px' }}/>
                  <p style={{ fontSize:14, color: isDark ? '#4E5268' : '#9CA3C0', fontWeight:500 }}>Chưa có bài tập nào</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {quizzes.map((quiz,i) => (
                    <div key={quiz.id} className="ag-fade-up" style={{
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(24,25,40,.9) 0%, rgba(16,17,28,.95) 100%)'
                        : 'linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(248,249,255,.98) 100%)',
                      border: isDark ? '1px solid rgba(255,255,255,.07)' : '1px solid rgba(99,102,241,.1)',
                      borderRadius:16, padding:'16px 18px',
                      animationDelay:`${i*.07}s`, position:'relative', overflow:'hidden',
                      transition:'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
                    }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform='translateY(-1px)';
                        e.currentTarget.style.boxShadow= isDark ? '0 8px 28px rgba(0,0,0,.5)' : '0 8px 28px rgba(99,102,241,.12)';
                        e.currentTarget.style.borderColor= isDark ? 'rgba(52,211,153,.18)' : 'rgba(5,150,105,.25)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform='translateY(0)';
                        e.currentTarget.style.boxShadow='none';
                        e.currentTarget.style.borderColor= isDark ? 'rgba(255,255,255,.07)' : 'rgba(99,102,241,.1)';
                      }}
                    >
                      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ width:40,height:40,borderRadius:11,background:'rgba(52,211,153,.1)',border:'1px solid rgba(52,211,153,.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                          <ClipboardList size={18} color={isDark ? '#34D399' : '#059669'}/>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:14, fontWeight:700, color: isDark ? '#E8E9F4' : '#1A1B2E', marginBottom:5, letterSpacing:'-.01em' }}>{quiz.title}</p>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:11, color: isDark ? '#8B9EFF' : '#4F46E5', background: isDark ? 'rgba(139,158,255,.1)' : 'rgba(79,70,229,.08)', border: isDark ? '1px solid rgba(139,158,255,.15)' : '1px solid rgba(79,70,229,.2)', padding:'2px 8px', borderRadius:6, fontWeight:600 }}>{quiz.courseName}</span>
                            <span style={{ fontSize:11, color: isDark ? '#4E5268' : '#9CA3C0', display:'flex', alignItems:'center', gap:3, fontWeight:500 }}><Clock size={10}/> {quiz.questions?.length||0} câu</span>
                          </div>
                        </div>
                        <button onClick={()=>setSelectedQuiz(quiz)} style={{
                          display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10,
                          background:'linear-gradient(135deg,#4f46e5,#8b5cf6)', border:'none',
                          color:'#fff', cursor:'pointer', fontSize:12.5, fontWeight:600, fontFamily:'inherit',
                          flexShrink:0, boxShadow:'0 4px 16px rgba(99,102,241,.3)',
                          transition:'all .2s ease',
                        }}
                          onMouseOver={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(99,102,241,.45)'; }}
                          onMouseOut={e  => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(99,102,241,.3)'; }}
                        >
                          Bắt đầu <ChevronRight size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}