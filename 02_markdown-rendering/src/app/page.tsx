import { SAMPLE_MARKDOWN } from "@/data/sample";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Step4 from "./components/Step4";

export default function Home() {
  return (
    <div className="min-h-screen  from-blue-50 to-indigo-100 py-12 px-4">
      <main className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI 응답을 위한 마크다운 렌더링
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            코드 블록, 표, 체크박스, HTML 태그까지 &quot;텍스트&quot;를
            <span className="font-semibold"> 개발자 도구급 UI</span>로 바꿔보는
            실습
          </p>
        </header>

        <section className="mb-10">
          <div className="space-y-8">
            <section className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  AI 응답 텍스트 (Markdown - Raw Text)
                </h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                OpenAI 응답이 아래와 같다고 가정하고, 이 마크다운 문자열을
                단계별로 렌더링해 봅니다.
              </p>
              <textarea
                className="w-full h-64 text-sm font-mono rounded-lg border text-black border-gray-200 bg-gray-50/80 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
                defaultValue={SAMPLE_MARKDOWN}
              />
            </section>

            <section className="grid gap-6   lg:grid-cols-2">
              {/* Step 1: 기본 react-markdown */}
              <Step1 />

              {/* Step 2: remark-gfm */}
              <Step2 />

              {/* Step 3: 코드 하이라이팅 */}
              <Step3 />

              {/* Step 4: HTML + sanitize + 커스터마이징 */}
              <Step4 />
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
