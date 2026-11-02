"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container section">
      <h1>Let’s try that again.</h1>
      <p>We couldn’t load this page. Your saved cart stays on this device.</p>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
