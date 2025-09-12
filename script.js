// Isha's Celestial Journey

document.addEventListener('DOMContentLoaded', () => {
    // --- SETUP ---
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let width, height;

    // --- STATE MANAGEMENT ---
    let currentScene = 0;
    let isAnimating = false;
    let scenes, imagePositions, camera;

    // --- RESPONSIVE CONFIG ---
    // Base scene structure to keep the code DRY
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

    // --- PARTICLES ---
    let particles = [];
    let numParticles;

    // --- IMAGES ---
    const images = [];
    const imageSources = ['devotion.png', 'compassion.jpg', 'wanderlust.png'];

    function loadImages() {
        let loadedCount = 0;
        const totalImages = imageSources.length;
        let experienceStarted = false;

        // Failsafe timeout: start the experience even if images fail to load
        const loadTimeout = setTimeout(() => {
            if (!experienceStarted) {
                console.warn("Image loading timed out. Starting experience anyway.");
                startExperience();
                experienceStarted = true;
            }
        }, 10000); // 10-second timeout

        if (totalImages === 0) {
            startExperience();
            clearTimeout(loadTimeout);
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
            images.push(img); // Pushimg immediately so array order is preserved
            img.onload = onImageLoadOrError;
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                // Still call the handler to not block the experience
                onImageLoadOrError();
            };
            img.src = src;
        });
    }

    // --- PARTICLE CLASS ---
    class Particle {
        constructor(x, y) {
            this.x = x || random(-width, width);
            this.y = y || random(-height, height);
            this.originX = this.x;
            this.originY = this.y;
            this.size = random(0.5, 2.5);
            this.speedX = random(-0.1, 0.1);
            this.speedY = random(-0.1, 0.1);
            this.color = `rgba(255, 215, 0, ${random(0.3, 1)})`;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // --- ANIMATION & RENDERING ---
    function animate() {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y);

        particles.forEach(p => p.draw());

        images.forEach((img, i) => {
            const pos = imagePositions[i];
            if (pos.alpha > 0) {
                const imgWidth = img.width * pos.scale;
                const imgHeight = img.height * pos.scale;

                ctx.globalAlpha = pos.alpha;

                // Add glow effect
                ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
                ctx.shadowBlur = 30 * pos.alpha; // Glow intensity tied to alpha

                ctx.drawImage(img, pos.x * width - imgWidth / 2, pos.y * height - imgHeight / 2, imgWidth, imgHeight);

                // Reset shadow for other elements
                ctx.shadowBlur = 0;
            }
        });
        ctx.globalAlpha = 1;

        ctx.restore();
        requestAnimationFrame(animate);
    }

    // --- FINALE ---
    function getTextPoints() {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const fontSize = Math.min(width * 0.1, 100);
        tempCanvas.width = width;
        tempCanvas.height = height;

        tempCtx.fillStyle = 'white';
        tempCtx.font = `bold ${fontSize}px "Cormorant Garamond"`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText("Happy Birthday, Isha", width / 2, height / 2);

        const imageData = tempCtx.getImageData(0, 0, width, height).data;
        const points = [];
        const density = window.innerWidth > 768 ? 6 : 8;

        for (let y = 0; y < height; y += density) {
            for (let x = 0; x < width; x += density) {
                if (imageData[((y * width + x) * 4) + 3] > 128) {
                    points.push({ x: x - width / 2, y: y - height / 2 });
                }
            }
        }
        return points;
    }

    function startFinale(prefersReducedMotion = false) {
        const textPoints = getTextPoints();
        const tl = gsap.timeline({ onComplete: () => isAnimating = false });

        let textParticles = particles.slice(0, textPoints.length);
        let otherParticles = particles.slice(textPoints.length);

        // Simple fade for reduced motion, complex animation otherwise
        if (prefersReducedMotion) {
            tl.to(camera, { zoom: 1, x: 0, y: 0, duration: 0.1 })
              .to('#final-message-card', { opacity: 1, delay: 0.5, duration: 2 });
        } else {
            tl.to(camera, { zoom: 1, x: 0, y: 0, duration: 2, ease: 'power2.inOut' })
              .to(otherParticles.map(p => p), {
                  x: () => random(-width, width), y: () => random(-height, height),
                  duration: 2.5, ease: 'power3.inOut', stagger: { amount: 1 }
              }, "-=1.5")
              .to(textParticles.map(p => p), {
                  x: i => textPoints[i].x, y: i => textPoints[i].y,
                  duration: 3, ease: 'power3.inOut', stagger: { amount: 2 }
              }, "-=2")
              .to('#final-message-card', { opacity: 1, delay: 2, duration: 2 });
        }
    }

    // --- SCENE NAVIGATION ---
    function navigateToScene(sceneIndex) {
        if (isAnimating || sceneIndex < 0 || sceneIndex >= scenes.length) return;
        isAnimating = true;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // --- Fade out old scene ---
        const oldScene = scenes[currentScene];
        if (oldScene) {
            if (oldScene.text) {
                gsap.to(oldScene.text, {
                    opacity: 0, duration: 0.8, ease: "power1.in",
                    onComplete: () => gsap.set(oldScene.text, { display: 'none' })
                });
            }
            if (oldScene.imgIndex !== undefined) {
                gsap.to(imagePositions[oldScene.imgIndex], { alpha: 0, duration: 1, ease: 'power1.in' });
            }
        }

        currentScene = sceneIndex;
        const targetScene = scenes[currentScene];

        // --- Handle Finale ---
        if (targetScene.isFinale) {
            document.querySelectorAll('.memory-text').forEach(el => {
                gsap.to(el, { opacity: 0, duration: 0.5, onComplete: () => el.style.display = 'none' });
            });
            startFinale(prefersReducedMotion);
            return;
        }

        // --- Animate to new scene ---
        const cameraAnimation = prefersReducedMotion
            ? { zoom: 1.2, x: 0, y: 0, duration: 0.5, ease: "power1.inOut" }
            : { zoom: targetScene.zoom, x: targetScene.x * width, y: targetScene.y * height, duration: 2.5, ease: "power2.inOut" };

        gsap.to(camera, {
            ...cameraAnimation,
            onComplete: () => isAnimating = false
        });

        const fadeInDelay = prefersReducedMotion ? 0.5 : 1.5;

        if (targetScene.imgIndex !== undefined) {
            gsap.to(imagePositions[targetScene.imgIndex], { alpha: 1, duration: 1.5, delay: fadeInDelay - 0.5, ease: 'power1.out' });
        }

        if (targetScene.text) {
            gsap.set(targetScene.text, { display: 'block', opacity: 0 });
            gsap.to(targetScene.text, {
                opacity: 1,
                duration: 1.5,
                delay: fadeInDelay,
                ease: "power1.out"
            });
        } else if (prefersReducedMotion) {
            // If there's no text and we're in reduced motion, we still need to end the animation state
            isAnimating = false;
        }
    }

    // --- EVENT LISTENERS & INIT ---
    function setupEventListeners() {
        // Debounce navigation to prevent rapid firing
        let lastNavigationTime = 0;
        const navigationCooldown = 500; // 0.5 seconds

        function handleNavigation(direction) {
            const now = Date.now();
            if (now - lastNavigationTime < navigationCooldown) return;
            if (isAnimating) return;

            lastNavigationTime = now;
            const nextScene = currentScene + direction;
            navigateToScene(nextScene);
        }

        // Mouse Wheel
        window.addEventListener('wheel', e => {
            e.preventDefault(); // Prevents page scroll
            handleNavigation(e.deltaY > 0 ? 1 : -1);
        }, { passive: false });

        // Keyboard Arrows
        window.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') {
                handleNavigation(1);
            } else if (e.key === 'ArrowUp') {
                handleNavigation(-1);
            }
        });

        // Touch Swipes
        let touchStartY = 0;
        window.addEventListener('touchstart', e => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchend', e => {
            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchStartY - touchEndY;
            const swipeThreshold = 40; // pixels

            if (deltaY > swipeThreshold) {
                handleNavigation(1); // Swipe Up
            } else if (deltaY < -swipeThreshold) {
                handleNavigation(-1); // Swipe Down
            }
        });

        window.addEventListener('resize', () => {
            // A small delay on resize can prevent jarring re-renders
            setTimeout(startExperience, 200);
        });
    }

    function init() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const isPortrait = height > width;
        const config = isPortrait ? sceneConfig.portrait : sceneConfig.landscape;

        // Combine base scene structure with orientation-specific details
        scenes = baseScenes.map((base, i) => ({ ...base, ...config.sceneDetails[i] }));
        imagePositions = JSON.parse(JSON.stringify(config.imagePositions)); // Deep copy to allow mutation
        camera = { x: 0, y: 0, zoom: 1 };
        numParticles = width > 768 ? 1200 : 500;

        particles = Array.from({ length: numParticles }, () => new Particle());

        // Reset text visibility
        document.querySelectorAll('.scene-text').forEach(el => el.style.opacity = 0);
    }

    function startExperience() {
        isAnimating = false;
        currentScene = 0;
        init();

        // Only setup listeners once
        if (!window.listenersAttached) {
            animate();
            setupEventListeners();
        window.listenersAttached = true;
        }

        navigateToScene(0);
    }

    function random(min, max) { return Math.random() * (max - min) + min; }

    loadImages();
});
