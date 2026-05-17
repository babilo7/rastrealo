"use client";
import { useState, useEffect } from "react";

export default function VistaRepartidor({ pedido, id }) {
  const [estado, setEstado] = useState("pendiente");
  const [tiempo, setTiempo] = useState(0);

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

  const iniciarRecorrido = () => {
    setEstado("iniciado");
  };

  const marcarEntregado = () => setEstado("entregado");

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-6">
        <h1 className="text-xl font-bold">Pedido #{id}</h1>
        <p className="text-gray-400 text-sm">Vista del Repartidor</p>
      </div>

      <div className="w-full max-w-md bg-gray-800 rounded-2xl p-5 mb-4">
        <p className="text-orange-400 font-semibold text-sm mb-3">DIRECCION</p>
        <p className="text-lg font-bold mb-1">{pedido.cliente}</p>
        <p className="text-gray-300">{pedido.direccionCliente}</p>
      </div>

      <div className="w-full max-w-md bg-gray-800 rounded-2xl p-5 mb-4">
        <p className="text-orange-400 font-semibold text-sm mb-3">PRODUCTOS</p>
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
            <p className="text-green-400 font-bold text-lg">En camino - {formatTiempo(tiempo)}</p>
            <button onClick={marcarEntregado} className="w-full bg-green-500 text-white text-xl font-bold py-5 rounded-2xl">
              Marcar como Entregado
            </button>
          </div>
        )}
        {estado === "entregado" && (
          <div className="text-center p-8">
            <p className="text-5xl mb-3">🎉</p>
            <p className="text-2xl font-bold text-green-400">Entregado!</p>
            <p className="text-gray-400 mt-2">Tiempo: {formatTiempo(tiempo)}</p>
          </div>
        )}
      </div>
    </div>
  );
}