const AUTH_API = "http://localhost:5000/api/auth";

// Login
async function login(email, password) {
    try {
        const response = await fetch(`${AUTH_API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",          // send/receive JWT cookie
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem("mealea_user", JSON.stringify({
                _id:   data._id,
                name:  data.name,
                email: data.email,
                role:  data.role
            }));
            // Redirect admin to dashboard but for everyone else to home
            window.location.href = data.role === "admin" ? "admin.html" : "index.html";
        } else {
            return { error: data.message || "Login failed" };
        }
    } catch (err) {
        console.error("Auth Error:", err);
        return { error: "Server connection failed. Is the backend running?" };
    }
}

// Register
async function register(name, email, password) {
    try {
        const response = await fetch(`${AUTH_API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("mealea_user", JSON.stringify({
                _id:   data._id,
                name:  data.name,
                email: data.email,
                role:  data.role
            }));
            window.location.href = "index.html";
        } else {
            return { error: data.message || "Registration failed" };
        }
    } catch (err) {
        console.error("Auth Error:", err);
        return { error: "Server connection failed. Is the backend running?" };
    }
}

async function logout() {
    try {
        await fetch(`${AUTH_API}/logout`, {
            method: "POST",
            credentials: "include"         
        });
    } catch (err) {
        console.error("Logout request failed:", err);
    } finally {

        localStorage.removeItem("mealea_user");
        window.location.href = "index.html";
    }
}


function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("mealea_user")) || null;
    } catch {
        return null;
    }
}

// Redirect if not login

function requireAuth() {
    if (!getCurrentUser()) {
        window.location.href = "login.html";
    }
}

//NAV UI UPDATE 
function updateAuthUI() {
    const user = getCurrentUser();

    const userInfo  = document.getElementById("nav-user-info");
    const loginBtn  = document.getElementById("nav-login-btn");
    const usernameEl = document.getElementById("nav-username");

    if (user && user.name) {
        if (userInfo)   { userInfo.style.display = "flex"; }
        if (loginBtn)   { loginBtn.style.display = "none"; }
        if (usernameEl) { usernameEl.textContent = user.name.split(" ")[0]; }
    } else {
        if (userInfo)   { userInfo.style.display = "none"; }
        if (loginBtn)   { loginBtn.style.display = ""; }
    }
}

function handleLogout() { logout(); }

document.addEventListener("DOMContentLoaded", updateAuthUI);