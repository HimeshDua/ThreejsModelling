function pageTransition() {
  let tl = gsap.timeline();

  tl.to(".nav a", {
    pointerEvents: "none",
  });
  tl.to(".transitions", {
    duration: 1,
    scaleY: 1,
    transformOrigin: "bottom",
    ease: "power4.inOut",
  });
  tl.to(".transitions", {
    duration: 0.8,
    scaleY: 0,
    transformOrigin: "top",
    ease: "power4.inOut",
    delay: 0.1,
  });
  tl.to(".nav a", {
    pointerEvents: "auto",
  }),
    "-=1.8";
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
        await delay(2000);
        done();
      },
    },
  ],
});
