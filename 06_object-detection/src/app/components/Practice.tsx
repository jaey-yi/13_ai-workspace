// 실습 탐지된 객체에 book 이 있을 경우 점수가 높은 (혹은 몇% 이상의 정확도 제한)crop 후 파일로 저장하기

// 1. 스크린샵 캡쳐 버튼 활성 / 비활성 먼저 해보기

"use client";

import { useEffect, useRef, useState } from "react";
import "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

type DetectedObject = {
  bbox: [number, number, number, number];
  class: string;
  score: number;
};

type CapturedFile = {
  id: number;
  objectUrl: string;
  blob: Blob;
  filename: string;
};

export default function Step3() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );

  // 에러 메세지
  const [error, setError] = useState<string>("");

  // 감지된 객체 목록
  const [detections, setDetections] = useState<DetectedObject[]>([]);
  const [isCaptured, setIsCaptured] = useState<boolean>(false);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);

  // 비디오 요소 (<video />)
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // requestAnimationFrame 루프 참조
  const refRef = useRef<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [capturedFiles, setCapturedFiles] = useState<CapturedFile[]>([]);

  const target = "cup";

  // 웹캠 켜기 버튼 클릭시 실행되는 함수 => 모델 로딩 및 웹캠 스트림 연결
  const startCamera = async () => {
    setStatus("loading");
    setError("");

    try {
      modelRef.current = await cocoSsd.load();
      // 웹캠 스트림 연결, 사용자의 카메라 스트림 객체 생성,
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      // 출력 시키기 위해 video 요소에 스트림 연결
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream; // 비디오 소스로 스트림 지정
      video.onloadedmetadata = () => {
        video.play(); // 비디오 재생
        setStatus("ready");
      };
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "웹캠 또는 모델 로드 실패",
      );
      setStatus("error");
    }
  };

  const startCapture = async () => {
    const canvas = canvasRef.current;

    if (!canvas) return;
    const targets = detections.filter((obj) => obj.class === target);

    for (const targetDet of targets) {
      // 여기서 각 person의 bbox로 crop 할 거야
      const [x, y, width, height] = targetDet.bbox;

      // 이미지

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const ctx = tempCanvas.getContext("2d");
      if (!canvas) return;

      const video = videoRef.current;
      if (!video) return;
      ctx?.drawImage(
        video,
        x,
        y,
        tempCanvas.width,
        tempCanvas.height,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height,
      );

      tempCanvas?.toBlob(
        // toBlob: canvas 요소의 이미지를 Blob 형태로 변환하는 메서드
        // - 변환된 Blob 형태의 파일을 처리할 콜백 함수
        (blob) => {
          if (!blob) return;
          const filename = `${target}-capture-${Date.now()}.png`;
          const objectUrl = URL.createObjectURL(blob); // Blob → 브라우저에서 쓸 수 있는 주소 생성
          setCapturedFiles((prev) => [
            ...prev,
            { id: Date.now(), blob, filename, objectUrl },
          ]);
        },
        "image/png", // 파일 형식
        0.92, // 파일 품질 (0.0 ~ 1.0)
      );
    }
  };

  const startDownload = async (dataURL: string, index: number) => {
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = `${target} - ${index}.png`;
    a.click();
  };

  // 컴포넌트 언마운트 시 : 웹캠 스트림 자원 반납, 모델 소스 해제 함수, 모델 리소스 반납, 웹캠 스트림 정리, 등
  useEffect(() => {
    return () => {
      // 애니메이션 루프 정지
      if (refRef.current) {
        cancelAnimationFrame(refRef.current);
      }

      // 모델 리소스 반납 - 카메라 끄기
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }

      // 모델 리소스 해제
      if (modelRef.current) {
        modelRef.current = null;
      }
    };
  }, []);

  // 실시간 객체 탐지, 매 프레임마다 model.detect()를 통해 객체 감지 결과 획득, requestAnimationFrame 활용
  useEffect(() => {
    const model = modelRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (status !== "ready" || !model || !video || !canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    if (!ctx) return;

    // 매 프레임 마다 반복적으로 객체 탐지 수행 함수
    const detectFrame = async () => {
      try {
        const detections = await model.detect(video, 20, 0.5);
        setDetections(detections);
        //Canvas 이용해서 바운드박스 & 라벨 그리기
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // 이전에 그린거 초기화

        for (const detObj of detections) {
          const [x, y, width, height] = detObj.bbox; // 바운딩박스 위치(x,y) 와 크기 (width, height)
          const label = `${detObj.class} ${(detObj.score * 100).toFixed(0)}%`;

          setIsCaptured(false);

          // 사각형테두리(바운딩 박스)
          ctx.strokeStyle = "#00ff00";
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);

          // 라벨 택스트 박스
          const textWidth = ctx.measureText(label).width;
          const padding = 4;
          ctx.fillStyle = "rgba(0,255,0,0.8)";
          ctx.fillRect(x, y - 24, textWidth + padding * 2, 24);

          ctx.font = "bold 20px sans=serif";
          ctx.fillStyle = "#000";
          ctx.fillText(label, x + padding, y - 8);
          if (detObj.class === target) {
            setIsCaptured(true);
          }
        }
      } catch (err) {
        console.error("탐지 오류:", err);
      }

      // 다음 프레임 예약 (항상 마지막에 한 번만 호출)
      refRef.current = requestAnimationFrame(detectFrame);
    };

    refRef.current = requestAnimationFrame(detectFrame); // *최초 1회 호출

    // status 변경 시 또는 언마운트 시 : 감지 루프 종료
    return () => {
      if (refRef.current) cancelAnimationFrame(refRef.current);
    };
  }, [status]);

  // error 상태일 경우 (기존 UI 유지)
  if (status === "error") {
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          <p className="font-medium">오류</p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={startCamera}
            className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 탐색된 객체 중에 원하는 물건 있는지 탐색하는

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-2 text-lg font-semibold text-zinc-800 dark:text-zinc-100">
        웹캠 연결 + 감지 결과 확인
      </h2>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        getUserMedia · COCO-SSD · 감지 데이터만 텍스트로 표시
      </p>

      <div className="relative mb-4 overflow-hidden rounded-lg bg-zinc-800">
        <video ref={videoRef} className="w-full h-full" />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        ></canvas>
      </div>

      {status === "idle" && (
        <button
          type="button"
          onClick={startCamera}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
        >
          웹캠 켜기
        </button>
      )}
      {isCaptured && (
        <button
          type="button"
          onClick={startCapture}
          className="rounded-lg bg-emerald-600 w-full my-4 px-1 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
        >
          캡쳐하기
        </button>
      )}
      <div className="flex gap-4 overflow-x-auto max-w-full">
        {capturedFiles.map((capturedFile, index) => (
          <div
            key={index}
            className="flex flex-col items-center flex-shrink-0 "
          >
            <img src={capturedFile.objectUrl} className="w-32 h-auto" />
            <button
              type="button"
              onClick={() => startDownload(capturedFile.objectUrl, index)}
              className="rounded-lg bg-emerald-600 w-32 my-4 px-1 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              저장하기
            </button>
          </div>
        ))}
      </div>

      {status === "loading" && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          모델 로딩 및 웹캠 연결 중…
        </p>
      )}
    </div>
  );
}
