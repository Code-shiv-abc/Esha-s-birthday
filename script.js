/*
script.js
- Uses PixiJS for the particle field and images
- Uses GSAP + ScrollTrigger to drive camera-like movement
- Converges particles into text for the final reveal

IMPORTANT: Ensure devotion.png, compassion.png, wanderlust.png are placed next to these files
*/

// Config
const CONFIG = {
PARTICLES_DESKTOP: 1100,
PARTICLES_TABLET: 700,
PARTICLES_MOBILE: 450,
PARTICLE_SIZE: 2.8,
GOLD_HEX: 0xFFD700,
SOFT_HEX: 0xE6E6E6,
};

// Globals
let app, particleContainer, particles = [], images = {}, sceneContainer;
const containerEl = document.getElementById('pixi-container');

function deviceParticleCap(){
const w = Math.max(window.innerWidth, 320);
if(w < 600) return CONFIG.PARTICLES_MOBILE;
if(w < 1000) return CONFIG.PARTICLES_TABLET;
return CONFIG.PARTICLES_DESKTOP;
}

// Initialize Pixi
function initPixi(){
app = new PIXI.Application({
width: window.innerWidth,
height: window.innerHeight,
transparent: true,
antialias: true,
resolution: Math.min(window.devicePixelRatio || 1, 2)
});
containerEl.appendChild(app.view);

sceneContainer = new PIXI.Container();
app.stage.addChild(sceneContainer);

// particle container behind images
particleContainer = new PIXI.Container();
sceneContainer.addChild(particleContainer);

// a container for the 3 memory images
const memContainer = new PIXI.Container();
memContainer.name = 'memContainer';
sceneContainer.addChild(memContainer);

// create particle texture (small circle)
const g = new PIXI.Graphics();
g.beginFill(CONFIG.GOLD_HEX);
g.drawCircle(0,0,CONFIG.PARTICLE_SIZE);
g.endFill();
const particleTexture = app.renderer.generateTexture(g);

// create particles
const count = deviceParticleCap();
for(let i=0;i<count;i++){
const s = new PIXI.Sprite(particleTexture);
s.anchor.set(0.5);
// random spread across a wide area to enable 'fly-through' illusion
s.x = (Math.random()-0.5) * (app.screen.width * 2);
s.y = (Math.random()-0.5) * (app.screen.height * 2);
s.z = Math.random() * 2000; // pseudo-depth
s.orig = {x: s.x, y: s.y, z: s.z};
s.alpha = 0.85 * (0.6 + Math.random()*0.4);
particleContainer.addChild(s);
particles.push(s);
}

// load images (assumes files exist in same folder)
const loader = new PIXI.Loader();
loader
.add('devotion', 'devotion.png')
.add('compassion', 'compassion.png')
.add('wanderlust', 'wanderlust.png')
.load((loader, resources) => {
// create sprites and place at z-depths
const devotion = new PIXI.Sprite(resources['devotion'].texture);
const compassion = new PIXI.Sprite(resources['compassion'].texture);
const wanderlust = new PIXI.Sprite(resources['wanderlust'].texture);

// basic styling of sprites
[devotion, compassion, wanderlust].forEach((sp, idx) => {
sp.anchor.set(0.5);
// scale down images so they look like floating bodies
const scaleBase = Math.min(app.screen.width, app.screen.height) / 1200; // adaptive
sp.scale.set(0.9 * scaleBase);
sp.alpha = 0.95;
sp.interactive = false;
memContainer.addChild(sp);
});

// position them spaced along the z axis (use x offsets to avoid overlap)
devotion.x = -app.screen.width * 0.6; devotion.y = 0; devotion.z = 900;
compassion.x = 0; compassion.y = -app.screen.height * 0.08; compassion.z = 1350;
wanderlust.x = app.screen.width * 0.7; wanderlust.y = app.screen.height * 0.05; wanderlust.z = 1800;

// keep references
images.devotion = devotion; images.compassion = compassion; images.wanderlust = wanderlust;

// add a little subtle float tween for each image
gsap.to(devotion, {y: devotion.y + 18, duration:4, yoyo:true, repeat:-1, ease:'sine.inOut'});
gsap.to(compassion, {y: compassion.y + 18, duration:4.6, yoyo:true, repeat:-1, ease:'sine.inOut'});
gsap.to(wanderlust, {y: wanderlust.y + 20, duration:5, yoyo:true, repeat:-1, ease:'sine.inOut'});

// start the scroll-driven timeline now that assets are ready
setupScrollTimeline();
});

// mousemove parallax (small subtle effect)
let pointer = {x:0,y:0};
window.addEventListener('mousemove', (e)=>{
pointer.x = (e.clientX - window.innerWidth/2) / window.innerWidth;
pointer.y = (e.clientY - window.innerHeight/2) / window.innerHeight;
});

app.ticker.add(()=>{
// parallax particle offset based on pointer
particleContainer.x += (pointer.x * 40 - particleContainer.x) * 0.02;
particleContainer.y += (pointer.y * 40 - particleContainer.y) * 0.02;

// slight twinkle: tiny alpha shifts
for(let i=0;i<particles.length;i++){
particles[i].alpha += (Math.random()-0.5) * 0.004;
if(particles[i].alpha < 0.15) particles[i].alpha = 0.15;
if(particles[i].alpha > 1) particles[i].alpha = 1;

// apply perspective scaling: closer z -> bigger
const perspective = 1200 / (particles[i].z + 600);
particles[i].scale.set(perspective * 0.8);
// slight slow drift based on z
particles[i].x += Math.sin((Date.now()/1000 + i) * 0.2) * 0.08 * (1 + (2000 - particles[i].z)/2000);
particles[i].y += Math.cos((Date.now()/1000 + i) * 0.2) * 0.06 * (1 + (2000 - particles[i].z)/2000);
}
});

// handle resize
window.addEventListener('resize', ()=>{
app.renderer.resize(window.innerWidth, window.innerHeight);
});
}

