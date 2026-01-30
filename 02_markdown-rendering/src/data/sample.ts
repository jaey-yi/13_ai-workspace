export const SAMPLE_MARKDOWN = `# ✨ AI 응답 예시

안녕하세요! 아래는 **AI가 돌려준 예시 응답**입니다.

## 1. 테이블 & 체크박스 (GFM)

할 일 목록:

- [x] \`react-markdown\` 설치
- [x] \`remark-gfm\` 적용
- [ ] 코드 블록 하이라이팅
- [ ] XSS 보안 처리

| 단계 | 내용                       | 상태   |
| ---- | -------------------------- | ------ |
| 1    | 기본 마크다운 렌더링      | 완료 ✅ |
| 2    | GFM (테이블/체크박스 등)  | 완료 ✅ |
| 3    | 코드 하이라이팅           | 진행중 ⏳ |
| 4    | 보안 / 커스터마이징       | 예정 🔐 |

---

## 2. 취소선 & 인라인 코드

~~옛날 방식 API~~ 대신에 \`/api/chat\` 같은 **프록시 API**를 활용합니다.

---

## 3. 코드 블록

\`\`\`ts
function greet(name: string) {
  console.log(\`Hello, \${name}\`);
}

greet('AI 프론트엔드 수업');
\`\`\`

\`\`\`java
public void main(String[] args) {
  System.out.println("Hello, World!");
}
\`\`\`

---

## 4. HTML 태그 (주의!)

<p style="color: #2563eb; font-weight: 600;">
  이 문장은 <strong>HTML 태그</strong>로 작성되었습니다.<br />
  <em>rehype-raw</em> + <strong>rehype-sanitize</strong>가 없으면 XSS 공격에 취약해질 수 있습니다.
</p>

<div style="padding: 12px; border-radius: 8px; border: 1px dashed #e5e7eb; background: #f9fafb;">
  <strong>Tip</strong>: 실제 서비스에서는 허용할 태그/속성을 꼭 제한해야 합니다.
</div>

---

## 5. 이미지 & 링크

![Next.js 로고](https://assets.vercel.com/image/upload/w_300/front/nextjs/twitter-card.png)

- 공식 문서: https://nextjs.org
- AI 모델 소개: [OpenAI](https://openai.com)

`;