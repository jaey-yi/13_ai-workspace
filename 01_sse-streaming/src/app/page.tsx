import ChatRestAPI from "./components/ChatRestAPI";
import ChatStreaming from "./components/ChatStreaming";


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <main className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI 서비스 연동 및 UX 고도화
          </h1>
          <p className="text-lg text-gray-600">
            백엔드 AI API 연동과 스트리밍을 통한 사용자 경험 개선
          </p>
        </div>

        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            {/* 일반 REST API 방식의 AI 챗봇 */}
            <ChatRestAPI />
          </div>
          <div>
            {/* 스트리밍 방식의 AI 챗봇 */}
            <ChatStreaming />
          </div>
        </div>

      </main>
    </div>
  );
}
