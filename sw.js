// 상해 여행 페이지 오프라인 저장: 한 번 열면 인터넷이 막혀도 마지막 버전이 열려요
const C='sh-trip-v1';
const CORE=['./','./index.html','./cover.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  const same=u.origin===location.origin;
  const font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!same&&!font)return;
  // 페이지: 네트워크 먼저(3초 안에 안 오면 저장본), 글꼴·사진: 저장본 먼저
  if(same&&(r.mode==='navigate'||u.pathname.endsWith('.html')||u.pathname.endsWith('/'))){
    e.respondWith(new Promise(res=>{let done=false;
      const t=setTimeout(()=>caches.match(r).then(m=>m&&!done&&(done=true,res(m))),3000);
      fetch(r).then(n=>{caches.open(C).then(c=>c.put(r,n.clone()));if(!done){done=true;clearTimeout(t);res(n)}})
        .catch(()=>caches.match(r).then(m=>m||caches.match('./index.html')).then(m=>{if(!done){done=true;clearTimeout(t);res(m)}}));
    }));return}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(n=>{if(n.ok||n.type==='opaque')caches.open(C).then(c=>c.put(r,n.clone()));return n})));
});
