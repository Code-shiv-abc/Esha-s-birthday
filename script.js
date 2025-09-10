// Isha's Celestial Journey

document.addEventListener('DOMContentLoaded', () => {
    // --- SETUP ---
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let width, height;

    // --- STATE MANAGEMENT ---
    let currentScene = 0;
    let isAnimating = false;
    const scenes = [
        { zoom: 1, x: 0, y: 0, text: '#scene1-text' },
        { zoom: 2.5, x: -0.8, y: -0.3, text: '#scene2-text-1', imgIndex: 0 },
        { zoom: 2.5, x: 0.8, y: 0, text: '#scene2-text-2', imgIndex: 1 },
        { zoom: 2.5, x: 0, y: 1.2, text: '#scene2-text-3', imgIndex: 2 },
        { isFinale: true } // Scene 4 is the finale trigger
    ];
    const camera = { x: 0, y: 0, zoom: 1 };

    // --- PARTICLES ---
    let particles = [];
    const numParticles = window.innerWidth > 768 ? 1200 : 500;

    // --- IMAGES ---
    const images = [];
    const imageSources = ['devotion.png', 'compassion.png', 'wanderlust.png'];
    const imagePositions = [
        { x: -0.8, y: -0.3, scale: 0.0005, alpha: 0 },
        { x: 0.8, y: 0, scale: 0.0005, alpha: 0 },
        { x: 0, y: 1.2, scale: 0.0005, alpha: 0 },
    ];
    let imagesLoaded = 0;

    function loadImages() {
        imageSources.forEach(src => {
            const img = new Image();
            img.src = src;
            images.push(img);
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === imageSources.length) {
                    startExperience();
                }
            };
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

    function startFinale() {
        const textPoints = getTextPoints();
        const tl = gsap.timeline({ onComplete: () => isAnimating = false });

        let textParticles = particles.slice(0, textPoints.length);
        let otherParticles = particles.slice(textPoints.length);

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

    // --- SCENE NAVIGATION ---
    function navigateToScene(sceneIndex) {
        if (isAnimating || sceneIndex < 0 || sceneIndex >= scenes.length) return;
        isAnimating = true;

        const oldScene = scenes[currentScene];
        if (oldScene && oldScene.imgIndex !== undefined) {
             gsap.to(imagePositions[oldScene.imgIndex], { alpha: 0, duration: 1, ease: 'power1.in' });
        }

        currentScene = sceneIndex;
        const targetScene = scenes[currentScene];

        document.querySelectorAll('.scene-text').forEach(el => {
            gsap.to(el, { opacity: 0, duration: 0.8, ease: "power1.in" });
        });

        if (targetScene.isFinale) {
            startFinale();
            return;
        }

        gsap.to(camera, {
            zoom: targetScene.zoom,
            x: targetScene.x * width, y: targetScene.y * height,
            duration: 2.5, ease: "power2.inOut",
        });

        if (targetScene.imgIndex !== undefined) {
            gsap.to(imagePositions[targetScene.imgIndex], { alpha: 1, duration: 1.5, delay: 1, ease: 'power1.out' });
        }

        gsap.to(targetScene.text, {
            opacity: 1, duration: 1.5, delay: 1.5, ease: "power1.out",
            onComplete: () => isAnimating = false
        });
    }

    // --- EVENT LISTENERS & INIT ---
    function setupEventListeners() {
        window.addEventListener('wheel', e => {
            if (isAnimating) return;
            navigateToScene(currentScene + (e.deltaY > 0 ? 1 : -1));
        });
        window.addEventListener('resize', init);
    }

    function init() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        particles = Array.from({ length: numParticles }, () => new Particle());
    }

    function startExperience() {
        init();
        animate();
        setupEventListeners();
        navigateToScene(0);
    }

    function random(min, max) { return Math.random() * (max - min) + min; }

    loadImages();
});
