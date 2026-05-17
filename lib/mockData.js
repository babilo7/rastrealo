 export const pedidosMock = {
  pedido123: {
    id: "pedido123",
    cliente: "Juan Pérez",
    direccionCliente: "Calle Méndez 45, Col. Centro",
    telefono: "+52 993 123 4567",
    productos: ["1x Burger Clásica", "2x Papas Medianas", "1x Refresco"],
    total: "$185.00",
    sucursal: { lat: 17.9869, lng: -92.9303 },
    destino: { lat: 17.9950, lng: -92.9180 },
    repartidor: {
      nombre: "Carlos López",
      telefono: "+52 993 987 6543",
      foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    },
    estado: "en_camino",
  },
};
