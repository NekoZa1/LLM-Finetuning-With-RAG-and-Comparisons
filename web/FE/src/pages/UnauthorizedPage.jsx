import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft, Home, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

/* ── Floating Orb ── */
const Orb = ({ size, top, left, right, bottom, color, duration, delay = 0 }) => (
  <div style={{
    position: 'absolute', width: size, height: size, borderRadius: '50%',
    background: color, filter: 'blur(70px)', top, left, right, bottom,
    pointerEvents: 'none',
    animation: `ag-glow-pulse ${duration}s ease-in-out ${delay}s infinite`,
    zIndex: 0,
  }}/>
);

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const goBack = () => {
    const role = localStorage.getItem('userRole');
    if (role === 'admin')        navigate('/admin',     { replace: true });
    else if (role === 'teacher') navigate('/teacher',   { replace: true });
    else                         navigate('/dashboard', { replace: true });
  };

  const pageBg = isDark
    ? 'linear-gradient(135deg, #0A0B14 0%, #0D0E1A 50%, #0B0C18 100%)'
    : 'linear-gradient(135deg, #FFF1F2 0%, #FEF2F2 50%, #FFF7F7 100%)';
  const toggleWrapBg    = isDark ? 'rgba(18,19,30,.8)' : 'rgba(255,255,255,.9)';
  const toggleWrapBorder= isDark ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(220,38,38,.15)';
  const cardBg          = isDark ? 'rgba(14,15,24,.88)' : 'rgba(255,255,255,.96)';
  const cardBorder      = isDark ? '1px solid rgba(248,113,113,.15)' : '1px solid rgba(248,113,113,.2)';
  const cardShadow      = isDark
    ? '0 32px 80px rgba(0,0,0,.7), 0 0 60px rgba(248,113,113,.06)'
    : '0 32px 80px rgba(220,38,38,.08), 0 0 60px rgba(248,113,113,.08)';
  const gridColor       = isDark ? 'rgba(248,113,113,.02)' : 'rgba(220,38,38,.04)';
  const headingColor    = isDark ? '#E8E9F4' : '#1A1B2E';
  const bodyTextColor   = isDark ? 'rgba(139,147,176,.7)' : 'rgba(90,95,125,.75)';
  const badge403Color   = isDark ? '#F87171' : '#DC2626';
  const secondBtnBg     = isDark ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.8)';
  const secondBtnBorder = isDark ? '1px solid rgba(255,255,255,.09)' : '1px solid rgba(220,38,38,.12)';
  const secondBtnColor  = isDark ? 'rgba(139,147,176,.8)' : 'rgba(90,95,125,.8)';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: pageBg,
      fontFamily: "'Inter', 'Outfit', sans-serif",
      position: 'relative', overflow: 'hidden',
      transition: 'background .4s ease',
    }}>
      {/* ThemeToggle — fixed top-right */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
        <div style={{
          background: toggleWrapBg, backdropFilter: 'blur(12px)',
          border: toggleWrapBorder, borderRadius: 99, padding: '4px 6px',
          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,.4)' : '0 4px 16px rgba(220,38,38,.1)',
          transition: 'all .3s ease',
        }}>
          <ThemeToggle size="sm"/>
        </div>
      </div>

      {/* Background orbs */}
      <Orb size={500} top="-150px" left="-150px"
        color={isDark
          ? 'radial-gradient(circle, rgba(248,113,113,.12) 0%, transparent 65%)'
          : 'radial-gradient(circle, rgba(248,113,113,.15) 0%, transparent 65%)'}
        duration={18}/>
      <Orb size={400} bottom="-100px" right="-100px"
        color={isDark
          ? 'radial-gradient(circle, rgba(168,85,247,.1) 0%, transparent 65%)'
          : 'radial-gradient(circle, rgba(168,85,247,.1) 0%, transparent 65%)'}
        duration={22} delay={3}/>

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(${gridColor} 1px, transparent 1px),
          linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px', pointerEvents: 'none',
      }}/>

      {/* Card */}
      <div className="ag-fade-up" style={{
        position: 'relative', zIndex: 1,
        background: cardBg,
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: cardBorder,
        borderRadius: 24, padding: '44px 40px',
        maxWidth: 440, width: '100%', textAlign: 'center',
        boxShadow: cardShadow,
        margin: '0 16px', overflow: 'hidden',
        transition: 'background .4s ease, border-color .4s ease, box-shadow .4s ease',
      }}>
        {/* Top glow line */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(248,113,113,.5), transparent)',
        }}/>
        {/* Inner top glow */}
        <div style={{
          position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 120,
          background: 'radial-gradient(ellipse, rgba(248,113,113,.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Icon */}
          <div style={{
            width: 76, height: 76, borderRadius: 20, margin: '0 auto 24px',
            background: isDark ? 'rgba(248,113,113,.1)' : 'rgba(220,38,38,.08)',
            border: '1px solid rgba(248,113,113,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(248,113,113,.15)',
            position: 'relative',
          }}>
            <ShieldOff size={34} color={isDark ? '#F87171' : '#DC2626'}/>
            <div style={{
              position: 'absolute', inset: -6,
              borderRadius: 26, border: '1px solid rgba(248,113,113,.12)',
            }}/>
          </div>

          {/* 403 Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 99, marginBottom: 18,
            background: isDark ? 'rgba(248,113,113,.1)' : 'rgba(220,38,38,.08)',
            border: '1px solid rgba(248,113,113,.2)',
            fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase',
            color: badge403Color,
          }}>
            <Lock size={10}/> 403 — Không có quyền
          </div>

          <h1 style={{
            fontSize: 24, fontWeight: 800, letterSpacing: '-.03em',
            marginBottom: 12,
            color: headingColor,
          }}>
            Truy cập bị từ chối
          </h1>

          <p style={{
            fontSize: 14, color: bodyTextColor,
            lineHeight: 1.7, marginBottom: 32, letterSpacing: '-.01em',
          }}>
            Bạn không có quyền xem trang này. Vui lòng quay về trang phù hợp với vai trò của bạn.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Primary button */}
            <button onClick={goBack} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '13px 20px', borderRadius: 12,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, fontFamily: 'inherit', letterSpacing: '-.01em',
              boxShadow: '0 4px 24px rgba(99,102,241,.4)',
              transition: 'all .2s ease',
            }}
              onMouseOver={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(99,102,241,.5)'; }}
              onMouseOut={e  => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 24px rgba(99,102,241,.4)'; }}
            >
              <Home size={16}/> Về trang chính
            </button>

            {/* Secondary button */}
            <button onClick={() => navigate('/login')} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '13px 20px', borderRadius: 12,
              background: secondBtnBg,
              color: secondBtnColor,
              border: secondBtnBorder,
              cursor: 'pointer', fontSize: 14, fontWeight: 500,
              fontFamily: 'inherit', letterSpacing: '-.01em', transition: 'all .2s ease',
            }}
              onMouseOver={e => {
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.07)' : 'rgba(254,242,242,.9)';
                e.currentTarget.style.color = isDark ? '#E8E9F4' : '#1A1B2E';
                e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.14)' : 'rgba(248,113,113,.3)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = secondBtnBg;
                e.currentTarget.style.color = secondBtnColor;
                e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.09)' : 'rgba(220,38,38,.12)';
              }}
            >
              <ArrowLeft size={16}/> Đăng nhập lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
