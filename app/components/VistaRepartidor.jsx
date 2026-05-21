"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const WA_TOKEN = "EAARc3iPFEecBQ1BZCw5L5fyZAMzizGuvmRkIGLkenZBfClfWWEhutZAIv31T8RtDTktri0ZCKuawbOJcDJrvXAxCZB86lAZAEX7A24J83oZBwOpVZCNKdW2dkZAj890AfhToM0Ek7tJZCDDrx1yiRXLSqhwKQzDhCPR01SrZBW2e4WyS163Jk1qpf2HJhC7cZC8Occl5E2rmCjrFX4CR59nmwZCP4nAiXm4iETbZBzHHGIapwLh";
const WA_PHONE_ID = "1062390730283477";
const DUENO_TEL = "529931776316";

async function enviarWhatsApp(telefono, mensaje) {
  await fetch(`https://graph.facebook.com/v25.0/${WA_PHONE_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WA_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: telefono,
      type: "text",
      text: { body: mensaje },
    }),
  });
}

export default function VistaRepartidor({ pedido, id }) {
  const [estado, setEstado] = useState("pendiente");
  const [tiempo, setTiempo] = useState(0);
  const [repartidor, setRepartidor] = useState(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    let intervalo;
    if (estado === "iniciado") {
      intervalo = setInterval(() => setTiempo((t) => t + 1), 1000);
    }
    return () => clearInterval(intervalo);
  }, [estado]);

  const formatTiempo = (seg) => {
    const m = Math.floor(seg / 60).toString().padStart(2, "0");
    const s = (seg % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const confirmarIdentidad = () => {
    if (!nombre.trim()) {
      alert("Por favor escribe tu nombre");
      return;
    }
    setRepartidor({ nombre: nombre.trim(), telefono: telefono.trim() });
  };

  const iniciarRecorrido = async () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    const { error } = await supabase.from("pedidos").upsert({
      pedido_id: id,
      cliente: pedido.cliente,
      direccion: pedido.direccionCliente,
      telefono_cliente: pedido.telefono,
      productos: pedido.productos,
      total: pedido.total,
      estado: "en_camino",
      repartidor_nombre: repartidor.nombre,
      repartidor_telefono: repartidor.telefono,
      lat_sucursal: pedido.sucursal.lat,
      lng_sucursal: pedido.sucursal.lng,
      lat_destino: pedido.destino.lat,
      lng_destino: pedido.destino.lng,
      lat_actual: pedido.sucursal.lat,
      lng_actual: pedido.sucursal.lng,
    }, { onConflict: "pedido_id" });

    if (error) {
      alert("Error Supabase: " + error.message);
      return;
    }

    setEstado("iniciado");

    if ('wakeLock' in navigator) {
      try {
        await navigator.wakeLock.request('screen');
      } catch (err) {
        console.log('Wake lock error:', err);
      }
    }

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
        reg.active?.postMessage({
          type: 'START_GPS',
          pedidoId: id,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        });
      } catch (err) {
        console.log('SW error:', err);
      }
    }

    navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'UPDATE_LOCATION',
            pedidoId: id,
            lat,
            lng,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          });
        } else {
          await supabase.from("pedidos").update({
            lat_actual: lat,
            lng_actual: lng,
          }).eq("pedido_id", id);
        }
      },
      (err) => console.log("GPS error:", err),
      { enableHighAccuracy: true }
    );
  };

  const marcarEntregado = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .update({ estado: "entregado" })
      .eq("pedido_id", id)
      .select();

    if (error) {
      alert("Error al actualizar: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("UPDATE llegó pero no devolvió filas — revisa RLS o el pedido_id");
      return;
    }

    // ✅ Notificación al cliente
    const telefonoCliente = pedido.telefono?.replace(/\D/g, "");
    if (telefonoCliente) {
      await enviarWhatsApp(
        telefonoCliente,
        `¡Tu pedido fue entregado! Gracias por tu compra 🎉 — Barbacoa Monroy`
      );
    }

    // ✅ Notificación al dueño
    await enviarWhatsApp(
      DUENO_TEL,
      `✅ Pedido #${id} entregado por ${repartidor.nombre} a ${pedido.cliente}`
    );

    setEstado("entregado");
  };

  // --- PANTALLA DE IDENTIFICACIÓN ---
  if (!repartidor) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <p className="text-4xl mb-3">🛵</p>
            <h1 className="text-2xl font-bold">Pedido #{id}</h1>
            <p className="text-gray-400 mt-1">Identifícate para continuar</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Tu nombre *</label>
              <input
                type="text"
                placeholder="Ej: Carlos López"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Tu teléfono (opcional)</label>
              <input
                type="tel"
                placeholder="Ej: 993 123 4567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={confirmarIdentidad}
              className="w-full bg-orange-500 text-white text-xl font-bold py-4 rounded-2xl mt-2"
            >
              Ver Pedido
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- PANTALLA DEL PEDIDO ---
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-6">
        <h1 className="text-xl font-bold">Pedido #{id}</h1>
        <p className="text-gray-400 text-sm">Hola, {repartidor.nombre} 👋</p>
      </div>
      <div className="w-full max-w-md bg-gray-800 rounded-2xl p-5 mb-4">
        <p className="text-orange-400 font-semibold text-sm uppercase mb-3">Dirección de entrega</p>
        <p className="text-lg font-bold mb-1">{pedido.cliente}</p>
        <p className="text-gray-300">{pedido.direccionCliente}</p>
      </div>
      <div className="w-full max-w-md bg-gray-800 rounded-2xl p-5 mb-4">
        <p className="text-orange-400 font-semibold text-sm uppercase mb-3">Productos</p>
        <ul>
          {pedido.productos.map((p, i) => (
            <li key={i} className="text-gray-300 text-sm">- {p}</li>
          ))}
        </ul>
        <p className="text-white font-bold mt-3 text-right">Total: {pedido.total}</p>
      </div>
      <div className="w-full max-w-md">
        {estado === "pendiente" && (
          <button onClick={iniciarRecorrido} className="w-full bg-orange-500 text-white text-xl font-bold py-5 rounded-2xl">
            Iniciar Recorrido
          </button>
        )}
        {estado === "iniciado" && (
          <div className="flex flex-col gap-4 items-center">
            <p className="text-green-400 font-bold text-lg">En camino — {formatTiempo(tiempo)}</p>
            <button onClick={marcarEntregado} className="w-full bg-green-500 text-white text-xl font-bold py-5 rounded-2xl">
              Marcar como Entregado
            </button>
          </div>
        )}
        {estado === "entregado" && (
          <div className="text-center p-8">
            <p className="text-5xl mb-3">🎉</p>
            <p className="text-2xl font-bold text-green-400">¡Entregado!</p>
            <p className="text-gray-400 mt-2">Tiempo: {formatTiempo(tiempo)}</p>
          </div>
        )}
      </div>
    </div>
  );
}