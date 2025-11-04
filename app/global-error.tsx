'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-4xl font-bold mb-4">Erreur serveur</h1>
          <p className="text-xl text-gray-600 mb-8">
            Une erreur critique est survenue
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
