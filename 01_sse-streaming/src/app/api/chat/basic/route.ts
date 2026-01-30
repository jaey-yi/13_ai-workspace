//백앤드단의 API 호출 영역

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    //1. 프론트에서 전달되는 메세지 받기
    const { message } = await request.json(); //{meassage: '~~~'}
    //로그 확인용  console.log("message", message);
    if (!message) {
      return NextResponse.json(
        {
          error: "메세지 누락되었습니다",
        },
        { status: 400 },
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
        stream: false, // 일반 REST API 방식  (스트리밍 비활성화, 전체 응답 받기)
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

    // 4. Open AI 의 응답을 프론트로 전달
    const data = await response.json(); //응답 의 구조 : {...., choices : [{ message: {coontent: 'AI 답변'}}]}
    return NextResponse.json({
      success: true,
      message: data.choices[0].message.content, //**이게 최종으로 보내는 message 임
    });
  } catch (error) {
    console.log("서버측 오류", error);
    return NextResponse.json(
      {
        error: "서버측 오류 발생",
      },
      {
        status: 500,
      },
    );
  }
}
