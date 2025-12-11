(function (app) {
    app.initParticles = function () {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: -1000, y: -1000, radius: 200 }; // Start off-screen

        // Set canvas size
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Track mouse position
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        window.addEventListener('mouseout', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        // Particle class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.baseSize = Math.random() * 2 + 1.5; // Base size
                this.size = this.baseSize;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = Math.random() * 20 + 5;
                this.baseOpacity = Math.random() * 0.4 + 0.2; // Base opacity
                this.opacity = this.baseOpacity;

                // Floating animation
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
            }

            draw() {
                ctx.fillStyle = `rgba(100, 149, 237, ${this.opacity})`; // Cornflower blue
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();

                // Add glow effect when near mouse
                if (this.size > this.baseSize * 1.5) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = 'rgba(100, 149, 237, 0.5)';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }

            update() {
                // Gentle floating animation
                this.baseX += this.vx;
                this.baseY += this.vy;

                // Bounce off edges
                if (this.baseX < 0 || this.baseX > canvas.width) this.vx *= -1;
                if (this.baseY < 0 || this.baseY > canvas.height) this.vy *= -1;

                // Calculate distance from mouse
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                // Mouse interaction
                if (distance < mouse.radius) {
                    // Repulsion force
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let force = (mouse.radius - distance) / mouse.radius;
                    let directionX = forceDirectionX * force * this.density;
                    let directionY = forceDirectionY * force * this.density;

                    this.x -= directionX;
                    this.y -= directionY;

                    // Grow size and increase opacity based on proximity
                    let proximityFactor = 1 - (distance / mouse.radius);
                    this.size = this.baseSize + (proximityFactor * 8); // Grow up to 8px larger
                    this.opacity = Math.min(this.baseOpacity + (proximityFactor * 0.6), 1); // Increase opacity
                } else {
                    // Return to base position
                    let returnDx = this.x - this.baseX;
                    let returnDy = this.y - this.baseY;
                    this.x -= returnDx / 10;
                    this.y -= returnDy / 10;

                    // Return to base size and opacity
                    this.size += (this.baseSize - this.size) / 10;
                    this.opacity += (this.baseOpacity - this.opacity) / 10;
                }
            }
        }

        // Initialize particles - MORE particles for better coverage
        function init() {
            particles = [];
            let numberOfParticles = (canvas.width * canvas.height) / 6000; // More particles
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        }
        init();

        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }

            requestAnimationFrame(animate);
        }
        animate();

        // Reinitialize on resize
        window.addEventListener('resize', () => {
            resizeCanvas();
            init();
        });
    };
})(window.Homepage = window.Homepage || {});
