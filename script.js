// Isha's Celestial Journey

document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // --- CONFIG, STATE & CONSTANTS ---
    // =================================================================

    const CONSTANTS = {
        PARTICLE_COUNT_DESKTOP: 1200,
        PARTICLE_COUNT_MOBILE: 500,
        NAVIGATION_COOLDOWN_MS: 500,
        SWIPE_THRESHOLD_PX: 40,
        RESIZE_DEBOUNCE_MS: 200,
        IMAGE_LOAD_TIMEOUT_MS: 10000,
    };

    const state = {
        width: 0,
        height: 0,
        currentScene: 0,
        isAnimating: false,
        scenes: [],
        imagePositions: [],
        camera: { x: 0, y: 0, zoom: 1 },
        particles: [],
        images: [],
        lastNavigationTime: 0,
        touchStartY: 0,
    };

    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');

    const imageSources = ['devotion.png', 'compassion.jpg', 'wanderlust.png'];
    const baseScenes = [
        { text: '#scene1-text' },
        { text: '#scene2-text-1', imgIndex: 0 },
        { text: '#scene2-text-2', imgIndex: 1 },
        { text: '#scene2-text-3', imgIndex: 2 },
        { isFinale: true }
    ];
    const sceneConfig = {
        landscape: {
            sceneDetails: [
                { zoom: 1, x: 0, y: 0 }, { zoom: 2.5, x: -0.8, y: -0.3 },
                { zoom: 2.5, x: 0.8, y: 0 }, { zoom: 2.5, x: 0, y: 1.2 }, {}
            ],
            imagePositions: [
                { x: -0.8, y: -0.3, scale: 0.0005, alpha: 0 },
                { x: 0.8, y: 0, scale: 0.0005, alpha: 0 },
                { x: 0, y: 1.2, scale: 0.0005, alpha: 0 },
            ]
        },
        portrait: {
            sceneDetails: [
                { zoom: 1, x: 0, y: 0 }, { zoom: 2.8, x: 0, y: -0.5 },
                { zoom: 2.8, x: 0, y: 0.5 }, { zoom: 2.8, x: 0, y: 1.5 }, {}
            ],
            imagePositions: [
                { x: 0, y: -0.5, scale: 0.0006, alpha: 0 },
                { x: 0, y: 0.5, scale: 0.0006, alpha: 0 },
                { x: 0, y: 1.5, scale: 0.0006, alpha: 0 },
            ]
        }
    };

    // =================================================================
    // --- HELPERS ---
    // =================================================================

    /**
     * Generates a random number between a min and max value.
     * @param {number} min The minimum value.
     * @param {number} max The maximum value.
     * @returns {number} A random number.
     */
    function random(min, max) { return Math.random() * (max - min) + min; }

    // =================================================================
    // --- CORE LOGIC ---
    // =================================================================

    /**
     * A class representing a single star particle on the canvas.
     */
    class Particle {
        constructor(x, y) {
            this.x = x || random(-state.width, state.width);
            this.y = y || random(-state.height, state.height);
            this.size = random(0.5, 2.5);
            this.color = `rgba(255, 215, 0, ${random(0.3, 1)})`;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * The main animation loop, called on every frame.
     * Renders particles and images based on the current camera state.
     */
    function animate() {
        ctx.clearRect(0, 0, state.width, state.height);
        ctx.save();
        ctx.translate(state.width / 2, state.height / 2);
        ctx.scale(state.camera.zoom, state.camera.zoom);
        ctx.translate(-state.camera.x, -state.camera.y);

        state.particles.forEach(p => p.draw());
        state.images.forEach((img, i) => {
            const pos = state.imagePositions[i];
            if (pos.alpha > 0) {
                const imgWidth = img.width * pos.scale;
                const imgHeight = img.height * pos.scale;
                ctx.globalAlpha = pos.alpha;
                ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
                ctx.shadowBlur = 30 * pos.alpha;
                ctx.drawImage(img, pos.x * state.width - imgWidth / 2, pos.y * state.height - imgHeight / 2, imgWidth, imgHeight);
                ctx.shadowBlur = 0;
            }
        });

        ctx.globalAlpha = 1;
        ctx.restore();
        requestAnimationFrame(animate);
    }

    /**
     * Calculates the coordinates for particles to form the finale text.
     * @returns {Array<{x: number, y: number}>} An array of points.
     */
    function getTextPoints() {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const fontSize = Math.min(state.width * 0.1, 100);
        tempCanvas.width = state.width;
        tempCanvas.height = state.height;

        tempCtx.fillStyle = 'white';
        tempCtx.font = `bold ${fontSize}px "Cormorant Garamond"`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText("Happy Birthday, Isha", state.width / 2, state.height / 2);

        const imageData = tempCtx.getImageData(0, 0, state.width, state.height).data;
        const points = [];
        const density = window.innerWidth > 768 ? 6 : 8;

        for (let y = 0; y < state.height; y += density) {
            for (let x = 0; x < state.width; x += density) {
                if (imageData[((y * state.width + x) * 4) + 3] > 128) {
                    points.push({ x: x - state.width / 2, y: y - state.height / 2 });
                }
            }
        }
        return points;
    }

    /**
     * Initiates the final animation sequence.
     * @param {boolean} [prefersReducedMotion=false] - Whether to use the simpler animation.
     */
    function startFinale(prefersReducedMotion = false) {
        const textPoints = getTextPoints();
        const tl = gsap.timeline({ onComplete: () => state.isAnimating = false });

        let textParticles = state.particles.slice(0, textPoints.length);
        let otherParticles = state.particles.slice(textPoints.length);

        if (prefersReducedMotion) {
            tl.to(state.camera, { zoom: 1, x: 0, y: 0, duration: 0.1 })
              .to('#final-message-card', { opacity: 1, delay: 0.5, duration: 2 });
        } else {
            tl.to(state.camera, { zoom: 1, x: 0, y: 0, duration: 2, ease: 'power2.inOut' })
              .to(otherParticles.map(p => p), {
                  x: () => random(-state.width, state.width), y: () => random(-state.height, state.height),
                  duration: 2.5, ease: 'power3.inOut', stagger: { amount: 1 }
              }, "-=1.5")
              .to(textParticles.map(p => p), {
                  x: i => textPoints[i].x, y: i => textPoints[i].y,
                  duration: 3, ease: 'power3.inOut', stagger: { amount: 2 }
              }, "-=2")
              .to('#final-message-card', { opacity: 1, delay: 2, duration: 2 });
        }
    }

    /**
     * Navigates the camera and content to a specific scene index.
     * @param {number} sceneIndex - The index of the scene to navigate to.
     */
    function navigateToScene(sceneIndex) {
        if (state.isAnimating || sceneIndex < 0 || sceneIndex >= state.scenes.length) return;
        state.isAnimating = true;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const oldScene = state.scenes[state.currentScene];
        if (oldScene) {
            if (oldScene.text) {
                gsap.to(oldScene.text, { opacity: 0, duration: 0.8, ease: "power1.in", onComplete: () => gsap.set(oldScene.text, { display: 'none' }) });
            }
            if (oldScene.imgIndex !== undefined) {
                gsap.to(state.imagePositions[oldScene.imgIndex], { alpha: 0, duration: 1, ease: 'power1.in' });
            }
        }

        state.currentScene = sceneIndex;
        const targetScene = state.scenes[state.currentScene];

        if (targetScene.isFinale) {
            document.querySelectorAll('.memory-text').forEach(el => gsap.to(el, { opacity: 0, duration: 0.5, onComplete: () => el.style.display = 'none' }));
            startFinale(prefersReducedMotion);
            return;
        }

        const cameraAnimation = prefersReducedMotion
            ? { zoom: 1.2, x: 0, y: 0, duration: 0.5, ease: "power1.inOut" }
            : { zoom: targetScene.zoom, x: targetScene.x * state.width, y: targetScene.y * state.height, duration: 2.5, ease: "power2.inOut" };

        gsap.to(state.camera, { ...cameraAnimation, onComplete: () => state.isAnimating = false });

        const fadeInDelay = prefersReducedMotion ? 0.5 : 1.5;

        if (targetScene.imgIndex !== undefined) {
            gsap.to(state.imagePositions[targetScene.imgIndex], { alpha: 1, duration: 1.5, delay: fadeInDelay - 0.5, ease: 'power1.out' });
        }

        if (targetScene.text) {
            gsap.set(targetScene.text, { display: 'block', opacity: 0 });
            gsap.to(targetScene.text, { opacity: 1, duration: 1.5, delay: fadeInDelay, ease: "power1.out" });
        } else if (prefersReducedMotion) {
            state.isAnimating = false;
        }
    }

    /**
     * Sets up all the global event listeners for user interaction.
     */
    function setupEventListeners() {
        function handleNavigation(direction) {
            const now = Date.now();
            if (now - state.lastNavigationTime < CONSTANTS.NAVIGATION_COOLDOWN_MS) return;
            if (state.isAnimating) return;

            state.lastNavigationTime = now;
            navigateToScene(state.currentScene + direction);
        }

        window.addEventListener('wheel', e => {
            e.preventDefault();
            handleNavigation(e.deltaY > 0 ? 1 : -1);
        }, { passive: false });

        window.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') handleNavigation(1);
            else if (e.key === 'ArrowUp') handleNavigation(-1);
        });

        window.addEventListener('touchstart', e => {
            state.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchend', e => {
            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = state.touchStartY - touchEndY;
            if (deltaY > CONSTANTS.SWIPE_THRESHOLD_PX) handleNavigation(1);
            else if (deltaY < -CONSTANTS.SWIPE_THRESHOLD_PX) handleNavigation(-1);
        });

        window.addEventListener('resize', () => {
            setTimeout(startExperience, CONSTANTS.RESIZE_DEBOUNCE_MS);
        });
    }

    /**
     * Initializes or re-initializes the entire experience.
     * Sets up canvas, particles, and scene configurations.
     */
    function init() {
        state.width = window.innerWidth;
        state.height = window.innerHeight;
        canvas.width = state.width;
        canvas.height = state.height;

        const isPortrait = state.height > state.width;
        const config = isPortrait ? sceneConfig.portrait : sceneConfig.landscape;
        const numParticles = isPortrait ? CONSTANTS.PARTICLE_COUNT_MOBILE : CONSTANTS.PARTICLE_COUNT_DESKTOP;

        state.scenes = baseScenes.map((base, i) => ({ ...base, ...config.sceneDetails[i] }));
        state.imagePositions = JSON.parse(JSON.stringify(config.imagePositions));
        state.camera = { x: 0, y: 0, zoom: 1 };
        state.particles = Array.from({ length: numParticles }, () => new Particle());

        document.querySelectorAll('.scene-text').forEach(el => el.style.opacity = 0);
    }

    /**
     * Preloads all necessary image assets before starting the main experience.
     */
    function loadImages() {
        let loadedCount = 0;
        const totalImages = imageSources.length;
        let experienceStarted = false;

        const loadTimeout = setTimeout(() => {
            if (!experienceStarted) {
                console.warn("Image loading timed out. Starting experience anyway.");
                startExperience();
                experienceStarted = true;
            }
        }, CONSTANTS.IMAGE_LOAD_TIMEOUT_MS);

        if (totalImages === 0) {
            clearTimeout(loadTimeout);
            startExperience();
            return;
        }

        const onImageLoadOrError = () => {
            loadedCount++;
            if (loadedCount === totalImages && !experienceStarted) {
                clearTimeout(loadTimeout);
                startExperience();
                experienceStarted = true;
            }
        };

        imageSources.forEach(src => {
            const img = new Image();
            state.images.push(img);
            img.onload = onImageLoadOrError;
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                onImageLoadOrError();
            };
            img.src = src;
        });
    }

    /**
     * Kicks off the entire application.
     */
    function startExperience() {
        state.isAnimating = false;
        state.currentScene = 0;
        init();

        if (!window.listenersAttached) {
            animate();
            setupEventListeners();
            window.listenersAttached = true;
        }

        navigateToScene(0);
    }

    // --- INITIALIZATION ---
    loadImages();
});
