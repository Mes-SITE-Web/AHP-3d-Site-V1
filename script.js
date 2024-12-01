// ---------- ⥥ IMPORT ⥥ ----------
import * as THREE from "https://cdn.skypack.dev/three@0.124.0";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/RGBELoader.js";

// ---------- ⥥ CANVAS ⥥ ----------
const canvasRect = document.getElementById("canvas");

// ---------- ⥥ SCENE ⥥ ----------
const scene = new THREE.Scene();

// Charger l'environnement HDRI
const hdrEquirect = new RGBELoader().load("./HDR/abstraitcolorciel01.hdr", (texture) => {
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
const ambientLight = new THREE.AmbientLight(0xdbdbdb, 0.2);
scene.add(ambientLight);

const pointlight1 = new THREE.PointLight(0x8376eb, 1, 0);
pointlight1.position.set(0, 3, 2);
group.add(pointlight1);

const pointlight2 = new THREE.PointLight(0xf35d5d, 0.3, 0);
pointlight2.position.set(1, 4, 2);
group.add(pointlight2);

// ---------- ⥥ SIZES ⥥ ----------
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// ---------- ⥥ CAMERA ⥥ ----------
// Paramètres de la caméra
// new THREE.PerspectiveCamera(fov, aspect, near, far)
// fov : angle de vision vertical en degrés
// aspect : rapport largeur/hauteur de la caméra
// near : distance minimale de rendu
// far : distance maximale de rendu
const camera = new THREE.PerspectiveCamera(
  45, // Angle de vision vertical
  sizes.width / sizes.height, // Rapport largeur/hauteur
  0.1, // Distance minimale de rendu
  1000 // Distance maximale de rendu
);

// Position de la caméra
// camera.position.set(x, y, z)
// x : gauche(-) / droite(+)
// y : bas(-) / haut(+)
// z : proche(-) / loin(+)
camera.position.set(0, 0, 8);

// Point que regarde la caméra
// camera.lookAt(x, y, z)
// x : gauche(-) / droite(+)
// y : bas(-) / haut(+)
// z : avant(-) / arrière(+)
camera.lookAt(0, -0.5, 0);

// ---------- ⥥ RENDERER ⥥ ----------
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
  stencil: false
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(sizes.width, sizes.height);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// EXPOSITION 
renderer.toneMappingExposure = 1;
// Amélioration des ombres
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// Optimisation du rendu
renderer.outputEncoding = THREE.sRGBEncoding;

// ---------- ⥥ MODEL ⥥ ----------
// Charger le modèle GLB
const loader = new GLTFLoader();
let model;

loader.load("./models/fade-btn.glb", (gltf) => {
  model = gltf.scene;
  
  // Ajuster l'échelle et la position initiale du modèle
  model.scale.set(1.5, 1.5, 1.5);
  model.position.set(0, -0.5, 0);
  model.rotation.set(0, 0, 0);

  // Ajuster la rotation initiale pour que l'objectif soit bien orienté
  model.rotation.x = Math.PI * 0.1;

  model.traverse((child) => {
    if (child.isMesh) {
      child.material.envMapIntensity = 0.1; // Intensité des reflets
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
      
      // Optimisation des matériaux
      if (child.material.map) {
        child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }
    }
  });

  scene.add(model);
});

// ---------- ⥥ ANIMATIONS DE PARALLAXE ⥥ ----------
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let currentRotationX = 0;
let currentRotationY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// Vitesse de suivi du curseur
// Plus la valeur est basse, plus le mouvement est fluide
// Valeurs conseillées entre 0.05 et 0.3
const rotationSpeed = 0.15;

// Angle maximum de rotation
// Math.PI/8 = 22.5 degrés
// Math.PI/6 = 30 degrés
// Math.PI/4 = 45 degrés
const maxRotation = Math.PI / 3;

// Inclinaison permanente du modèle
// Valeurs positives = objectif vers le haut
// Valeurs négatives = objectif vers le bas
// Math.PI * 0.1 = inclinaison de 18 degrés

// OBJECTIF SUIVI 
const rotationOffsetX = Math.PI * 0.1;

// ---------- ⥥ VARIABLES DE SCROLL ⥥ ----------
let currentScroll = 0;
let targetScroll = 0;
const scrollEase = 0.05; // Vitesse de l'effet de scroll

// Paramètres de zoom au scroll
const minScale = 1.5; // Échelle minimum du modèle
const maxScale = 2; // Échelle maximum du modèle
const zoomSpeed = 0.001; // Vitesse du zoom

// Paramètres de zoom pour le texte
const textMinScale = 1; // Échelle minimum du texte
const textMaxScale = 1.1; // Échelle maximum du texte
const textZoomSpeed = 0.0005; // Vitesse du zoom du texte
const textOffsetY = 30; // Décalage vertical maximum en pixels

// Sélection des éléments de texte
const textBehind = document.getElementById("text-behind");
const textBehindBlur = document.getElementById("text-behind-blur");
const textFront = document.getElementById("text-front");

function updateMousePosition(event) {
  // Calcul de la position relative de la souris (-1 à 1)
  mouseX = (event.clientX - windowHalfX) / windowHalfX;
  mouseY = (event.clientY - windowHalfY) / windowHalfY;

  // Calcul des rotations cibles
  targetRotationY = mouseX * maxRotation; // Rotation horizontale
  targetRotationX = mouseY * maxRotation * 0.7; // Rotation verticale (réduite à 70%)
}

document.addEventListener("mousemove", updateMousePosition);

// ---------- ⥥ ANIMATION ⥥ ----------
const breathingAmplitude = 0.1; // Amplitude du mouvement (0.02 = subtil, 0.1 = fort)
const breathingSpeed = 0.001;    // Vitesse du mouvement (0.001 = lent, 0.003 = rapide)

function animate() {
  requestAnimationFrame(animate);

  if (model) {
    // Interpolation douce des rotations
    currentRotationX += (targetRotationX - currentRotationX) * rotationSpeed;
    currentRotationY += (targetRotationY - currentRotationY) * rotationSpeed;

    // Application des rotations au modèle
    model.rotation.x = currentRotationX + rotationOffsetX;
    model.rotation.y = currentRotationY;

    // Animation de lévitation
    model.position.y = -0.5 + Math.sin(Date.now() * breathingSpeed) * breathingAmplitude;

    // Effet de zoom au scroll pour le modèle
    currentScroll += (targetScroll - currentScroll) * scrollEase;
    const modelScale = minScale + currentScroll * zoomSpeed;
    const clampedModelScale = Math.min(Math.max(modelScale, minScale), maxScale);
    model.scale.set(clampedModelScale, clampedModelScale, clampedModelScale);

    // Effet de zoom au scroll pour le texte
    const textScale = textMinScale + currentScroll * textZoomSpeed;
    const clampedTextScale = Math.min(Math.max(textScale, textMinScale), textMaxScale);
    
    // Calcul du décalage vertical basé sur le scroll
    const scrollRatio = currentScroll / (document.documentElement.scrollHeight - window.innerHeight);
    const offset = scrollRatio * textOffsetY;
    
    // Appliquer l'échelle et le décalage aux éléments de texte
    textBehind.style.transform = `scale(${clampedTextScale}) translateY(${offset * 1.2}px)`;
    textBehindBlur.style.transform = `scale(${clampedTextScale}) translateY(${offset * 1.1}px)`;
    textFront.style.transform = `scale(${clampedTextScale}) translateY(${offset}px)`;
  }

  renderer.render(scene, camera);
}

animate();

// ---------- ⥥ GESTION DU SCROLL ⥥ ----------
const logoContainer = document.querySelector(".logo-container");
const scrollContainer = document.querySelector(".scroll-container");
const socialsContainer = document.querySelector(".socials");

// Gestion du scroll pour le zoom et l'opacité
window.addEventListener("scroll", () => {
  // Mise à jour de la position de scroll cible
  targetScroll = window.pageYOffset;

  // Gestion de l'opacité des éléments
  if (targetScroll > 30) {
    logoContainer.style.opacity = "0";
    scrollContainer.style.opacity = "0";
    socialsContainer.style.opacity = "0";
  } else {
    logoContainer.style.opacity = "1";
    scrollContainer.style.opacity = "1";
    socialsContainer.style.opacity = "1";
  }
});

// ---------- ⥥ REDIMENSIONNEMENT ⥥ ----------
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (model) {
    const scale = Math.min(window.innerWidth, window.innerHeight) * 0.001;
    model.scale.set(scale, scale, scale);
  }
}

window.addEventListener('resize', onWindowResize);
