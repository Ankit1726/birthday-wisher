const tabLogin = document.getElementById("tab-login");
const tabCreate = document.getElementById("tab-create");
const loginForm = document.getElementById("login-form");
const createForm = document.getElementById("create-form");

if (Auth.isLoggedIn()) {
  window.location.href = "/dashboard";
}

tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabCreate.classList.remove("active");
  loginForm.classList.remove("hidden");
  createForm.classList.add("hidden");
});

tabCreate.addEventListener("click", () => {
  tabCreate.classList.add("active");
  tabLogin.classList.remove("active");
  createForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("login-error");
  errorEl.textContent = "";
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;
  try {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    Auth.setSession(data);
    window.location.href = "/dashboard";
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("create-error");
  errorEl.textContent = "";
  const username = document.getElementById("create-username").value.trim();
  const name = document.getElementById("create-name").value.trim();
  const password = document.getElementById("create-password").value;
  try {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, username, password }),
    });
    Auth.setSession(data);
    window.location.href = "/dashboard";
  } catch (err) {
    errorEl.textContent = err.message;
  }
});
