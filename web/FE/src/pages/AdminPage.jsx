import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, UserPlus, Upload, Trash2, Edit2, Check, X,
  Plus, Search, LogOut, FileSpreadsheet, ShieldCheck, GraduationCap,
  LayoutDashboard, Settings
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const INIT_USERS = [
  { id:1, name:'Nguyễn Văn A',  email:'student1@uni.edu.vn', role:'student'  },
  { id:2, name:'Trần Thị B',    email:'student2@uni.edu.vn', role:'student'  },
  { id:3, name:'Lê Văn Cường',  email:'teacher1@uni.edu.vn', role:'teacher'  },
  { id:4, name:'Phạm Thị Dung', email:'teacher2@uni.edu.vn', role:'teacher'  },
  { id:5, name:'Admin System',  email:'admin@uni.edu.vn',    role:'admin'    },
];
const INIT_COURSES = [
  { id:1, code:'IT001', name:'Nhập môn Lập trình',          teacherId:3, studentCount:42 },
  { id:2, code:'IT002', name:'Lập trình Hướng đối tượng',   teacherId:3, studentCount:35 },
  { id:3, code:'SE104', name:'Nhập môn Kỹ thuật Phần mềm',  teacherId:4, studentCount:28 },
];
const INIT_ASSIGNMENTS = [
  { id:1, studentId:1, courseId:1 },
  { id:2, studentId:2, courseId:1 },
  { id:3, studentId:1, courseId:2 },
];

const ROLE_COLOR = {
  admin:   { bg:'rgba(242,139,130,.12)', color:'#F28B82', border:'rgba(242,139,130,.2)' },
  teacher: { bg:'rgba(138,180,248,.12)', color:'#8AB4F8', border:'rgba(138,180,248,.2)' },
  student: { bg:'rgba(129,201,149,.12)', color:'#81C995', border:'rgba(129,201,149,.2)' },
};
const ROLE_LABEL = { admin:'Admin', teacher:'Giảng viên', student:'Sinh viên' };

const RoleBadge = ({ role }) => {
  const c = ROLE_COLOR[role] || ROLE_COLOR.student;
  return (
    <span style={{
      padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:600,
      background:c.bg, color:c.color, border:`1px solid ${c.border}`,
    }}>
      {ROLE_LABEL[role]}
    </span>
  );
};

