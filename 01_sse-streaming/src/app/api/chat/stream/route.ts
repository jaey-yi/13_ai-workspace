import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 1. 사용자 입력 메세지 전달 받기
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json(
        {
          error: "메세지가 누락 되었습니다",
        },
        { status: 500 },
      );
    }

    // 2. OpenAI API 연동을 위한 key 가져오기 (환경변수)
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "openAI Key 가 설정 되지 않았습니다",
        },
        { status: 500 },
      );
    }

    // 3. OpenAI 연동 (SDK vs "API 요청")
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Respond in Korean",
          },
          {
            role: "user",
            content: message,
          },
        ],
        stream: true, // 스트리밍 응답 방식
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Open AI API 오류",
        },
        { status: response.status },
      );
    }

    // 4. OpenAI 응답 (response.body) ReadableStram
    const stream = new ReadableStream({
      // ReadableStream = fetch함수를 실행하여 얻은 response 객체의 body의 타입
      // ReadableStream 의 기본 구조
      // : controller - stream 을 컨트롤 하는 역할 , stream 에 데이터 push 또는 / stream 에 데이터를 close
      // : reader - stream 에서 데이터를 읽는 객체

      start: async (controller) => {
        // *로직1. stram이 정의가 될때  (클라이언트가 API 연결시) start 함수를 자동으로 시작하게 하는 로직
        const reader = response.body?.getReader(); //getReader = ReadableStram 의 reader(stream 의 데이터를 읽는 객체)를 생성하고, 스트림을 리더에 고정하는 메소드
        const decoder = new TextDecoder();

        if (!reader) {
          controller.close(); // 응답바디 = controllser 가 없으면 스트림 종료
          return;
        }

        try {
          // *로직2. stream 의 데이터 = reader 객체를 통해 청크단위의 모든 데이터들 반복해서 읽는 while 문
          while (true) {
            const { done, value } = await reader.read();
            //reader() = stream 에서 제공하는 데이터를 비동기로 읽을 수 있게하는 메소드 , done(스트림에서 데이터를 모두 읽었는지 ) 과 value(바로 읽은 데이터가) 속성의 객체를 promise 로 생성함
            if (done) {
              controller.close();
              break;
            }
            //value : Uint8Array 바이너리데이터 => 필요한 데이터를 걸러서 - 서버단에서, 디코딩 해서 문자열로 프론트에 보낸다
            //chunk (value 를 문자열로 디코딩한 결과) :{...,choices:[{delta: {...,content:"~~"}}]} // 분리: data:JSON 문자열{~~~}\n\ndata: JSON문자열{~~~}

            // *로직3. reader 데이터를 비동기로 읽은 내용을, 문자열로 디코딩 해서 저장 chunk 단위로 저장
            const chunk = decoder.decode(value, { stream: true });
            //console.log(chunk);
            //console.log("----------------------------");

            // *로직4. chunk 단위로 저장된 데이터를 줄바꿈 기준으로 나눠서, 나눈 배열의 6번째(choices)를 data 로 선언
            const lines = chunk.split("\n"); // ['data: JSON 문자열{~~~}', ...]
            for (const line of lines) {
              //console.log("line-", line);
              const data = line.slice(6);
              // *로직5. Done 일때 controller 데이터 주기 멈춤
              if (data === "[DONE]") {
                controller.close();
                return;
              }
              try {
                // *로직6. 빈문자열이 아닐때, choices 내부의 content 를 저장.
                const json = JSON.parse(data); // JSON 객체 data 가 빈문자열일 경우 , error => catch
                //console.log(json);
                const content = json.choices[0]?.delta?.content || "";
                if (content) {
                  // *로직7. 최종 SSE 방식으로 데이터를 가공해서 , 프론트에 content 전달
                  const sseData = `data: ${JSON.stringify({ content })}\n\n`;
                  //enqueue() : 가공한데이터를 실시간으로 프론트엔드에 보내는 메소드
                  controller.enqueue(new TextEncoder().encode(sseData)); //JSON 문자열(new TextEncoder()) => 바이너리데티어(.encode(sseData))=>프론트로 흘려보내기(controller.enqueue()
                }
              } catch (error) {
                //JSON 문자열 파싱 오류 , 스킵 -> 별도 과정 없음
              }
            }
          }
        } catch (error) {
          console.log("스트림처리 오류:", error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    // 5. 클라이언트 측으로 응답하기 (body: stream 객체, headers:SSE 방식지정)
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        connection: "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "서버측에 오류가 발생하였습니다",
      },
      { status: 500 },
    );
  }
}
