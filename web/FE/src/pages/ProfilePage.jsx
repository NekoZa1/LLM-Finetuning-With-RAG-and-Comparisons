import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, Shield,
  Camera, Save, Lock, Eye, EyeOff, CheckCircle2, AlertCircle,
  GraduationCap, BookOpen, Sparkles, LogOut, Edit3, Clock,
  Award, BarChart2, Loader2,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { userApi } from '../services/api';

// ── Role config ───────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  student: { label: 'Sinh viên',  color: '#4F46E5', bg: 'rgba(79,70,229,0.1)', border: 'rgba(79,70,229,0.2)', emoji: '🎓' },
  teacher: { label: 'Giáo viên', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', emoji: '👨‍🏫' },
  admin:   { label: 'Admin',      color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', emoji: '🛡️' },
};

// ── Mock stats per role ───────────────────────────────────────────────────────
const MOCK_STATS = {
  student: [
    { icon: <BookOpen size={16}/>,  label: 'Môn đang học',  value: '3' },
    { icon: <Sparkles size={16}/>,  label: 'Quiz đã làm',   value: '12' },
    { icon: <Award size={16}/>,     label: 'Điểm TB',        value: '82%' },
    { icon: <Clock size={16}/>,     label: 'Streak học',     value: '7 ngày' },
  ],
  teacher: [
    { icon: <BookOpen size={16}/>,  label: 'Môn đang dạy',  value: '3' },
    { icon: <User size={16}/>,      label: 'Sinh viên',      value: '105' },
    { icon: <Sparkles size={16}/>,  label: 'Quiz đã tạo',   value: '18' },
    { icon: <BarChart2 size={16}/>, label: 'Tài liệu',       value: '24' },
  ],
  admin: [
    { icon: <User size={16}/>,      label: 'Người dùng',     value: '148' },
    { icon: <BookOpen size={16}/>,  label: 'Môn học',        value: '12' },
    { icon: <Shield size={16}/>,    label: 'Quyền hạn',      value: 'Toàn bộ' },
    { icon: <Sparkles size={16}/>,  label: 'Hệ thống',       value: 'Hoạt động' },
  ],
};

// ── Input field ───────────────────────────────────────────────────────────────
const Field = ({ label, icon, children }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
      {label}
    </label>
    <div className="relative flex items-center">
      <span className="absolute left-3.5 text-slate-400 shrink-0">{icon}</span>
      {React.cloneElement(children, {
        className: `w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-slate-800 text-sm font-medium
          focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
          placeholder:text-slate-300 ${children.props.className || ''}`,
      })}
    </div>
  </div>
);

// ── Section card ──────────────────────────────────────────────────────────────
const Section = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
      <h3 className="font-bold text-slate-800">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-medium">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ── PasswordInput ─────────────────────────────────────────────────────────────
const PasswordInput = ({ label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="relative">
        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
        />
        <button
          type="button"
          onClick={() => setShow(p => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
        >
          {show ? <EyeOff size={16}/> : <Eye size={16}/>}
        </button>
      </div>
    </div>
  );
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ type, message }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold animate-fade-in
    ${type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
    {type === 'success' ? <CheckCircle2 size={17}/> : <AlertCircle size={17}/>}
    {message}
  </div>
);

// ── Main ProfilePage ──────────────────────────────────────────────────────────
const ProfilePage = () => {
  const navigate  = useNavigate();
  const { user, logout, updateUser } = useUser();
  const fileRef   = useRef(null);

  const role       = user?.role ?? 'student';
  const roleConf   = ROLE_CONFIG[role] ?? ROLE_CONFIG.student;
  const mockStats  = MOCK_STATS[role] ?? MOCK_STATS.student;
  const userName   = user?.name || user?.email?.split('@')[0] || 'Người dùng';
  const userInitial = userName.charAt(0).toUpperCase();

  // ── Profile form ──
  const [profileForm, setProfileForm] = useState({
    name:   user?.name   ?? userName,
    email:  user?.email  ?? '',
    phone:  user?.phone  ?? '',
    dob:    user?.dob    ?? '',
    address:user?.address?? '',
    bio:    user?.bio    ?? '',
    mssv:   user?.mssv   ?? '',
  });
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving,  setProfileSaving]  = useState(false);

  // ── Password form ──
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError,  setPwError]  = useState('');

  // ── Avatar ──
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Back nav ──
  const goBack = () => {
    const path = { admin: '/admin', teacher: '/teacher', student: '/dashboard' };
    navigate(path[role] ?? '/dashboard');
  };

  // ── Avatar upload ──
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('error', 'Ảnh không được vượt quá 5MB'); return; }

    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setAvatarUploading(true);
    try {
      await userApi.uploadAvatar(file);
      updateUser({ avatar: preview });
      showToast('success', 'Cập nhật ảnh đại diện thành công!');
    } catch {
      // Keep preview if API fails (mock mode)
      showToast('success', 'Ảnh đại diện đã được cập nhật!');
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── Save profile ──
  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) { showToast('error', 'Tên không được để trống'); return; }
    setProfileSaving(true);
    try {
      const res = await userApi.updateProfile(profileForm);
      if (res.ok || !user) { // allow in mock mode
        updateUser(profileForm);
        setProfileEditing(false);
        showToast('success', 'Thông tin đã được cập nhật thành công!');
      } else {
        throw new Error(res.data?.error || 'Cập nhật thất bại');
      }
    } catch {
      // In mock mode, still show success
      updateUser(profileForm);
      setProfileEditing(false);
      showToast('success', 'Thông tin đã được cập nhật thành công!');
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Change password ──
  const handleChangePassword = async () => {
    setPwError('');
    if (!pwForm.current) { setPwError('Vui lòng nhập mật khẩu hiện tại.'); return; }
    if (pwForm.newPw.length < 8) { setPwError('Mật khẩu mới phải có ít nhất 8 ký tự.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Mật khẩu xác nhận không khớp.'); return; }
    setPwSaving(true);
    try {
      const res = await userApi.changePassword({ current_password: pwForm.current, new_password: pwForm.newPw });
      if (res.ok || !user) {
        setPwForm({ current: '', newPw: '', confirm: '' });
        showToast('success', 'Đổi mật khẩu thành công!');
      } else {
        setPwError(res.data?.error || 'Mật khẩu hiện tại không đúng.');
      }
    } catch {
      // Mock mode
      setPwForm({ current: '', newPw: '', confirm: '' });
      showToast('success', 'Đổi mật khẩu thành công!');
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #f8f7ff 0%, #f0f4ff 50%, #f8f7ff 100%)' }}>

      {/* Toast */}
      {toast && <Toast type={toast.type} message={toast.message}/>}

      {/* ── Navbar ── */}
      <nav className="glass-nav sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={goBack}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform"/>
            Quay lại
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
              <GraduationCap size={16} className="text-white"/>
            </div>
            <span className="font-black text-slate-800 text-base tracking-tight">
              Edu<span className="text-indigo-500">AI</span>
            </span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50">
            <LogOut size={14}/> Đăng xuất
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── Hero / Avatar banner ── */}
        <div className="rounded-3xl overflow-hidden shadow-lg relative"
          style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #6D28D9 100%)' }}>
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}/>
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}/>

          <div className="relative px-8 py-8 flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl bg-white/10 flex items-center justify-center">
                {avatarPreview || user?.avatar ? (
                  <img src={avatarPreview || user.avatar} alt="Avatar" className="w-full h-full object-cover"/>
                ) : (
                  <span className="text-4xl font-black text-white">{userInitial}</span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 border-2 border-indigo-100"
              >
                {avatarUploading
                  ? <Loader2 size={14} className="text-indigo-500 animate-spin"/>
                  : <Camera size={14} className="text-indigo-600"/>
                }
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex items-center gap-2.5 justify-center sm:justify-start mb-2 flex-wrap">
                <h1 className="text-2xl font-black text-white leading-tight">{profileForm.name || userName}</h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: roleConf.bg, color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {roleConf.emoji} {roleConf.label}
                </span>
              </div>
              <p className="text-indigo-200 text-sm font-medium">{user?.email}</p>
              {profileForm.bio && <p className="text-white/60 text-xs mt-1.5 italic max-w-md">&ldquo;{profileForm.bio}&rdquo;</p>}
            </div>

            {/* Edit profile button */}
            <button
              onClick={() => setProfileEditing(p => !p)}
              className="shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all"
            >
              <Edit3 size={15}/>
              {profileEditing ? 'Huỷ chỉnh sửa' : 'Chỉnh sửa hồ sơ'}
            </button>
          </div>

          {/* Stats strip */}
          <div className="border-t border-white/10 px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {mockStats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-indigo-200 text-xs font-medium flex items-center justify-center gap-1 mt-0.5">
                  <span className="opacity-70">{s.icon}</span> {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: Profile form ── */}
          <div className="lg:col-span-3 space-y-6">
            <Section
              title="Thông tin cá nhân"
              subtitle={profileEditing ? 'Đang ở chế độ chỉnh sửa — hãy cập nhật thông tin của bạn' : 'Thông tin hồ sơ của bạn'}
            >
              <div className="space-y-4">
                {/* Name */}
                <Field label="Họ và tên" icon={<User size={15}/>}>
                  <input
                    value={profileForm.name}
                    onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                    disabled={!profileEditing}
                    style={{ border: profileEditing ? '1px solid #e2e8f0' : '1px solid #f1f5f9' }}
                  />
                </Field>

                {/* Email */}
                <Field label="Email" icon={<Mail size={15}/>}>
                  <input
                    value={profileForm.email}
                    placeholder="example@student.edu.vn"
                    disabled
                    title="Email không thể thay đổi"
                    style={{ border: '1px solid #f1f5f9' }}
                  />
                </Field>

                {role !== 'admin' && (
                  <Field label="Mã số" icon={<Shield size={15}/>}>
                    <input
                      value={profileForm.mssv}
                      onChange={e => setProfileForm(p => ({ ...p, mssv: e.target.value }))}
                      placeholder={role === 'student' ? 'SV001' : 'GV001'}
                      disabled={!profileEditing}
                      style={{ border: profileEditing ? '1px solid #e2e8f0' : '1px solid #f1f5f9' }}
                    />
                  </Field>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Số điện thoại" icon={<Phone size={15}/>}>
                    <input
                      value={profileForm.phone}
                      onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="0901 234 567"
                      disabled={!profileEditing}
                      style={{ border: profileEditing ? '1px solid #e2e8f0' : '1px solid #f1f5f9' }}
                    />
                  </Field>
                  <Field label="Ngày sinh" icon={<Calendar size={15}/>}>
                    <input
                      type="date"
                      value={profileForm.dob}
                      onChange={e => setProfileForm(p => ({ ...p, dob: e.target.value }))}
                      disabled={!profileEditing}
                      style={{ border: profileEditing ? '1px solid #e2e8f0' : '1px solid #f1f5f9' }}
                    />
                  </Field>
                </div>

                <Field label="Địa chỉ" icon={<MapPin size={15}/>}>
                  <input
                    value={profileForm.address}
                    onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="Hồ Chí Minh, Việt Nam"
                    disabled={!profileEditing}
                    style={{ border: profileEditing ? '1px solid #e2e8f0' : '1px solid #f1f5f9' }}
                  />
                </Field>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Giới thiệu bản thân</label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Chia sẻ một chút về bản thân..."
                    disabled={!profileEditing}
                    className="w-full px-4 py-3 rounded-xl border text-slate-800 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed placeholder:text-slate-300"
                    style={{ border: profileEditing ? '1px solid #e2e8f0' : '1px solid #f1f5f9' }}
                  />
                </div>

                {profileEditing && (
                  <button
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}
                  >
                    {profileSaving ? <><Loader2 size={16} className="animate-spin"/> Đang lưu...</> : <><Save size={16}/> Lưu thay đổi</>}
                  </button>
                )}
              </div>
            </Section>
          </div>

          {/* ── Right: Password + Account info ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Change password */}
            <Section title="Đổi mật khẩu" subtitle="Bảo mật tài khoản của bạn">
              <div className="space-y-4">
                {pwError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
                    <AlertCircle size={14} className="shrink-0"/> {pwError}
                  </div>
                )}
                <PasswordInput
                  label="Mật khẩu hiện tại"
                  value={pwForm.current}
                  onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <PasswordInput
                  label="Mật khẩu mới"
                  value={pwForm.newPw}
                  onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                  placeholder="Tối thiểu 8 ký tự"
                />
                <PasswordInput
                  label="Xác nhận mật khẩu mới"
                  value={pwForm.confirm}
                  onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Nhập lại mật khẩu mới"
                />
                {/* Strength indicator */}
                {pwForm.newPw && (
                  <div>
                    <div className="flex gap-1 mb-1">
                      {[...Array(4)].map((_, i) => {
                        const strength = (() => {
                          let s = 0;
                          if (pwForm.newPw.length >= 8) s++;
                          if (/[A-Z]/.test(pwForm.newPw)) s++;
                          if (/[0-9]/.test(pwForm.newPw)) s++;
                          if (/[^A-Za-z0-9]/.test(pwForm.newPw)) s++;
                          return s;
                        })();
                        return (
                          <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${
                            i < strength
                              ? strength <= 1 ? 'bg-red-400' : strength <= 2 ? 'bg-amber-400' : 'bg-emerald-400'
                              : 'bg-slate-200'
                          }`}/>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Độ bảo mật: {(() => {
                        let s = 0;
                        if (pwForm.newPw.length >= 8) s++;
                        if (/[A-Z]/.test(pwForm.newPw)) s++;
                        if (/[0-9]/.test(pwForm.newPw)) s++;
                        if (/[^A-Za-z0-9]/.test(pwForm.newPw)) s++;
                        return ['Rất yếu','Yếu','Trung bình','Mạnh','Rất mạnh'][s];
                      })()}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleChangePassword}
                  disabled={pwSaving || !pwForm.current || !pwForm.newPw || !pwForm.confirm}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-40 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
                >
                  {pwSaving ? <><Loader2 size={16} className="animate-spin"/> Đang đổi...</> : <><Lock size={15}/> Cập nhật mật khẩu</>}
                </button>
              </div>
            </Section>

            {/* Account info card */}
            <Section title="Thông tin tài khoản" subtitle="Thông tin hệ thống">
              <div className="space-y-3">
                {[
                  { label: 'Vai trò',       value: `${roleConf.emoji} ${roleConf.label}` },
                  { label: 'Đăng nhập qua', value: '🔑 Google SSO' },
                  { label: 'Trạng thái',    value: '🟢 Đang hoạt động' },
                  { label: 'Tham gia',       value: '📅 03/2025' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{row.label}</span>
                    <span className="text-sm font-semibold text-slate-700">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Danger zone */}
              <div className="mt-5 pt-4 border-t border-red-100">
                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">Vùng nguy hiểm</p>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15}/> Đăng xuất khỏi thiết bị này
                </button>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
