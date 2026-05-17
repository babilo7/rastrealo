export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">🛵</p>
        <h1 className="text-4xl font-bold text-orange-400 mb-2">rastrealo.lat</h1>
        <p className="text-gray-400 mb-8">Plataforma de rastreo de entregas</p>
        <div className="flex flex-col gap-3">
          <a href="/repartidor/pedido123"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-2xl transition">
            🛵 Vista Repartidor (demo)
          </a>
          <a href="/pedido/pedido123"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-2xl transition">
            📍 Vista Cliente (demo)
          </a>
        </div>
      </div>
    </main>
  );
}