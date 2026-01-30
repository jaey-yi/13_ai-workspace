"use client";

import { useState } from "react";

/*
  ## 일반 REST API 방식으로 AI 챗봇 구현 ##
  일반적인 fetch API를 사용하여 응답을 한 번에 받아와서 출력 
  => 사용자는 전체 응답이 완성될 때까지 기다려야됨 
*/

export default function ChatRestAPI() {
  const [message, setMessage] = useState(""); // 사용자 입력 메세지
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(""); // 에러 메시지
  const [response, setResponse] = useState(""); // 응답 메시지 (대기중일 때는 빈 문자열)

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResponse("");
    // 여기서 (클라이언트, 브라우저) 직접 open API 호출 할 경우 => CORS 위반, API key 노출(보안문제)
    // 따라서(Next.js API Route 로 대체), 백엔드에서 진행해야함

    try {
      //1. api 요청
      const response = await fetch("/api/chat/basic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", //json타입일때 필수
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      // 2. json 형식 문자열로 변환
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }
      // 3. response 상태값에, api 반환을 - 문자열로 반환한 값을 넣기
      setResponse(data.message);
    } catch (error) {
      setError(error instanceof Error ? error.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        일반 REST API 방식
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        전체 응답이 완성될 때까지 기다려야 합니다.
      </p>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "전송 중..." : "전송"}
          </button>
        </div>
      </form>

      {/* 에러 메시지 출력 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 응답 출력 */}
      {response && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-2 text-gray-800">응답:</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
        </div>
      )}

      {/* 로딩 중 메시지 출력 */}
      {loading && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-700">응답을 기다리는 중...</p>
        </div>
      )}
    </div>
  );
}
