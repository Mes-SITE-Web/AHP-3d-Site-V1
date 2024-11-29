import * as THREE from "https://cdn.skypack.dev/three@0.124.0";
import { RGBELoader } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/GLTFLoader.js";

// Récupération des éléments HTML
const textBehind = document.getElementById("text-behind");
const textFront = document.getElementById("text-front");
const textBehindBlur = document.getElementById("text-behind-blur");
const canvasRect = document.getElementById("canvas");
const logoContainer = document.querySelector(".logo-container");

// ---------- ⥥ CONSTANTES POUR LES ANIMATIONS ⥥ ----------
const parallaxScaling1 = 0.0003; // Texte
const parallaxScaling2 = 0.0002; // Canvas
const parallaxScaling3 = 0.0000002; // Rotation globale

let currentScroll = 0,
  targetScroll = 0,
  theta1 = 0,
  ease = 0.001;

// ---------- ⥥ INITIALISATION DE LA SCÈNE THREE.JS ⥥ ----------
const renderer = new THREE.WebGLRenderer({
  canvas: canvasRect,
  antialias: true,
  alpha: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();

// Charger l'environnement HDRI
const hdrEquirect = new RGBELoader().load("/HDR/abstraitcolorciel01.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.encoding = THREE.RGBEEncoding;
  scene.environment = texture;
});

// Brouillard
scene.fog = new THREE.FogExp2(0x11151c, 0);

// Groupe principal
const group = new THREE.Group();
scene.add(group);

// Lumières
const pointlight1 = new THREE.PointLight(0x8376eb, 1, 0);
// (Couleurs, Intensité et Distance) 
pointlight1.position.set(0, 3, 2);
// x,y et z - Position : Située au-dessus (y=3) et légèrement en avant (z=2).
group.add(pointlight1);

const pointlight2 = new THREE.PointLight(0xf35d5d, 0.3, 0);
pointlight2.position.set(1, 4, 2);
group.add(pointlight2);

const ambientLight = new THREE.AmbientLight(0xdbdbdb, 0.2);
scene.add(ambientLight);

// Caméra
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1, 10);
group.add(camera);

// Charger le modèle GLB
const loader = new GLTFLoader();
loader.load("/models/camsuper.glb", (gltf) => {
  const model = gltf.scene;

  // Ajuster l'échelle du modèle
  // model.scale.set(15, 15, 15);
  // model.scale.set(10, 10, 10);
  // model.scale.set(5, 5, 5);
  //  model.scale.set(2.3, 2.3, 2.3);
   model.scale.set(0.5, 0.5, 0.5);

  // Appliquer des matériaux réalistes
  model.traverse((child) => {
    if (child.isMesh && child.material) {
      const mat = child.material;
      mat.envMap = scene.environment;
      mat.envMapIntensity = 5;
      mat.roughness = 3;
      mat.metalness = 0;
      if (mat.emissive) {
        mat.emissiveIntensity = 50;
      }
    }
  });

  group.add(model);
});

// ---------- ⥥ ANIMATIONS DE PARALLAXE ⥥ ----------
function updateScale() {
  let rect = canvasRect.getBoundingClientRect();
  let startScrollPosition = window.pageYOffset + rect.top;
  let endScrollPosition = window.pageYOffset + rect.bottom;

  if (
    targetScroll + window.innerHeight < startScrollPosition ||
    targetScroll > endScrollPosition
  ) {
    return;
  }

  currentScroll += (targetScroll - currentScroll) * ease;

  // Échelle et rotation
  let scaleValue1 = 1 + currentScroll * parallaxScaling1;
  let scaleValue2 = 1 + currentScroll * parallaxScaling2;

  textBehind.style.transform = `scale(${scaleValue1})`;
  textFront.style.transform = `scale(${scaleValue1})`;
  textBehindBlur.style.transform = `scale(${scaleValue1})`;
  canvasRect.style.transform = `scale(${scaleValue2})`;

  theta1 += currentScroll * parallaxScaling3;
  setTimeout(updateScale, 1000 / 60);
}

  // SCROLL DOWN OPACITE
const scrollContainer = document.querySelector(".scroll-container");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY; // Position verticale du scroll
  const maxOpacity = 1; // Opacité initiale
  const fadeStart = 50; // Position où commence la disparition
  const fadeEnd = 200; // Position où l'opacité devient 0

  let opacity = maxOpacity;
  if (scrollY > fadeStart) {
    opacity = Math.max(
      0,
      maxOpacity - (scrollY - fadeStart) / (fadeEnd - fadeStart)
    );
  }
  scrollContainer.style.opacity = opacity;
});

// Variables pour le mouvement de la souris
window.addEventListener("scroll", () => {
  targetScroll = window.pageYOffset;
  updateScale();
});
updateScale();

// Variables pour le mouvement de la souris
let mouseX = 0,
  mouseY = 0;
let targetMouseX = 0,
  targetMouseY = 0;
const mouseEase = 0.1;

// ---------- ⥥ EFFETS DE MOUVEMENT À LA SOURIS ⥥ ----------
document.addEventListener("mousemove", (event) => {
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  mouseX = (event.clientX - windowHalfX) / windowHalfX;
  mouseY = (event.clientY - windowHalfY) / windowHalfY;

  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Gestion de l'opacité du logo au scroll
window.addEventListener("scroll", () => {
  const scrollPosition = window.scrollY;
  if (scrollPosition > 50) { // Commence à disparaître après 50px de scroll
    logoContainer.style.opacity = "0";
  } else {
    logoContainer.style.opacity = "1";
  }
});

// ---------- ⥥ ANIMATION PRINCIPALE DE LA SCÈNE ⥥ ----------
function update() {
  theta1 += 0.0025;

  // Lissage des mouvements de la souris
  targetMouseX += (mouseX - targetMouseX) * mouseEase;
  targetMouseY += (mouseY - targetMouseY) * mouseEase;

  // Mise à jour des lumières
  pointlight1.position.x = Math.sin(theta1 + 1) * 5;
  pointlight1.position.y = Math.cos(theta1) * 2;
  pointlight1.position.z = Math.cos(theta1) * 5;

  pointlight2.position.x = -Math.sin(theta1) * 5;
  pointlight2.position.y = -Math.cos(theta1 + 1) * 2;
  pointlight2.position.z = -Math.cos(theta1) * 5;
  

  // Effets parallaxe
  // group.rotation.y += 0.0006;
  // group.rotation.x = targetMouseY * 0.1;
  // group.rotation.y += targetMouseX * 0.1;

  // Mouvement de la caméra
  camera.position.x = Math.sin(theta1) * 10 + targetMouseX * 1;
  camera.position.z = Math.cos(theta1) * 10;
  camera.lookAt(0, 0, 0);
}

// Variables pour le mouvement de la souris
function updateMousePosition() {
  // Applique les mouvements de souris pour ajuster la position du groupe
  group.position.x = mouseX * 0.2; // Ajuste le multiplicateur pour l'amplitude
  group.position.y = mouseY * 0.2; // Ajuste le multiplicateur pour l'amplitude

  // Si tu veux manipuler aussi l'axe Z :
  // group.position.z = mouseX * 2; // Facultatif pour une profondeur dynamique
}

function animate() {
  updateMousePosition(); // Mise à jour de la position avec la souris
  update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// ---------- ⥥ REDIMENSIONNEMENT ⥥ ----------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


