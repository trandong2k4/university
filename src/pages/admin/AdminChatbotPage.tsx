import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { ChatbotView, CHATBOT_VIEW_CONFIGS } from '@/components/chatbot/ChatbotView';

export function AdminChatbotPage() {
  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      <AdminSidebar activeMenu="chatbot" />
      <div className="flex-1 ml-64 flex flex-col">
        <AdminHeader title="Trợ lý quản trị" />
        <ChatbotView config={CHATBOT_VIEW_CONFIGS.admin} />
      </div>
    </div>
  );
}
