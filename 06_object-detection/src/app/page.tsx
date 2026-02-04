import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 py-12 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8">
        <header className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            객체 탐지 · TensorFlow.js
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            이미지 및 웹캠 영상에서 사물 위치 실시간 추적
          </p>
        </header>

        <Step1 />
        {/* <Step2 /> */}
        {/* <Step3 /> */}
      </main>
    </div>
  );
}
