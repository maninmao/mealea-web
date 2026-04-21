const API_BASE = "http://127.0.0.1:5000/api";

export async function request(endpoint, method = "GET", data = null) {
  const res = await fetch(API_BASE + endpoint, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",          // sends JWT cookie on every request
    body: data ? JSON.stringify(data) : null
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }

  return res.json();
}