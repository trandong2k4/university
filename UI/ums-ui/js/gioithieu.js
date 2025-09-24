
// Reusing JS functions from the Home page for consistency
document.getElementById('logoutBtn').addEventListener('click', function(event) {
    event.preventDefault();
    console.log('Đăng xuất thành công. Chuyển hướng về trang đăng nhập.');
    //alert('Đăng xuất thành công. Chuyển hướng về trang đăng nhập.');
    setTimeout(() => {
            // Chuyển hướng đến trang chủ
            window.location.href = '../dangnhap.html'; // Thay thế bằng URL trang chủ thực tế
    }, 1500);
});

const chatbotIcon = document.getElementById('chatbot-icon');
const chatbotWindow = document.getElementById('chatbot-window');
const closeChatBtn = document.getElementById('close-chat-btn');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatContent = document.getElementById('chat-content');

chatbotIcon.addEventListener('click', () => {
    chatbotWindow.classList.toggle('hidden');
});

closeChatBtn.addEventListener('click', () => {
    chatbotWindow.classList.add('hidden');
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userMessage = chatInput.value.trim();
    if (userMessage === '') return;

    const userBubble = document.createElement('div');
    userBubble.className = 'flex justify-end mb-2';
    userBubble.innerHTML = `<div class="bg-blue-500 text-white p-3 rounded-lg max-w-xs">${userMessage}</div>`;
    chatContent.appendChild(userBubble);
    chatInput.value = '';
    chatContent.scrollTop = chatContent.scrollHeight;

    setTimeout(() => {
        const aiBubble = document.createElement('div');
        aiBubble.className = 'flex justify-start mb-2';
        aiBubble.innerHTML = `<div class="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs">Chào bạn, tôi có thể cung cấp thêm thông tin gì về Learning Hub?</div>`;
        chatContent.appendChild(aiBubble);
        chatContent.scrollTop = chatContent.scrollHeight;
    }, 1000);
});