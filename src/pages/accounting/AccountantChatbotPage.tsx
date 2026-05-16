import { AccountantSidebar } from '@/components/layouts/AccountantSidebar';
import { AccountantHeader } from '@/components/layouts/AccountantHeader';
import { ChatbotView, CHATBOT_VIEW_CONFIGS } from '@/components/chatbot/ChatbotView';

export function AccountantChatbotPage() {
  return (
    <div className="flex h-screen bg-stone-50">
      <AccountantSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <AccountantHeader title="Trợ lý kế toán" />
        <ChatbotView config={CHATBOT_VIEW_CONFIGS.accountant} />
      </div>
    </div>
  );
}
