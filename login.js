const errorBox = document.getElementById('errorBox');
const t = (k) => window.i18n ? window.i18n.t(k) : k;

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.add('show');
}
function clearError() {
  errorBox.classList.remove('show');
}

document.querySelectorAll('.login-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.login-form').forEach(f => f.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.form === 'login' ? 'loginForm' : 'registerForm';
    document.getElementById(target).classList.add('active');
    clearError();
  });
});

async function submitForm(form, endpoint) {
  clearError();
  const fd = new FormData(form);
  const body = Object.fromEntries(fd.entries());
  const btn = form.querySelector('button[type=submit]');
  const originalKey = endpoint.endsWith('login') ? 'login.signIn' : 'login.signUp';
  btn.disabled = true;
  btn.textContent = t('login.loading');

  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || t('login.genericError'));
    window.location.href = '/';
  } catch (err) {
    showError(err.message);
    btn.disabled = false;
    btn.textContent = t(originalKey);
  }
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  submitForm(e.target, '/api/auth/login');
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  submitForm(e.target, '/api/auth/register');
});
