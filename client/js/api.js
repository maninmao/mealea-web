const API_BASE = "http://localhost:5000/api";

async function request(endpoint, method = "GET", data = null) {
  const res = await fetch(API_BASE + endpoint, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: data ? JSON.stringify(data) : null
  });

  return res.json();
}