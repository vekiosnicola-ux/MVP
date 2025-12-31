export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Dieta Positiva</h1>
        <p className="text-gray-600 mb-8">AI-Powered Wellness Coaching Platform</p>
        <div className="rounded-lg bg-gray-100 p-6">
          <p className="text-sm text-gray-700">
            Phase 1: Project scaffold initialized
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Health check: <a href="/api/health" className="text-blue-600 hover:underline">/api/health</a>
          </p>
        </div>
      </div>
    </main>
  );
}
