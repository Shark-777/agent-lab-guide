'use strict';
const PREFIX='neyrotex-harness-'+self.registration.scope+'-';
const CACHE=PREFIX+'v1';
const ASSETS=['./','./index.html','./manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',event=>{if(event.data?.type==='CHECK_READY')event.waitUntil(caches.open(CACHE).then(async cache=>{const ready=(await Promise.all(ASSETS.map(path=>cache.match(new URL(path,self.registration.scope))))).every(Boolean);if(ready)event.source?.postMessage({type:'OFFLINE_READY'})}))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).catch(()=>event.request.mode==='navigate'?caches.match(new URL('./index.html',self.registration.scope)):Response.error())))});
