
function showMessage(text, type = 'error') {
  const box = document.getElementById('messageBox');
  const textEl = document.getElementById('messageText');
  textEl.textContent = text;
  box.className = '';
  box.style.display = 'block';
  box.classList.add(type);
}

function hideMessage() {
  document.getElementById('messageBox').style.display = 'none';
}

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  hideMessage();

  if (username === '') {
    showMessage('Vui lòng nhập tên đăng nhập');
    return;
  }
  if (password === '') {
    showMessage('Vui lòng nhập mật khẩu');
    return;
  }

  if (username === 'admin' && password === '123') {
    showMessage('Đăng nhập thành công! Chuyển đến trang chủ...', 'success');
    setTimeout(() => {
      window.location.href = './App/trangchu.html';
    }, 1000);
  } else {
    showMessage('Sai tên đăng nhập hoặc mật khẩu');
  }
}

document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
  e.preventDefault();
  setTimeout(() => {
      window.location.href = './App/quenmatkhau.html';
    }, 400);
  // showMessage('Chuyển hướng đến trang lấy lại mật khẩu...', 'success');
});