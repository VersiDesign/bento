<script>
document.addEventListener("DOMContentLoaded", () => {

  const STORAGE_KEY = "ageVerified";

  const ageGate = document.querySelector(".age-gate__wrap");

  // No age gate on this page
  if (!ageGate) return;


  /* =========================================
     ALREADY VERIFIED THIS SESSION
  ========================================= */

  if (sessionStorage.getItem(STORAGE_KEY) === "true") {
    ageGate.remove();
    return;
  }


  /* =========================================
     ELEMENTS
  ========================================= */

  const videoStage = ageGate.querySelector(".age-gate__video-wrap");
  const videoWrap = ageGate.querySelector(".age-gate__video");

  // Webflow Background Video component
  const video = videoWrap?.querySelector("video");

  const screenPos = ageGate.querySelector(".age-gate__screen-pos");
  const textWrap = ageGate.querySelector(".age-gate__txt-wrap");
  const noButton = ageGate.querySelector(".age-gate__btn.btn-no");
  const yesButton = ageGate.querySelector(".age-gate__btn.btn-yes");


  /* =========================================
   KEEP SCREEN OVERLAY MATCHED TO VIDEO
========================================= */

const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;

function syncScreenPosition() {

  if (!videoStage || !screenPos) return;

  const stageWidth = videoStage.clientWidth;
  const stageHeight = videoStage.clientHeight;

  if (!stageWidth || !stageHeight) return;


  /* =========================================
     CALCULATE 16:9 COVER SIZE
  ========================================= */

  const scale = Math.max(
    stageWidth / VIDEO_WIDTH,
    stageHeight / VIDEO_HEIGHT
  );

  const renderedWidth = VIDEO_WIDTH * scale;
  const renderedHeight = VIDEO_HEIGHT * scale;


  /* =========================================
     GET VIDEO HORIZONTAL POSITION
  ========================================= */

  const videoPosition =
    getComputedStyle(videoStage)
      .getPropertyValue("--age-video-x")
      .trim();

  const parsedPositionX = parseFloat(videoPosition);

  const positionX =
    Number.isFinite(parsedPositionX)
      ? parsedPositionX / 100
      : 0.5;


  /* =========================================
     MATCH OBJECT-POSITION GEOMETRY
  ========================================= */

  const renderedLeft =
    (stageWidth - renderedWidth) * positionX;

  const renderedTop =
    (stageHeight - renderedHeight) * 0.5;


  /* =========================================
     POSITION OVERLAY COORDINATE SYSTEM
  ========================================= */

  screenPos.style.width = `${renderedWidth}px`;
  screenPos.style.height = `${renderedHeight}px`;

  screenPos.style.left = `${renderedLeft}px`;
  screenPos.style.top = `${renderedTop}px`;

  screenPos.style.transform = "none";

}

  syncScreenPosition();

  let screenResizeObserver;

  if (videoStage && screenPos && "ResizeObserver" in window) {

    screenResizeObserver =
      new ResizeObserver(syncScreenPosition);

    screenResizeObserver.observe(videoStage);

  } else {

    // Fallback for browsers without ResizeObserver
    window.addEventListener("resize", syncScreenPosition);

  }


  /* =========================================
     SHOW AGE GATE
  ========================================= */

  let ageGateShown = false;

  function showAgeGate() {

    if (ageGateShown) return;
    ageGateShown = true;

    // Make certain overlay geometry matches current video crop
    syncScreenPosition();

    // Give browser two frames to settle layout and draw video
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {

        // Recalculate once more after Safari has settled layout
        syncScreenPosition();

        // Lock scrolling when gate becomes visible
        document.documentElement.classList.add("age-gate-open");

        ageGate.classList.add("is-ready");

      });
    });

  }


  if (video) {

    function waitForMovingVideo() {

      // Wait until an actual video frame beyond the opening
      // frame has been rendered.
      if ("requestVideoFrameCallback" in video) {

        function checkFrame(now, metadata) {

          if (metadata.mediaTime > 0.05) {
            showAgeGate();
            return;
          }

          video.requestVideoFrameCallback(checkFrame);

        }

        video.requestVideoFrameCallback(checkFrame);

      } else {

        // Fallback for older browsers
        const checkPlayback = () => {

          if (!video.paused && video.currentTime > 0.05) {
            showAgeGate();
            return;
          }

          requestAnimationFrame(checkPlayback);

        };

        checkPlayback();

      }

    }


    // If Webflow has already started playback
    if (!video.paused && video.currentTime > 0) {

      waitForMovingVideo();

    } else {

      // Wait until playback genuinely begins
      video.addEventListener("playing", waitForMovingVideo, {
        once: true
      });

    }

  } else {

    // Safety fallback
    showAgeGate();

  }


  /* =========================================
     NO
     Fade text back in
  ========================================= */

  noButton?.addEventListener("click", (event) => {

    event.preventDefault();

    if (!textWrap) return;

    // Cancel any previous fade if clicked repeatedly
    textWrap.getAnimations().forEach(animation => {
      animation.cancel();
    });

    textWrap.animate(
      [
        { opacity: 0 },
        { opacity: 1 }
      ],
      {
        duration: 600,
        easing: "ease",
        fill: "forwards"
      }
    );

  });


  /* =========================================
     YES
  ========================================= */

  yesButton?.addEventListener("click", (event) => {

    event.preventDefault();

    // Remember verification for this tab/session
    sessionStorage.setItem(STORAGE_KEY, "true");

    // Fade the gate away
    ageGate.classList.add("is-leaving");

    let removed = false;

    function removeAgeGate() {

      if (removed) return;
      removed = true;

      if (video) {
        video.pause();
      }

      if (screenResizeObserver) {
        screenResizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", syncScreenPosition);
      }

      // Restore normal page scrolling
      document.documentElement.classList.remove("age-gate-open");

      // Remove complete age gate + video from DOM
      ageGate.remove();

    }

    ageGate.addEventListener("transitionend", (event) => {

      // Only react to the age gate's own opacity transition
      if (
        event.target === ageGate &&
        event.propertyName === "opacity"
      ) {
        removeAgeGate();
      }

    });

    // Safety fallback in case transitionend does not fire
    setTimeout(removeAgeGate, 700);

  });

});
</script>

