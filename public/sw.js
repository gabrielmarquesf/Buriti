// Este arquivo será substituído pelo next-pwa durante o build
// Este é apenas um placeholder para desenvolvimento

self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker ativado');
});

self.addEventListener('fetch', (event) => {
    // Intercepta requisições de rede
    console.log('Fetch interceptado para:', event.request.url);
}); 