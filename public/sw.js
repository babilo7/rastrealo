self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

let watchId = null;

self.addEventListener('message', (event) => {
  if (event.data.type === 'START_GPS') {
    const { pedidoId, supabaseUrl, supabaseKey } = event.data;

    if (watchId !== null) return;

    watchId = self.registration.navigationPreload?.isEnabled
      ? null
      : setInterval(async () => {
          // ping para mantener vivo el SW
        }, 20000);

    // Escuchar posición desde el cliente principal
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'GPS_READY' });
      });
    });
  }

  if (event.data.type === 'UPDATE_LOCATION') {
    const { pedidoId, lat, lng, supabaseUrl, supabaseKey } = event.data;

    fetch(`${supabaseUrl}/rest/v1/pedidos?pedido_id=eq.${pedidoId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ lat_actual: lat, lng_actual: lng }),
    });
  }
});