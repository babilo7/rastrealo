import { createClient } from "@supabase/supabase-js";
import MapaCliente from "@/app/components/MapaCliente";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function PaginaCliente({ params }) {
  const { id } = await params;

  const { data: pedido, error } = await supabase
    .from("pedidos")
    .select("*")
    .eq("pedido_id", id)
    .single();

  if (!pedido || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">❌</p>
          <h1 className="text-2xl font-bold">Pedido no encontrado</h1>
        </div>
      </div>
    );
  }

  // Convertir estructura plana de Supabase al formato que espera MapaCliente
  const pedidoFormateado = {
    id: pedido.pedido_id,
    cliente: pedido.cliente,
    direccionCliente: pedido.direccion,
    telefono: pedido.telefono_cliente,
    productos: pedido.productos,
    total: pedido.total,
    sucursal: { lat: pedido.lat_sucursal, lng: pedido.lng_sucursal },
    destino: { lat: pedido.lat_destino, lng: pedido.lng_destino },
    repartidor: {
      nombre: pedido.repartidor_nombre,
      telefono: pedido.repartidor_telefono,
    },
    estado: pedido.estado,
    lat_actual: pedido.lat_actual,
    lng_actual: pedido.lng_actual,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-orange-500 text-white p-4">
        <h1 className="font-bold text-lg">Tu pedido va en camino 🛵</h1>
        <p className="text-orange-100 text-sm">Pedido #{id}</p>
      </header>
      <div className="flex-1 p-4">
        <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg">
          <MapaCliente pedido={pedidoFormateado} />
        </div>
        <div className="mt-3 bg-white rounded-2xl p-4 shadow">
          <p className="text-sm text-gray-500">Entregando en:</p>
          <p className="font-semibold text-gray-800">{pedido.direccion}</p>
        </div>
      </div>
    </div>
  );
}