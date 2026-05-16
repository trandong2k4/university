import { InstructorSidebar } from '@/components/layouts/InstructorSidebar';
import { InstructorHeader } from '@/components/layouts/InstructorHeader';
import { ChatbotView, CHATBOT_VIEW_CONFIGS } from '@/components/chatbot/ChatbotView';

export function LecturerChatbotPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <InstructorSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <InstructorHeader title="Trợ lý giảng viên" />
        <ChatbotView config={CHATBOT_VIEW_CONFIGS.lecturer} />
      </div>
    </div>
  );
}
