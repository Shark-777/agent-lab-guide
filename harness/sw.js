'use strict';
const PREFIX='neyrotex-harness-'+self.registration.scope+'-';
const CACHE=PREFIX+'v2';
const ASSETS=['./','./index.html','./manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',event=>{if(event.data?.type==='CHECK_READY')event.waitUntil(caches.open(CACHE).then(async cache=>{const ready=(await Promise.all(ASSETS.map(path=>cache.match(new URL(path,self.registration.scope))))).every(Boolean);if(ready)event.source?.postMessage({type:'OFFLINE_READY'})}))});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response}
  catch(error){return (await cache.match(request))||(request.mode==='navigate'?await cache.match(new URL('./index.html',self.registration.scope)):null)||Response.error()}
 })());
});