<script>

/* animation wine slide 2 */

window.Webflow = window.Webflow || [];

window.Webflow.push(function () {

  const illo = document.querySelector(
    '.products__illo.illo-slide-2'
  );

  if (!illo) return;

  window.addEventListener(
    'bento:products-illos-ready',
    function () {

  const slider = document.querySelector('.products-slider');
  const slides = slider ?
    Array.from(slider.querySelectorAll('.w-slide')) :
    [];
  const matchingSlide = slides[1];

  const face = illo.querySelector('.illo-img.img-a');
  const bottomEyesOpen = illo.querySelector('.illo-img.img-b');
  const topEyesOpen = illo.querySelector('.illo-img.img-c');
  const bottomEyesClosed = illo.querySelector('.illo-img.img-d');
  const topEyesClosed = illo.querySelector('.illo-img.img-e');
  const leftMidLeaf = illo.querySelector('.illo-img.img-f');
  const rightMidLeaf = illo.querySelector('.illo-img.img-g');
  const leftTopLeaf = illo.querySelector('.illo-img.img-h');
  const rightTopLeaf = illo.querySelector('.illo-img.img-i');

  if (
    !face ||
    !bottomEyesOpen ||
    !topEyesOpen ||
    !bottomEyesClosed ||
    !topEyesClosed
  ) {
    return;
  }


  /* =========================================
     BLINK SETTINGS
  ========================================= */

  const blink = {
    minInitialDelay: 0.35,
    maxInitialDelay: 0.8,
    minDelay: 1.8,
    maxDelay: 4.2,
    minClosedHold: 0.11,
    maxClosedHold: 0.18,
    minRowOffset: 0.055,
    maxRowOffset: 0.095,
    singleRowChance: 0.22,
    doubleChance: 0.18,
    minDoubleGap: 0.12,
    maxDoubleGap: 0.22
  };


  /* =========================================
     LEAF SETTINGS
  ========================================= */

  const leaves = [
    {
      el: leftMidLeaf,
      xPercent: -38,
      yPercent: 0,
      driftX: 17,
      driftY: 17,
      rotation: 9
    },
    {
      el: rightMidLeaf,
      xPercent: 36,
      yPercent: 15,
      driftX: 17,
      driftY: 17,
      rotation: 9
    },
    {
      el: leftTopLeaf,
      xPercent: -30,
      yPercent: -33,
      driftX: 14,
      driftY: 17,
      rotation: 11
    },
    {
      el: rightTopLeaf,
      xPercent: 30,
      yPercent: -38,
      driftX: 14,
      driftY: 17,
      rotation: 11
    }
  ].filter(function (leaf) {
    return leaf.el;
  });

  const leafTiming = {
    minDuration: 2.4,
    maxDuration: 3.8
  };


  /* =========================================
     SETUP
  ========================================= */

  const eyeLayers = [
    bottomEyesOpen,
    topEyesOpen,
    bottomEyesClosed,
    topEyesClosed
  ];

  let blinkTimeline = null;
  let leafTweens = [];
  let running = false;

  gsap.set(face, {
    autoAlpha: 1
  });

  gsap.set(eyeLayers, {
    autoAlpha: 0
  });

  gsap.set([bottomEyesOpen, topEyesOpen], {
    autoAlpha: 1
  });

  leaves.forEach(function (leaf) {
    gsap.set(leaf.el, {
      autoAlpha: 1,
      xPercent: leaf.xPercent,
      yPercent: leaf.yPercent,
      x: 0,
      y: 0,
      rotation: 0,
      transformOrigin: '50% 50%'
    });
  });


  /* =========================================
     BLINK SEQUENCE
  ========================================= */

  function resetEyes() {
    gsap.set([bottomEyesClosed, topEyesClosed], {
      autoAlpha: 0
    });

    gsap.set([bottomEyesOpen, topEyesOpen], {
      autoAlpha: 1
    });
  }

  function addBlink(tl) {

    const closedHold = gsap.utils.random(
      blink.minClosedHold,
      blink.maxClosedHold
    );

    const rowOffset = gsap.utils.random(
      blink.minRowOffset,
      blink.maxRowOffset
    );

    // Bottom row blinks first.
    tl.set(bottomEyesOpen, {
      autoAlpha: 0
    });

    tl.set(bottomEyesClosed, {
      autoAlpha: 1
    });

    tl.to({}, {
      duration: rowOffset
    });

    // Top row follows slightly after.
    tl.set(topEyesOpen, {
      autoAlpha: 0
    });

    tl.set(topEyesClosed, {
      autoAlpha: 1
    });

    tl.to({}, {
      duration: closedHold
    });

    tl.set(bottomEyesClosed, {
      autoAlpha: 0
    });

    tl.set(bottomEyesOpen, {
      autoAlpha: 1
    });

    tl.to({}, {
      duration: rowOffset
    });

    tl.set(topEyesClosed, {
      autoAlpha: 0
    });

    tl.set(topEyesOpen, {
      autoAlpha: 1
    });
  }

  function addSingleRowBlink(tl, openEyes, closedEyes) {

    const closedHold = gsap.utils.random(
      blink.minClosedHold,
      blink.maxClosedHold
    );

    tl.set(openEyes, {
      autoAlpha: 0
    });

    tl.set(closedEyes, {
      autoAlpha: 1
    });

    tl.to({}, {
      duration: closedHold
    });

    tl.set(closedEyes, {
      autoAlpha: 0
    });

    tl.set(openEyes, {
      autoAlpha: 1
    });
  }

  function addRandomSingleRowBlink(tl) {

    if (Math.random() < 0.5) {
      addSingleRowBlink(
        tl,
        bottomEyesOpen,
        bottomEyesClosed
      );

      return;
    }

    addSingleRowBlink(
      tl,
      topEyesOpen,
      topEyesClosed
    );
  }

  function createBlinkSequence(isFirstBlink) {

    const delay = gsap.utils.random(
      isFirstBlink ? blink.minInitialDelay : blink.minDelay,
      isFirstBlink ? blink.maxInitialDelay : blink.maxDelay
    );

    const tl = gsap.timeline({
      paused: true,
      onComplete: function () {
        if (!running) return;

        blinkTimeline = createBlinkSequence(false);
        blinkTimeline.play(0);
      }
    });

    tl.to({}, {
      duration: delay
    });

    const useSingleRowBlink =
      !isFirstBlink &&
      Math.random() < blink.singleRowChance;

    if (useSingleRowBlink) {
      addRandomSingleRowBlink(tl);
    } else {
      addBlink(tl);
    }

    if (
      !useSingleRowBlink &&
      Math.random() < blink.doubleChance
    ) {
      tl.to({}, {
        duration: gsap.utils.random(
          blink.minDoubleGap,
          blink.maxDoubleGap
        )
      });

      addBlink(tl);
    }

    return tl;
  }


  /* =========================================
     LEAF FLOATING
  ========================================= */

  function floatLeaf(leaf, index) {

    if (!running) return;

    leafTweens[index] = gsap.to(leaf.el, {
      x: gsap.utils.random(
        -leaf.driftX,
        leaf.driftX
      ),

      y: gsap.utils.random(
        -leaf.driftY,
        leaf.driftY
      ),

      rotation: gsap.utils.random(
        -leaf.rotation,
        leaf.rotation
      ),

      duration: gsap.utils.random(
        leafTiming.minDuration,
        leafTiming.maxDuration
      ),

      ease: 'sine.inOut',

      onComplete: function () {
        floatLeaf(leaf, index);
      }
    });
  }

  function startLeaves() {
    leaves.forEach(function (leaf, index) {
      floatLeaf(leaf, index);
    });
  }

  function stopLeaves() {
    leafTweens.forEach(function (tween) {
      if (tween) {
        tween.kill();
      }
    });

    leafTweens = [];

    leaves.forEach(function (leaf) {
      gsap.set(leaf.el, {
        x: 0,
        y: 0,
        rotation: 0
      });
    });
  }


  /* =========================================
     START
  ========================================= */

  function startAnimation() {

    if (running) return;

    running = true;

    resetEyes();

    if (blinkTimeline) {
      blinkTimeline.kill();
    }

    blinkTimeline = createBlinkSequence(true);
    blinkTimeline.play(0);

    startLeaves();
  }


  /* =========================================
     STOP
  ========================================= */

  function stopAnimation() {

    if (!running) return;

    running = false;

    if (blinkTimeline) {
      blinkTimeline.kill();
      blinkTimeline = null;
    }

    resetEyes();
    stopLeaves();
  }


  /* =========================================
     WATCH ACTIVE SLIDE
  ========================================= */

  function checkState() {

    const isActiveIllustration =
      illo.classList.contains('is-active');

    const isActiveSlide =
      matchingSlide &&
      matchingSlide.getAttribute('aria-hidden') !== 'true';

    if (isActiveIllustration || isActiveSlide) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }

  const observer = new MutationObserver(checkState);

  observer.observe(illo, {
    attributes: true,
    attributeFilter: ['class']
  });

  if (matchingSlide) {
    observer.observe(matchingSlide, {
      attributes: true,
      attributeFilter: ['aria-hidden']
    });
  }

  requestAnimationFrame(checkState);

    },
    { once: true }
  );

});

