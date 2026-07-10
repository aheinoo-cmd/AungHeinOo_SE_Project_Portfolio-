/* --- icons --- */
lucide.createIcons();

/* ---- theme toggle ---- */
const html = document.documentElement;
document.getElementById('themeBtn').addEventListener('click', () => {
  html.setAttribute('data-theme', html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

/* ---- sticky header shadow ---- */
const hdr = document.getElementById('hdr');
addEventListener('scroll', () => hdr.classList.toggle('up', scrollY > 10), { passive: true });

/* ---- mobile drawer ---- */
const hamBtn = document.getElementById('hamBtn');
const drawer = document.getElementById('drawer');
hamBtn.addEventListener('click', () => {
  const open = drawer.classList.toggle('show');
  hamBtn.setAttribute('aria-expanded', String(open));
});
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  drawer.classList.remove('show');
  hamBtn.setAttribute('aria-expanded', 'false');
}));

/* ---- scroll reveal ---- */
const rvObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); rvObs.unobserve(e.target); } }), { threshold: 0.09 });
document.querySelectorAll('.rv').forEach(el => rvObs.observe(el));

/* ---- active nav link ---- */
const sections = document.querySelectorAll('section[id]');
const navAs = document.querySelectorAll('.nl a');
const navObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { navAs.forEach(a => a.classList.remove('on')); const a = document.querySelector(`.nl a[href="#${e.target.id}"]`); if (a) a.classList.add('on'); } }), { threshold: 0.38 });
sections.forEach(s => navObs.observe(s));

/* ---- stat counters ---- */
const cntObs = new IntersectionObserver(es => {
  es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const t = parseInt(el.dataset.t, 10);
    let c = 0;
    const id = setInterval(() => {
      c = Math.min(c + Math.ceil(t / 15), t); // balanced speed scaling
      el.textContent = c + (t > 5 ? '+' : '');
      if (c >= t) {
        el.textContent = t;
        clearInterval(id);
      }
    }, 40);
    cntObs.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.count').forEach(el => cntObs.observe(el));

/* ==========================================================
   THREE.JS — Hero 3D scene
========================================================== */
(function buildHero() {
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
  camera.position.set(0, 0, 6.5);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const pl1 = new THREE.PointLight(0x6366f1, 4, 24);
  pl1.position.set(4, 3, 5);
  scene.add(pl1);
  const pl2 = new THREE.PointLight(0xf59e0b, 3, 24);
  pl2.position.set(-5, -2, 4);
  scene.add(pl2);

  const g = new THREE.Group();
  scene.add(g);

  const coreMesh = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.95, 0.35, 128, 16, 2, 3),
    new THREE.MeshPhysicalMaterial({ color: 0x6366f1, emissive: 0x0d0d2e, metalness: 0.18, roughness: 0.14, transparent: true, opacity: 0.86 })
  );
  g.add(coreMesh);

  const cage = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.72, 0)),
    new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 })
  );
  g.add(cage);

  let mx = 0, my = 0;
  addEventListener('pointermove', e => {
    mx = (e.clientX / innerWidth)  * 2 - 1;
    my = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  let raf;
  (function loop(ts) {
    raf = requestAnimationFrame(loop);
    const t = ts * 0.001;
    g.rotation.x += 0.003;
    g.rotation.y += 0.004;
    cage.rotation.x -= 0.002;
    cage.rotation.z += 0.003;
    g.position.x += (mx * 0.55 - g.position.x) * 0.05;
    g.position.y += (-my * 0.32 - g.position.y) * 0.05;
    coreMesh.scale.setScalar(1 + Math.sin(t * 1.9) * 0.035);
    renderer.render(scene, camera);
  })(0);
  addEventListener('beforeunload', () => cancelAnimationFrame(raf));
})();

/* ==========================================================
   THREE.JS — Project thumbnail mini scenes
========================================================== */
(function buildThumbs() {
  if (typeof THREE === 'undefined') return;
  [
    { id: 'thumb1', color: 0x6366f1, geo: new THREE.OctahedronGeometry(.85,0) },
    { id: 'thumb2', color: 0xf59e0b, geo: new THREE.DodecahedronGeometry(.82,0) },
    { id: 'thumb3', color: 0x10b981, geo: new THREE.IcosahedronGeometry(.82,0) },
  ].forEach(({ id, color, geo }) => {
    const parent = document.getElementById(id);
    if (!parent) return;
    const c = document.createElement('canvas');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    parent.insertBefore(c, parent.firstChild);
    const r = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    const sc = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
    cam.position.z = 3.0;
    sc.add(new THREE.AmbientLight(0xffffff, 1.1));
    const pl = new THREE.PointLight(color, 3, 14);
    pl.position.set(2, 2, 3);
    sc.add(pl);
    const mat = new THREE.MeshPhysicalMaterial({ color, metalness: 0.1, roughness: 0.2, transparent: true, opacity: 0.82 });
    const mesh = new THREE.Mesh(geo, mat);
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 }));
    sc.add(mesh); sc.add(wire);
    function sz() {
      const w = c.clientWidth, h = c.clientHeight || 1;
      r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    }
    sz();
    addEventListener('resize', sz, { passive: true });
    let raf2;
    (function loop(ts) {
      raf2 = requestAnimationFrame(loop);
      const t = ts * 0.001;
      mesh.rotation.y = t * 0.65; mesh.rotation.x = t * 0.38;
      wire.rotation.y = mesh.rotation.y; wire.rotation.x = mesh.rotation.x;
      r.render(sc, cam);
    })(0);
    addEventListener('beforeunload', () => cancelAnimationFrame(raf2));
  });
})();