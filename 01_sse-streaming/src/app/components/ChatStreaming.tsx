"use client";

import { useState } from "react";

export default function ChatStreaming() {
  const [message, setMessage] = useState(""); // 사용자 입력 메세지
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(""); // 에러 메시지
  const [response, setResponse] = useState(""); // 응답 메시지 (대기중일 때는 빈 문자열)

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    // *로직1. 제출 핸들러 발생했을 때
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");
    try {
      // *로직2. fetch 실행, 응답 response 없으면 error 읽거나 오류 안내
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        throw new Error(
          (await response.json()).error || "오류가 발생하였습니다",
        );
      }

      // ReadableStream = fetch함수를 실행하여 얻은 response 객체의 body의 타입
      // ReadableStream 의 기본 구조
      // : controller - stream 을 컨트롤 하는 역할 , stream 에 데이터 push 또는 / stream 에 데이터를 close
      // : reader - stream 에서 데이터를 읽는 객체

      // *로직3. 프론트엔드에서 SSE 스트리밍 처리
      const reader = response.body?.getReader(); //getReader = ReadableStram 의 reader(stream 의 데이터를 읽는 객체)를 생성하고, 스트림을 리더에 고정하는 메소드
      if (!reader) {
        throw new Error("스트림을 읽을 수 없습니다");
      }

      const decoder = new TextDecoder();

      // *로직 4. stream 의 데이터인, reader 객체를 통해 청크단위의 모든 데이터들 반복해서 읽는 while 문
      while (true) {
        //reader() = stream 에서 제공하는 데이터를 비동기로 읽을 수 있게하는 메소드 , done(스트림에서 데이터를 모두 읽었는지 ) 과 value(바로 읽은 데이터가) 속성의 객체를 promise 로 생성함
        // *로직4-1. reader 데이터를 비동기로 읽은 내용을, 문자열로 디코딩 해서 저장 chunk 단위로 저장
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        //console.log(chunk);

        // *로직4-2 = chunk 단위를 줄바꿈 기준으로 분리해서 저장
        const lines = chunk.split("\n");
        for (const line of lines) {
          console.log(line); //"data: JSON 문자열" || ""

          // *로직4-3 = 한묶음의 chunk 에서 6번째 배열 choices 만 따로 분리 후저장
          const data = line.slice(6);

          try {
            // *로직 4-4 = choices 단위 에서 , JSON을 문자열로 바꾼 후 , 객체의 content 분리 후 저장
            const json = JSON.parse(data);
            const content = json.content;

            // *로직 4-5 최종 content 를 화살표 함수로 이전 값에서 계속해서 합한 후 setResponse 로 response 상태 값으로 넣어주기
            setResponse((prev) => prev + content);
          } catch (error) {} //JSON parson 오류 (빈문자열) 그냥 통과
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        스트리밍 방식 (SSE) - Latency Masking
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        응답이 생성되는 동안 실시간으로 볼 수 있습니다. (타자 치듯이)
      </p>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "스트리밍 중..." : "전송"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {response && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-2 text-gray-800">응답 (실시간):</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {response}
            {loading && (
              <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse" />
            )}
          </p>
        </div>
      )}

      {loading && !response && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-700">스트리밍을 시작하는 중...</p>
        </div>
      )}
    </div>
  );
}
