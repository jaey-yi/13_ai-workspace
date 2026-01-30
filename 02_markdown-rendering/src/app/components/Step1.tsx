import { SAMPLE_MARKDOWN } from "@/data/sample";
import ReactMarkdown from "react-markdown";

export default function Step1() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Step 1. 기본{" "}
        <code className="px-1 py-0.5 rounded bg-gray-100 text-xs">
          react-markdown
        </code>
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        별도의 플러그인 없이 순수 마크다운만 렌더링합니다.
        GFM(테이블/체크박스)은 깨져 보입니다.
      </p>
      <div className="w-full rounded-lg border text-black border-gray-200 bg-gray-50/80 p-3">
        <div className="markdown-native">
          {/* react-markdown 사용해보기 */}
          <ReactMarkdown>{SAMPLE_MARKDOWN}</ReactMarkdown>{" "}
          {/*ReactMarkdown : Markdown 텍스트를 HTML 요소로 렌더링해주는 React 컴포넌트 라이브러리*/}
        </div>
      </div>
    </div>
  );
}
