document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".loader").style.display = "block";
});

window.addEventListener("load", () => {
  gsap.to(".loader", {
    opacity: 0,
    duration: 1,
    ease: "power4.inOut",
    onComplete: () => {
      document.querySelector(".loader").style.display = "none";
    },
  });

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

function pageTransition(outCallback) {
  let tl = gsap.timeline();

  tl.to(".transitions", {
    duration: 1.3,
    scaleY: 1,
    transformOrigin: "bottom",
    ease: "power4.inOut",
    onComplete: () => {
      outCallback();
    },
  });

  tl.to(".transitions", {
    duration: 1.3,
    scaleY: 0,
    transformOrigin: "top",
    ease: "power4.inOut",
    delay: 0.2,
  });
}

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const href = link.getAttribute("href");

    pageTransition(() => {
      window.location.href = href;
    });
  });
});

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

const GLTFLoader = THREE.GLTFLoader;
let scene, camera, renderer, model, mixer;
let animationFrameId = null;

function cleanupThreeJS() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement = null;
    renderer = null;
  }

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

  if (mixer) {
    mixer.stopAllAction();
    mixer.uncacheRoot(model);
    mixer = null;
  }

  const container = document.getElementById("model-container");
  if (container) container.innerHTML = "";
}

function initThreeJS() {
  const container = document.getElementById("model-container");
  if (!container) {
    console.error("Container not found!");
    return;
  }

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 20);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 6, 5).normalize();
  scene.add(directionalLight);

  new THREE.GLTFLoader().load(
    "./assets/model/Skull.glb",
    (gltf) => {
      model = gltf.scene;
      scene.add(model);

      updateModelPosition();

      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
    },
    undefined,
    (error) => console.error("Error loading model:", error)
  );

  const clock = new THREE.Clock();
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta() * 0.1);
    if (model) model.rotation.z += 0.02;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    const container = document.getElementById("model-container");
    if (container) {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      updateModelPosition();
    }
  });
}

function updateModelPosition() {
  if (!model || !camera) return;

  const distanceFromCamera = 20;
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const visibleHeight = 2 * Math.tan(fov / 2) * distanceFromCamera;
  const visibleWidth = visibleHeight * camera.aspect;

  model.position.x = visibleWidth / 2 - 4;
  model.position.y = -visibleHeight / 2 + 2;

  const scale = visibleHeight * 0.01;
  model.scale.set(scale, scale, scale);

  model.rotation.x = -Math.PI / 2;
}

initThreeJS();

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