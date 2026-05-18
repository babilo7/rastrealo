import { pedidosMock } from "@/lib/mockData";
import VistaRepartidor from "@/app/components/VistaRepartidor";

export default async function PaginaRepartidor({ params }) {
  const { id } = await params;
  const pedido = pedidosMock[id];

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">❌</p>
          <h1 className="text-2xl font-bold">Pedido no encontrado</h1>
          <p className="text-gray-400 mt-2">ID: {id}</p>
        </div>
      </div>
    );
  }

  return <VistaRepartidor pedido={pedido} id={id} />;
}