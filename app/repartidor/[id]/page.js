import { pedidosMock } from "@/lib/mockData";
import MapaCliente from "@/app/components/MapaCliente";

export default async function PaginaCliente({ params }) {
  const { id } = await params;
  const pedido = pedidosMock[id];

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">❌</p>
          <h1 className="text-2xl font-bold">Pedido no encontrado</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-orange-500 text-white p-4">
        <h1 className="font-bold text-lg">Tu pedido va en camino 🛵</h1>
        <p className="text-orange-100 text-sm">Pedido #{id}</p>
      </header>
      <div className="flex-1 p-4">
        <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg">
          <MapaCliente pedido={pedido} />
        </div>
        <div className="mt-3 bg-white rounded-2xl p-4 shadow">
          <p className="text-sm text-gray-500">Entregando en:</p>
          <p className="font-semibold text-gray-800">{pedido.direccionCliente}</p>
        </div>
      </div>
    </div>
  );
}