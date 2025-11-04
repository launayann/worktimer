export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Page non trouvée
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Retour à l'accueil
      </a>
    </div>
  );
}
