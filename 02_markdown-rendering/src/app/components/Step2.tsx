import { SAMPLE_MARKDOWN } from "@/data/sample";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Step2() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Step 2.{" "}
        <code className="px-1 py-0.5 rounded bg-gray-100 text-xs">
          remark-gfm
        </code>{" "}
        적용
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        GitHub Flavored Markdown: 테이블, 체크박스, 취소선 등이 제대로
        렌더링됩니다.
      </p>
      <div className="w-full rounded-lg border border-gray-200 bg-gray-50/80 p-3">
        <div className="markdown-native">
          {/* remark-gfm 사용해보기 */}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {SAMPLE_MARKDOWN}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
