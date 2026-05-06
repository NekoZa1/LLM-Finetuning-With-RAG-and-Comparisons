import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2,
  GraduationCap, ArrowRight, Bot, BookOpen, Users, Sparkles
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

const ROLE_REDIRECT = { admin: '/admin', teacher: '/teacher', student: '/chat/1' };

const validate = (email, password) => {
  const e = {};
  if (!email.trim())                                   e.email    = 'Email không được để trống.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email    = 'Email không hợp lệ.';
  if (!password)                                       e.password = 'Mật khẩu không được để trống.';
  else if (password.length < 6)                        e.password = 'Tối thiểu 6 ký tự.';
  return e;
};

/* ── Input Field — fully theme-aware ── */
const Field = ({ label, id, type, name, icon, placeholder, value, error, touched, onChange, onBlur, suffix, isDark }) => {
  const [focused, setFocused] = useState(false);
  const hasErr = touched && error;
  const isOk   = touched && !error && value;

  const borderColor = hasErr ? 'rgba(248,113,113,.55)'
                    : isOk   ? 'rgba(52,211,153,.5)'
                    : focused ? (isDark ? 'rgba(139,158,255,.5)' : 'rgba(79,70,229,.5)')
                    : (isDark ? 'rgba(255,255,255,.09)' : 'rgba(99,102,241,.18)');

  const shadowColor = hasErr ? '0 0 0 3px rgba(248,113,113,.1)'
                    : isOk   ? '0 0 0 3px rgba(52,211,153,.1)'
                    : focused ? '0 0 0 3px rgba(99,102,241,.12)'
                    : 'none';

  const containerBg = isDark
    ? (focused ? 'rgba(22,24,40,.95)' : 'rgba(18,19,30,.85)')
    : (focused ? '#ffffff' : 'rgba(248,249,255,.9)');

  const iconColor = hasErr ? '#F87171'
                  : isOk   ? '#34D399'
                  : focused ? (isDark ? '#8B9EFF' : '#4F46E5')
                  : (isDark ? '#4E5268' : '#9CA3C0');

  // ── Fix: detect browser autofill via CSS animation trick ──
  const handleAnimationStart = (e) => {
    if (e.animationName === 'onAutoFillStart') {
      // Browser has autofilled this field — read real DOM value and sync React state
      const realValue = e.target.value;
      if (realValue !== undefined && realValue !== value) {
        onChange({ target: { name, value: realValue } });
      }
    }
  };

  return (
    <div>
      <label htmlFor={id} style={{
        display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: isDark ? 'rgba(139,147,176,.8)' : 'rgba(90,95,125,.85)',
        marginBottom: 7,
      }}>
        {label}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: containerBg,
        borderRadius: 12,
        border: `1px solid ${borderColor}`,
        boxShadow: shadowColor,
        transition: 'all .2s ease',
        backdropFilter: 'blur(12px)',
      }}>
        <span style={{
          paddingLeft: 13, color: iconColor,
          display: 'flex', flexShrink: 0, transition: 'color .2s ease',
        }}>
          {icon}
        </span>
        <input
          id={id} type={type} name={name} value={value}
          placeholder={placeholder} onChange={onChange}
          onBlur={(e) => { setFocused(false); onBlur(e); }}
          onFocus={() => setFocused(true)}
          onAnimationStart={handleAnimationStart}
          autoComplete={name === 'email' ? 'email' : 'current-password'}
          style={{
            flex: 1, padding: '12px 10px', fontSize: 14,
            color: isDark ? '#E8E9F4' : '#1A1B2E',
            background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'inherit', letterSpacing: '-.01em',
          }}
        />
        <span style={{ paddingRight: 11, display: 'flex', alignItems: 'center', flexShrink: 0, gap: 4 }}>
          {suffix}
          {!suffix && isOk   && <CheckCircle2 size={15} color="#34D399"/>}
          {!suffix && hasErr && <AlertCircle  size={15} color="#F87171"/>}
        </span>
      </div>
      {hasErr && (
        <p className="ag-fade-in" style={{
          marginTop: 5, fontSize: 12, color: '#F87171',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <AlertCircle size={11}/> {error}
        </p>
      )}
    </div>
  );
};

