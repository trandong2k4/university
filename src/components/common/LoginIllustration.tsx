import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { BookOpen, Brain, Users } from 'lucide-react';
import { LearningHubMark } from '@/components/common/LearningHubMark';

// Decorative elements inspired by Figma design
function Km1Component() {
  return <div className="absolute bg-[rgba(255,255,255,0.1)] right-[-64px] rounded-full size-64 top-[-32px]" />;
}

function Km2Component() {
  return <div className="absolute bg-[rgba(255,255,255,0.1)] right-[48px] rounded-full size-40 bottom-24" />;
}

export function LoginIllustration() {
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-7 xl:p-10 2xl:p-12 flex flex-col justify-center overflow-hidden">
      {/* Decorative background circles */}
      <Km1Component />
      <Km2Component />

      {/* Additional decorative elements */}
      <div className="absolute top-1/4 left-12 bg-[rgba(255,255,255,0.08)] rounded-full size-32 blur-xl" />
      <div className="absolute bottom-1/4 right-24 bg-[rgba(255,255,255,0.08)] rounded-full size-48 blur-2xl" />

      {/* Content */}
      <div className="relative z-10 space-y-5 2xl:space-y-7">
        {/* Logo & Title */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <LearningHubMark className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl 2xl:text-4xl font-bold text-white">LearningHub</h1>
          </div>

          <h2 className="text-2xl 2xl:text-3xl font-bold text-white leading-tight max-w-lg">
            Nền tảng quản lý đào tạo thông minh tích hợp AI
          </h2>

          <p className="text-blue-100 text-base 2xl:text-lg leading-relaxed max-w-lg">
            LearningHub là hệ thống quản lý đào tạo hiện đại, tích hợp công nghệ AI để hỗ trợ học viên theo dõi tiến độ học tập một cách hiệu quả.
          </p>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-2.5">
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-2 rounded-lg flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Quản lý học tập thông minh</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-2 rounded-lg flex items-center gap-2">
            <Brain className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Chatbot AI 24/7</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-2 rounded-lg flex items-center gap-2">
            <Users className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Theo dõi tiến độ realtime</span>
          </div>
        </div>

        {/* Illustration Image */}
        <div className="mt-4 2xl:mt-6 relative">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1771408427146-09be9a1d4535?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMGVkdWNhdGlvbiUyMHN0dWRlbnQlMjBsYXB0b3B8ZW58MXx8fHwxNzc0NTA3MjM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Online Learning"
              className="w-full h-[clamp(190px,36vh,300px)] object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 2xl:gap-6 pt-2 2xl:pt-4">
          <div className="text-center">
            <div className="text-2xl 2xl:text-3xl font-bold text-white">1000+</div>
            <div className="text-blue-200 text-sm mt-1">Học viên</div>
          </div>
          <div className="text-center">
            <div className="text-2xl 2xl:text-3xl font-bold text-white">50+</div>
            <div className="text-blue-200 text-sm mt-1">Khóa học</div>
          </div>
          <div className="text-center">
            <div className="text-2xl 2xl:text-3xl font-bold text-white">98%</div>
            <div className="text-blue-200 text-sm mt-1">Hài lòng</div>
          </div>
        </div>
      </div>
    </div>
  );
}
