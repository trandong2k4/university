import { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { FileCheck2, FileWarning, BookOpenText, Search } from 'lucide-react';
import { AdminAIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import { useAsync } from '@/hooks';
import { adminRepository, workflowRepository } from '@/api';
import type { AdminContentItem } from '@/types';

export default function AdminContentPage() {
  const [search, setSearch] = useState('');
  const [contentItems, setContentItems] = useState<AdminContentItem[]>([]);
  const { data = [] } = useAsync(() => adminRepository.getContentItems(), []);

  useEffect(() => {
    setContentItems(data);
  }, [data]);

  const handleUpdateStatus = async (id: string, status: AdminContentItem['status']) => {
    const current = contentItems.find((item) => item.id === id);
    await adminRepository.updateContentStatus(id, status);
    await workflowRepository.appendLog({
      actorRole: 'admin',
      actorId: 'admin',
      module: 'admin-content',
      action: status === 'approved' ? 'approve_content' : 'reject_content',
      entityId: id,
      fromStatus: current?.status,
      toStatus: status,
      note: `Duyệt nội dung ${id}`,
    });
    setContentItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const filtered = contentItems.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.owner.toLowerCase().includes(search.toLowerCase()) ||
      item.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      <AdminSidebar activeMenu="content" />
      <div className="flex-1 ml-64 flex flex-col">
        <AdminHeader title="Nội dung học tập" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5"><p className="text-sm text-gray-500">Nội dung chờ duyệt</p><p className="text-2xl font-bold text-amber-600">16</p></div>
              <div className="bg-white border border-gray-200 rounded-xl p-5"><p className="text-sm text-gray-500">Đã xuất bản</p><p className="text-2xl font-bold text-green-600">124</p></div>
              <div className="bg-white border border-gray-200 rounded-xl p-5"><p className="text-sm text-gray-500">Nội dung lỗi chuẩn</p><p className="text-2xl font-bold text-red-600">3</p></div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tiêu đề, giảng viên, môn học..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filtered.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{item.type} • {item.subject}</p>
                    <h3 className="text-lg font-bold text-[#0a2540]">{item.title}</h3>
                    <p className="text-sm text-gray-600">Giảng viên: {item.owner}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {item.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                    <button onClick={() => handleUpdateStatus(item.id, 'approved')} className="px-3 py-2 bg-[#0a2540] text-white rounded-lg inline-flex items-center gap-2"><FileCheck2 className="w-4 h-4" />Duyệt</button>
                    <button onClick={() => handleUpdateStatus(item.id, 'rejected')} className="px-3 py-2 border border-red-300 text-red-700 rounded-lg inline-flex items-center gap-2"><FileWarning className="w-4 h-4" />Từ chối</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 inline-flex items-start gap-3 text-sm text-blue-900">
              <BookOpenText className="w-5 h-5 mt-0.5" />
              <span>Admin kiểm soát chất lượng nội dung trước khi sinh viên nhìn thấy trên các trang tài liệu, bài tập, quiz.</span>
            </div>
          </div>
        </div>
      </div>
      <AdminAIAssistantButton />
    </div>
  );
}


