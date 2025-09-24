
document.addEventListener('DOMContentLoaded', () => {
    const userRole = 'Admin'; // Change this variable to 'Giảng viên' or 'Sinh viên' to test different menus

    const mainMenu = document.getElementById('main-menu');
    const contactForm = document.getElementById('contact-form');
    const logoutBtn = document.getElementById('logoutBtn');
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatContent = document.getElementById('chat-content');

    // Function to render menu based on user role
    function renderMenu(role) {
        let menuItems = [
            { name: 'Trang chủ', href: '../App/trangchu.html', icon: 'home' },
            { name: 'Giới thiệu', href: '../App/gioithieu.html', icon: 'info-circle' },
            { name: 'Khóa học', href: '../App/khoaghoc.html', icon: 'book' },
            { name: 'Lịch thi', href: '../App/lichthui.html', icon: 'calendar-alt' },
            { name: 'Tin tức', href: '../App/tintuc.html', icon: 'newspaper' },
            { name: 'Liên hệ', href: '../App/lienhe.html', icon: 'envelope' },
        ];

        mainMenu.innerHTML = menuItems.map(item => `
            <li>
                <a href="${item.href}" class="text-gray-600 hover:text-blue-600 transition-colors">
                    <i class="fas fa-${item.icon} mr-1"></i> ${item.name}
                </a>
            </li>
        `).join('');

        // Add logout button separately
        const logoutItem = document.createElement('li');
        logoutItem.innerHTML = `<a href="#" id="logoutBtn" class="text-red-500 hover:text-red-700 transition-colors font-semibold">Đăng xuất</a>`;
        mainMenu.appendChild(logoutItem);

        // Add event listener to the newly created logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            alert('Bạn đã đăng xuất khỏi hệ thống.');
        });
    }

    // Render menu on page load
    renderMenu(userRole);

    // Contact form submission logic
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thông tin liên hệ của bạn đã được gửi thành công!');
        contactForm.reset();
    });

    // Chatbot logic
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
            aiBubble.innerHTML = `<div class="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs">Chào bạn, tôi có thể giải đáp các thắc mắc về hệ thống.</div>`;
            chatContent.appendChild(aiBubble);
            chatContent.scrollTop = chatContent.scrollHeight;
        }, 1000);
    });
});