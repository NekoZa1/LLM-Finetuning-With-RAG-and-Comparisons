import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeToggle — Premium animated sun/moon toggle button
 *
 * Props:
 *   size?: 'sm' | 'md' | 'lg'   (default: 'md')
 *   showLabel?: boolean          (default: false)
 */
export default function ThemeToggle({ size = 'md', showLabel = false }) {
  const { theme, toggleTheme, isDark } = useTheme();

  const dims = {
    sm: { btn: 30, icon: 14, track: { w: 44, h: 24, r: 12 }, thumb: 18 },
    md: { btn: 36, icon: 16, track: { w: 52, h: 28, r: 14 }, thumb: 22 },
    lg: { btn: 42, icon: 18, track: { w: 60, h: 32, r: 16 }, thumb: 26 },
  }[size];

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
      aria-label="Toggle theme"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: 99,
        fontFamily: 'inherit',
      }}
    >
      {/* Toggle track */}
      <div style={{
        position: 'relative',
        width: dims.track.w,
        height: dims.track.h,
        borderRadius: dims.track.r,
        border: isDark
          ? '1px solid rgba(139,158,255,.25)'
          : '1px solid rgba(234,179,8,.3)',
        background: isDark
          ? 'linear-gradient(135deg, rgba(79,70,229,.3), rgba(139,92,246,.2))'
          : 'linear-gradient(135deg, rgba(234,179,8,.25), rgba(251,146,60,.2))',
        transition: 'all .3s cubic-bezier(.4,0,.2,1)',
        boxShadow: isDark
          ? '0 0 12px rgba(99,102,241,.2), inset 0 1px 0 rgba(255,255,255,.05)'
          : '0 0 12px rgba(234,179,8,.2), inset 0 1px 0 rgba(255,255,255,.3)',
        flexShrink: 0,
      }}>
        {/* Thumb */}
        <div style={{
          position: 'absolute',
          top: '50%',
          transform: `translateY(-50%) translateX(${isDark ? dims.track.w - dims.thumb - 4 : 3}px)`,
          width: dims.thumb,
          height: dims.thumb,
          borderRadius: '50%',
          background: isDark
            ? 'linear-gradient(135deg, #8B9EFF, #C084FC)'
            : 'linear-gradient(135deg, #FCD34D, #F97316)',
          boxShadow: isDark
            ? '0 0 8px rgba(139,158,255,.6), 0 2px 6px rgba(0,0,0,.4)'
            : '0 0 8px rgba(252,211,77,.7), 0 2px 6px rgba(0,0,0,.2)',
          transition: 'all .35s cubic-bezier(.34,1.56,.64,1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {/* Icon inside thumb */}
          <div style={{
            transition: 'transform .35s cubic-bezier(.34,1.56,.64,1), opacity .25s',
            transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)',
            opacity: 1,
            display: 'flex',
          }}>
            {isDark
              ? <Moon size={dims.thumb * 0.55} color="white" strokeWidth={2.5}/>
              : <Sun  size={dims.thumb * 0.55} color="white" strokeWidth={2.5}/>
            }
          </div>
        </div>

        {/* Background stars (dark) / rays (light) */}
        {isDark && (
          <>
            <div style={{ position: 'absolute', left: 7, top: 5, width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,.6)' }}/>
            <div style={{ position: 'absolute', left: 13, top: 10, width: 1.5, height: 1.5, borderRadius: '50%', background: 'rgba(255,255,255,.4)' }}/>
            <div style={{ position: 'absolute', left: 9, top: 16, width: 1, height: 1, borderRadius: '50%', background: 'rgba(255,255,255,.3)' }}/>
          </>
        )}
      </div>

      {/* Optional label */}
      {showLabel && (
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '.02em',
          color: isDark ? 'rgba(139,147,176,.8)' : 'rgba(100,110,130,.9)',
          transition: 'color .3s',
          userSelect: 'none',
        }}>
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}
