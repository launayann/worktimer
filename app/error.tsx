'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Une erreur est survenue</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        {error.message || 'Quelque chose s\'est mal passé'}
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}
