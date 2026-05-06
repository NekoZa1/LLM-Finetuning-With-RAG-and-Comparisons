import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, LogOut, Upload, FileText, Trash2,
  CheckCircle, Clock, ChevronRight, Users, BarChart2,
  X, AlertCircle, Edit2, Check, Sparkles,
  Plus, ClipboardList, TrendingUp, Award,
  ChevronDown, ChevronUp, Loader, GraduationCap,
  LayoutDashboard, MessageSquare
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { fileApi, quizApi, instructorApi } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

const delay = (ms) => new Promise(r => setTimeout(r, ms));
const today = () => new Date().toISOString().slice(0, 10);
const avgPct = (stats) => stats.length === 0 ? 0 : Math.round(stats.reduce((s, r) => s + r.percent, 0) / stats.length);
const BLANK_Q = () => ({ id: Date.now() + Math.random(), question: '', options: ['', '', '', ''], correct: 0, explain: '' });

const COURSES = [
  { id: 1, code: 'IT001', name: 'Nhập môn Lập trình', studentCount: 42, color: '#8AB4F8' },
  { id: 2, code: 'IT002', name: 'Lập trình Hướng đối tượng', studentCount: 35, color: '#81C995' },
  { id: 3, code: 'SE104', name: 'Nhập môn Kỹ thuật Phần mềm', studentCount: 28, color: '#BB86FC' },
];

