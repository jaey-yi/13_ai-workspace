import ImageClassifier from "./components/ImageClassifier";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 py-12 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8">
        <header className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            브라우저 이미지 분류 · TensorFlow.js
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            서버 없이 브라우저에서 이미지 분류 (MobileNet)
          </p>
        </header>
        <ImageClassifier />
      </main>
    </div>
  );
}
