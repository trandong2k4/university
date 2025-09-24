// ums-frontend/js/contact.js
// Reusing common JS functions for consistency
document.getElementById('logoutBtn').addEventListener('click', function (event) {
    event.preventDefault();
    console.log('Đăng xuất thành công. Chuyển hướng về trang đăng nhập.');
    alert('Đăng xuất thành công. Chuyển hướng về trang đăng nhập.');
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
        aiBubble.innerHTML = `<div class="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs">Chào bạn, tôi có thể cung cấp thêm thông tin về liên hệ?</div>`;
        chatContent.appendChild(aiBubble);
        chatContent.scrollTop = chatContent.scrollHeight;
    }, 1000);
});

// Form Submission Logic
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Simple validation
    if (!name || !email || !message) {
        formMessage.textContent = 'Vui lòng điền đầy đủ tất cả các trường.';
        formMessage.classList.remove('hidden', 'text-green-600');
        formMessage.classList.add('text-red-600');
        return;
    }

    // Simulate sending form data
    console.log('Form submitted:', { name, email, message });

    // Display success message
    formMessage.textContent = 'Cảm ơn bạn! Thông tin đã được gửi thành công.';
    formMessage.classList.remove('hidden', 'text-red-600');
    formMessage.classList.add('text-green-600');
    contactForm.reset();
});