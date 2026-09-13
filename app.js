'use strict';
const $ = selector => document.querySelector(selector);
const track = (event, props) => { if (window.posthog) window.posthog.capture(event, props); };
let selected = 'all', onlySales = false, toastTimer;
function notify(message) {
 $('#toast').textContent = message;
 clearTimeout(toastTimer);
 toastTimer = setTimeout(() => { $('#toast').textContent = ''; }, 3200);
}
function renderDemo() {
 let count = 0;
 document.querySelectorAll('.demo-card').forEach(card => {
  const match = (selected === 'all' || card.dataset.categories.split(' ').includes(selected)) && (!onlySales || card.dataset.sale === 'true');
  card.hidden = !match;
  if (match) count++;
 });
 document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === selected)));
 $('#sale-filter').setAttribute('aria-pressed', String(onlySales));
 $('#demo-count').textContent = `${count} ${count === 1 ? 'producto de ejemplo' : 'productos de ejemplo'}`;
 $('#demo-empty').hidden = count > 0;
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { selected = button.dataset.filter; renderDemo(); track('demo_filter_selected', {category: selected}); }));
$('#sale-filter').addEventListener('click', () => { onlySales = !onlySales; renderDemo(); track('demo_sale_filter_toggled', {active: onlySales}); });
const extra = $('#extra-filters'), toggle = $('#more-filters');
toggle.addEventListener('click', event => {
 const open = toggle.getAttribute('aria-expanded') !== 'true';
 toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? '−' : '+';
 toggle.setAttribute('aria-label', open ? 'Ocultar más categorías' : 'Mostrar más categorías');
 extra.hidden = !open;
 if (open && event.detail > 0 && !matchMedia('(prefers-reduced-motion: reduce)').matches) extra.animate([{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'cubic-bezier(.23,1,.32,1)'});
});
extra.addEventListener('keydown', event => { if(event.key === 'Escape') { extra.hidden = true; toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Mostrar más categorías'); toggle.textContent = '+'; toggle.focus(); } });
document.querySelectorAll('.save-demo').forEach(button => button.addEventListener('click', () => {
 const saved = button.getAttribute('aria-pressed') !== 'true';
 button.setAttribute('aria-pressed',String(saved)); button.textContent = saved ? '✓' : '+';
 notify(saved ? 'Guardado en esta demo. Así de fácil.' : 'Desmarcado en la demo. Tu wishlist real no cambia.');
 track('demo_product_saved', {saved, product: button.closest('.demo-card')?.querySelector('h3')?.textContent});
}));
$('#copy-address').addEventListener('click', async () => {
 track('install_address_copied');
 try { await navigator.clipboard.writeText('chrome://extensions'); notify('Dirección copiada. Pégala en la barra de Chrome.'); }
 catch { notify('Copia esta dirección: chrome://extensions'); }
});
$('.download')?.addEventListener('click', () => track('chrome_download_clicked'));
function revealTarget() { const target = document.getElementById(location.hash.slice(1)); if(target?.tagName === 'DETAILS') target.open = true; }
window.addEventListener('hashchange',revealTarget);revealTarget();

// Reveal each section once; content stays available without JavaScript and with reduced motion.
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
if(!motionPreference.matches && 'IntersectionObserver' in window){
 const sections=[...document.querySelectorAll('main > section:not(.hero)')].filter(node=>node.getBoundingClientRect().top>innerHeight);
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}},{threshold:.05,rootMargin:'0px 0px -20px 0px'});
 sections.forEach(section=>{section.classList.add('motion-reveal');observer.observe(section);});
 motionPreference.addEventListener('change',event=>{if(event.matches){sections.forEach(section=>section.classList.add('is-visible'));observer.disconnect();}});
}
