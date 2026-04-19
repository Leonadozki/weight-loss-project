import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-6xl font-bold text-green-500 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">页面迷路了</h2>
        <p className="text-gray-600 mb-8">
          您访问的页面不存在或已被移除。让我们一起回到正轨，继续您的健康减脂之旅。
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link
            href="/"
            className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
          >
            返回首页
          </Link>
          <Link
            href="/dashboard"
            className="bg-white text-green-600 border-2 border-green-500 px-6 py-3 rounded-xl font-medium hover:bg-green-50 transition-colors"
          >
            个人中心
          </Link>
        </div>
      </div>
    </div>
  );
}