/* ── Feature row ── */
const Feature = ({ icon, label, color, isDark }) => {
  const lightColor = color === '#8B9EFF' ? '#4F46E5' : color === '#C084FC' ? '#7C3AED' : '#059669';
  const displayColor = isDark ? color : lightColor;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0' }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: `${displayColor}18`, border: `1px solid ${displayColor}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {React.cloneElement(icon, { size: 15, color: displayColor })}
      </div>
      <span style={{
        fontSize: 13,
        color: isDark ? 'rgba(139,147,176,.85)' : 'rgba(90,95,125,.8)',
        letterSpacing: '-.01em',
      }}>{label}</span>
    </div>
  );
};

/* ── Floating Orb ── */
const Orb = ({ size, top, left, right, bottom, color, duration, delay = 0 }) => (
  <div style={{
    position: 'absolute', width: size, height: size, borderRadius: '50%',
    background: color, filter: 'blur(60px)', top, left, right, bottom,
    pointerEvents: 'none',
    animation: `ag-glow-pulse ${duration}s ease-in-out ${delay}s infinite`,
    zIndex: 0,
  }}/>
);

/* ═══════════════════════════════════════ */
export default function LoginPage() {
  const navigate          = useNavigate();
  const location          = useLocation();
  const { user, loading } = useUser();
  const { isDark }        = useTheme();
  const from              = location.state?.from?.pathname;

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});
  const [gError,  setGError]  = useState('');
  const [busy,    setBusy]    = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (!loading && user)
      navigate(from ?? ROLE_REDIRECT[user.role] ?? '/dashboard', { replace: true });
  }, [user, loading]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({...p, [name]: value}));
    setGError('');
    if (touched[name]) {
      const errs = validate(name==='email'?value:form.email, name==='password'?value:form.password);
      setErrors(p => ({...p, [name]: errs[name]??''}));
    }
  };
  const onBlur = (e) => {
    const { name } = e.target;
    setTouched(p => ({...p, [name]: true}));
    setErrors(p => ({...p, [name]: validate(form.email, form.password)[name]??''}));
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const errs = validate(form.email, form.password);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true); setGError('');
    try {
      await new Promise(r => setTimeout(r, 900));
      let role = 'student';
      if (form.email.includes('admin'))   role = 'admin';
      if (form.email.includes('teacher')) role = 'teacher';
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('userRole', role);
      setSuccess(true);
      setTimeout(() => navigate(from??ROLE_REDIRECT[role]??'/dashboard', {replace:true}), 700);
    } catch(err) {
      setGError(err.message || 'Đăng nhập thất bại.');
    } finally { setBusy(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#0D0E14' : '#F4F5FF' }}>
      <div style={{
        width: 40, height: 40,
        border: `2px solid ${isDark ? 'rgba(255,255,255,.06)' : 'rgba(99,102,241,.15)'}`,
        borderTopColor: isDark ? '#8B9EFF' : '#4F46E5',
        borderRadius: '50%', animation: 'ag-spin 1s linear infinite',
      }}/>
    </div>
  );

  // ── Derived theme colors ──
  const pageBg = isDark
    ? 'linear-gradient(135deg, #0A0B14 0%, #0D0E1A 50%, #0B0C18 100%)'
    : 'linear-gradient(135deg, #EEF2FF 0%, #F4F5FF 50%, #F8F0FF 100%)';
  const gridColor = isDark ? 'rgba(139,158,255,.025)' : 'rgba(99,102,241,.06)';
  const leftPanelBorder = isDark ? '1px solid rgba(255,255,255,.05)' : '1px solid rgba(99,102,241,.1)';
  const cardBg = isDark ? 'rgba(14,15,24,.88)' : 'rgba(255,255,255,.96)';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(99,102,241,.15)';
  const cardShadow = isDark
    ? '0 32px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(139,158,255,.04)'
    : '0 32px 80px rgba(99,102,241,.1), 0 0 0 1px rgba(99,102,241,.07)';
  const panelBg = isDark ? 'rgba(18,19,30,.6)' : 'rgba(255,255,255,.7)';
  const panelBorder = isDark ? '1px solid rgba(255,255,255,.06)' : '1px solid rgba(99,102,241,.12)';
  const dividerLine = isDark ? 'rgba(255,255,255,.06)' : 'rgba(99,102,241,.1)';
  const chatBubbleBg = isDark ? 'rgba(24,25,40,.9)' : 'rgba(255,255,255,.95)';
  const chatBubbleBorder = isDark ? 'rgba(255,255,255,.07)' : 'rgba(99,102,241,.12)';
  const chatBubbleText = isDark ? '#E8E9F4' : '#1A1B2E';
  const toggleWrapBg = isDark ? 'rgba(18,19,30,.8)' : 'rgba(255,255,255,.9)';
  const toggleWrapBorder = isDark ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(99,102,241,.15)';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', overflow: 'hidden',
      background: pageBg,
      fontFamily: "'Inter', 'Outfit', sans-serif",
      position: 'relative',
    }}>
      {/* ── ThemeToggle — fixed top-right ── */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
        <div style={{
          background: toggleWrapBg,
          backdropFilter: 'blur(12px)',
          border: toggleWrapBorder,
          borderRadius: 99, padding: '4px 6px',
          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,.4)' : '0 4px 16px rgba(99,102,241,.12)',
          transition: 'all .3s ease',
        }}>
          <ThemeToggle size="sm"/>
        </div>
      </div>

      {/* ── Background Orbs ── */}
      <Orb size={700} top="-200px" left="-200px"
        color={isDark
          ? 'radial-gradient(circle, rgba(79,70,229,.22) 0%, transparent 65%)'
          : 'radial-gradient(circle, rgba(79,70,229,.12) 0%, transparent 65%)'}
        duration={18}/>
      <Orb size={500} bottom="-100px" right="-100px"
        color={isDark
          ? 'radial-gradient(circle, rgba(168,85,247,.18) 0%, transparent 65%)'
          : 'radial-gradient(circle, rgba(168,85,247,.12) 0%, transparent 65%)'}
        duration={22} delay={3}/>

      {/* ── Grid overlay ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
        backgroundSize: '48px 48px', pointerEvents: 'none',
      }}/>

      {/* ═══ LEFT PANEL ═══ */}
      <div style={{
        display: 'none', flexDirection: 'column', justifyContent: 'space-between',
        padding: '52px 56px',
        borderRight: leftPanelBorder,
        position: 'relative', zIndex: 1,
      }} className="login-left">
        <style>{`
          @media(min-width:900px){ .login-left{ display:flex; width:50%; } }
          @media(max-width:899px){ .login-mobile-brand{ display:flex !important; } }
        `}</style>

        {/* Logo */}
        <div className="ag-fade-up" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(99,102,241,.4)',
          }}>
            <GraduationCap size={19} color="#fff"/>
          </div>
          <span style={{
            fontSize: 16, fontWeight: 700, letterSpacing: '-.02em',
            color: isDark ? '#E8E9F4' : '#1A1B2E',
          }}>CourseAI</span>
        </div>

        {/* Center Content */}
        <div>
          <div className="ag-fade-up delay-1" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 22,
            padding: '5px 14px', borderRadius: 99,
            background: isDark ? 'rgba(139,158,255,.08)' : 'rgba(79,70,229,.08)',
            border: `1px solid ${isDark ? 'rgba(139,158,255,.18)' : 'rgba(79,70,229,.18)'}`,
            fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
            color: isDark ? '#8B9EFF' : '#4F46E5',
          }}>
            <Sparkles size={11}/> AI-Powered Learning
          </div>

          <h1 className="ag-fade-up delay-2" style={{
            fontSize: 'clamp(2rem,3vw,2.8rem)', fontWeight: 800,
            lineHeight: 1.1, letterSpacing: '-.03em', marginBottom: 16,
            color: isDark ? '#E8E9F4' : '#1A1B2E',
          }}>
            Trợ lý học tập<br/>
            <span style={{
              background: isDark
                ? 'linear-gradient(135deg, #8B9EFF 0%, #C084FC 50%, #F472B6 100%)'
                : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #DB2777 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              thông minh.
            </span>
          </h1>

          <p className="ag-fade-up delay-3" style={{
            fontSize: 14,
            color: isDark ? 'rgba(139,147,176,.75)' : 'rgba(90,95,125,.8)',
            lineHeight: 1.75, marginBottom: 36, maxWidth: 360,
          }}>
            Hỏi bất kỳ câu hỏi nào về bài giảng. AI sẽ trả lời ngay từ tài liệu của giảng viên, chính xác và tức thì.
          </p>

          {/* Chat preview */}
          <div className="ag-fade-up delay-4" style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(99,102,241,.35)',
              }}>
                <Bot size={14} color="#fff"/>
              </div>
              <div style={{
                background: chatBubbleBg,
                border: `1px solid ${chatBubbleBorder}`,
                borderRadius: '4px 14px 14px 14px',
                padding: '10px 14px', fontSize: 13,
                color: chatBubbleText,
                lineHeight: 1.55, maxWidth: 260,
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,.4)' : '0 4px 20px rgba(99,102,241,.08)',
              }}>
                Xin chào! Bạn cần ôn tập phần nào hôm nay? 📚
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <div style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(79,70,229,.2), rgba(139,92,246,.18))'
                  : 'linear-gradient(135deg, rgba(79,70,229,.12), rgba(139,92,246,.1))',
                border: '1px solid rgba(99,102,241,.25)',
                borderRadius: '14px 4px 14px 14px',
                padding: '10px 14px', fontSize: 13,
                color: chatBubbleText, lineHeight: 1.55, maxWidth: 220,
              }}>
                Giải thích về con trỏ trong C nhé!
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={14} color="#fff"/>
              </div>
              <div style={{
                background: chatBubbleBg,
                border: `1px solid ${chatBubbleBorder}`,
                borderRadius: '4px 14px 14px 14px',
                padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <div className="ag-typing-dot"/>
                <div className="ag-typing-dot"/>
                <div className="ag-typing-dot"/>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="ag-fade-up delay-5" style={{
            background: panelBg,
            border: panelBorder,
            borderRadius: 16, padding: '8px 16px',
            backdropFilter: 'blur(12px)',
          }}>
            <Feature icon={<Bot/>}      label="AI Chatbot từ tài liệu giảng viên" color="#8B9EFF" isDark={isDark}/>
            <div style={{ height: 1, background: dividerLine, margin: '2px 0' }}/>
            <Feature icon={<BookOpen/>} label="Quiz luyện tập thông minh"          color="#C084FC" isDark={isDark}/>
            <div style={{ height: 1, background: dividerLine, margin: '2px 0' }}/>
            <Feature icon={<Users/>}    label="Quản lý đa vai trò"                 color="#34D399" isDark={isDark}/>
          </div>
        </div>

        <p style={{ fontSize: 12, color: isDark ? 'rgba(78,82,104,.8)' : 'rgba(156,163,192,.9)', letterSpacing: '.03em' }}>
          © 2026 CourseAI — All rights reserved
        </p>
      </div>

      {/* ═══ RIGHT — Form ═══ */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', position: 'relative', zIndex: 1,
      }}>
        <div className="ag-fade-up" style={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile brand */}
          <div className="login-mobile-brand" style={{ display: 'none', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99,102,241,.4)',
            }}>
              <GraduationCap size={17} color="#fff"/>
            </div>
            <span style={{
              fontSize: 16, fontWeight: 700,
              background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>CourseAI</span>
          </div>

          {/* ── Form Card ── */}
          <div style={{
            background: cardBg,
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: cardBorder,
            borderRadius: 24, padding: '36px 32px',
            boxShadow: cardShadow,
            position: 'relative', overflow: 'hidden',
            transition: 'background .4s ease, border-color .4s ease, box-shadow .4s ease',
          }}>
            {/* Top highlight */}
            <div style={{
              position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(139,158,255,.4), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(99,102,241,.3), transparent)',
            }}/>
            {/* Subtle inner glow */}
            <div style={{
              position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
              width: 200, height: 120,
              background: isDark
                ? 'radial-gradient(ellipse, rgba(99,102,241,.12) 0%, transparent 70%)'
                : 'radial-gradient(ellipse, rgba(99,102,241,.05) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}/>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Header */}
              <div style={{ marginBottom: 28 }}>
                <h2 style={{
                  fontSize: 24, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 6,
                  color: isDark ? '#E8E9F4' : '#1A1B2E',
                }}>
                  Đăng nhập
                </h2>
                <p style={{
                  fontSize: 13.5, letterSpacing: '-.01em',
                  color: isDark ? 'rgba(139,147,176,.7)' : 'rgba(90,95,125,.75)',
                }}>
                  Chào mừng trở lại 👋
                </p>
              </div>

              {/* Global error */}
              {gError && (
                <div className="ag-fade-in" style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '11px 13px',
                  borderRadius: 12, marginBottom: 18,
                  background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.22)',
                  color: isDark ? '#F87171' : '#DC2626', fontSize: 13,
                }}>
                  <AlertCircle size={14} style={{flexShrink:0}}/> {gError}
                </div>
              )}
              {success && (
                <div className="ag-fade-in" style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '11px 13px',
                  borderRadius: 12, marginBottom: 18,
                  background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.22)',
                  color: isDark ? '#34D399' : '#059669', fontSize: 13, fontWeight: 500,
                }}>
                  <CheckCircle2 size={14} style={{flexShrink:0}}/> Đăng nhập thành công!
                </div>
              )}

              {/* <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field
                  label="Email" id="email" type="email" name="email"
                  icon={<Mail size={16}/>} placeholder="email@student.edu.vn"
                  value={form.email} error={errors.email} touched={touched.email}
                  onChange={onChange} onBlur={onBlur} isDark={isDark}
                />
                <Field
                  label="Mật khẩu" id="password" type={showPwd?'text':'password'} name="password"
                  icon={<Lock size={16}/>} placeholder="••••••••"
                  value={form.password} error={errors.password} touched={touched.password}
                  onChange={onChange} onBlur={onBlur} isDark={isDark}
                  suffix={
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowPwd(p => !p)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: isDark ? '#4E5268' : '#9CA3C0',
                        display: 'flex', padding: 4, borderRadius: 6, transition: 'color .15s',
                      }}
                      onMouseOver={e => e.currentTarget.style.color = isDark ? '#8B9EFF' : '#4F46E5'}
                      onMouseOut={e  => e.currentTarget.style.color = isDark ? '#4E5268' : '#9CA3C0'}
                    >
                      {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  }
                /> */}

                {/* Options row */}
                {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', userSelect: 'none' }}>
                    <input type="checkbox" style={{ accentColor: '#6366f1', width: 13, height: 13 }}/>
                    <span style={{ fontSize: 13, color: isDark ? 'rgba(139,147,176,.7)' : 'rgba(90,95,125,.75)' }}>Ghi nhớ</span>
                  </label>
                  <button type="button" onClick={() => navigate('/forgot-password')} style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    color: isDark ? '#8B9EFF' : '#4F46E5',
                    transition: 'color .15s, text-shadow .15s', fontFamily: 'inherit', letterSpacing: '-.01em',
                  }}
                    onMouseOver={e => { e.currentTarget.style.color = isDark ? '#C084FC' : '#7C3AED'; }}
                    onMouseOut={e  => { e.currentTarget.style.color = isDark ? '#8B9EFF' : '#4F46E5'; }}
                  >
                    Quên mật khẩu?
                  </button>
                </div> */}

                {/* Submit button */}
                {/* <button id="btn-login-submit" type="submit" disabled={busy||success}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '13px',
                    background: (busy || success)
                      ? 'rgba(99,102,241,.5)'
                      : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #8b5cf6 80%, #a855f7 100%)',
                    color: '#fff', border: 'none', borderRadius: 12,
                    cursor: (busy||success) ? 'not-allowed' : 'pointer',
                    fontSize: 14, fontWeight: 600, fontFamily: 'inherit', letterSpacing: '-.01em',
                    boxShadow: (busy||success) ? 'none' : '0 4px 24px rgba(99,102,241,.4)',
                    transition: 'all .25s ease',
                  }}
                  onMouseOver={e => { if (!busy && !success) { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(99,102,241,.55)'; }}}
                  onMouseOut={e  => { e.currentTarget.style.transform='translateY(0)'; if (!busy&&!success) e.currentTarget.style.boxShadow='0 4px 24px rgba(99,102,241,.4)'; }}
                >
                  {busy
                    ? <><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.25)',borderTopColor:'#fff',borderRadius:'50%',animation:'ag-spin 1s linear infinite' }}/> Đang xác thực…</>
                    : success ? <><CheckCircle2 size={16}/> Thành công!</>
                    : <>Đăng nhập <ArrowRight size={15}/></>
                  }
                </button>
              </form> */}

              {/* Divider */}
              {/* <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0' }}>
                <div style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,.07)' : 'rgba(99,102,241,.12)' }}/>
                <span style={{ fontSize: 11, color: isDark ? '#2E3048' : '#C8CCE0', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>hoặc</span>
                <div style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,.07)' : 'rgba(99,102,241,.12)' }}/>
              </div> */}

              {/* Google button */}
              <button type="button" onClick={() => window.location.href = authApi.getGoogleLoginUrl()}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '12px 16px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 500,
                  color: isDark ? 'rgba(139,147,176,.85)' : 'rgba(90,95,125,.85)',
                  background: isDark ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.8)',
                  border: isDark ? '1px solid rgba(255,255,255,.09)' : '1px solid rgba(99,102,241,.15)',
                  transition: 'all .2s ease', fontFamily: 'inherit', letterSpacing: '-.01em',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.07)' : 'rgba(238,242,255,.9)';
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.14)' : 'rgba(99,102,241,.3)';
                  e.currentTarget.style.color = isDark ? '#E8E9F4' : '#1A1B2E';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.8)';
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.09)' : 'rgba(99,102,241,.15)';
                  e.currentTarget.style.color = isDark ? 'rgba(139,147,176,.85)' : 'rgba(90,95,125,.85)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Tiếp tục với Google
              </button>

              {/* Dev hint */}
              <div style={{
                marginTop: 18, padding: '9px 13px', borderRadius: 10, textAlign: 'center',
                background: isDark ? 'rgba(139,158,255,.04)' : 'rgba(79,70,229,.04)',
                border: isDark ? '1px solid rgba(139,158,255,.08)' : '1px solid rgba(79,70,229,.1)',
              }}>
                <p style={{ fontSize: 11.5, color: isDark ? '#2E3048' : '#C8CCE0' }}>
                  Demo:{' '}
                  <code style={{
                    color: isDark ? '#8B9EFF' : '#4F46E5',
                    background: isDark ? 'rgba(139,158,255,.12)' : 'rgba(79,70,229,.1)',
                    padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace',
                    border: isDark ? '1px solid rgba(139,158,255,.15)' : '1px solid rgba(79,70,229,.15)',
                  }}>admin@</code>
                  {' · '}
                  <code style={{
                    color: isDark ? '#34D399' : '#059669',
                    background: isDark ? 'rgba(52,211,153,.1)' : 'rgba(5,150,105,.08)',
                    padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace',
                    border: isDark ? '1px solid rgba(52,211,153,.15)' : '1px solid rgba(5,150,105,.15)',
                  }}>teacher@</code>
                </p>
              </div>

              <p style={{ marginTop: 16, textAlign: 'center', fontSize: 11.5, color: isDark ? '#1E2030' : '#C8CCE0', letterSpacing: '.03em' }}>
                © 2026 CourseAI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