const MODAL_TABS = [
  { key: 'docs', label: 'Tài liệu', icon: <FileText size={14} /> },
  { key: 'quiz', label: 'Bài tập', icon: <ClipboardList size={14} /> },
  { key: 'progress', label: 'Tiến độ SV', icon: <TrendingUp size={14} /> },
];

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { isDark } = useTheme();

  const [uploads, setUploads] = useState({});
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [editingFileId, setEditingFileId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('docs');
  const [expandedGroups, setExpandedGroups] = useState({});
  const toggleGroup = (subjectName) => setExpandedGroups(p => ({ ...p, [subjectName]: !p[subjectName] }));

  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ title: '', questions: [BLANK_Q()] });
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genCount, setGenCount] = useState(3);
  const [quizError, setQuizError] = useState('');
  const [quizSuccess, setQuizSuccess] = useState('');
  const [expandedQuiz, setExpandedQuiz] = useState(null);

  const [quizStats, setQuizStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [courses, setCourses] = useState([]);

  const loadUploads = useCallback(async () => {
    setLoadingUploads(true);
    try {
      const res = await fileApi.getUploads();
      if (res.ok && res.data?.subjectsUploads) {
        console.log(res.data.subjectsUploads);
        const parsed = {};
        for (const [subjectName, files] of Object.entries(res.data.subjectsUploads)) {
          parsed[subjectName] = files.map(u => ({ id: u.id, name: u.file_name, file: u.file, status: 'done' }));
        }
        setUploads(parsed);
      }
    } catch (err) { console.error(err); }
    finally { setLoadingUploads(false); }
  }, []);

  const loadQuizzes = useCallback(async (courseId) => {
    setLoadingQuizzes(true);
    try {
      const res = await quizApi.getQuizzesByCourse(courseId);
      if (res.ok && res.data?.quizzes) setQuizzes(res.data.quizzes);
    } catch (err) { console.error(err); }
    finally { setLoadingQuizzes(false); }
  }, []);

  const loadStats = useCallback(async (courseId) => {
    setLoadingStats(true);
    try {
      const res = await quizApi.getQuizStats(courseId);
      if (res.ok && res.data?.stats) setQuizStats(res.data.stats);
    } catch (err) { console.error(err); }
    finally { setLoadingStats(false); }
  }, []);

  const loadSubjects = useCallback(async () => {
    const res = await instructorApi.getSubjects();
    if (res.ok && res.data?.subjects) {
      let subjects = []

      for (var prop in res.data.subjects) {
        let subject = res.data.subjects[prop]
        subjects.push({
          id: subject.id,
          code: prop.substring(0,3).toUpperCase() + subject.id,
          name: prop,
          studentCount: 0,
          color: ['#8AB4F8', '#81C995', '#BB86FC'][subject.id % 3]
        })
      }

      setCourses(subjects);
    }
  }, []);

  useEffect(() => { loadSubjects(); }, [loadSubjects]);
  useEffect(() => { loadUploads(); }, [loadUploads]);

  const openCourse = (course) => {
    setSelectedCourse(course); setActiveModalTab('docs');
    setUploadError(''); setQuizError(''); setQuizSuccess('');
    setShowCreateQuiz(false); setNewQuiz({ title: '', questions: [BLANK_Q()] });
    setExpandedQuiz(null);
    loadQuizzes(course.id); loadStats(course.id);
    loadUploads();
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const processFiles = async (fileList) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    const maxSize = 10 * 1024 * 1024;
    const validFiles = [];
    for (const f of Array.from(fileList)) {
      if (!allowed.includes(f.type)) { setUploadError(`File "${f.name}" không đúng định dạng.`); return; }
      if (f.size > maxSize) { setUploadError(`File "${f.name}" vượt quá 10MB.`); return; }
      validFiles.push(f);
    }
    if (!validFiles.length) return;
    setUploadError(''); setUploading(true);
    const tempDocs = validFiles.map((f, i) => ({ id: `temp-${Date.now()}-${i}`, name: f.name, status: 'processing', size: (f.size / 1024 / 1024).toFixed(2) + ' MB' }));
    const targetSubject = selectedCourse ? selectedCourse.name : "Các khóa học khác";
    setUploads(prev => ({ ...prev, [targetSubject]: [...(prev[targetSubject] || []), ...tempDocs] }));
    try {
      const metadata = validFiles.map(() => ({ subjects: selectedCourse ? [selectedCourse.id] : [] }));
      const res = await fileApi.upload(validFiles, metadata);
      if (res.ok && res.data?.uploadIds) await loadUploads();
      else throw new Error(res.data?.error || 'Upload thất bại');
    } catch (err) {
      setUploadError(err.message || 'Upload thất bại. Vui lòng thử lại.');
      setUploads(prev => {
        const nw = { ...prev };
        Object.keys(nw).forEach(st => { nw[st] = nw[st].filter(d => !String(d.id).startsWith('temp-')) });
        return nw;
      });
    } finally { setUploading(false); }
  };

  const handleFileInput = (e) => processFiles(e.target.files);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); };

  const handleDeleteFile = async (docId) => {
    if (!confirm('Bạn có chắc muốn xoá file này?')) return;
    setUploads(prev => { const nw = { ...prev }; Object.keys(nw).forEach(k => { nw[k] = nw[k].filter(d => d.id !== docId) }); return nw; });
    try { const res = await fileApi.deleteUpload(docId); if (!res.ok) { await loadUploads(); setUploadError('Xoá file thất bại.'); } }
    catch { await loadUploads(); }
  };

  const handleRename = async (docId) => {
    if (!editingName.trim()) return;
    setUploads(prev => { const nw = { ...prev }; Object.keys(nw).forEach(k => { nw[k] = nw[k].map(d => d.id === docId ? { ...d, name: editingName.trim() } : d) }); return nw; });
    setEditingFileId(null); setEditingName('');
    try { await fileApi.renameUpload(docId, editingName.trim()); }
    catch (err) { console.error(err); }
  };

  const updateQuestion = (qi, field, value) =>
    setNewQuiz(p => ({ ...p, questions: p.questions.map((q, i) => i === qi ? { ...q, [field]: value } : q) }));
  const updateOption = (qi, oi, value) =>
    setNewQuiz(p => ({ ...p, questions: p.questions.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? value : o) } : q) }));
  const addQuestion = () => setNewQuiz(p => ({ ...p, questions: [...p.questions, BLANK_Q()] }));
  const removeQuestion = (qi) => setNewQuiz(p => ({ ...p, questions: p.questions.filter((_, i) => i !== qi) }));
  const flashSuccess = (msg) => { setQuizSuccess(msg); setTimeout(() => setQuizSuccess(''), 3500); };

  const handleSaveQuiz = async () => {
    if (!newQuiz.title.trim()) { setQuizError('Vui lòng nhập tiêu đề.'); return; }
    if (newQuiz.questions.some(q => !q.question.trim())) { setQuizError('Vui lòng điền nội dung câu hỏi.'); return; }
    if (newQuiz.questions.some(q => q.options.some(o => !o.trim()))) { setQuizError('Vui lòng điền đủ đáp án.'); return; }
    setSavingQuiz(true); setQuizError('');
    try {
      const res = await quizApi.createQuiz(selectedCourse.id, newQuiz);
      if (res.ok) { await loadQuizzes(selectedCourse.id); setNewQuiz({ title: '', questions: [BLANK_Q()] }); setShowCreateQuiz(false); flashSuccess('Đã tạo bài quiz!'); }
      else throw new Error(res.data?.error || 'Tạo quiz thất bại');
    } catch (err) { setQuizError(err.message); }
    finally { setSavingQuiz(false); }
  };

  const handleGenerateQuiz = async () => {
    if (!genTopic.trim()) { setQuizError('Vui lòng nhập chủ đề.'); return; }
    setGeneratingQuiz(true); setQuizError('');
    try {
      const res = await quizApi.generateQuiz(selectedCourse.id, { topic: genTopic, count: genCount });
      if (res.ok) { await loadQuizzes(selectedCourse.id); flashSuccess(`AI tạo ${genCount} câu!`); setGenTopic(''); }
      else throw new Error(res.data?.error || 'Tạo AI quiz thất bại');
    } catch (err) { setQuizError(err.message); }
    finally { setGeneratingQuiz(false); }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Xoá bài quiz này?')) return;
    setQuizzes(p => p.filter(q => q.id !== quizId));
    try { await quizApi.deleteQuiz(quizId); }
    catch { await loadQuizzes(selectedCourse.id); }
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'Giảng Viên';
  const totalDocs = Object.values(uploads).reduce((acc, files) => acc + files.length, 0);
  const courseUploads = selectedCourse && uploads[selectedCourse.name] ? uploads[selectedCourse.name] : [];

  // ── Derived theme values ──
  const pageBg = isDark ? '#1B1B1F' : '#F4F5FF';
  const pageColor = isDark ? '#E3E3E3' : '#1A1B2E';
  const bodyTextColor = isDark ? '#9AA0A6' : 'rgba(90,95,125,.75)';
  const sidebarBorder = isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.12)';
  const userCardBg = isDark ? 'rgba(255,255,255,.04)' : 'rgba(99,102,241,.05)';
  const navSubColor = isDark ? '#5F6368' : '#9CA3C0';
  const cardBg = isDark ? '#28292F' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,.1)' : 'rgba(99,102,241,.12)';
  const panelBg = isDark ? '#2D2E36' : '#EEF2FF';
  const panelBorder = isDark ? 'rgba(255,255,255,.1)' : 'rgba(99,102,241,.15)';
  const emptyTextColor = isDark ? '#5F6368' : '#C8CCE0';
  const IS = {
    background: isDark ? '#2D2E36' : '#F5F6FF',
    border: isDark ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(99,102,241,.18)',
    borderRadius: 8, padding: '9px 12px', fontSize: 13,
    color: isDark ? '#E3E3E3' : '#1A1B2E',
    outline: 'none', fontFamily: 'inherit', width: '100%', transition: 'border-color .2s',
  };
  const modalBg = isDark ? '#28292F' : '#FFFFFF';
  const modalBorder = isDark ? 'rgba(255,255,255,.12)' : 'rgba(99,102,241,.15)';
  const modalHeaderBg = isDark ? '#22232A' : '#F8F9FF';
  const modalHeaderBorder = isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.1)';
  const fileItemBg = isDark ? '#2D2E36' : '#F5F6FF';
  const fileItemBorder = isDark ? 'rgba(255,255,255,.07)' : 'rgba(99,102,241,.1)';
  const quizItemBg = isDark ? '#2D2E36' : '#F5F6FF';
  const statCardBg = isDark ? '#2D2E36' : '#FFFFFF';
  const statCardBorder = isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.1)';
  const tableBg = isDark ? '#28292F' : '#FFFFFF';
  const dropBoxBg = isDark ? '#35363F' : '#EEF2FF';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: pageBg, fontFamily: "'Inter',sans-serif", color: pageColor, transition: 'background .3s, color .3s' }}>

      {/* ═══ SIDEBAR ═══ */}
      <div className="ag-sidebar">
        <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${sidebarBorder}`, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 12px rgba(99,102,241,.25)' }}>
            <GraduationCap size={16} color="#fff" />
          </div>
          <div>
            <div style={{
              fontSize: 13, fontWeight: 700, letterSpacing: '-.02em',
              background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>CourseAI</div>
            <div style={{ fontSize: 10, color: isDark ? '#81C995' : '#059669', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>Teacher</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          <button onClick={() => setActiveNav('dashboard')} className={`ag-sidebar-item${activeNav === 'dashboard' ? ' active' : ''}`}>
            <LayoutDashboard size={16} /> Tổng quan
          </button>
          <div style={{ padding: '8px 16px 4px', fontSize: 10, color: navSubColor, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>Môn đang dạy</div>
          {courses.map(c => (
            <button key={c.id} onClick={() => openCourse(c)} className="ag-sidebar-item" style={{ paddingLeft: 22, fontSize: 13 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
            </button>
          ))}
          <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,.06)' : 'rgba(99,102,241,.08)', margin: '8px 12px' }} />
          <button onClick={() => setActiveNav('docs')} className={`ag-sidebar-item${activeNav === 'docs' ? ' active' : ''}`}>
            <FileText size={16} /> Tài liệu
          </button>
        </div>

        <div style={{ padding: '8px 8px 16px', borderTop: `1px solid ${sidebarBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', borderRadius: 10, background: userCardBg, border: `1px solid ${isDark ? 'rgba(255,255,255,.06)' : 'rgba(99,102,241,.1)'}` }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#81C995,#78DCE8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: pageColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
              <div style={{ fontSize: 10, color: navSubColor }}>Giảng viên</div>
            </div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: navSubColor, display: 'flex', padding: 4, borderRadius: 6, transition: 'color .15s' }}
              onMouseOver={e => e.currentTarget.style.color = '#F28B82'}
              onMouseOut={e => e.currentTarget.style.color = navSubColor}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ MAIN ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Navbar */}
        <div className="ag-navbar">
          <h1 style={{ fontSize: 14, fontWeight: 600, color: pageColor }}>Bảng điều khiển Giảng Viên</h1>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 14, fontSize: 12, color: bodyTextColor }}>
              <span><strong style={{ color: isDark ? '#8AB4F8' : '#4F46E5' }}>{courses.reduce((s, c) => s + c.studentCount, 0)}</strong> Sinh viên</span>
              <span><strong style={{ color: isDark ? '#81C995' : '#059669' }}>{totalDocs}</strong> Tài liệu</span>
            </div>
            <ThemeToggle size="sm" />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Dashboard overview */}
          {activeNav === 'dashboard' && !selectedCourse && (
            <>
              {/* Greeting */}
              <div className="ag-fade-up" style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: pageColor, marginBottom: 4, letterSpacing: '-.02em' }}>
                  Xin chào, {userName} 🎙️
                </h2>
                <p style={{ fontSize: 13.5, color: bodyTextColor }}>Quản lý tài liệu, bài tập và theo dõi tiến độ sinh viên.</p>
              </div>

              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
                {[
                  { label: 'Môn đang dạy', value: courses.length, color: isDark ? '#8AB4F8' : '#4F46E5', icon: <BookOpen size={18} /> },
                  { label: 'Sinh viên', value: courses.reduce((s, c) => s + c.studentCount, 0), color: isDark ? '#81C995' : '#059669', icon: <Users size={18} /> },
                  { label: 'Tài liệu', value: totalDocs, color: isDark ? '#BB86FC' : '#7C3AED', icon: <FileText size={18} /> },
                ].map((s, i) => (
                  <div key={i} className="ag-metric ag-fade-up" style={{ animationDelay: `${i * .08}s` }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: s.color }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 26, fontWeight: 700, color: pageColor, lineHeight: 1.1 }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: bodyTextColor, marginTop: 2 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Course cards */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <BookOpen size={14} color={isDark ? '#8AB4F8' : '#4F46E5'} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: pageColor }}>Khoá học đang phụ trách</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
                  {courses.map((c, i) => (
                    <div key={c.id} onClick={() => openCourse(c)}
                      className="ag-card ag-card-interactive ag-fade-up"
                      style={{ padding: 18, animationDelay: `${i * .06}s` }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: c.color }}>
                          <BookOpen size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: c.color, background: `${c.color}14`, padding: '2px 7px', borderRadius: 4, display: 'inline-block', marginBottom: 5 }}>{c.code}</span>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: pageColor, marginBottom: 4, lineHeight: 1.4 }}>{c.name}</p>
                          <p style={{ fontSize: 12, color: bodyTextColor }}>{c.studentCount} sinh viên</p>
                        </div>
                        <ChevronRight size={15} color={bodyTextColor} style={{ flexShrink: 0, marginTop: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Docs View */}
          {activeNav === 'docs' && !selectedCourse && (
            <div className="ag-fade-up">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: pageColor, letterSpacing: '-.02em', margin: 0 }}>
                  Quản lý tài liệu theo môn
                </h2>
              </div>

              {Object.keys(uploads).length === 0 && !loadingUploads && (
                <div style={{ textAlign: 'center', padding: '40px', borderRadius: 16, border: `1px dashed ${isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.15)'}`, color: emptyTextColor, fontSize: 14 }}>Kho tài liệu chưa có file nào. Vui lòng vào từng môn học để tải lên.</div>
              )}
              {loadingUploads && (
                <div style={{ padding: '20px', textAlign: 'center', color: bodyTextColor }}><Loader size={16} style={{ animation: 'ag-spin 1s linear infinite' }} /> Đang tải...</div>
              )}

              {Object.entries(uploads).map(([subjectName, files]) => {
                if (files.length === 0) return null;
                const isExpanded = expandedGroups[subjectName] ?? true;
                return (
                  <div key={subjectName} style={{ marginBottom: 28, background: isDark ? 'rgba(255,255,255,.02)' : 'rgba(99,102,241,.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : 'rgba(99,102,241,.1)'}`, borderRadius: 16, overflow: 'hidden' }}>
                    <div onClick={() => toggleGroup(subjectName)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: isDark ? 'rgba(255,255,255,.02)' : '#F8F9FF', cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: isDark ? 'rgba(138,180,248,.1)' : 'rgba(79,70,229,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#8AB4F8' : '#4F46E5' }}>
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: pageColor, margin: 0 }}>{subjectName}</h3>
                          <span style={{ fontSize: 12, color: bodyTextColor }}>{files.length} tài liệu</span>
                        </div>
                      </div>
                      <div style={{ color: bodyTextColor, display: 'flex', alignItems: 'center' }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: '16px 20px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : 'rgba(99,102,241,.1)'}` }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
                          {files.map(doc => (
                            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: isDark ? 'none' : '0 2px 8px rgba(99,102,241,.05)' }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(138,180,248,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: isDark ? '#8AB4F8' : '#4F46E5' }}><FileText size={18} /></div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {editingFileId === doc.id
                                  ? <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                    <input value={editingName} onChange={e => setEditingName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRename(doc.id)} style={{ ...IS, width: 'auto', flex: 1, padding: '5px 8px' }} autoFocus />
                                    <button onClick={() => handleRename(doc.id)} style={{ background: 'rgba(129,201,149,.15)', border: 'none', cursor: 'pointer', color: '#81C995', padding: '5px 8px', borderRadius: 6 }}><Check size={14} /></button>
                                    <button onClick={() => setEditingFileId(null)} style={{ background: isDark ? 'rgba(255,255,255,.07)' : 'rgba(99,102,241,.07)', border: 'none', cursor: 'pointer', color: bodyTextColor, padding: '5px 8px', borderRadius: 6 }}><X size={14} /></button>
                                  </div>
                                  : <p style={{ fontSize: 13.5, fontWeight: 600, color: pageColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }} title={doc.name}>{doc.name}</p>
                                }
                                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600, background: doc.status === 'done' ? 'rgba(129,201,149,.12)' : 'rgba(253,214,99,.1)', color: doc.status === 'done' ? '#81C995' : '#FDD663', border: `1px solid ${doc.status === 'done' ? 'rgba(129,201,149,.2)' : 'rgba(253,214,99,.2)'}`, display: 'inline-block' }}>
                                  {doc.status === 'done' ? 'Sẵn sàng' : 'Đang xử lý'}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                <button onClick={() => { setEditingFileId(doc.id); setEditingName(doc.name); }} className="ag-btn-icon" title="Đổi tên"><Edit2 size={15} /></button>
                                <button onClick={() => handleDeleteFile(doc.id)} className="ag-btn-icon" style={{ color: '#F28B82' }} title="Xoá"><Trash2 size={15} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══ COURSE MODAL ═══ */}
      {selectedCourse && (
        <div style={{ position: 'fixed', inset: 0, background: isDark ? 'rgba(0,0,0,.75)' : 'rgba(79,70,229,.15)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div className="ag-modal-in" style={{ background: modalBg, border: `1px solid ${modalBorder}`, borderRadius: 20, width: '100%', maxWidth: 760, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: isDark ? '0 24px 64px rgba(0,0,0,.7)' : '0 24px 64px rgba(99,102,241,.15)' }}>

            {/* Modal header */}
            <div style={{ padding: '16px 20px', background: modalHeaderBg, borderBottom: `1px solid ${modalHeaderBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 11, color: selectedCourse.color || '#8AB4F8', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 3 }}>
                  {selectedCourse.code}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: pageColor }}>{selectedCourse.name}</div>
              </div>
              <button onClick={() => setSelectedCourse(null)} className="ag-btn-icon"><X size={18} /></button>
            </div>

            {/* Modal tabs */}
            <div className="ag-tabs" style={{ padding: '0 8px', background: modalHeaderBg, flexShrink: 0 }}>
              {MODAL_TABS.map(t => (
                <button key={t.key} onClick={() => setActiveModalTab(t.key)} className={`ag-tab${activeModalTab === t.key ? ' active' : ''}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Modal body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: modalBg }}>

              {/* ── Tab: Docs ── */}
              {activeModalTab === 'docs' && (
                <div className="ag-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Dropzone */}
                  <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
                    className={`ag-dropzone${dragOver ? ' drag-over' : ''}`}
                    style={{ padding: '32px 20px', textAlign: 'center', position: 'relative', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? .6 : 1 }}>
                    <input type="file" multiple accept=".pdf,.docx,.pptx,.txt" onChange={handleFileInput}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} disabled={uploading} />
                    <div style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      {uploading
                        ? <><div style={{ width: 28, height: 28, border: '2px solid rgba(138,180,248,.2)', borderTopColor: '#8AB4F8', borderRadius: '50%', animation: 'ag-spin 1s linear infinite' }} /><p style={{ fontSize: 13, color: bodyTextColor }}>Đang xử lý tài liệu...</p></>
                        : <>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: dropBoxBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: bodyTextColor }}><Upload size={20} /></div>
                          <p style={{ fontSize: 13.5, fontWeight: 500, color: pageColor }}>Kéo thả hoặc nhấn để upload</p>
                          <p style={{ fontSize: 12, color: emptyTextColor }}>PDF, DOCX, PPTX, TXT · Tối đa 10MB</p>
                        </>
                      }
                    </div>
                  </div>

                  {uploadError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(242,139,130,.1)', border: '1px solid rgba(242,139,130,.2)', color: '#F28B82', fontSize: 13 }}>
                      <AlertCircle size={14} style={{ flexShrink: 0 }} /> {uploadError}
                    </div>
                  )}

                  {/* File list */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: bodyTextColor, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={13} /> Tài liệu đã tải lên ({courseUploads.length})
                    </div>
                    {loadingUploads
                      ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, borderRadius: 10, background: panelBg, color: bodyTextColor, fontSize: 13 }}>
                        <Loader size={14} style={{ animation: 'ag-spin 1s linear infinite' }} /> Đang tải...
                      </div>
                      : courseUploads.length === 0
                        ? <div style={{ textAlign: 'center', padding: '32px', borderRadius: 12, border: `1px dashed ${isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.15)'}`, color: emptyTextColor, fontSize: 13 }}>Kho tài liệu trống. Hãy upload để RAG AI học!</div>
                        : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {courseUploads.map(doc => (
                            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: fileItemBg, border: `1px solid ${fileItemBorder}` }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(138,180,248,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: isDark ? '#8AB4F8' : '#4F46E5' }}><FileText size={16} /></div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {editingFileId === doc.id
                                  ? <div style={{ display: 'flex', gap: 6 }}>
                                    <input value={editingName} onChange={e => setEditingName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRename(doc.id)} style={{ ...IS, width: 'auto', flex: 1, padding: '5px 8px' }} autoFocus />
                                    <button onClick={() => handleRename(doc.id)} style={{ background: 'rgba(129,201,149,.15)', border: 'none', cursor: 'pointer', color: '#81C995', padding: '5px 8px', borderRadius: 6 }}><Check size={14} /></button>
                                    <button onClick={() => setEditingFileId(null)} style={{ background: isDark ? 'rgba(255,255,255,.07)' : 'rgba(99,102,241,.07)', border: 'none', cursor: 'pointer', color: bodyTextColor, padding: '5px 8px', borderRadius: 6 }}><X size={14} /></button>
                                  </div>
                                  : <p style={{ fontSize: 13, fontWeight: 500, color: pageColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                                }
                                {doc.size && <p style={{ fontSize: 11, color: emptyTextColor, marginTop: 2 }}>{doc.size}</p>}
                              </div>
                              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, fontWeight: 600, background: doc.status === 'done' ? 'rgba(129,201,149,.12)' : 'rgba(253,214,99,.1)', color: doc.status === 'done' ? '#81C995' : '#FDD663', border: `1px solid ${doc.status === 'done' ? 'rgba(129,201,149,.2)' : 'rgba(253,214,99,.2)'}`, flexShrink: 0 }}>
                                {doc.status === 'done' ? 'Sẵn sàng' : 'Đang xử lý'}
                              </span>
                              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                <button onClick={() => { setEditingFileId(doc.id); setEditingName(doc.name); }} className="ag-btn-icon" title="Đổi tên"><Edit2 size={14} /></button>
                                <button onClick={() => handleDeleteFile(doc.id)} className="ag-btn-icon" style={{ color: '#F28B82' }} title="Xoá"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                </div>
              )}

              {/* ── Tab: Quiz ── */}
              {activeModalTab === 'quiz' && (
                <div className="ag-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {quizSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(129,201,149,.1)', border: '1px solid rgba(129,201,149,.2)', color: isDark ? '#81C995' : '#059669', fontSize: 13 }}>
                      <CheckCircle size={14} /> {quizSuccess}
                    </div>
                  )}
                  {quizError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(242,139,130,.1)', border: '1px solid rgba(242,139,130,.2)', color: '#F28B82', fontSize: 13 }}>
                      <AlertCircle size={14} /> {quizError}
                      <button onClick={() => setQuizError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F28B82', marginLeft: 'auto' }}><X size={13} /></button>
                    </div>
                  )}

                  {/* AI Generator */}
                  <div style={{ background: isDark ? 'rgba(99,102,241,.1)' : 'rgba(79,70,229,.06)', border: isDark ? '1px solid rgba(99,102,241,.2)' : '1px solid rgba(79,70,229,.15)', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Sparkles size={15} color={isDark ? '#8AB4F8' : '#4F46E5'} /><span style={{ fontSize: 13.5, fontWeight: 600, color: pageColor }}>AI Quiz Generator</span>
                    </div>
                    <p style={{ fontSize: 12, color: bodyTextColor, marginBottom: 12, lineHeight: 1.5 }}>AI tổng hợp từ tài liệu môn học để tạo đề trắc nghiệm tự động.</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <input value={genTopic} onChange={e => setGenTopic(e.target.value)} placeholder="Chủ đề (vd: Con trỏ C++)" style={{ ...IS, flex: 1, minWidth: 150 }} />
                      <select value={genCount} onChange={e => setGenCount(Number(e.target.value))} style={{ ...IS, width: 'auto', padding: '9px 10px' }}>
                        {[3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n} câu</option>)}
                      </select>
                      <button onClick={handleGenerateQuiz} disabled={generatingQuiz} className="ag-btn ag-btn-primary" style={{ padding: '9px 14px', fontSize: 13 }}>
                        {generatingQuiz ? <><Loader size={13} style={{ animation: 'ag-spin 1s linear infinite' }} /> Đang tạo...</> : <><Sparkles size={13} /> Tạo ngay</>}
                      </button>
                    </div>
                  </div>

                  {/* Manual create toggle */}
                  <button onClick={() => { setShowCreateQuiz(p => !p); setQuizError(''); }} className="ag-btn ag-btn-ghost" style={{ width: 'fit-content', padding: '8px 14px', fontSize: 13 }}>
                    <Plus size={14} /> {showCreateQuiz ? 'Thu gọn' : 'Tự soạn quiz thủ công'}
                  </button>

                  {showCreateQuiz && (
                    <div className="ag-fade-in" style={{ background: panelBg, border: `1px solid ${panelBorder}`, borderRadius: 12, padding: 16 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: pageColor, marginBottom: 12 }}>Biên tập bài Quiz</p>
                      <input value={newQuiz.title} onChange={e => setNewQuiz(p => ({ ...p, title: e.target.value }))} placeholder="Tiêu đề bài quiz (bắt buộc)" style={{ ...IS, marginBottom: 12 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {newQuiz.questions.map((q, qi) => (
                          <div key={q.id} style={{ background: isDark ? '#35363F' : '#F8F9FF', border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.1)'}`, borderRadius: 10, padding: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: isDark ? '#8AB4F8' : '#4F46E5', letterSpacing: '.05em', textTransform: 'uppercase' }}>Câu {qi + 1}</span>
                              {newQuiz.questions.length > 1 && <button onClick={() => removeQuestion(qi)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F28B82', display: 'flex', padding: 4 }}><Trash2 size={13} /></button>}
                            </div>
                            <input value={q.question} onChange={e => updateQuestion(qi, 'question', e.target.value)} placeholder="Nội dung câu hỏi..." style={{ ...IS, marginBottom: 8 }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                              {q.options.map((opt, oi) => (
                                <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 8, border: `1px solid ${q.correct === oi ? 'rgba(99,102,241,.4)' : (isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.1)')}`, background: q.correct === oi ? (isDark ? 'rgba(99,102,241,.1)' : 'rgba(99,102,241,.06)') : (isDark ? '#2D2E36' : '#FFFFFF') }}>
                                  <input type="radio" checked={q.correct === oi} onChange={() => updateQuestion(qi, 'correct', oi)} style={{ accentColor: '#6366f1', cursor: 'pointer', flexShrink: 0 }} />
                                  <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Phương án ${String.fromCharCode(65 + oi)}`} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12.5, color: pageColor, fontFamily: 'inherit' }} />
                                </div>
                              ))}
                            </div>
                            <input value={q.explain} onChange={e => updateQuestion(qi, 'explain', e.target.value)} placeholder="Giải thích (optional)" style={{ ...IS, fontSize: 12.5, padding: '7px 10px' }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,.06)' : 'rgba(99,102,241,.1)'}` }}>
                        <button onClick={addQuestion} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#8AB4F8' : '#4F46E5', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
                          <Plus size={13} /> Thêm câu hỏi
                        </button>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => { setShowCreateQuiz(false); setQuizError(''); }} className="ag-btn ag-btn-ghost" style={{ padding: '8px 14px', fontSize: 12.5 }}>Huỷ</button>
                          <button onClick={handleSaveQuiz} disabled={savingQuiz} className="ag-btn ag-btn-primary" style={{ padding: '8px 14px', fontSize: 12.5 }}>
                            {savingQuiz ? <><Loader size={13} style={{ animation: 'ag-spin 1s linear infinite' }} /> Đang lưu...</> : <><Check size={13} /> Lưu Quiz</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quiz list */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: bodyTextColor, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ClipboardList size={13} /> Ngân hàng đề ({quizzes.length})
                    </div>
                    {loadingQuizzes
                      ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, borderRadius: 10, background: panelBg, color: bodyTextColor, fontSize: 13 }}>
                        <Loader size={14} style={{ animation: 'ag-spin 1s linear infinite' }} /> Đang tải...
                      </div>
                      : quizzes.length === 0
                        ? <div style={{ textAlign: 'center', padding: '28px', borderRadius: 10, border: `1px dashed ${isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.15)'}`, color: emptyTextColor, fontSize: 13 }}>Chưa có bài quiz nào.</div>
                        : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {quizzes.map(quiz => (
                            <div key={quiz.id} style={{ background: quizItemBg, border: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : 'rgba(99,102,241,.1)'}`, borderRadius: 10, padding: '12px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontSize: 13.5, fontWeight: 600, color: pageColor, marginBottom: 4 }}>{quiz.title}</p>
                                  <div style={{ display: 'flex', gap: 8 }}>
                                    <span style={{ fontSize: 11, color: bodyTextColor, background: isDark ? 'rgba(255,255,255,.07)' : 'rgba(99,102,241,.07)', padding: '2px 7px', borderRadius: 4 }}>{quiz.questions?.length || 0} câu</span>
                                    <span style={{ fontSize: 11, color: isDark ? '#81C995' : '#059669', background: isDark ? 'rgba(129,201,149,.1)' : 'rgba(5,150,105,.08)', padding: '2px 7px', borderRadius: 4 }}>{quiz.attemptCount || 0} lượt</span>
                                    <span style={{ fontSize: 11, color: emptyTextColor }}>{quiz.createdAt}</span>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                  <button onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)} className="ag-btn-icon" title="Xem đề">
                                    {expandedQuiz === quiz.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                  <button onClick={() => handleDeleteQuiz(quiz.id)} className="ag-btn-icon" style={{ color: '#F28B82' }}><Trash2 size={14} /></button>
                                </div>
                              </div>
                              {expandedQuiz === quiz.id && (
                                <div className="ag-fade-in" style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,.06)' : 'rgba(99,102,241,.08)'}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {quiz.questions?.map((q, i) => (
                                    <div key={q.id || i} style={{ background: isDark ? '#35363F' : '#F8F9FF', borderRadius: 8, padding: '8px 12px', fontSize: 12.5 }}>
                                      <p style={{ color: pageColor, marginBottom: 4 }}><span style={{ color: isDark ? '#8AB4F8' : '#4F46E5', fontWeight: 600 }}>Q{i + 1}.</span> {q.question}</p>
                                      <span style={{ color: isDark ? '#81C995' : '#059669', background: isDark ? 'rgba(129,201,149,.1)' : 'rgba(5,150,105,.08)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>✓ {q.options?.[q.correct]}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                </div>
              )}

              {/* ── Tab: Progress ── */}
              {activeModalTab === 'progress' && (
                <div className="ag-fade-in">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: 'SV đã làm bài', value: new Set(quizStats.map(s => s.mssv)).size, color: isDark ? '#8AB4F8' : '#4F46E5', icon: <Users size={16} /> },
                      { label: 'Lượt nộp', value: quizStats.length, color: isDark ? '#BB86FC' : '#7C3AED', icon: <ClipboardList size={16} /> },
                      { label: 'TB điểm', value: `${avgPct(quizStats)}%`, color: avgPct(quizStats) >= 70 ? (isDark ? '#81C995' : '#059669') : '#FDD663', icon: <TrendingUp size={16} /> },
                    ].map((s, i) => (
                      <div key={i} style={{ background: statCardBg, border: `1px solid ${statCardBorder}`, borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: s.color }}>{s.icon}</div>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
                          <div style={{ fontSize: 11, color: bodyTextColor, marginTop: 2 }}>{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {loadingStats
                    ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, borderRadius: 10, background: panelBg, color: bodyTextColor, fontSize: 13 }}>
                      <Loader size={14} style={{ animation: 'ag-spin 1s linear infinite' }} /> Đang tải dữ liệu...
                    </div>
                    : quizStats.length === 0
                      ? <div style={{ textAlign: 'center', padding: '32px', color: emptyTextColor, fontSize: 13, borderRadius: 10, border: `1px dashed ${isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.15)'}` }}>Sinh viên chưa nộp bài.</div>
                      : <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'rgba(99,102,241,.1)'}` }}>
                        <table className="ag-table" style={{ background: tableBg }}>
                          <thead><tr><th>Sinh viên</th><th>Bài quiz</th><th>Kết quả</th><th>Điểm</th><th>Ngày nộp</th></tr></thead>
                          <tbody>
                            {quizStats.map((row, i) => (
                              <tr key={i}>
                                <td>
                                  <p style={{ fontWeight: 500, color: pageColor }}>{row.studentName}</p>
                                  <p style={{ fontSize: 11, color: isDark ? '#8AB4F8' : '#4F46E5' }}>{row.mssv}</p>
                                </td>
                                <td style={{ color: bodyTextColor, fontSize: 12.5 }}>{row.quizTitle}</td>
                                <td><span style={{ fontWeight: 600, color: pageColor }}>{row.score}</span><span style={{ color: emptyTextColor }}>/{row.total}</span></td>
                                <td>
                                  <span style={{
                                    padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                                    background: row.percent >= 70 ? 'rgba(129,201,149,.12)' : row.percent >= 50 ? 'rgba(253,214,99,.1)' : 'rgba(242,139,130,.1)',
                                    color: row.percent >= 70 ? (isDark ? '#81C995' : '#059669') : row.percent >= 50 ? '#FDD663' : '#F28B82',
                                    border: `1px solid ${row.percent >= 70 ? 'rgba(129,201,149,.2)' : row.percent >= 50 ? 'rgba(253,214,99,.2)' : 'rgba(242,139,130,.2)'}`
                                  }}>
                                    {row.percent}%
                                  </span>
                                </td>
                                <td style={{ color: emptyTextColor, fontSize: 12 }}>{row.submittedAt}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                  }
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div style={{ padding: '12px 20px', borderTop: `1px solid ${modalHeaderBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: modalHeaderBg, flexShrink: 0 }}>
              <p style={{ fontSize: 12, color: emptyTextColor }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#81C995', display: 'inline-block', marginRight: 6 }} />
                {Object.values(uploads).reduce((acc, files) => acc + files.filter(d => d.status === 'done').length, 0)} tài liệu · {quizzes.length} đề
              </p>
              <button onClick={() => setSelectedCourse(null)} className="ag-btn ag-btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
