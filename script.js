// Barba.js and GSAP Code
function pageTransition() {
  let tl = gsap.timeline();

  tl.to(".nav a", {
    pointerEvents: "none",
  });
  tl.to(".transitions", {
    duration: 1.3,
    scaleY: 1,
    transformOrigin: "bottom",
    ease: "power4.inOut",
  });
  tl.to(".transitions", {
    duration: 1.3,
    scaleY: 0,
    transformOrigin: "top",
    ease: "power4.inOut",
    delay: 0.1,
  });
  tl.to(".nav a", {
    pointerEvents: "auto",
  }),
    "-=2.6";
}

function delay(n) {
  n = n || 1500;
  return new Promise((done) => {
    setTimeout(() => {
      done();
    }, n);
  });
}

barba.init({
  sync: true,
  transitions: [
    {
      async leave(data) {
        const done = this.async();
        pageTransition();
        await delay(1200);
        done();
      },
      enter() {
        initThreeJS();
      },
    },
  ],
});

barba.hooks.after(()=>{
  initThreeJS();
})

// Three.js Code
// Scene, Camera, Renderer
function initThreeJS() {
  if (window.currentscene) {
    window.currentscene.clear();
    document.getElementById("model-container").innerHTML = "";
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    124, // Reduced FOV for a better view
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("model-container").appendChild(renderer.domElement);

  const clock = new THREE.Clock(); // Required for animations
  let mixer = null; // Animation mixer

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5).normalize();
  scene.add(directionalLight);

  // Load the GLB model
  const loader = new THREE.GLTFLoader();
  loader.load(
    "/assets/model/flower.glb",
    function (gltf) {
      const model = gltf.scene;
      scene.add(model);

      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });

      console.log("Model loaded successfully!");
    },
    undefined,
    function (error) {
      console.error("Error loading model:", error);
    }
  );

  camera.position.set(0, -1, 3.8);

  // Animation loop
  const animationSpeed = 0.012;
  function animate() {
    requestAnimationFrame(animate);
    if (mixer) {
      mixer.update(clock.getDelta() * animationSpeed);
    }
    renderer.render(scene, camera);
  }
  animate();

  // Handle window resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  window.currentscene = scene;
}
initThreeJS();
