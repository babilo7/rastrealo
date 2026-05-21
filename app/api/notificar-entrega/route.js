const WA_TOKEN = "EAARc3iPFEecBQ1BZCw5L5fyZAMzizGuvmRkIGLkenZBfClfWWEhutZAIv31T8RtDTktri0ZCKuawbOJcDJrvXAxCZB86lAZAEX7A24J83oZBwOpVZCNKdW2dkZAj890AfhToM0Ek7tJZCDDrx1yiRXLSqhwKQzDhCPR01SrZBW2e4WyS163Jk1qpf2HJhC7cZC8Occl5E2rmCjrFX4CR59nmwZCP4nAiXm4iETbZBzHHGIapwLh";
const WA_PHONE_ID = "1062390730283477";

async function enviarWhatsApp(telefono, mensaje) {
  const res = await fetch(`https://graph.facebook.com/v25.0/${WA_PHONE_ID}/messages`, {
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
  return res.json();
}

export async function POST(request) {
  const { telefonoCliente, cliente, repartidor, pedidoId } = await request.json();

  const resultados = [];

  if (telefonoCliente) {
    const r = await enviarWhatsApp(
      telefonoCliente.replace(/\D/g, ""),
      `¡Tu pedido fue entregado! Gracias por tu compra 🎉 — Barbacoa Monroy`
    );
    resultados.push(r);
  }

  const rDueno = await enviarWhatsApp(
    "529931776316",
    `✅ Pedido #${pedidoId} entregado por ${repartidor} a ${cliente}`
  );
  resultados.push(rDueno);

  return Response.json({ ok: true, resultados });
} 
