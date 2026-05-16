import { useAuth } from '@/hooks';
import { StudentSidebar } from '@/components/layouts/StudentSidebar';
import { StudentHeader } from '@/components/layouts/StudentHeader';
import { ChatbotView, CHATBOT_VIEW_CONFIGS } from '@/components/chatbot/ChatbotView';

export function ChatbotPage() {
  const { user } = useAuth();
  const userName = user?.fullName || user?.username || '';

  return (
    <div className="flex h-screen bg-gray-50">
      <StudentSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <StudentHeader userName={userName} title="Trợ lý học viên" />
        <ChatbotView config={CHATBOT_VIEW_CONFIGS.student} />
      </div>
    </div>
  );
}
