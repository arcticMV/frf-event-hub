'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    rotation: number;
    rotationSpeed: number;
    color: string;
    shape: 'circle' | 'triangle' | 'square';
    opacity: number;
}

interface ParticleBackgroundProps {
    particleCount?: number;
    interactive?: boolean;
}

export default function ParticleBackground({
    particleCount = 40,
    interactive = true
}: ParticleBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number | undefined>(undefined);
    const theme = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle colors based on theme
        const colors = theme.palette.mode === 'dark'
            ? ['rgba(99, 102, 241, 0.6)', 'rgba(139, 92, 246, 0.6)', 'rgba(236, 72, 153, 0.6)', 'rgba(59, 130, 246, 0.6)']
            : ['rgba(99, 102, 241, 0.4)', 'rgba(139, 92, 246, 0.4)', 'rgba(236, 72, 153, 0.4)', 'rgba(16, 185, 129, 0.4)'];

        // Initialize particles
        const initParticles = () => {
            particlesRef.current = [];
            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 30 + 20,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.02,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    shape: ['circle', 'triangle', 'square'][Math.floor(Math.random() * 3)] as 'circle' | 'triangle' | 'square',
                    opacity: Math.random() * 0.5 + 0.3,
                });
            }
        };
        initParticles();

        // Mouse interaction
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        if (interactive) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        // Draw particle
        const drawParticle = (particle: Particle) => {
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.globalAlpha = particle.opacity;

            ctx.fillStyle = particle.color;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 2;

            const halfSize = particle.size / 2;

            switch (particle.shape) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'triangle':
                    ctx.beginPath();
                    ctx.moveTo(0, -halfSize);
                    ctx.lineTo(halfSize, halfSize);
                    ctx.lineTo(-halfSize, halfSize);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'square':
                    ctx.fillRect(-halfSize, -halfSize, particle.size, particle.size);
                    break;
            }

            ctx.restore();
        };

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((particle) => {
                // Mouse interaction - repel particles
                if (interactive) {
                    const dx = particle.x - mouseRef.current.x;
                    const dy = particle.y - mouseRef.current.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = 150;

                    if (distance < minDistance) {
                        const force = (minDistance - distance) / minDistance;
                        particle.vx += (dx / distance) * force * 0.5;
                        particle.vy += (dy / distance) * force * 0.5;
                    }
                }

                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.rotation += particle.rotationSpeed;

                // Apply friction
                particle.vx *= 0.98;
                particle.vy *= 0.98;

                // Boundary collision with bounce
                if (particle.x < 0 || particle.x > canvas.width) {
                    particle.vx *= -0.8;
                    particle.x = Math.max(0, Math.min(canvas.width, particle.x));
                }
                if (particle.y < 0 || particle.y > canvas.height) {
                    particle.vy *= -0.8;
                    particle.y = Math.max(0, Math.min(canvas.height, particle.y));
                }

                // Gentle floating effect
                particle.vy += Math.sin(Date.now() * 0.001 + particle.x) * 0.01;

                drawParticle(particle);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            animate();
        } else {
            // Draw static particles if reduced motion is preferred
            particlesRef.current.forEach(drawParticle);
        }

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (interactive) {
                window.removeEventListener('mousemove', handleMouseMove);
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [particleCount, interactive, theme.palette.mode]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
            }}
        />
    );
}
