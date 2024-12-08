// ---------- ⥥ IMPORT ⥥ ----------
import * as THREE from "https://cdn.skypack.dev/three@0.124.0";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/RGBELoader.js";

// ---------- ⥥ CANVAS ⥥ ----------
const canvasRect = document.getElementById("canvas");

// ---------- ⥥ SCENE ⥥ ----------
const scene = new THREE.Scene();

// Charger l'environnement HDRI
const hdrEquirect = new RGBELoader().load("./HDR/hdri-Bleu-panoramas.hdr", (texture) => {
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
const ambientLight = new THREE.AmbientLight(0xdbdbdb, 4);
scene.add(ambientLight);

const pointlight1 = new THREE.PointLight(0x8376eb, 7, 0);
pointlight1.position.set(0, 2, 0);
group.add(pointlight1);

const pointlight2 = new THREE.PointLight(0xf35d5d, 3, 0);
pointlight2.position.set(0, 2, 2);
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
// x : gauche(-) / droite(+)
// y : bas(-) / haut(+)
// z : proche(-) / loin(+)
camera.position.set(0, 0, 8);
// Point que regarde la caméra
// x : gauche(-) / droite(+)
// y : bas(-) / haut(+)
// z : avant(-) / arrière(+)
camera.lookAt(0, -0.5, 0);

// ---------- ⥥ RENDERER ⥥ ----------
const renderer = new THREE.WebGLRenderer({
  canvas: canvasRect,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// EXPOSITION HDRI ⥥
renderer.toneMappingExposure = 0.8;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true; // Ajout pour un meilleur rendu du verre
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ---------- ⥥ TEXTURES ⥥ ----------
const textureLoader = new THREE.TextureLoader();

// OPACITE 

// Charger les textures pour les imperfections
const roughnessMap = textureLoader.load(
  './models/textures/finger-lentille-opacity.jpg',
  function(texture) {
    console.log('Texture rayures chargée');
    texture.encoding = THREE.sRGBEncoding;
    texture.flipY = false;
  },
  undefined,
  function(err) {
    console.error('Erreur chargement texture rayures:', err);
  }
);
// NORMAL

const normalMap = textureLoader.load(
  './models/textures/lentille-normal.jpg',
  function(texture) {
    console.log('Texture normal map chargée');
    texture.encoding = THREE.LinearEncoding;
    texture.flipY = false;
  },
  undefined,
  function(err) {
    console.error('Erreur chargement normal map:', err);
  }
);

// Ajuster les paramètres des textures
roughnessMap.repeat.set(0.3, 0.3);
// RAYURES 
normalMap.repeat.set(0.3, 0.3);
// FINGERS 
// normalMap.repeat.set(1, 1);
roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;

// ---------- ⥥ MODEL ⥥ ----------
// URL du modèle local
const MODEL_URL = './models-optimized/Super8-final-01-compressed.glb';

// Configuration du DRACOLoader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/'); // Utiliser le décodeur hébergé par Google
dracoLoader.setDecoderConfig({ type: 'js' }); // Utiliser la version JavaScript du décodeur

// Configuration du GLTFLoader avec Draco
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

let model;
let startTime = null;
// Durée totale de l'animation de chargement
const animationDuration = 5000; // 5 secondes pour l'animation complète

// Variables pour le loader
const minLoaderDuration = 5000; // 5 secondes exactement
let loaderStartTime = null;
let currentProgress = 0;

// Utiliser le loader existant au lieu d'en créer un nouveau
const loaderElement = document.getElementById('loader');
const loaderText = loaderElement.querySelector('.percentage');

// Fonction pour mettre à jour le loader
function updateLoader(progress) {
    loaderText.textContent = `${Math.floor(progress)}%`;
    const progressFill = loaderElement.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
}

loader.load(MODEL_URL, 
  // Fonction de succès
  (gltf) => {
    model = gltf.scene;
    
    // Ajuster l'échelle et la position initiale du modèle
    model.scale.set(1.8, 1.8, 1.8);
    model.position.set(0, -0.5, 0);
    model.rotation.set(0, 0, 0);

    // Ajuster la rotation initiale pour que l'objectif soit bien orienté
    model.rotation.x = Math.PI * 0.1;

    model.traverse((child) => {
      if (child.isMesh) {
        // Vérifier si c'est la lentille
        if (child.name === "Lentille") {
          // Configuration avancée pour le verre
          const material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0.0, 0.0, 0.0),  // Couleur noire
            roughness: 1,                         // Augmenter la rugosité de base
            metalness: 0,                           // Pas de métal
            transparent: true,
            opacity: 0.8,                          // Contrôle de la transparence
            clearcoat: 1,                          // Effet verre
            side: THREE.DoubleSide,
            roughnessMap: roughnessMap,            // Texture pour les rayures
            normalMap: normalMap,                  // Texture pour le relief
            normalScale: new THREE.Vector2(0.05, 0.05)   // Augmenter l'intensité du relief
          });

          // Appliquer le nouveau matériau
          child.material = material;
        } else {
          // Pour les autres matériaux
          child.material.envMapIntensity = 0.1;
        }

        // Paramètres communs
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Optimisation des textures
        if (child.material.map) {
          child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
        }
      }
    });

    scene.add(model);

    // Attendre que l'animation atteigne 100% avant de masquer
    const elapsedTime = Date.now() - loaderStartTime;
    const remainingTime = Math.max(0, minLoaderDuration - elapsedTime);

    setTimeout(() => {
      updateLoader(100); // Assurer que nous sommes à 100%
      // Masquer le loader avec la transition CSS
      loaderElement.style.opacity = '0';
      setTimeout(() => {
        loaderElement.style.display = 'none';
      }, 500); // Transition de disparition de 0.5 seconde
    }, remainingTime);
  },
  // Gestionnaire de progression
  (xhr) => {
    if (!loaderStartTime) loaderStartTime = Date.now();
    
    const elapsedTime = Date.now() - loaderStartTime;
    const progress = Math.min((elapsedTime / minLoaderDuration) * 100, 100);
    
    updateLoader(progress);
  },
  // Gestionnaire d'erreur
  (error) => {
    console.error('Erreur lors du chargement du modèle:', error);
  }
);

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
    logoContainer.style.opacity = "0.3";
    scrollContainer.style.opacity = "0";
    socialsContainer.style.opacity = "0";
  } else {
    logoContainer.style.opacity = "1";
    scrollContainer.style.opacity = "1";
    socialsContainer.style.opacity = "1";
  }
});

// Fonction de défilement optimisée
function smoothScroll(targetPosition, duration = 500) {  
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    // Fonction d'easing plus rapide
    const easeOutQuart = progress => 1 - Math.pow(1 - progress, 4);

    window.scrollTo(0, startPosition + (distance * easeOutQuart(progress)));

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

// Fonction de défilement vers le haut optimisée
function smoothScrollToTop() {
  smoothScroll(0);
}

// Fonction de défilement vers la section 2 optimisée
function smoothScrollToSection2() {
  const section2 = document.getElementById('section-2');
  smoothScroll(section2.offsetTop);
}

// Sélectionner les éléments et ajouter les événements
const logoBtn = document.getElementById('logo-btn');
const scrollBtn = document.getElementById('scroll-btn');

logoBtn.addEventListener('click', smoothScrollToTop);
scrollBtn.addEventListener('click', smoothScrollToSection2);

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
