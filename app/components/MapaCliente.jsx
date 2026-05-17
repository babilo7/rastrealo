"use client";
import { useEffect, useRef, useState } from "react";

export default function MapaCliente({ pedido }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [llegando, setLlegando] = useState(false);
  const [entregado, setEntregado] = useState(false);
  const posRef = useRef({ ...pedido.sucursal });

  useEffect(() => {
    if (typeof window === "undefined" || mapInstanceRef.current) return;

    // Carga dinámica de Leaflet
    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
    ]).then(([L]) => {
      const Lef = L.default;

      // Fix íconos de Leaflet con Next.js
      delete Lef.Icon.Default.prototype._getIconUrl;
      Lef.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = Lef.map(mapRef.current).setView(
        [pedido.sucursal.lat, pedido.sucursal.lng],
        15
      );

      Lef.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      // Ícono moto (emoji como div)
      const motoIcon = Lef.divIcon({
        html: `<div style="font-size:28px; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5))">🛵</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        className: "",
      });

      // Ícono destino
      const destinoIcon = Lef.divIcon({
        html: `<div style="font-size:28px">📍</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        className: "",
      });

      // Marcadores
      const motoMarker = Lef.marker(
        [pedido.sucursal.lat, pedido.sucursal.lng],
        { icon: motoIcon }
      ).addTo(map).bindPopup("🛵 Repartidor en camino");

      Lef.marker([pedido.destino.lat, pedido.destino.lng], { icon: destinoIcon })
        .addTo(map)
        .bindPopup("🏠 Tu dirección");

      // Línea de ruta
      const ruta = Lef.polyline(
        [
          [pedido.sucursal.lat, pedido.sucursal.lng],
          [pedido.destino.lat, pedido.destino.lng],
        ],
        { color: "#f97316", weight: 4, dashArray: "8 6", opacity: 0.7 }
      ).addTo(map);

      mapInstanceRef.current = map;
      markerRef.current = motoMarker;

      // Simulación de movimiento
      const steps = 60;
      let step = 0;
      const startLat = pedido.sucursal.lat;
      const startLng = pedido.sucursal.lng;
      const endLat = pedido.destino.lat;
      const endLng = pedido.destino.lng;

      const mover = setInterval(() => {
        if (step >= steps) {
          clearInterval(mover);
          setEntregado(true);
          return;
        }
        step++;
        const t = step / steps;
        // Interpolación con leve zigzag para que se vea natural
        const zigzag = Math.sin(step * 0.5) * 0.0005;
        const newLat = startLat + (endLat - startLat) * t + zigzag;
        const newLng = startLng + (endLng - startLng) * t;
        posRef.current = { lat: newLat, lng: newLng };
        motoMarker.setLatLng([newLat, newLng]);
        map.panTo([newLat, newLng], { animate: true, duration: 0.5 });

        // Distancia al destino (muy simple)
        const dist = Math.sqrt(
          Math.pow(newLat - endLat, 2) + Math.pow(newLng - endLng, 2)
        );
        if (dist < 0.003 && !llegando) {
          setLlegando(true);
        }
      }, 1500); // mueve cada 1.5 segundos

      return () => clearInterval(mover);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-2xl z-0" />

      {/* Banner llegando */}
      {llegando && !entregado && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-orange-500 text-white font-bold px-6 py-3 rounded-2xl shadow-xl animate-bounce text-center">
          🛵 ¡Tu pedido está por llegar!
        </div>
      )}

      {/* Banner entregado */}
      {entregado && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-green-500 text-white font-bold px-6 py-3 rounded-2xl shadow-xl text-center">
          ✅ ¡Pedido entregado!
        </div>
      )}
    </div>
  );
}