import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, SendHorizonal, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

/* ── Orb ── */
const Orb = ({ size, top, left, right, bottom, color, duration, delay = 0 }) => (
  <div style={{
    position: 'absolute', width: size, height: size, borderRadius: '50%',
    background: color, filter: 'blur(70px)', top, left, right, bottom,
    pointerEvents: 'none',
    animation: `ag-glow-pulse ${duration}s ease-in-out ${delay}s infinite`,
    zIndex: 0,
  }}/>
);

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [email,       setEmail]       = useState('');
  const [touched,     setTouched]     = useState(false);
  const [focused,     setFocused]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [globalError, setGlobalError] = useState('');

  const emailError = touched && !email.trim()
    ? 'Email không được để trống.'
    : touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? 'Địa chỉ email không hợp lệ.'
    : '';
  const isValid = touched && !emailError && email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (emailError || !email) return;
    setSubmitting(true); setGlobalError('');
    try {
      const res = await fetch('http://localhost:8000/auth/password-reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSubmitted(true);
      else {
        const d = await res.json();
        setGlobalError(d.error || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch { setGlobalError('Không thể kết nối tới máy chủ. Thử lại sau.'); }
    finally { setSubmitting(false); }
  };

  // ── Derived theme values ──
  const pageBg = isDark
    ? 'linear-gradient(135deg, #0A0B14 0%, #0D0E1A 50%, #0B0C18 100%)'
    : 'linear-gradient(135deg, #EEF2FF 0%, #F4F5FF 50%, #F8F0FF 100%)';
  const gridColor       = isDark ? 'rgba(139,158,255,.025)' : 'rgba(99,102,241,.06)';
  const toggleWrapBg    = isDark ? 'rgba(18,19,30,.8)' : 'rgba(255,255,255,.9)';
  const toggleWrapBorder= isDark ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(99,102,241,.15)';
  const cardBg          = isDark ? 'rgba(14,15,24,.88)' : 'rgba(255,255,255,.96)';
  const cardBorder      = isDark ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(99,102,241,.15)';
  const cardShadow      = isDark
    ? '0 32px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(139,158,255,.04)'
    : '0 32px 80px rgba(99,102,241,.1), 0 0 0 1px rgba(99,102,241,.07)';
  const headingColor    = isDark ? '#E8E9F4' : '#1A1B2E';
  const bodyColor       = isDark ? 'rgba(139,147,176,.65)' : 'rgba(90,95,125,.75)';
  const labelColor      = isDark ? 'rgba(139,147,176,.8)' : 'rgba(90,95,125,.85)';
  const backBtnColor    = isDark ? 'rgba(139,147,176,.7)' : 'rgba(90,95,125,.7)';
  const backBtnBg       = isDark ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.7)';
  const backBtnBorder   = isDark ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(99,102,241,.12)';

  // Input field colors
  const inputBorderColor = emailError ? 'rgba(248,113,113,.55)'
                         : isValid    ? 'rgba(52,211,153,.5)'
                         : focused    ? (isDark ? 'rgba(139,158,255,.5)' : 'rgba(79,70,229,.5)')
                         : (isDark ? 'rgba(255,255,255,.09)' : 'rgba(99,102,241,.18)');
  const inputShadow = emailError ? '0 0 0 3px rgba(248,113,113,.1)'
                    : isValid    ? '0 0 0 3px rgba(52,211,153,.1)'
                    : focused    ? '0 0 0 3px rgba(99,102,241,.12)'
                    : 'none';
  const inputBg     = isDark
    ? (focused ? 'rgba(22,24,40,.95)' : 'rgba(18,19,30,.85)')
    : (focused ? '#ffffff' : 'rgba(248,249,255,.9)');
  const inputIconColor = emailError ? '#F87171' : isValid ? '#34D399' : focused ? (isDark ? '#8B9EFF' : '#4F46E5') : (isDark ? '#4E5268' : '#9CA3C0');
  const inputTextColor = isDark ? '#E8E9F4' : '#1A1B2E';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: pageBg,
      fontFamily: "'Inter', 'Outfit', sans-serif",
      padding: 16, position: 'relative', overflow: 'hidden',
      transition: 'background .4s ease',
    }}>
      {/* ThemeToggle — fixed top-right */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
        <div style={{
          background: toggleWrapBg, backdropFilter: 'blur(12px)',
          border: toggleWrapBorder, borderRadius: 99, padding: '4px 6px',
          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,.4)' : '0 4px 16px rgba(99,102,241,.12)',
          transition: 'all .3s ease',
        }}>
          <ThemeToggle size="sm"/>
        </div>
      </div>

      {/* Background orbs */}
      <Orb size={600} top="-200px" left="-200px"
        color={isDark
          ? 'radial-gradient(circle, rgba(79,70,229,.18) 0%, transparent 65%)'
          : 'radial-gradient(circle, rgba(79,70,229,.1) 0%, transparent 65%)'}
        duration={20}/>
      <Orb size={400} bottom="-100px" right="-100px"
        color={isDark
          ? 'radial-gradient(circle, rgba(168,85,247,.14) 0%, transparent 65%)'
          : 'radial-gradient(circle, rgba(168,85,247,.1) 0%, transparent 65%)'}
        duration={24} delay={4}/>

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
        backgroundSize: '48px 48px', pointerEvents: 'none',
      }}/>

      {/* Card */}
      <div className="ag-fade-up" style={{
        position: 'relative', zIndex: 1,
        background: cardBg,
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: cardBorder, borderRadius: 24, padding: '36px 32px',
        maxWidth: 420, width: '100%',
        boxShadow: cardShadow, overflow: 'hidden',
        transition: 'background .4s ease, border-color .4s ease, box-shadow .4s ease',
      }}>
        {/* Top highlight */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(139,158,255,.4), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(99,102,241,.25), transparent)',
        }}/>
        {/* Inner glow */}
        <div style={{
          position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 120,
          background: isDark
            ? 'radial-gradient(ellipse, rgba(99,102,241,.1) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(99,102,241,.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Back button */}
          <button onClick={() => navigate('/login')} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: backBtnBg, border: backBtnBorder,
            cursor: 'pointer', color: backBtnColor,
            fontSize: 12.5, fontWeight: 600, marginBottom: 28,
            transition: 'all .15s', fontFamily: 'inherit', letterSpacing: '-.01em',
            padding: '6px 12px', borderRadius: 9,
          }}
            onMouseOver={e => { e.currentTarget.style.color = isDark ? '#8B9EFF' : '#4F46E5'; e.currentTarget.style.background = isDark ? 'rgba(139,158,255,.08)' : 'rgba(238,242,255,.9)'; e.currentTarget.style.borderColor = isDark ? 'rgba(139,158,255,.2)' : 'rgba(79,70,229,.2)'; }}
            onMouseOut={e  => { e.currentTarget.style.color = backBtnColor; e.currentTarget.style.background = backBtnBg; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.12)'; }}
          >
            <ArrowLeft size={14}/> Quay lại đăng nhập
          </button>

          {!submitted ? (
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 18, margin: '0 auto 20px',
                  background: isDark ? 'linear-gradient(135deg, rgba(79,70,229,.25), rgba(139,92,246,.2))' : 'rgba(79,70,229,.08)',
                  border: isDark ? '1px solid rgba(139,158,255,.25)' : '1px solid rgba(99,102,241,.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isDark ? '0 0 40px rgba(99,102,241,.2)' : '0 0 24px rgba(99,102,241,.12)',
                  position: 'relative',
                }}>
                  <KeyRound size={26} color={isDark ? '#8B9EFF' : '#4F46E5'}/>
                  <div style={{ position: 'absolute', inset: -6, borderRadius: 24, border: `1px solid ${isDark ? 'rgba(139,158,255,.1)' : 'rgba(99,102,241,.1)'}` }}/>
                </div>
                <h1 style={{
                  fontSize: 22, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 10,
                  color: headingColor,
                }}>
                  Đặt lại mật khẩu
                </h1>
                <p style={{ fontSize: 13.5, color: bodyColor, lineHeight: 1.7, letterSpacing: '-.01em' }}>
                  Nhập email đăng ký và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                </p>
              </div>

              {/* Error */}
              {globalError && (
                <div className="ag-fade-in" style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '11px 13px',
                  borderRadius: 12, marginBottom: 18, fontSize: 13,
                  background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.22)',
                  color: isDark ? '#F87171' : '#DC2626',
                }}>
                  <AlertCircle size={14} style={{flexShrink:0}}/> {globalError}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label htmlFor="fp-email" style={{
                    display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.06em',
                    textTransform: 'uppercase', color: labelColor, marginBottom: 7,
                  }}>
                    Địa chỉ email
                  </label>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    background: inputBg, borderRadius: 12,
                    border: `1px solid ${inputBorderColor}`,
                    boxShadow: inputShadow,
                    transition: 'all .2s ease', backdropFilter: 'blur(12px)',
                  }}>
                    <span style={{ paddingLeft: 13, color: inputIconColor, display: 'flex', flexShrink: 0, transition: 'color .2s ease' }}>
                      <Mail size={16}/>
                    </span>
                    <input
                      id="fp-email" type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setGlobalError(''); }}
                      onBlur={() => { setTouched(true); setFocused(false); }}
                      onFocus={() => setFocused(true)}
                      placeholder="email@student.edu.vn"
                      autoComplete="email"
                      style={{
                        flex: 1, padding: '12px 10px', fontSize: 14,
                        color: inputTextColor,
                        background: 'transparent', border: 'none', outline: 'none',
                        fontFamily: 'inherit', letterSpacing: '-.01em',
                      }}
                    />
                    <span style={{ paddingRight: 12, display: 'flex' }}>
                      {isValid    && <CheckCircle2 size={15} color="#34D399"/>}
                      {emailError && <AlertCircle  size={15} color="#F87171"/>}
                    </span>
                  </div>
                  {emailError && (
                    <p className="ag-fade-in" style={{ marginTop: 5, fontSize: 12, color: isDark ? '#F87171' : '#DC2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertCircle size={11}/> {emailError}
                    </p>
                  )}
                </div>

                <button id="btn-forgot-submit" type="submit" disabled={submitting}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px', fontSize: 14, borderRadius: 12, width: '100%',
                    background: submitting ? 'rgba(99,102,241,.5)' : 'linear-gradient(135deg, #4f46e5, #6366f1, #8b5cf6)',
                    color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', fontWeight: 600, letterSpacing: '-.01em',
                    boxShadow: submitting ? 'none' : '0 4px 24px rgba(99,102,241,.4)',
                    transition: 'all .25s ease',
                  }}
                  onMouseOver={e => { if (!submitting) { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(99,102,241,.5)'; }}}
                  onMouseOut={e  => { e.currentTarget.style.transform='translateY(0)'; if (!submitting) e.currentTarget.style.boxShadow='0 4px 24px rgba(99,102,241,.4)'; }}
                >
                  {submitting
                    ? <><Loader2 size={16} style={{ animation: 'ag-spin 1s linear infinite' }}/> Đang gửi...</>
                    : <><SendHorizonal size={16}/> Gửi hướng dẫn</>
                  }
                </button>
              </form>
            </>
          ) : (
            /* ── Success state ── */
            <div className="ag-fade-up" style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20, margin: '0 auto 24px',
                background: isDark ? 'rgba(52,211,153,.1)' : 'rgba(5,150,105,.08)',
                border: '1px solid rgba(52,211,153,.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(52,211,153,.15)',
                position: 'relative',
              }}>
                <CheckCircle2 size={32} color={isDark ? '#34D399' : '#059669'}/>
                <div style={{ position: 'absolute', inset: -6, borderRadius: 26, border: '1px solid rgba(52,211,153,.1)' }}/>
              </div>

              <h2 style={{
                fontSize: 21, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 12,
                color: headingColor,
              }}>
                Email đã được gửi!
              </h2>

              <div style={{
                background: isDark ? 'rgba(52,211,153,.05)' : 'rgba(5,150,105,.05)',
                border: isDark ? '1px solid rgba(52,211,153,.12)' : '1px solid rgba(5,150,105,.15)',
                borderRadius: 12, padding: '14px 16px', marginBottom: 28,
              }}>
                <p style={{ fontSize: 13.5, color: bodyColor, lineHeight: 1.7, letterSpacing: '-.01em' }}>
                  Kiểm tra hộp thư của{' '}
                  <strong style={{ color: isDark ? '#34D399' : '#059669', fontWeight: 700 }}>{email}</strong>.
                  Link đặt lại mật khẩu có hiệu lực trong{' '}
                  <strong style={{ color: isDark ? '#8B9EFF' : '#4F46E5', fontWeight: 700 }}>15 phút</strong>.
                </p>
              </div>

              <button onClick={() => navigate('/login')} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '13px', fontSize: 14, borderRadius: 12,
                background: backBtnBg, color: backBtnColor,
                border: backBtnBorder, cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 500, letterSpacing: '-.01em',
                transition: 'all .15s',
              }}
                onMouseOver={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.07)' : 'rgba(238,242,255,.9)'; e.currentTarget.style.color = isDark ? '#E8E9F4' : '#1A1B2E'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.14)' : 'rgba(99,102,241,.25)'; }}
                onMouseOut={e  => { e.currentTarget.style.background = backBtnBg; e.currentTarget.style.color = backBtnColor; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.12)'; }}
              >
                <ArrowLeft size={15}/> Về trang đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;