</script>

<script>

/* animation wine slide 3 */

window.Webflow = window.Webflow || [];

window.Webflow.push(function () {

  const illo = document.querySelector(
    '.products__illo.illo-slide-3'
  );

  if (!illo) return;

  window.addEventListener(
    'bento:products-illos-ready',
    function () {

  const slider = document.querySelector('.products-slider');
  const slides = slider ?
    Array.from(slider.querySelectorAll('.w-slide')) :
    [];
  const matchingSlide = slides[2];

  const frameA = illo.querySelector('.illo-img.img-a');
  const frameB = illo.querySelector('.illo-img.img-b');
  const frameC = illo.querySelector('.illo-img.img-c');
  const frameD = illo.querySelector('.illo-img.img-d');
  const frameE = illo.querySelector('.illo-img.img-e');

  if (!frameA || !frameD) return;


  /* =========================================
     BOUNCE SETTINGS
  ========================================= */

  const timing = {
    hold: 0.12,
    squash: 0.1,
    squashHold: 0.08,
    lift: 0.24,
    settle: 0.28,
    pauseMin: 0.04,
    pauseMax: 0.16,
    minStyleLoops: 2,
    maxStyleLoops: 5
  };

  const rock = {
    rotation: 2,
    minDuration: 0.9,
    maxDuration: 1.8
  };

  const squish = {
    squashScaleX: 1.006,
    squashScaleY: 0.994,
    stretchScaleX: 0.99,
    stretchScaleY: 1.012,
    liftY: -10
  };


  /* =========================================
     SETUP
  ========================================= */

  const frames = [
    frameA,
    frameB,
    frameC,
    frameD,
    frameE
  ].filter(function (frame) {
    return frame;
  });

  const motionLayers = frames.map(function (frame) {
    return frame.firstElementChild || frame;
  });

  const bounceStyles = [
    {
      frame: frameA
    },
    {
      frame: frameD
    }
  ];

  let bounceTimeline = null;
  let rockTween = null;
  let running = false;
  let lastStyleIndex = -1;
  let currentFrame = frameA;

  gsap.set(frames, {
    autoAlpha: 0
  });

  gsap.set(motionLayers, {
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    transformOrigin: '50% 100%'
  });

  gsap.set(frameA, {
    autoAlpha: 1
  });

  /* =========================================
     BOUNCE SEQUENCE
  ========================================= */

  function showFrame(tl, frame, position) {

    if (currentFrame === frame && position === undefined) {
      return;
    }

    tl.set(currentFrame, {
      autoAlpha: 0
    }, position);

    tl.set(frame, {
      autoAlpha: 1
    }, position);

    currentFrame = frame;
  }

  function addBounceMotion(tl, frame, syncFrameSwitch) {
    if (!syncFrameSwitch) {
      showFrame(tl, frame);
    }

    tl.to({}, {
      duration: timing.hold
    });

    tl.to(motionLayers, {
      y: 0,
      scaleX: squish.squashScaleX,
      scaleY: squish.squashScaleY,
      duration: timing.squash,
      ease: 'power1.inOut'
    });

    const switchStart = tl.duration();

    if (syncFrameSwitch) {
      showFrame(tl, frame, switchStart);
    }

    tl.to({}, {
      duration: timing.squashHold
    });

    const liftStart = tl.duration();

    tl.to(motionLayers, {
      y: squish.liftY,
      scaleX: squish.stretchScaleX,
      scaleY: squish.stretchScaleY,
      duration: timing.lift,
      ease: 'sine.out'
    }, liftStart);

    tl.to(motionLayers, {
      y: 0,
      scaleX: 1,
      scaleY: 1,
      duration: timing.settle,
      ease: 'sine.inOut'
    });
  }

  function randomStyleIndex() {

    if (bounceStyles.length < 2) {
      return 0;
    }

    let nextIndex = lastStyleIndex;

    while (nextIndex === lastStyleIndex) {
      nextIndex = Math.floor(
        Math.random() * bounceStyles.length
      );
    }

    lastStyleIndex = nextIndex;

    return nextIndex;
  }

  function createBounceSequence() {

    const styleIndex =
      randomStyleIndex();

    const style =
      bounceStyles[styleIndex];

    const styleLoops = Math.floor(
      gsap.utils.random(
        timing.minStyleLoops,
        timing.maxStyleLoops + 1
      )
    );

    const tl = gsap.timeline({
      paused: true,
      onComplete: function () {
        if (!running) return;

        bounceTimeline = createBounceSequence();
        bounceTimeline.play(0);
      }
    });

    for (let index = 0; index < styleLoops; index++) {
      addBounceMotion(
        tl,
        style.frame,
        index === 0 && currentFrame !== style.frame
      );

      tl.to({}, {
        duration: gsap.utils.random(
          timing.pauseMin,
          timing.pauseMax
        )
      });
    }

    return tl;
  }

  /* =========================================
     ROCKING LAYER
  ========================================= */

  function rockLayer() {

    if (!running) return;

    rockTween = gsap.to(motionLayers, {
      rotation: gsap.utils.random(
        -rock.rotation,
        rock.rotation
      ),

      duration: gsap.utils.random(
        rock.minDuration,
        rock.maxDuration
      ),

      ease: 'sine.inOut',

      onComplete: rockLayer
    });
  }


  /* =========================================
     START
  ========================================= */

  function startAnimation() {

    if (running) return;

    running = true;

    if (bounceTimeline) {
      bounceTimeline.kill();
    }

    currentFrame = frameA;

    bounceTimeline = createBounceSequence();
    bounceTimeline.play(0);

    rockLayer();
  }


  /* =========================================
     STOP
  ========================================= */

  function stopAnimation() {

    if (!running) return;

    running = false;

    if (bounceTimeline) {
      bounceTimeline.kill();
      bounceTimeline = null;
    }

    if (rockTween) {
      rockTween.kill();
      rockTween = null;
    }

    gsap.set(frames, {
      autoAlpha: 0
    });

    gsap.set(motionLayers, {
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    });

    gsap.set(frameA, {
      autoAlpha: 1
    });

    currentFrame = frameA;
  }


  /* =========================================
     WATCH ACTIVE SLIDE
  ========================================= */

  function checkState() {

    const isActiveIllustration =
      illo.classList.contains('is-active');

    const isActiveSlide =
      matchingSlide &&
      matchingSlide.getAttribute('aria-hidden') !== 'true';

    if (isActiveIllustration || isActiveSlide) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }

  const observer = new MutationObserver(checkState);

  observer.observe(illo, {
    attributes: true,
    attributeFilter: ['class']
  });

  if (matchingSlide) {
    observer.observe(matchingSlide, {
      attributes: true,
      attributeFilter: ['aria-hidden']
    });
  }

  requestAnimationFrame(checkState);

    },
    { once: true }
  );

});

