self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
// No fetch interception or offline caching of private pages, API responses or files.
self.addEventListener('push',event=>{
 let message={};try{message=event.data?.json()||{};}catch{}
 let url=new URL('/workspace',self.location.origin);try{const candidate=new URL(message.url,self.location.origin);if(candidate.origin===self.location.origin&&['/tickets','/profile','/workspace'].includes(candidate.pathname))url=candidate;}catch{}
 event.waitUntil(self.registration.showNotification('NNIC MMS',{body:'You have a new update. Open MMS to view it.',icon:'/assets/app-icon-192.png',badge:'/assets/app-icon-192.png',tag:typeof message.tag==='string'?message.tag.slice(0,100):'mms-update',data:{url:url.href}}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const url=new URL(event.notification.data?.url||'/workspace',self.location.origin);if(url.origin!==self.location.origin)return;const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});const existing=windows.find(w=>new URL(w.url).origin===self.location.origin);if(existing){await existing.navigate(url.href);await existing.focus();}else await self.clients.openWindow(url.href);})());});
