// Show Loader on Page Load
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".loader").style.display = "block"; // Show loader
});

// Hide Loader After Page Fully Loads
window.addEventListener("load", () => {
  gsap.to(".loader", {
    opacity: 0,
    duration: 1,
    ease: "power4.inOut",
    onComplete: () => {
      document.querySelector(".loader").style.display = "none";
    },
  });

  // Run Entry Animation After Loader
  gsap.fromTo(
    ".transitions",
    { scaleY: 1 },
    {
      duration: 1.3,
      scaleY: 0,
      transformOrigin: "top",
      ease: "power4.inOut",
    }
  );
});

// GSAP Page Transition
function pageTransition(outCallback) {
  let tl = gsap.timeline();

  // Exit Animation
  tl.to(".transitions", {
    duration: 1.3,
    scaleY: 1,
    transformOrigin: "bottom",
    ease: "power4.inOut",
    onComplete: () => {
      outCallback(); // Change page in the middle of animation
    },
  });

  // Entry Animation (after new page loads)
  tl.to(".transitions", {
    duration: 1.3,
    scaleY: 0,
    transformOrigin: "top",
    ease: "power4.inOut",
    delay: 0.2,
  });
}

// Handle link clicks for navigation
document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default link behavior
    const href = link.getAttribute("href");

    // Trigger the page transition
    pageTransition(() => {
      window.location.href = href; // Change the page in the middle
    });
  });
});

// Run the entry animation when the page loads
window.addEventListener("load", () => {
  gsap.fromTo(
    ".transitions",
    { scaleY: 1 },
    {
      duration: 1.3,
      scaleY: 0,
      transformOrigin: "top",
      ease: "power4.inOut",
    }
  );
});

// Three.js Implementation
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const GLTFLoader = THREE.GLTFLoader;

let scene, camera, renderer, model, mixer;
let animationFrameId = null;

function cleanupThreeJS() {
  // Cancel the animation loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Dispose of the renderer
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement = null;
    renderer = null;
  }

  // Dispose of the scene and its children
  if (scene) {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
    scene.clear();
    scene = null;
  }

  // Dispose of the mixer
  if (mixer) {
    mixer.stopAllAction();
    mixer.uncacheRoot(model);
    mixer = null;
  }

  // Clear the container
  const container = document.getElementById("model-container");
  if (container) container.innerHTML = "";
}

function initThreeJS() {
  // Ensure the container exists
  const container = document.getElementById("model-container");
  if (!container) {
    console.error("Container not found!");
    return;
  }

  // Scene setup
  scene = new THREE.Scene();

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    45, // Reduced FOV to prevent "zoomed out" effect
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 20); // Move camera closer

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 6, 5).normalize();
  scene.add(directionalLight);

  // Model loading
  new THREE.GLTFLoader().load(
    "./assets/model/Skull.glb",
    (gltf) => {
      model = gltf.scene;
      scene.add(model);

      // Initial position, rotation, and scale adjustments
      updateModelPosition();

      // Animations
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
    },
    undefined,
    (error) => console.error("Error loading model:", error)
  );

  // Animation loop
  const clock = new THREE.Clock();
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta() * 0.1);
    if (model) model.rotation.z += 0.02;
    renderer.render(scene, camera);
  }
  animate();

  // Responsive handling for window resize
  window.addEventListener("resize", () => {
    const container = document.getElementById("model-container");
    if (container) {
      // Update camera and renderer
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);

      // Update model position and scale
      updateModelPosition();
    }
  });
}

// Function to update model position and scale
function updateModelPosition() {
  if (!model || !camera) return;

  // Calculate visible area at the model's depth
  const distanceFromCamera = 20; // Match camera.position.z
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const visibleHeight = 2 * Math.tan(fov / 2) * distanceFromCamera;
  const visibleWidth = visibleHeight * camera.aspect;

  // Position at bottom-right (90% from left, 90% from top)
  model.position.x = visibleWidth / 2 - 4; // Right edge with a small margin
  model.position.y = -visibleHeight / 2 + 2; // Bottom edge with a small margin

  // Adjust scale based on visible area
  const scale = visibleHeight * 0.01; // 10% of visible height
  model.scale.set(scale, scale, scale);

  // Fixed rotation
  model.rotation.x = -Math.PI / 2;
}

// Initial load
initThreeJS();

// Vinta JS
VANTA.FOG({
  el: "body",
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.0,
  minWidth: 200.0,
  highlightColor: 0x0,
  midtoneColor: 0xa21818,
  lowlightColor: 0x0,
  baseColor: 0x360606,
  blurFactor: 0.71,
  speed: 2.2,
});