</script>

<script>

/* animation wine slide 5 */

window.Webflow = window.Webflow || [];

window.Webflow.push(function () {

  const illo = document.querySelector(
    '.products__illo.illo-slide-5'
  );

  if (!illo) return;

  window.addEventListener(
    'bento:products-illos-ready',
    function () {

  const slider = document.querySelector('.products-slider');
  const slides = slider ?
    Array.from(slider.querySelectorAll('.w-slide')) :
    [];
  const matchingSlide = slides[4];

  const clouds = illo.querySelector('.illo-img.img-a');
  const topCharacter = illo.querySelector('.illo-img.img-b');
  const bottomCharacter = illo.querySelector('.illo-img.img-c');

  if (!clouds || !topCharacter || !bottomCharacter) return;


  /* =========================================
     FLOAT SETTINGS
  ========================================= */

  const layers = [
    {
      el: clouds,
      x: 5,
      y: 8,
      rotation: 0.35,
      scale: 1.004,
      squashX: 1,
      squashY: 1,
      duration: 6.8,
      delay: 0,
      ease: 'sine.inOut',
      origin: '50% 50%'
    },
    {
      el: topCharacter,
      x: 8,
      y: 14,
      rotation: 1.2,
      scale: 1.018,
      squashX: 1.012,
      squashY: 0.988,
      duration: 4.7,
      delay: 0.35,
      ease: 'sine.inOut',
      origin: '50% 58%'
    },
    {
      el: bottomCharacter,
      x: 6,
      y: 11,
      rotation: -0.9,
      scale: 1.024,
      squashX: 1.014,
      squashY: 0.986,
      duration: 5.4,
      delay: 0.8,
      ease: 'sine.inOut',
      origin: '50% 62%'
    }
  ];

  let timelines = [];
  let running = false;


  /* =========================================
     SETUP
  ========================================= */

  gsap.set(layers.map(function (layer) {
    return layer.el;
  }), {
    autoAlpha: 1,
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    force3D: true
  });

  layers.forEach(function (layer) {
    gsap.set(layer.el, {
      transformOrigin: layer.origin
    });
  });


  /* =========================================
     FLOAT SEQUENCE
  ========================================= */

  function createFloatTimeline(layer) {

    const tl = gsap.timeline({
      repeat: -1,
      delay: layer.delay
    });

    tl.to(layer.el, {
      x: layer.x,
      y: -layer.y,
      rotation: layer.rotation,
      scaleX: layer.scale * layer.squashX,
      scaleY: layer.scale * layer.squashY,
      duration: layer.duration * 0.5,
      ease: layer.ease
    });

    tl.to(layer.el, {
      x: -layer.x * 0.65,
      y: layer.y * 0.36,
      rotation: -layer.rotation * 0.7,
      scaleX: 1,
      scaleY: 1,
      duration: layer.duration * 0.5,
      ease: layer.ease
    });

    return tl;
  }


  /* =========================================
     START
  ========================================= */

  function startAnimation() {

    if (running) return;

    running = true;

    timelines = layers.map(createFloatTimeline);
  }


  /* =========================================
     STOP
  ========================================= */

  function stopAnimation() {

    if (!running) return;

    running = false;

    timelines.forEach(function (timeline) {
      timeline.kill();
    });

    timelines = [];

    gsap.set(layers.map(function (layer) {
      return layer.el;
    }), {
      autoAlpha: 1,
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    });
  }


  /* =========================================
     WATCH ACTIVE SLIDE
  ========================================= */

  function checkState() {

    const isActiveIllustration =
      illo.classList.contains('is-active');

    const isActiveSlide =
      matchingSlide &&
      matchingSlide.getAttribute('aria-hidden') !== 'true';

    if (isActiveIllustration || isActiveSlide) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }

  const observer = new MutationObserver(checkState);

  observer.observe(illo, {
    attributes: true,
    attributeFilter: ['class']
  });

  if (matchingSlide) {
    observer.observe(matchingSlide, {
      attributes: true,
      attributeFilter: ['aria-hidden']
    });
  }

  requestAnimationFrame(checkState);

    },
    { once: true }
  );

});