// Scroll-driven timeline using GSAP ScrollTrigger
function setupScrollTimeline(){
gsap.registerPlugin(ScrollTrigger);

const introEl = document.getElementById('intro');
const memDev = document.getElementById('mem-devotion');
const memComp = document.getElementById('mem-compassion');
const memWan = document.getElementById('mem-wanderlust');
const finalCard = document.getElementById('finalCard');

// center coordinates helper
function centerX(){ return app.screen.width / 2 }
function centerY(){ return app.screen.height / 2 }

// helper to move scene so a pixi object appears centered
function focusOn(sprite, extraScale=1.18, duration=1.2){
const tx = -sprite.x + centerX();
const ty = -sprite.y + centerY();
return gsap.to(sceneContainer, {x:tx, y:ty, scale:extraScale, duration:duration, ease:'power2.inOut'});
}

// reset focus (pull back / fly-through)
function resetFocus(duration=1.2){
return gsap.to(sceneContainer, {x:0, y:0, scale:1, duration:duration, ease:'power2.inOut'});
}

// create timeline
const tl = gsap.timeline({
scrollTrigger: {
trigger: '.scroll-track',
start: 'top top',
end: 'bottom bottom',
scrub: 0.6,
pin: true,
anticipatePin: 1
}
});

// Scene 1: Intro visible -> slight zoom-in on intro
tl.to({}, {duration:0.6});
tl.to(introEl, {autoAlpha:1, duration:0.8}, 0);
tl.to(sceneContainer.scale, {x:1.04,y:1.04, duration:0.8, ease:'sine.inOut'}, 0);

// Scene 2: Fly forward -> focus on devotion
tl.to({}, {duration:0.6});
tl.add(()=>{
// hide intro
gsap.to(introEl, {autoAlpha:0, duration:0.6});
});
tl.add(focusOn(images.devotion, 1.25, 1.6));
tl.add(()=>{
// show devotion mem text
gsap.set(memDev,{display:'block'});
gsap.fromTo(memDev, {autoAlpha:0,y:10}, {autoAlpha:1,y:0,duration:0.7});
}, '-=0.6');

// travel to compassion
tl.to({}, {duration:0.8});
tl.add(()=>{
gsap.to(memDev, {autoAlpha:0,duration:0.4, onComplete:()=>gsap.set(memDev,{display:'none'})});
});
tl.add(focusOn(images.compassion, 1.28, 1.6));
tl.add(()=>{
gsap.set(memComp,{display:'block'});
gsap.fromTo(memComp, {autoAlpha:0,y:10}, {autoAlpha:1,y:0,duration:0.7});
}, '-=0.6');

// travel to wanderlust
tl.to({}, {duration:0.8});
tl.add(()=>{
gsap.to(memComp, {autoAlpha:0,duration:0.4, onComplete:()=>gsap.set(memComp,{display:'none'})});
});
tl.add(focusOn(images.wanderlust, 1.3, 1.8));
tl.add(()=>{
gsap.set(memWan,{display:'block'});
gsap.fromTo(memWan, {autoAlpha:0,y:10}, {autoAlpha:1,y:0,duration:0.7});
}, '-=0.6');

// final: pull back and converge
tl.to({}, {duration:0.9});
tl.add(()=>{
// hide last mem text
gsap.to(memWan, {autoAlpha:0,duration:0.45, onComplete:()=>gsap.set(memWan,{display:'none'})});
});

// pull back camera
tl.add(resetFocus.bind(null,1.2));

// call converge sequence
tl.call(convergeToText, [], '+=0.2');

// after converge, show final card (we'll show final card inside convergeToText after particles form)

// keep timeline length balanced
}

