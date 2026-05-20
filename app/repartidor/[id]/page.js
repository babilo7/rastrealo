import { createClient } from "@supabase/supabase-js";
import VistaRepartidor from "@/app/components/VistaRepartidor";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function PaginaRepartidor({ params }) {
  const { id } = await params;

  const { data: pedido, error } = await supabase
    .from("pedidos")
    .select("*")
    .eq("pedido_id", id)
    .single();

  if (!pedido || error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">✗</p>
          <h1 className="text-2xl font-bold">Pedido no encontrado</h1>
          <p className="text-gray-400 mt-2">ID: {id}</p>
        </div>
      </div>
    );
  }

  const pedidoFormateado = {
    id: pedido.pedido_id,
    cliente: pedido.cliente,
    direccionCliente: pedido.direccion,
    telefono: pedido.telefono_cliente,
    productos: typeof pedido.productos === 'string' ? JSON.parse(pedido.productos) : (pedido.productos || []),
    total: pedido.total,
    sucursal: { lat: pedido.lat_sucursal, lng: pedido.lng_sucursal },
    destino: { lat: pedido.lat_destino, lng: pedido.lng_destino },
    repartidor: {
      nombre: pedido.repartidor_nombre,
      telefono: pedido.repartidor_telefono,
    },
    estado: pedido.estado,
  };

  return <VistaRepartidor pedido={pedidoFormateado} id={id} />;
}