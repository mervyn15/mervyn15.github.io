// Scope-relative paths support both the root Site and /nnic/ on GitHub Pages.
const scope = new URL(self.registration.scope);
const appUrl = path => new URL(path.replace(/^\//, ''), scope).href;
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
// Network-only navigation: never cache ticket data, credentials or attachments.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.mode !== 'navigate' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname) || url.pathname.includes('/api/')) return;
  event.respondWith(fetch(event.request).catch(() => new Response(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NAIA Report · Offline</title><body style="font:18px system-ui;background:#edf4f7;color:#153c5b;margin:0;padding:10vh 24px"><main style="max-width:540px;margin:auto"><h1>You’re offline</h1><p>Reconnect to use NAIA Report. Tickets and files are not stored offline, and no report has been submitted from this screen.</p><a href="${appUrl('/')}" style="display:inline-block;padding:14px 22px;background:#095ea5;color:white;border-radius:10px">Try again</a></main></body></html>`, {status:503, headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})));
});
self.addEventListener('push', event => {
  let message = {}; try {message = event.data?.json() || {};} catch {}
  let url = appUrl('/workspace');
  try {
    const candidate = new URL(message.url, scope);
    const logical = candidate.pathname.startsWith(scope.pathname) ? '/' + candidate.pathname.slice(scope.pathname.length) : candidate.pathname;
    if (candidate.origin === scope.origin && ['/tickets','/profile','/workspace'].includes(logical)) url = appUrl(logical) + candidate.search;
  } catch {}
  event.waitUntil(self.registration.showNotification('NNIC MMS', {body:'You have a new update. Open MMS to view it.',icon:appUrl('/assets/app-icon-192.png'),badge:appUrl('/assets/app-icon-192.png'),tag:typeof message.tag==='string'?message.tag.slice(0,100):'mms-update',data:{url}}));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const url = new URL(event.notification.data?.url || appUrl('/workspace'));
    if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
    const windows = await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const existing = windows.find(w => w.url.startsWith(scope.href));
    if (existing) {await existing.navigate(url.href); await existing.focus();}
    else await self.clients.openWindow(url.href);
  })());
});