const TABS = [
  { id:'users',   label:'Người dùng',     icon:<Users size={15}/> },
  { id:'courses', label:'Khoá học',        icon:<BookOpen size={15}/> },
  { id:'assign',  label:'Biên chế lớp',   icon:<UserPlus size={15}/> },
  { id:'import',  label:'Nhập hàng loạt', icon:<FileSpreadsheet size={15}/> },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const { logout, user } = useUser();
  const { isDark } = useTheme();
  const userName = user?.name || user?.email?.split('@')[0] || 'Admin';

  const [tab,         setTab]         = useState('users');
  const [users,       setUsers]       = useState(INIT_USERS);
  const [courses,     setCourses]     = useState(INIT_COURSES);
  const [assignments, setAssignments] = useState(INIT_ASSIGNMENTS);
  const [search,      setSearch]      = useState('');
  const [editId,      setEditId]      = useState(null);
  const [editData,    setEditData]    = useState({});
  const [newUser,     setNewUser]     = useState({ name:'', email:'', role:'student' });
  const [newCourse,   setNewCourse]   = useState({ code:'', name:'', teacherId:'' });
  const [showNewUser,   setShowNewUser]   = useState(false);
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [importLog,   setImportLog]   = useState([]);
  const [assignStudent, setAssignStudent] = useState('');
  const [assignCourse,  setAssignCourse]  = useState('');
  const fileRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const addUser      = ()   => { if (!newUser.name||!newUser.email) return; setUsers(p=>[...p,{id:Date.now(),...newUser}]); setNewUser({name:'',email:'',role:'student'}); setShowNewUser(false); };
  const deleteUser   = (id) => setUsers(p=>p.filter(u=>u.id!==id));
  const startEdit    = (u)  => { setEditId(u.id); setEditData({name:u.name,email:u.email,role:u.role}); };
  const saveEdit     = (id) => { setUsers(p=>p.map(u=>u.id===id?{...u,...editData}:u)); setEditId(null); };
  const teachers     = users.filter(u=>u.role==='teacher');

  const addCourse    = ()   => { if (!newCourse.code||!newCourse.name) return; setCourses(p=>[...p,{id:Date.now(),...newCourse,studentCount:0}]); setNewCourse({code:'',name:'',teacherId:''}); setShowNewCourse(false); };
  const deleteCourse = (id) => setCourses(p=>p.filter(c=>c.id!==id));

  const students   = users.filter(u=>u.role==='student');
  const addAssignment = () => {
    if (!assignStudent||!assignCourse) return;
    if (assignments.some(a=>a.studentId===+assignStudent&&a.courseId===+assignCourse)) return;
    setAssignments(p=>[...p,{id:Date.now(),studentId:+assignStudent,courseId:+assignCourse}]);
  };
  const removeAssignment = (id) => setAssignments(p=>p.filter(a=>a.id!==id));

  const handleImport = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setImportLog([`✅ Đọc file: ${f.name}`,'📋 Tìm 3 sinh viên mới...','✅ Thêm: Nguyễn Văn X','✅ Thêm: Trần Thị Y','⚠️ Bỏ qua: email trùng','🎉 Hoàn tất! 2/3 bản ghi.']);
    if (fileRef.current) fileRef.current.value='';
  };

  // ── Theme-aware style helpers ──
  const inputStyle = {
    background: isDark ? '#2D2E36' : '#F5F6FF',
    border: isDark ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(99,102,241,.18)',
    borderRadius:8, padding:'9px 12px', fontSize:13,
    color: isDark ? '#E3E3E3' : '#1A1B2E',
    outline:'none', fontFamily:'inherit', width:'100%', transition:'border-color .2s',
  };
  const selectStyle = { ...inputStyle, cursor:'pointer' };

  // Derived theme values
  const pageBg      = isDark ? '#1B1B1F' : '#F4F5FF';
  const pageColor   = isDark ? '#E3E3E3' : '#1A1B2E';
  const sidebarBorder = isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.12)';
  const userCardBg  = isDark ? 'rgba(255,255,255,.04)' : 'rgba(99,102,241,.05)';
  const logoTextColor = isDark ? '#E3E3E3' : '#1A1B2E';
  const navSubColor = isDark ? '#5F6368' : '#9CA3C0';
  const cardBg      = isDark ? '#28292F' : '#FFFFFF';
  const cardBorder  = isDark ? 'rgba(255,255,255,.1)' : 'rgba(99,102,241,.12)';
  const formPanelBg = isDark ? '#2D2E36' : '#EEF2FF';
  const formPanelBorder = isDark ? 'rgba(255,255,255,.1)' : 'rgba(99,102,241,.15)';
  const tableBg     = isDark ? '#28292F' : '#FFFFFF';
  const inlineTableBorder = isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.1)';
  const emptyTextColor   = isDark ? '#5F6368' : '#C8CCE0';
  const bodyTextColor    = isDark ? '#9AA0A6' : 'rgba(90,95,125,.75)';
  const importBg    = isDark ? '#1B1B1F' : '#F4F5FF';
  const dropUploadBoxBg = isDark ? '#35363F' : '#EEF2FF';

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:pageBg, fontFamily:"'Inter',sans-serif", color:pageColor, transition:'background .3s, color .3s' }}>

      {/* ═══ SIDEBAR ═══ */}
      <div className="ag-sidebar">
        {/* Logo */}
        <div style={{ padding:'16px 16px 8px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${sidebarBorder}`, marginBottom:8 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 12px rgba(99,102,241,.3)' }}>
            <ShieldCheck size={16} color="#fff"/>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, letterSpacing:'-.02em',
              background:'linear-gradient(90deg, #4F46E5, #7C3AED)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>CourseAI</div>
            <div style={{ fontSize:10, color: isDark ? '#8AB4F8' : '#4F46E5', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase' }}>Admin</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex:1, padding:'8px 0', overflowY:'auto' }}>
          {[
            { label:'Tổng quan',  icon:<LayoutDashboard size={16}/>, active:false },
            { label:'Người dùng', icon:<Users size={16}/>,           active:tab==='users',   onClick:()=>setTab('users')   },
            { label:'Khoá học',   icon:<BookOpen size={16}/>,        active:tab==='courses', onClick:()=>setTab('courses') },
            { label:'Biên chế',   icon:<UserPlus size={16}/>,        active:tab==='assign',  onClick:()=>setTab('assign')  },
            { label:'Nhập liệu',  icon:<Upload size={16}/>,          active:tab==='import',  onClick:()=>setTab('import')  },
          ].map((item, i) => (
            <button key={i} onClick={item.onClick || undefined}
              className={`ag-sidebar-item${item.active?' active':''}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* User + Logout */}
        <div style={{ padding:'8px 8px 16px', borderTop:`1px solid ${sidebarBorder}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px', borderRadius:10, background:userCardBg, border:`1px solid ${isDark ? 'rgba(255,255,255,.06)' : 'rgba(99,102,241,.1)'}` }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:600, color:logoTextColor, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{userName}</div>
              <div style={{ fontSize:10, color:navSubColor }}>Administrator</div>
            </div>
            <button onClick={handleLogout} title="Đăng xuất" style={{ background:'none', border:'none', cursor:'pointer', color:navSubColor, display:'flex', padding:4, borderRadius:6, transition:'color .15s' }}
              onMouseOver={e=>e.currentTarget.style.color='#F28B82'}
              onMouseOut={e=>e.currentTarget.style.color=navSubColor}
            >
              <LogOut size={15}/>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ MAIN ═══ */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Top bar */}
        <div className="ag-navbar">
          <h1 style={{ fontSize:15, fontWeight:600, color:pageColor }}>Trung tâm Quản trị</h1>
          <div style={{ flex:1 }}/>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ display:'flex', gap:16, fontSize:12, color:bodyTextColor }}>
              <span><strong style={{ color: isDark ? '#8AB4F8' : '#4F46E5' }}>{users.filter(u=>u.role==='student').length}</strong> Sinh viên</span>
              <span><strong style={{ color: isDark ? '#BB86FC' : '#7C3AED' }}>{users.filter(u=>u.role==='teacher').length}</strong> GV</span>
              <span><strong style={{ color: isDark ? '#81C995' : '#059669' }}>{courses.length}</strong> Môn</span>
            </div>
            <ThemeToggle size="sm"/>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ padding:'20px 24px 0', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {[
            { label:'Sinh viên', value:users.filter(u=>u.role==='student').length, color: isDark ? '#8AB4F8' : '#4F46E5', chip:'ag-chip-indigo', icon:<GraduationCap size={18}/> },
            { label:'Giảng viên',value:users.filter(u=>u.role==='teacher').length, color: isDark ? '#BB86FC' : '#7C3AED', chip:'ag-chip-violet', icon:<Users size={18}/> },
            { label:'Khoá học',  value:courses.length,                             color: isDark ? '#81C995' : '#059669', chip:'ag-chip-green',  icon:<BookOpen size={18}/> },
          ].map((s,i) => (
            <div key={i} className="ag-metric ag-fade-up" style={{ animationDelay:`${i*.08}s` }}>
              <div className={`ag-chip ${s.chip}`}>{s.icon}</div>
              <div>
                <div style={{ fontSize:26, fontWeight:700, color:pageColor, lineHeight:1.1 }}>{s.value}</div>
                <div style={{ fontSize:12, color:bodyTextColor, marginTop:2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs + Content */}
        <div style={{ flex:1, margin:'20px 24px', background:cardBg, borderRadius:16, border:`1px solid ${cardBorder}`, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div className="ag-tabs">
            {TABS.map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)} className={`ag-tab${tab===t.id?' active':''}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:24 }}>

            {/* ── Users Tab ── */}
            {tab==='users' && (
              <div className="ag-fade-in">
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                  <div className="ag-search-wrap" style={{ flex:1, minWidth:200 }}>
                    <Search size={15}/>
                    <input value={search} onChange={e=>setSearch(e.target.value)}
                      placeholder="Tìm theo tên hoặc email..."
                      className="ag-input ag-search" style={{ fontSize:13 }}/>
                  </div>
                  <button onClick={()=>setShowNewUser(p=>!p)} className="ag-btn ag-btn-primary" style={{ padding:'8px 14px', fontSize:13 }}>
                    <Plus size={15}/> Thêm người dùng
                  </button>
                </div>

                {showNewUser && (
                  <div className="ag-fade-in" style={{ background:formPanelBg, border:`1px solid ${formPanelBorder}`, borderRadius:12, padding:16, marginBottom:16, display:'grid', gridTemplateColumns:'1fr 1fr auto auto', gap:10, alignItems:'end' }}>
                    <div>
                      <label className="ag-label">Họ và tên</label>
                      <input style={inputStyle} value={newUser.name} onChange={e=>setNewUser(p=>({...p,name:e.target.value}))} placeholder="Họ và tên"/>
                    </div>
                    <div>
                      <label className="ag-label">Email</label>
                      <input style={inputStyle} value={newUser.email} onChange={e=>setNewUser(p=>({...p,email:e.target.value}))} placeholder="email@edu.vn"/>
                    </div>
                    <div>
                      <label className="ag-label">Vai trò</label>
                      <select style={selectStyle} value={newUser.role} onChange={e=>setNewUser(p=>({...p,role:e.target.value}))}>
                        <option value="student">Sinh viên</option>
                        <option value="teacher">Giảng viên</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <button onClick={addUser} className="ag-btn ag-btn-primary" style={{ padding:'9px 16px', fontSize:13 }}>
                      <Check size={15}/> Lưu
                    </button>
                  </div>
                )}

                <div style={{ borderRadius:12, border:`1px solid ${inlineTableBorder}`, overflow:'hidden' }}>
                  <table className="ag-table" style={{ background:tableBg }}>
                    <thead>
                      <tr>
                        <th>Họ tên</th><th>Email</th><th>Vai trò</th><th style={{ textAlign:'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td style={{ fontWeight:500 }}>
                            {editId===u.id
                              ? <input style={{...inputStyle,width:160,padding:'5px 8px'}} value={editData.name} onChange={e=>setEditData(p=>({...p,name:e.target.value}))}/>
                              : <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                  <div style={{ width:28,height:28,borderRadius:'50%',background:'rgba(138,180,248,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#8AB4F8',flexShrink:0 }}>{u.name.charAt(0)}</div>
                                  <span style={{ color:pageColor }}>{u.name}</span>
                                </div>
                            }
                          </td>
                          <td style={{ color:bodyTextColor }}>
                            {editId===u.id
                              ? <input style={{...inputStyle,width:200,padding:'5px 8px'}} value={editData.email} onChange={e=>setEditData(p=>({...p,email:e.target.value}))}/>
                              : u.email}
                          </td>
                          <td>
                            {editId===u.id
                              ? <select style={{...selectStyle,width:'auto',padding:'5px 8px'}} value={editData.role} onChange={e=>setEditData(p=>({...p,role:e.target.value}))}>
                                  <option value="student">Sinh viên</option>
                                  <option value="teacher">Giảng viên</option>
                                  <option value="admin">Admin</option>
                                </select>
                              : <RoleBadge role={u.role}/>
                            }
                          </td>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:6 }}>
                              {editId===u.id ? (
                                <>
                                  <button onClick={()=>saveEdit(u.id)} className="ag-btn-icon" style={{ color:'#81C995' }}><Check size={15}/></button>
                                  <button onClick={()=>setEditId(null)} className="ag-btn-icon"><X size={15}/></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={()=>startEdit(u)} className="ag-btn-icon"><Edit2 size={14}/></button>
                                  <button onClick={()=>deleteUser(u.id)} className="ag-btn-icon" style={{ color:'#F28B82' }}><Trash2 size={14}/></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length===0 && (
                        <tr><td colSpan={4} style={{ textAlign:'center', color:emptyTextColor, padding:'32px 0' }}>Không tìm thấy người dùng nào</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Courses Tab ── */}
            {tab==='courses' && (
              <div className="ag-fade-in">
                <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
                  <button onClick={()=>setShowNewCourse(p=>!p)} className="ag-btn ag-btn-primary" style={{ padding:'8px 14px', fontSize:13 }}>
                    <Plus size={15}/> Thêm môn học
                  </button>
                </div>

                {showNewCourse && (
                  <div className="ag-fade-in" style={{ background:formPanelBg, border:`1px solid ${formPanelBorder}`, borderRadius:12, padding:16, marginBottom:16, display:'grid', gridTemplateColumns:'auto 1fr auto auto', gap:10, alignItems:'end' }}>
                    <div>
                      <label className="ag-label">Mã môn</label>
                      <input style={{...inputStyle,width:100}} value={newCourse.code} onChange={e=>setNewCourse(p=>({...p,code:e.target.value}))} placeholder="IT001"/>
                    </div>
                    <div>
                      <label className="ag-label">Tên môn học</label>
                      <input style={inputStyle} value={newCourse.name} onChange={e=>setNewCourse(p=>({...p,name:e.target.value}))} placeholder="Nhập tên môn học"/>
                    </div>
                    <div>
                      <label className="ag-label">Giảng viên</label>
                      <select style={selectStyle} value={newCourse.teacherId} onChange={e=>setNewCourse(p=>({...p,teacherId:+e.target.value}))}>
                        <option value="" disabled>Chọn GV</option>
                        {teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <button onClick={addCourse} className="ag-btn ag-btn-primary" style={{ padding:'9px 16px', fontSize:13 }}>
                      <Check size={15}/> Lưu
                    </button>
                  </div>
                )}

                <div style={{ borderRadius:12, border:`1px solid ${inlineTableBorder}`, overflow:'hidden' }}>
                  <table className="ag-table" style={{ background:tableBg }}>
                    <thead>
                      <tr><th>Mã</th><th>Tên môn học</th><th>Giảng viên</th><th>Sĩ số</th><th style={{ textAlign:'right' }}>Xoá</th></tr>
                    </thead>
                    <tbody>
                      {courses.map(c => {
                        const t = users.find(u=>u.id===c.teacherId);
                        return (
                          <tr key={c.id}>
                            <td><span style={{ background:'rgba(138,180,248,.12)', color: isDark ? '#8AB4F8' : '#4F46E5', padding:'3px 8px', borderRadius:6, fontSize:12, fontWeight:600, fontFamily:'monospace' }}>{c.code}</span></td>
                            <td style={{ fontWeight:500, color:pageColor }}>{c.name}</td>
                            <td style={{ color:bodyTextColor }}>{t?.name||'—'}</td>
                            <td style={{ color:bodyTextColor }}>{c.studentCount}</td>
                            <td style={{ textAlign:'right' }}><button onClick={()=>deleteCourse(c.id)} className="ag-btn-icon" style={{ color:'#F28B82' }}><Trash2 size={14}/></button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Assign Tab ── */}
            {tab==='assign' && (
              <div className="ag-fade-in">
                <div style={{ background:formPanelBg, border:`1px solid ${formPanelBorder}`, borderRadius:12, padding:16, marginBottom:20, display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:12, alignItems:'end' }}>
                  <div>
                    <label className="ag-label">Sinh viên</label>
                    <select style={selectStyle} value={assignStudent} onChange={e=>setAssignStudent(e.target.value)}>
                      <option value="" disabled>Chọn sinh viên</option>
                      {students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="ag-label">Môn học</label>
                    <select style={selectStyle} value={assignCourse} onChange={e=>setAssignCourse(e.target.value)}>
                      <option value="" disabled>Chọn môn</option>
                      {courses.map(c=><option key={c.id} value={c.id}>[{c.code}] {c.name}</option>)}
                    </select>
                  </div>
                  <button onClick={addAssignment} className="ag-btn ag-btn-primary" style={{ padding:'9px 16px', fontSize:13 }}>
                    <UserPlus size={15}/> Thêm
                  </button>
                </div>

                <div style={{ borderRadius:12, border:`1px solid ${inlineTableBorder}`, overflow:'hidden' }}>
                  <table className="ag-table" style={{ background:tableBg }}>
                    <thead><tr><th>Sinh viên</th><th>Môn học</th><th style={{ textAlign:'right' }}>Xoá</th></tr></thead>
                    <tbody>
                      {assignments.map(a => {
                        const sv = users.find(u=>u.id===a.studentId);
                        const mh = courses.find(c=>c.id===a.courseId);
                        return (
                          <tr key={a.id}>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div style={{ width:26,height:26,borderRadius:'50%',background:'rgba(129,201,149,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#81C995',flexShrink:0 }}>{sv?.name?.charAt(0)||'?'}</div>
                                <span style={{ fontWeight:500, color:pageColor }}>{sv?.name||'—'}</span>
                              </div>
                            </td>
                            <td style={{ color:bodyTextColor }}>
                              {mh && <><span style={{ color: isDark ? '#8AB4F8' : '#4F46E5', fontWeight:600 }}>{mh.code}</span> — {mh.name}</>}
                            </td>
                            <td style={{ textAlign:'right' }}><button onClick={()=>removeAssignment(a.id)} className="ag-btn-icon" style={{ color:'#F28B82' }}><X size={14}/></button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Import Tab ── */}
            {tab==='import' && (
              <div className="ag-fade-in" style={{ maxWidth:600, margin:'0 auto', paddingTop:8 }}>
                <div style={{ textAlign:'center', marginBottom:24 }}>
                  <div style={{ width:52,height:52,borderRadius:14,background:'rgba(138,180,248,.12)',border:'1px solid rgba(138,180,248,.18)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',color: isDark ? '#8AB4F8' : '#4F46E5' }}>
                    <FileSpreadsheet size={24}/>
                  </div>
                  <h3 style={{ fontSize:16, fontWeight:700, color:pageColor, marginBottom:6 }}>Nhập dữ liệu hàng loạt</h3>
                  <p style={{ fontSize:13, color:bodyTextColor, lineHeight:1.6 }}>
                    Upload file danh sách lớp để tự động tạo tài khoản sinh viên
                  </p>
                </div>

                <label className="ag-dropzone" style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 20px', cursor:'pointer', gap:10, position:'relative' }}>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }}/>
                  <div style={{ width:44,height:44,borderRadius:12,background:dropUploadBoxBg,display:'flex',alignItems:'center',justifyContent:'center',color:bodyTextColor }}>
                    <Upload size={22}/>
                  </div>
                  <p style={{ fontSize:14, fontWeight:500, color:pageColor }}>Kéo thả hoặc nhấn để chọn file</p>
                  <p style={{ fontSize:12, color:emptyTextColor }}>Hỗ trợ XLS, XLSX, CSV</p>
                </label>

                {importLog.length>0 && (
                  <div className="ag-fade-in" style={{ marginTop:16, background:importBg, borderRadius:12, padding:16, border:`1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.1)'}`, fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10, color:emptyTextColor }}>
                      <div style={{ width:8,height:8,borderRadius:'50%',background:'#81C995' }}/>
                      <div style={{ width:8,height:8,borderRadius:'50%',background:'#FDD663' }}/>
                      <div style={{ width:8,height:8,borderRadius:'50%',background:'#F28B82' }}/>
                      <span style={{ marginLeft:4 }}>import.log</span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {importLog.map((line,i) => (
                        <div key={i} style={{ color: line.startsWith('✅')?'#81C995':line.startsWith('⚠️')?'#FDD663':line.startsWith('🎉')?(isDark?'#8AB4F8':'#4F46E5'):bodyTextColor }}>
                          ~ {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}