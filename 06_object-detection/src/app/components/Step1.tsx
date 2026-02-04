"use client";

import { useEffect, useRef, useState } from "react";
import "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

/** COCO-SSD가 반환하는 감지 결과 한 건의 타입 (bbox: [x, y, width, height]) */
type DetectedObject = {
  bbox: [number, number, number, number];
  class: string;
  score: number;
};

export default function Step1() {
  // 모델 로딩 여부
  const [modelLoading, setModelLoading] = useState(true);
  // 모델 로딩 진행 퍼센트
  const [progress, setProgress] = useState(0);
  // 모델 로딩 진행 상태 메시지
  const [progressLabel, setProgressLabel] = useState("모델 준비 중…");

  // 이미지를 표시할 <img> 엘리먼트, 탐지시에도 필요 (Ref 사용)
  const imgRef = useRef<HTMLImageElement>(null);

  // 이미지 미리보기 경로 (Base64 URL)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // 탐지 중 여부
  const [detecting, setDetecting] = useState(false);
  /** 감지된 객체 목록 → 화면에 텍스트로 표시 */
  const [detections, setDetections] = useState<DetectedObject[] | null>([]);

  // 에러 메시지
  const [error, setError] = useState<string | null>(null);

  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);

  useEffect(() => {
    let progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return Math.min(95, prev + Math.random() * 4 + 2);
      });
    }, 80);

    async function loadModel() {
      try {
        setProgressLabel("모델 로딩 중…");

        // 필요 모델 로드
        const model = await cocoSsd.load();
        modelRef.current = model;

        if (progressInterval) clearInterval(progressInterval);
        setProgress(100);
        setProgressLabel("모델 로딩 완료");
        setModelLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "모델 로딩 중 오류가 발생했습니다.",
        );
        if (progressInterval) clearInterval(progressInterval);
        setModelLoading(false);
      }
    }
    loadModel();

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, []);

  if (error && !modelLoading) {
    return (
      <div className="w-full max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        <p className="font-medium">오류</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // 파일 리스트에서 첫번째 파일 선택
    if (!file) {
      setSelectedImage(null);
      setDetections([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string); // 미리보기 이미지 설정
      setDetections(null); // 기존 탐지 결과 초기화
    };
    reader.readAsDataURL(file); // 파일 읽어서 Base64 URL로 변환
  };

  const detectObjects = async () => {
    const model = modelRef.current;
    const imgElement = imgRef.current;
    if (!model || !imgElement) {
      setError("모델이미지가 준비되지 않았습니다.");
      return;
    }
    setDetecting(true);
    setError(null);

    try {
      const results = await model.detect(imgElement, 20);

      if (!results) {
        setDetections([]);
      } else {
        setDetections(results);
        console.log(results);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : " 탐지 실패");
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-2 text-lg font-semibold text-zinc-800 dark:text-zinc-100">
        이미지 내의 객체 탐지
      </h2>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        TensorFlow.js · COCO-SSD · 감지된 객체의 데이터만 텍스트로 표시
      </p>

      {modelLoading && (
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

      {!modelLoading && (
        <>
          <div className="mb-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-sm text-zinc-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-4 file:py-2 file:text-emerald-700 dark:text-zinc-300 dark:file:bg-emerald-900/50 dark:file:text-emerald-300"
            />
          </div>

          {selectedImage && (
            <div className="mb-4 flex flex-col gap-3">
              <img
                ref={imgRef}
                src={selectedImage}
                alt="탐지할 이미지"
                className="max-h-64 w-auto rounded-lg border border-zinc-200 object-contain dark:border-zinc-600"
              />
              <button
                type="button"
                onClick={detectObjects}
                disabled={detecting}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                {detecting ? "탐지 중…" : "탐지 실행"}
              </button>
            </div>
          )}

          {(detecting || detections !== null) && (
            <div className="mb-4 min-h-16 rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800/50">
              {detecting && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  탐지 중…
                </p>
              )}
              {!detecting && detections?.length === 0 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  감지된 객체가 없습니다.
                </p>
              )}
              {!detecting && detections && detections?.length > 0 && (
                <>
                  <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    감지된 객체 (class, score)
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {detections?.map((obj, i) => (
                      <li
                        key={`${obj.class}-${i}`}
                        className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      >
                        {obj.class} {(obj.score * 100).toFixed(0)}%
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
              <p className="text-sm">{error}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