// Convergence: render text to offscreen canvas and map particles to it
function convergeToText(){
const text = 'Happy Birthday, Isha';
// offscreen canvas
const off = document.createElement('canvas');
const W = Math.min(1200, Math.max(700, window.innerWidth * 0.9));
const H = 250;
off.width = W; off.height = H;
const ctx = off.getContext('2d');
// draw text centered
ctx.clearRect(0,0,W,H);
// nice golden fill
const fontSize = Math.floor(Math.min(96, W / 11));
ctx.font = `bold ${fontSize}px Lora, serif`;
ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
// black transparent background not needed
ctx.fillStyle = 'white';
ctx.fillText(text, W/2, H/2);

// sample pixels
const imageData = ctx.getImageData(0,0,W,H).data;
const points = [];
// sample at a grid (gap controls letter density)
const gap = 6; // lower = denser
for(let y=0;y<H;y+=gap){
for(let x=0;x<W;x+=gap){
const idx = (y * W + x) * 4 + 3; // alpha channel
if(imageData[idx] > 128){
// convert canvas coordinates to pixi world coords (centered)
const worldX = x - W/2 + app.screen.width/2;
const worldY = y - H/2 + app.screen.height/2 - 30; // slight lift
points.push({x: worldX, y: worldY});
}
}
}

if(points.length === 0) return;

// limit mapping to existing particles (map many particles to points if particles > points)
const N = particles.length;
// shuffle points for variety
const shuffled = points.sort(() => Math.random() - 0.5);

// animate particles to their assigned point
const timeline = gsap.timeline();
const travelDuration = 1.6;
for(let i=0;i<N;i++){
const p = particles[i];
const target = shuffled[i % shuffled.length];
// store current orig for revert
p._preTarget = {x: p.x, y: p.y, z:p.z};
timeline.to(p, {x: target.x, y: target.y, duration: travelDuration, ease:'power2.inOut'}, 0);
// also optionally tint close to gold
timeline.to(p, {alpha:1, duration: travelDuration*0.6}, 0);
}

// after a hold, dissolve back
timeline.to({}, {duration:0.8});
timeline.call(()=>{
// hold for 2.2s then disperse
gsap.delayedCall(2.2, disperseParticles);
});

// reveal final message card after small delay (match hold)
setTimeout(()=>{
showFinalCard();
}, 1200 + travelDuration*1000);
}

function disperseParticles(){
// animate back to original distribution
particles.forEach((p,i)=>{
const orig = p.orig;
gsap.to(p, {x: orig.x, y: orig.y, duration: 1.4 + Math.random()*0.6, ease:'power2.out'});
gsap.to(p, {alpha: 0.85 * (0.6 + Math.random()*0.4), duration: 1.2});
});
// hide final card after a moment so user sees it
gsap.delayedCall(2.8, ()=>{
hideFinalCard();
});
}

function showFinalCard(){
const finalCard = document.getElementById('finalCard');
gsap.set(finalCard, {pointerEvents:'auto'});
gsap.to(finalCard, {autoAlpha:1, y:0, duration:0.9, ease:'back.out(1.2)'});
}
function hideFinalCard(){
const finalCard = document.getElementById('finalCard');
gsap.to(finalCard, {autoAlpha:0, duration:0.6, onComplete:()=>gsap.set(finalCard,{pointerEvents:'none'})});
}

// Replay capability: scroll to top and refresh timeline by reloading window or resetting ScrollTrigger
function setupReplay(){
const btn = document.getElementById('replayBtn');
btn.addEventListener('click', ()=>{
// scroll to top
window.scrollTo({top:0,behavior:'smooth'});
// re-run converge after a short delay when scroll returns to top
setTimeout(()=>{
// quick disperse to ensure particles back to orig
disperseParticles();
}, 700);
});
}

// init everything
window.addEventListener('DOMContentLoaded', ()=>{
initPixi();
setupReplay();
});