</script>

<script>

/* Delay Jotform Instagram widget until page has loaded */

window.addEventListener("load", function () {

  const widgetId =
    "JFWebsiteWidget-01a0132c79c8700086754d96f64e1b18acb2";

  const widget =
    document.getElementById(widgetId);

  if (!widget) return;

  function loadJotformInstagram() {

    if (
      document.querySelector(
        'script[data-jotform-instagram-widget]'
      )
    ) {
      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://www.jotform.com/website-widgets/embed/01a0132c79c8700086754d96f64e1b18acb2";

    script.async = true;

    script.setAttribute(
      "data-jotform-instagram-widget",
      "true"
    );

    document.body.appendChild(script);
  }

  if ("requestIdleCallback" in window) {

    requestIdleCallback(
      loadJotformInstagram,
      { timeout: 1500 }
    );

  } else {

    setTimeout(
      loadJotformInstagram,
      500
    );
  }

});

/* Jotform IG carousel control - start */
  
document.addEventListener("DOMContentLoaded", function () {

  const widgetId =
    "JFWebsiteWidget-01a0132c79c8700086754d96f64e1b18acb2";

  // This page does not contain the Instagram widget
  if (!document.getElementById(widgetId)) return;

  const autoAdvanceDelay = 5000;
  const transitionTime = 650;

  function initInstagramSlider() {

    const root = document.getElementById(widgetId);
    if (!root) return false;

    const firstCard =
      root.querySelector(".social-feed-card");

    if (!firstCard) return false;

    const slider = firstCard.parentElement;

    const cards = Array.from(
      slider.querySelectorAll(".social-feed-card")
    );

    if (cards.length < 2) return false;

    if (slider.dataset.customLoopInitialized === "true") {
      return true;
    }

    slider.dataset.customLoopInitialized = "true";

    let rotation = 0;
    let autoTimer;
    let animationTimer;
    let isAnimating = false;

    let modalWasOpen = false;

    /*
     * Carousel position lock
     */
    let feedLocked = false;
    let lockedFeedPosition = 0;
    let lockFrame = null;
    let savedScrollBehavior = "";
    let savedScrollSnapType = "";


    /*
     * --------------------------------------------------
     * ARROW IDENTIFICATION
     * --------------------------------------------------
     */

    function arrowDirection(control) {

      const label = [
        control.getAttribute("aria-label"),
        control.getAttribute("title"),
        control.textContent
      ]
        .filter(Boolean)
        .join(" ")
        .trim()
        .toLowerCase();

      if (
        label.includes("next") ||
        label.includes("right") ||
        label === ">" ||
        label === "›"
      ) {
        return 1;
      }

      if (
        label.includes("previous") ||
        label.includes("prev") ||
        label.includes("left") ||
        label === "<" ||
        label === "‹"
      ) {
        return -1;
      }

      return 0;
    }


    /*
     * Only the OUTER feed arrows.
     */
    const mainArrows = Array.from(
      root.querySelectorAll(
        'button, [role="button"]'
      )
    ).filter(function (control) {

      if (!arrowDirection(control)) {
        return false;
      }

      if (slider.contains(control)) {
        return false;
      }

      if (
        control.closest(
          '[role="dialog"], [aria-modal="true"]'
        )
      ) {
        return false;
      }

      return true;
    });


    /*
     * --------------------------------------------------
     * CONTINUOUS LOOP
     * --------------------------------------------------
     */

    function applyOrder() {

      const total = cards.length;

      cards.forEach(function (card, index) {

        const order =
          (index - rotation + total) % total;

        card.style.order = order;
      });
    }


    function visualCards() {

      return cards
        .slice()
        .sort(function (a, b) {
          return a.offsetLeft - b.offsetLeft;
        });
    }


    function cardPitch() {

      const ordered = visualCards();

      if (ordered.length < 2) return 0;

      return (
        ordered[1].offsetLeft -
        ordered[0].offsetLeft
      );
    }


    function instantScroll(left) {

      const oldBehavior =
        slider.style.scrollBehavior;

      const oldSnap =
        slider.style.scrollSnapType;

      slider.style.scrollBehavior = "auto";
      slider.style.scrollSnapType = "none";

      slider.scrollLeft = left;

      requestAnimationFrame(function () {

        slider.style.scrollBehavior =
          oldBehavior;

        slider.style.scrollSnapType =
          oldSnap;
      });
    }


    /*
     * --------------------------------------------------
     * HARD POSITION LOCK
     * --------------------------------------------------
     *
     * Used while a Jotform modal is open, and briefly
     * when internal post-image arrows are clicked.
     *
     * Any attempt by Jotform to scroll the outer feed
     * is corrected before the browser paints the frame.
     */

    function lockFeedPosition() {

      if (feedLocked) return;

      lockedFeedPosition =
        slider.scrollLeft;

      feedLocked = true;

      savedScrollBehavior =
        slider.style.scrollBehavior;

      savedScrollSnapType =
        slider.style.scrollSnapType;

      slider.style.scrollBehavior = "auto";
      slider.style.scrollSnapType = "none";


      function enforceLock() {

        if (!feedLocked) return;

        if (
          Math.abs(
            slider.scrollLeft -
            lockedFeedPosition
          ) > 0.5
        ) {
          slider.scrollLeft =
            lockedFeedPosition;
        }

        lockFrame =
          requestAnimationFrame(enforceLock);
      }

      enforceLock();
    }


    function unlockFeedPosition() {

      if (!feedLocked) return;

      /*
       * Make certain the exact original position is
       * restored before normal scrolling is re-enabled.
       */
      slider.scrollLeft =
        lockedFeedPosition;

      feedLocked = false;

      if (lockFrame) {
        cancelAnimationFrame(lockFrame);
        lockFrame = null;
      }

      slider.style.scrollBehavior =
        savedScrollBehavior;

      slider.style.scrollSnapType =
        savedScrollSnapType;
    }


    /*
     * Also catch any scroll initiated between frames.
     */
    slider.addEventListener(
      "scroll",
      function () {

        if (
          feedLocked &&
          Math.abs(
            slider.scrollLeft -
            lockedFeedPosition
          ) > 0.5
        ) {
          slider.scrollLeft =
            lockedFeedPosition;
        }

      },
      { passive: true }
    );


    /*
     * --------------------------------------------------
     * NEXT
     * --------------------------------------------------
     */

    function goNext() {

      if (
        isAnimating ||
        feedLocked
      ) {
        return;
      }

      const pitch = cardPitch();

      if (!pitch) return;

      isAnimating = true;

      slider.scrollTo({
        left: pitch,
        behavior: "smooth"
      });

      clearTimeout(animationTimer);

      animationTimer = setTimeout(function () {

        const oldBehavior =
          slider.style.scrollBehavior;

        const oldSnap =
          slider.style.scrollSnapType;

        slider.style.scrollBehavior = "auto";
        slider.style.scrollSnapType = "none";

        rotation =
          (rotation + 1) % cards.length;

        applyOrder();

        slider.scrollLeft = 0;

        requestAnimationFrame(function () {

          slider.style.scrollBehavior =
            oldBehavior;

          slider.style.scrollSnapType =
            oldSnap;

          isAnimating = false;

          enableMainArrows();
        });

      }, transitionTime);
    }


    /*
     * --------------------------------------------------
     * PREVIOUS
     * --------------------------------------------------
     */

    function goPrevious() {

      if (
        isAnimating ||
        feedLocked
      ) {
        return;
      }

      isAnimating = true;

      const oldBehavior =
        slider.style.scrollBehavior;

      const oldSnap =
        slider.style.scrollSnapType;

      slider.style.scrollBehavior = "auto";
      slider.style.scrollSnapType = "none";

      rotation =
        (rotation - 1 + cards.length) %
        cards.length;

      applyOrder();

      const pitch = cardPitch();

      slider.scrollLeft = pitch;

      requestAnimationFrame(function () {

        slider.style.scrollBehavior =
          oldBehavior;

        slider.style.scrollSnapType =
          oldSnap;

        slider.scrollTo({
          left: 0,
          behavior: "smooth"
        });
      });

      clearTimeout(animationTimer);

      animationTimer = setTimeout(function () {

        instantScroll(0);

        isAnimating = false;

        enableMainArrows();

      }, transitionTime);
    }


    /*
     * --------------------------------------------------
     * MAIN ARROWS
     * --------------------------------------------------
     */

    function enableMainArrows() {

      mainArrows.forEach(function (control) {

        control.removeAttribute("disabled");

        control.setAttribute(
          "aria-disabled",
          "false"
        );

        control.style.pointerEvents = "auto";
      });
    }


    /*
     * --------------------------------------------------
     * MODAL
     * --------------------------------------------------
     */

    function modalIsOpen() {

      const dialogs = Array.from(
        document.querySelectorAll(
          '[role="dialog"], [aria-modal="true"]'
        )
      );

      return dialogs.some(function (dialog) {

        if (
          dialog.getAttribute("aria-hidden") === "true"
        ) {
          return false;
        }

        const style =
          window.getComputedStyle(dialog);

        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          dialog.getClientRects().length > 0
        );
      });
    }


    /*
     * --------------------------------------------------
     * AUTOPLAY
     * --------------------------------------------------
     */

    function stopAutoAdvance() {
      clearTimeout(autoTimer);
    }


    function startAutoAdvance() {

      stopAutoAdvance();

      autoTimer = setTimeout(function run() {

        if (
          modalIsOpen() ||
          feedLocked
        ) {
          startAutoAdvance();
          return;
        }

        if (!isAnimating) {
          goNext();
        }

        startAutoAdvance();

      }, autoAdvanceDelay);
    }


    /*
     * --------------------------------------------------
     * CLICK HANDLING
     * --------------------------------------------------
     */

    document.addEventListener(
      "click",
      function (event) {

        const control = event.target.closest(
          'button, [role="button"]'
        );


        /*
         * OUTER CAROUSEL ARROWS
         */
        if (
          control &&
          mainArrows.includes(control)
        ) {

          const direction =
            arrowDirection(control);

          if (!direction) return;

          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          if (direction === 1) {
            goNext();
          } else {
            goPrevious();
          }

          startAutoAdvance();

          return;
        }


        /*
         * INNER MULTI-IMAGE ARROWS
         *
         * Temporarily lock the OUTER carousel while
         * leaving Jotform free to change the image.
         */
        if (
          control &&
          slider.contains(control) &&
          control.closest(".social-feed-card") &&
          arrowDirection(control)
        ) {

          stopAutoAdvance();
          lockFeedPosition();

          /*
           * Jotform handles its own image transition.
           */
          setTimeout(function () {

            if (!modalIsOpen()) {
              unlockFeedPosition();
              startAutoAdvance();
            }

          }, 450);

          return;
        }


        /*
         * POST CLICK
         *
         * Lock immediately, BEFORE Jotform's own
         * click handler gets a chance to centre
         * or scroll the post.
         */
        if (
          slider.contains(event.target) &&
          event.target.closest(".social-feed-card")
        ) {

          stopAutoAdvance();

          lockFeedPosition();

          /*
           * If for some reason the click doesn't
           * actually open a modal, release the lock.
           */
          setTimeout(function () {

            if (!modalIsOpen()) {
              unlockFeedPosition();
              startAutoAdvance();
            }

          }, 800);

          return;
        }


        /*
         * Interaction inside an open modal.
         */
        if (
          event.target.closest(
            '[role="dialog"], [aria-modal="true"]'
          )
        ) {

          stopAutoAdvance();

          return;
        }

      },
      true
    );


    /*
     * --------------------------------------------------
     * MODAL STATE
     * --------------------------------------------------
     */

    setInterval(function () {

      const modalOpen =
        modalIsOpen();


      /*
       * Modal just opened.
       *
       * Feed is already locked from the original
       * card click, so leave it locked.
       */
      if (
        modalOpen &&
        !modalWasOpen
      ) {

        stopAutoAdvance();

        if (!feedLocked) {
          lockFeedPosition();
        }
      }


      /*
       * Modal just closed.
       *
       * Keep the lock briefly while Jotform returns
       * focus to the original card.
       */
      if (
        !modalOpen &&
        modalWasOpen
      ) {

        setTimeout(function () {

          unlockFeedPosition();

          startAutoAdvance();

        }, 350);
      }

      modalWasOpen = modalOpen;

    }, 100);


    /*
     * --------------------------------------------------
     * POINTER / TOUCH INTERACTION
     * --------------------------------------------------
     *
     * On iPhone a touch that becomes a page scroll can
     * fire pointercancel instead of pointerup.
     */

    function resumeAutoAdvance() {

      setTimeout(function () {

        if (
          !modalIsOpen() &&
          !feedLocked
        ) {
          startAutoAdvance();
        }

      }, 100);
    }


    slider.addEventListener(
      "pointerdown",
      function () {
        stopAutoAdvance();
      }
    );


    slider.addEventListener(
      "pointerup",
      resumeAutoAdvance
    );


    /*
     * Important for Safari / iPhone:
     * restart autoplay if the touch gesture is cancelled.
     */
    slider.addEventListener(
      "pointercancel",
      resumeAutoAdvance
    );


    /*
     * --------------------------------------------------
     * SAFARI PAGE VISIBILITY
     * --------------------------------------------------
     *
     * Restart the timer if Safari has suspended the page
     * and the user returns to it.
     */

    document.addEventListener(
      "visibilitychange",
      function () {

        if (document.hidden) {

          stopAutoAdvance();

          return;
        }

        if (
          !modalIsOpen() &&
          !feedLocked
        ) {
          startAutoAdvance();
        }
      }
    );


    /*
     * --------------------------------------------------
     * RESIZE
     * --------------------------------------------------
     */

    let resizeTimer;

    window.addEventListener(
      "resize",
      function () {

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(
          function () {

            if (
              !isAnimating &&
              !feedLocked
            ) {
              instantScroll(0);
            }

          },
          150
        );
      }
    );


    /*
     * --------------------------------------------------
     * INITIALISE
     * --------------------------------------------------
     */

    applyOrder();
    instantScroll(0);

    enableMainArrows();

    setInterval(
      enableMainArrows,
      1000
    );

    startAutoAdvance();

    return true;
  }


  /*
   * Wait for Jotform to load.
   */
  const waitForWidget =
    setInterval(function () {

      if (initInstagramSlider()) {
        clearInterval(waitForWidget);
      }

    }, 300);

});

