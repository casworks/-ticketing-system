const Api = (() => {
  function token() {
    return localStorage.getItem("token");
  }

  function currentUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }

  function requireLogin() {
    if (!token()) window.location.href = "/index.html";
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/index.html";
  }

  async function request(method, url, body) {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token() ? { Authorization: `Bearer ${token()}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (res.status === 401) {
      logout();
      return;
    }
    const data = res.status === 204 ? null : await res.json();
    if (!res.ok) throw new Error(data && data.error ? data.error : `Request failed (${res.status})`);
    return data;
  }

  return {
    get: (url) => request("GET", url),
    post: (url, body) => request("POST", url, body),
    patch: (url, body) => request("PATCH", url, body),
    put: (url, body) => request("PUT", url, body),
    del: (url) => request("DELETE", url),
    token,
    currentUser,
    requireLogin,
    logout
  };
})();
