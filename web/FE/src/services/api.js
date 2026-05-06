export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    credentials: "include",
    headers: { ...(options.headers || {}) },
    ...options,
  };
  if (config.method && config.method !== "GET") {
    config.headers["X-CSRFToken"] = getCSRFToken();
  }
  if (config.body && !(config.body instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  if (config.method && config.method != 'GET') {
    config.headers["X-CSRFToken"] = document.cookie.split("csrftoken=")[1];
  }

  const res = await fetch(url, config);
  if (res.status === 401 || res.status === 403) {
    return { ok: false, status: res.status, data: null };
  }
  let data = null;
  const ct = res.headers.get("content-type");
  if (ct && ct.includes("application/json")) data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export const authApi = {
  getGoogleLoginUrl: () => `${API_BASE}/auth/login`,
  logout: async () => {
    try {
      const response = await request("/auth/logout", {
        method: "POST",
      });
      console.log("Logout API called successfully");
      return response;
    } catch (error) {
      console.error("Logout API error:", error);
      throw error;
    }
  },
};

export const userApi = {
  getMe: () => request("/users/me"),
  getStudentCourses: () => request("/api/student/courses"),
};

export const chatApi = {
  getSessions: () => request("/api/chat"),
  createSession: (title) =>
    request("/api/chat", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  getMessages: (chatId) => request(`/api/chat/${chatId}`),
  sendMessage: (chatId, query, model = "gpt-3.5") =>
    request(`/api/chat/${chatId}`, {
      method: "POST",
      body: JSON.stringify({ query, model, streaming: false }),
    }),
  updateSession: (chatId, title) =>
    request(`/api/chat/${chatId}`, {
      method: "PUT",
      body: JSON.stringify({ title }),
    }),
  deleteSession: (chatId) =>
    request(`/api/chat/${chatId}`, { method: "DELETE" }),
  headers: {
    "X-CSRFToken": document.cookie.split("csrftoken=")[1],
  },
};

export const instructorApi = {
  getSubjects: () => request("/api/instructors/self/subjects"),
  
};

export const fileApi = {
  getUploads: () => request("/api/file"),
  upload: (files, metadata) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    fd.append("metadata", JSON.stringify(metadata));
    return request("/api/file", {
      method: "POST",
      body: fd,
      headers: { "X-CSRFToken": document.cookie.split("csrftoken=")[1] },
    });
  },
  getUpload: (fileId) => request(`/api/file/${fileId}`),
  renameUpload: (fileId, fileName) =>
    request(`/api/file/${fileId}`, {
      method: "PUT",
      body: JSON.stringify({ file_name: fileName }),
    }),
  deleteUpload: (fileId) =>
    request(`/api/file/${fileId}`, { method: "DELETE" }),
  headers: {
    "X-CSRFToken": document.cookie.split("csrftoken=")[1],
  },
};

export const quizApi = {
  createQuiz: (courseId, data) =>
    request("/api/quiz", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId, ...data }),
    }),
  getQuizzesByCourse: (courseId) => request(`/api/quiz?course_id=${courseId}`),
  getQuizById: (quizId) => request(`/api/quiz/${quizId}`),
  submitQuiz: (quizId, answers) =>
    request(`/api/quiz/${quizId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
  getQuizStats: (courseId) => request(`/api/quiz/stats?course_id=${courseId}`),
  deleteQuiz: (quizId) => request(`/api/quiz/${quizId}`, { method: "DELETE" }),
  generateQuiz: (courseId, params) =>
    request("/api/quiz/generate", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId, ...params }),
    }),
};
function getCSRFToken() {
  return document.cookie.split("csrftoken=")[1];
}

export default { authApi, userApi, chatApi, instructorApi, fileApi, quizApi };