/* Jotform IG carousel control - end */
  
</script>

<script>

/* illustration sliders - start */

window.Webflow = window.Webflow || [];

window.Webflow.push(function () {
  const slider = document.querySelector('.products-slider');

  if (!slider) return;

  const mask = slider.querySelector('.w-slider-mask');
  const slides = Array.from(slider.querySelectorAll('.w-slide'));
  const illustrations = Array.from(
    document.querySelectorAll('.products-illos__wrap .products__illo')
  );

  if (!mask || !slides.length) return;

  function getActiveSlide() {
    return slides.find(
      slide => slide.getAttribute('aria-hidden') !== 'true'
    );
  }

  function updateIllustration(activeSlide) {
    const activeIndex = slides.indexOf(activeSlide);

    illustrations.forEach((illustration, index) => {
      illustration.classList.toggle(
        'is-active',
        index === activeIndex
      );
    });
  }

  function updateSlider() {
    const activeSlide = getActiveSlide();

    if (!activeSlide) return;

    // Show illustration corresponding to current slide
    updateIllustration(activeSlide);

    // Auto-height only on mobile
    if (window.innerWidth > 767) {
      mask.style.height = '';
      slider.style.height = '';
      return;
    }

    const content = activeSlide.querySelector(
      '.products-slider__content-wrap'
    );

    if (!content) return;

    const height = Math.ceil(
      content.getBoundingClientRect().height
    );

    mask.style.height = height + 'px';
    slider.style.height = height + 'px';
  }

  function openSlideFromURL() {
    const params = new URLSearchParams(window.location.search);
    const requestedSlide = parseInt(params.get('slide'), 10);

    if (
      !requestedSlide ||
      requestedSlide < 1 ||
      requestedSlide > slides.length
    ) {
      return false;
    }

    const dots = slider.querySelectorAll('.w-slider-dot');
    const targetDot = dots[requestedSlide - 1];

    if (!targetDot) return false;

    targetDot.click();

    return true;
  }

  // Watch Webflow changing active slides
  const observer = new MutationObserver(function () {
    requestAnimationFrame(updateSlider);
  });

  slides.forEach(slide => {
    observer.observe(slide, {
      attributes: true,
      attributeFilter: ['aria-hidden']
    });
  });

  // Recalculate if slide content changes size
  const resizeObserver = new ResizeObserver(function () {
    requestAnimationFrame(updateSlider);
  });

  slides.forEach(slide => {
    const content = slide.querySelector(
      '.products-slider__content-wrap'
    );

    if (content) {
      resizeObserver.observe(content);
    }
  });

  window.addEventListener('resize', updateSlider);

  // Open requested slide from URL, then initialise
  requestAnimationFrame(function () {
    openSlideFromURL();

    requestAnimationFrame(function () {
      updateSlider();

      window.dispatchEvent(
        new CustomEvent('bento:products-illos-ready')
      );
    });
  });
});

