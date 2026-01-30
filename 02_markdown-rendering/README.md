마크다운 렌더링 (AI UX) 방법

1. ReactMarkdown 태그
   import - react-ReactMarkdown / remarkGfm,  
    => ReactMarkdown 태그 사용
   <ReactMarkdown >
2. remark-gfm
   import - react-ReactMarkdown ,remarkGfm, Prism , vscDarkPlus
   => ReactMarkdown 태그 사용 + 태그 내부 remarkPlugins 값 주기 \* 단, 정규표현식으로 코드 lauguage 추출 해야함
   <ReactMarkdown remarkPlugins={[remarkGfm]}>
3. react-syntax-highlighter > rehype-raw
   import - react-ReactMarkdown ,remarkGfm, Prism , vscDarkPlus, rehypeRaw
   ReactMarkdown 태그 사용 + 태그 내부 remarkPlugins = {[remarkGfm]} 값 주기 + 태그 내부 rehypePlugins={[rehypeRaw]} 값 주기
   코드 문자열을 언어에 맞게 하이라이트해 주는 React 컴포넌트 라이브러리
   rehypeRaw : 보안에 취약할 수 있음 / 왜? rehypeRaw 은 HTML 문자열을 실제 HTML AST로 파싱하도록 허용

4. react-syntax-highlighter > rehype-sanitize
   import - react-ReactMarkdown ,remarkGfm, Prism , vscDarkPlus, rehypeRaw
   rehypeSanitize : 허용할 태그/속성을 화이트리스트로 정의하여, 안전하지 않은 태그나 속성을 제거해 주는 플러그인
