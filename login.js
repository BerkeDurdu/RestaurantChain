const errorBox = document.getElementById('errorBox');

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
  btn.disabled = true;
  btn.textContent = 'Lütfen bekleyin...';

  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Bir hata oluştu');
    window.location.href = '/';
  } catch (err) {
    showError(err.message);
    btn.disabled = false;
    btn.textContent = endpoint.endsWith('login') ? 'Giriş Yap' : 'Kayıt Ol';
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
