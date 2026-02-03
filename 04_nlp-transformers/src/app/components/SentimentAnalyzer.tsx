"use client";

import { useEffect, useRef, useState } from "react";
import { pipeline } from "@huggingface/transformers";

type SentimentResult = { label: string; score: number } | null;

export default function SentimentAnalyzer() {
  // 초기 분석 모델 로딩 중 여부 상태
  const [loading, setLoading] = useState(true);
  // 모델 로딩 진행 상태 (0 => 95 (부드럽게 점진적으로))
  const [progress, setProgress] = useState(0);
  // 모델 로딩 진행 상태 표시를 위한 상태 (모델 준비 중.. => 모델 다운로드 중… => 모델 로딩 완료)
  const [progressLabel, setProgressLabel] = useState("모델 준비 중…");

  // 입력 문장 상태
  const [input, setInput] = useState("");

  // 분석 중 여부 표시를 위한 상태
  const [analyzing, setAnalyzing] = useState(false);
  // 분석 결과 표시를 위한 상태
  const [result, setResult] = useState<SentimentResult>(null);
  const [translateResult, setTranslateResult] = useState<string>("");
  // 오류 메시지 표시를 위한 상태
  const [error, setError] = useState<string | null>(null);

  const classifierRef = useRef<any>(null); //?? 렌더링을 발생시키지 않고 값을 저장하거나 DOM을 가리키기 위해 쓰는 훅.
  const translatorRef = useRef<any>(null);

  useEffect(() => {
    async function loadAllPipeline() {
      try {
        setProgressLabel("번역 모델 다운로드 중");
        const translator = await pipeline(
          "translation",
          "Xenova/nllb-200-distilled-600M",
          {
            progress_callback: (progress) => {
              if (progress.status === "progress") {
                const percent = Math.round(progress.progress);
                setProgressLabel(`${progress.file} 다운로드 중... ${percent}%`);
              }
            },
          },
        );
        translatorRef.current = translator;
        setProgressLabel("번역 모델 로딩 완료");
        setProgressLabel("감정모델 다운로드 중");
        // progress_callback: 진행상황 중에 반복적으로 실행시킬 callback 함수 등록 옵션

        const classifier = await pipeline(
          "sentiment-analysis",
          "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
          {
            progress_callback: (args) => {
              if (args.status === "progress") {
                setProgress(args.progress); // 진행률 업데이트
                setProgressLabel(`${args.file} 다운로드 중`); // 내려받는 파일명 안내
              }
            },
          },
        );
        classifierRef.current = classifier;

        setProgressLabel("모델 로딩 완료");
        setLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : "모델 로드 실패");
      }
    }

    loadAllPipeline();
  }, []);

  // 분석 요청시 실행되는 함수
  const runAnalysis = async () => {
    //분석 시작
    setAnalyzing(true);
    try {
      // 변역 파이프라인
      const translatePipe = translatorRef.current;
      if (!translatePipe) {
        throw new Error("번역모델이 로딩 중 입니다. 잠시 후 다시 시도해주세요");
      }
      if (!input.trim()) throw new Error("분석할 문장을 입력해 주세요");

      const translateOutput = await translatePipe(input.trim(), {
        src_lang: "kor_Hang",
        tgt_lang: "eng_Latn",
      });

      setTranslateResult(
        (Array.isArray(translateOutput) ? translateOutput[0] : translateOutput)
          .translation_text,
      );

      console.log(translateResult);
      // 감정분석 파이프라인
      const classifierpipe = classifierRef.current;
      if (!classifierpipe) {
        throw new Error(
          "감석 분석 모델이 로딩 중 입니다. 잠시 후 다시 시도해주세요",
        );
      }

      const output = await classifierpipe(translateResult);
      const result = Array.isArray(output) ? output[0] : output;
      setResult(
        result
          ? {
              label: result.label,
              score: result.score,
            }
          : null,
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "분석 중 오류가 발생");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      runAnalysis();
    }
  };

  if (error && !loading) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        <p className="font-medium">오류</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-2 text-lg font-semibold text-zinc-800 dark:text-zinc-100">
        텍스트 감정 분석
      </h2>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        Transformers.js · ONNX · Quantization (브라우저에서 실행)
      </p>

      {/* 모델 로딩 표시: Progress Bar */}
      {loading && (
        <div className="mb-6">
          <div className="mb-1 flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>{progressLabel}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300 ease-out dark:bg-emerald-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {!loading && (
        <>
          <textarea
            className="mb-3 w-full resize-none rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            placeholder="문장을 입력한 뒤 [분석] 버튼 또는 Enter로 분석. 예: I love this product!"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={analyzing}
          />
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={runAnalysis}
              disabled={analyzing || !input.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              {analyzing ? "분석 중…" : "분석"}
            </button>
          </div>

          {/* 결과: POSITIVE/NEGATIVE + score */}
          {(analyzing || result) && (
            <div className="min-h-[3rem] rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800/50">
              {analyzing && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  분석 중…
                </p>
              )}
              {!analyzing && result && (
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                      result.label === "POSITIVE"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                    }`}
                  >
                    {result.label}
                  </span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">
                    score: {(result.score * 100).toFixed(1)}%
                  </span>
                  <span>{translateResult}</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