/* illustration sliders - end */

</script>

<script>

/* animation wine slide 1 */

window.Webflow = window.Webflow || [];

window.Webflow.push(function () {

  const illo = document.querySelector(
    '.products__illo.illo-slide-1'
  );

  if (!illo) return;

  const frameA = illo.querySelector('.illo-img.img-a');
  const frameB = illo.querySelector('.illo-img.img-b');
  const frameC = illo.querySelector('.illo-img.img-c');
  const frameD = illo.querySelector('.illo-img.img-d');
  const floatE = illo.querySelector('.illo-img.img-e.is-top');

  if (!frameA || !frameB || !frameC || !frameD || !floatE) return;


  /* =========================================
     TIMING SETTINGS
  ========================================= */

  const timing = {
    a: 0.2,
    b: 0.2,
    c: 0.2,
    dMin: 0.4,
    dMax: 1.5
  };

  /* =========================================
     FLOATING LAYER SWELL SETTINGS
  ========================================= */

  const floating = {
    kickX: 3,
    kickY: 1,
    kickRotation: 1.0,
    kickDurationRatio: 0.92
  };


  /* =========================================
     SETUP
  ========================================= */

  const frames = [
    frameA,
    frameB,
    frameC,
    frameD
  ];

  let sequenceTimeline = null;
  let kickTween = null;
  let running = false;


  gsap.set(frames, {
    autoAlpha: 0
  });

  gsap.set(frameA, {
    autoAlpha: 1
  });

  gsap.set(floatE, {
    autoAlpha: 1,
    x: 0,
    y: 0,
    rotation: 0,
    transformOrigin: '50% 50%'
  });


  /* =========================================
     FRAME SEQUENCE
  ========================================= */

  function createSequence() {

    const dDuration = gsap.utils.random(
      timing.dMin,
      timing.dMax
    );

    const cycleDuration =
      timing.a +
      timing.b +
      timing.c +
      dDuration;

    const tl = gsap.timeline({
      paused: true,
      onComplete: function () {
        if (!running) return;

        sequenceTimeline = createSequence();
        sequenceTimeline.play(0);
      }
    });

    tl.call(function () {
      kickFloatLayer(
        cycleDuration * floating.kickDurationRatio
      );
    });

    // A
    tl.set(frames, {
      autoAlpha: 0
    });

    tl.set(frameA, {
      autoAlpha: 1
    });

    tl.to({}, {
      duration: timing.a
    });


    // B
    tl.set(frameA, {
      autoAlpha: 0
    });

    tl.set(frameB, {
      autoAlpha: 1
    });

    tl.to({}, {
      duration: timing.b
    });


    // C
    tl.set(frameB, {
      autoAlpha: 0
    });

    tl.set(frameC, {
      autoAlpha: 1
    });

    tl.to({}, {
      duration: timing.c
    });


    // D
    tl.set(frameC, {
      autoAlpha: 0
    });

    tl.set(frameD, {
      autoAlpha: 1
    });

    tl.to({}, {
      duration: dDuration
    });


    return tl;
  }


  /* =========================================
     FLOATING LAYER SWELL
  ========================================= */

  function kickFloatLayer(duration) {

    if (!running) return;

    if (kickTween) {
      kickTween.kill();
    }

    kickTween = gsap.timeline({
      onComplete: function () {
        kickTween = null;
      }
    });

    kickTween.to(floatE, {
      x: gsap.utils.random(
        -floating.kickX,
        floating.kickX
      ),

      y: -floating.kickY,

      rotation: gsap.utils.random(
        -floating.kickRotation,
        floating.kickRotation
      ),

      duration: duration * 0.35,
      ease: 'power1.inOut'
    });

    kickTween.to(floatE, {
      x: 0,
      y: 0,
      rotation: 0,
      duration: duration * 0.65,
      ease: 'sine.inOut'
    });
  }


  /* =========================================
     START
  ========================================= */

  function startAnimation() {

    if (running) return;

    running = true;

    if (sequenceTimeline) {
      sequenceTimeline.kill();
    }

    sequenceTimeline = createSequence();
    sequenceTimeline.play(0);
  }


  /* =========================================
     STOP
  ========================================= */

  function stopAnimation() {

    if (!running) return;

    running = false;

    if (sequenceTimeline) {
      sequenceTimeline.kill();
      sequenceTimeline = null;
    }

    if (kickTween) {
      kickTween.kill();
      kickTween = null;
    }

    // Reset sequence to A
    gsap.set(frames, {
      autoAlpha: 0
    });

    gsap.set(frameA, {
      autoAlpha: 1
    });

    // Reset floating layer
    gsap.set(floatE, {
      x: 0,
      y: 0,
      rotation: 0
    });
  }


  /* =========================================
     WATCH ACTIVE SLIDE
  ========================================= */

  function checkState() {

    if (illo.classList.contains('is-active')) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }

  const observer = new MutationObserver(checkState);

  observer.observe(illo, {
    attributes: true,
    attributeFilter: ['class']
  });

  checkState();

});

</script>
