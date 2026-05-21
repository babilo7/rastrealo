"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MapaCliente({ pedido }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [llegando, setLlegando] = useState(false);
  const [entregado, setEntregado] = useState(false);

  // ✅ Mapa — useEffect separado
  useEffect(() => {
    if (typeof window === "undefined" || mapInstanceRef.current) return;

    Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]).then(([L]) => {
      const Lef = L.default;

      delete Lef.Icon.Default.prototype._getIconUrl;
      Lef.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = Lef.map(mapRef.current).setView([pedido.sucursal.lat, pedido.sucursal.lng], 15);

      Lef.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const motoIcon = Lef.divIcon({
        html: `<div style="font-size:28px">🛵</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        className: "",
      });

      const destinoIcon = Lef.divIcon({
        html: `<div style="font-size:28px">📍</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        className: "",
      });

      const motoMarker = Lef.marker([pedido.sucursal.lat, pedido.sucursal.lng], { icon: motoIcon })
        .addTo(map)
        .bindPopup("🛵 Repartidor en camino");

      Lef.marker([pedido.destino.lat, pedido.destino.lng], { icon: destinoIcon })
        .addTo(map)
        .bindPopup("🏠 Tu dirección");

      Lef.polyline(
        [[pedido.sucursal.lat, pedido.sucursal.lng], [pedido.destino.lat, pedido.destino.lng]],
        { color: "#f97316", weight: 4, dashArray: "8 6", opacity: 0.7 }
      ).addTo(map);

      mapInstanceRef.current = map;
      markerRef.current = motoMarker;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ✅ Realtime — useEffect completamente separado del mapa
  useEffect(() => {
    console.log("🔌 Suscribiendo canal Realtime para pedido:", pedido.id);

    const channel = supabase
      .channel("pedido-" + pedido.id)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pedidos",
          filter: "pedido_id=eq." + pedido.id,
        },
        (payload) => {
          console.log("📡 Realtime payload recibido:", payload);
          const { lat_actual, lng_actual, estado } = payload.new;

          if (lat_actual && lng_actual && markerRef.current && mapInstanceRef.current) {
            markerRef.current.setLatLng([lat_actual, lng_actual]);
            mapInstanceRef.current.panTo([lat_actual, lng_actual], { animate: true });

            const dist = Math.sqrt(
              Math.pow(lat_actual - pedido.destino.lat, 2) +
              Math.pow(lng_actual - pedido.destino.lng, 2)
            );
            if (dist < 0.003) setLlegando(true);
          }

          if (estado === "entregado") {
            console.log("✅ Estado entregado detectado en cliente");
            setEntregado(true);
          }
        }
      )
      .subscribe((status) => {
        console.log("📶 Canal status:", status);
      });

    return () => {
      console.log("🔌 Removiendo canal Realtime");
      supabase.removeChannel(channel);
    };
  }, [pedido.id]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-2xl z-0" />
      {llegando && !entregado && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-orange-500 text-white font-bold px-6 py-3 rounded-2xl shadow-xl animate-bounce text-center">
          🛵 Tu pedido está por llegar!
        </div>
      )}
      {entregado && (
        <div className="absolute top-4 left-1/2