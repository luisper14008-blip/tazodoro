// Service worker mínimo de Tazodoro. No guarda nada en caché ni intercepta pedidos:
// existe para que Android pueda mostrar los avisos de fin de taza (allí la página no puede
// crearlos por su cuenta) y para que, al tocar un aviso, vuelva al frente la pestaña de Tazodoro.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (evento) => evento.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  evento.waitUntil((async () => {
    const alcance = self.registration.scope;
    const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const propia = ventanas.find((ventana) => ventana.url.startsWith(alcance));
    if (propia) return propia.focus();
    return self.clients.openWindow(alcance);
  })());
});
