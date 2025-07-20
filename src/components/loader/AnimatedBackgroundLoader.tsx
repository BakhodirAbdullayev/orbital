import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface Planet {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  color: string;
  centerX: number;
  centerY: number;
  trail: { x: number; y: number; opacity: number }[];
  originalSpeed: number;
  isHovered: boolean;
  glowIntensity: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  life: number;
}

interface RippleEffect {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  life: number;
}

interface InteractiveParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface MousePosition {
  x: number;
  y: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const rippleEffectsRef = useRef<RippleEffect[]>([]);
  const interactiveParticlesRef = useRef<InteractiveParticle[]>([]);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const mouseRef = useRef<MousePosition>({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);
  const keysRef = useRef<Set<string>>(new Set());

  // RocketLoader ga tegishli state o'zgaruvchilari
  const rocketAngleRef = useRef(0); // Raketaning hozirgi burchagi
  const ROCKET_ANIM_AREA_SIZE = 400; // Raketa animatsiyasi uchun bazaviy o'lcham
  const ROCKET_ORBIT_SPEED = 0.02; // Raketa aylanish tezligi

  const createShootingStar = (fromMouse = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = fromMouse
      ? mouseRef.current.x
      : Math.random() * canvas.width;
    const startY = fromMouse
      ? mouseRef.current.y
      : Math.random() * canvas.height * 0.3;

    shootingStarsRef.current.push({
      x: startX,
      y: startY,
      vx: (Math.random() + 0.5) * (fromMouse ? 4 : 3),
      vy: (Math.random() + 0.5) * (fromMouse ? 3 : 2),
      length: Math.random() * 80 + (fromMouse ? 40 : 20),
      opacity: 1,
      life: 1,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createStars();
      createPlanets();
    };

    const createStars = () => {
      const stars: Star[] = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 8000);

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    };

    const createPlanets = () => {
      const planets: Planet[] = [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const orbits = [
        { radius: 150, speed: 0.005, size: 8, color: "#60a5fa" },
        { radius: 220, speed: -0.003, size: 12, color: "#a78bfa" },
        { radius: 300, speed: 0.002, size: 6, color: "#34d399" },
        { radius: 380, speed: -0.004, size: 10, color: "#fbbf24" },
        { radius: 480, speed: 0.001, size: 14, color: "#f87171" },
      ];

      orbits.forEach((orbit) => {
        const planetCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < planetCount; i++) {
          const speed = orbit.speed + (Math.random() - 0.5) * 0.001;
          planets.push({
            angle: (Math.PI * 2 * i) / planetCount + Math.random() * Math.PI,
            radius: orbit.radius + Math.random() * 40 - 20,
            speed,
            originalSpeed: speed,
            size: orbit.size + Math.random() * 4 - 2,
            color: orbit.color,
            centerX,
            centerY,
            trail: [],
            isHovered: false,
            glowIntensity: 0,
          });
        }
      });
      planetsRef.current = planets;
    };

    const createRipple = (x: number, y: number, maxRadius = 100) => {
      rippleEffectsRef.current.push({
        x,
        y,
        radius: 0,
        maxRadius,
        opacity: 1,
        life: 1,
      });
    };

    const createInteractiveParticles = (x: number, y: number, count = 10) => {
      const colors = ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24", "#f87171"];

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = Math.random() * 3 + 1;

        interactiveParticlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1,
          maxLife: 1,
        });
      }
    };

    const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      planetsRef.current.forEach((planet) => {
        const x = planet.centerX + Math.cos(planet.angle) * planet.radius;
        const y = planet.centerY + Math.sin(planet.angle) * planet.radius;
        const distance = getDistance(
          mouseRef.current.x,
          mouseRef.current.y,
          x,
          y
        );

        planet.isHovered = distance < planet.size * 3;
        if (planet.isHovered) {
          planet.glowIntensity = Math.min(planet.glowIntensity + 0.1, 1);
        } else {
          planet.glowIntensity = Math.max(planet.glowIntensity - 0.05, 0);
        }
      });

      createInteractiveParticles(mouseRef.current.x, mouseRef.current.y, 3);
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDownRef.current = true;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      createRipple(x, y, 150);
      createInteractiveParticles(x, y, 15);
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      createRipple(x, y, 200);
      createInteractiveParticles(x, y, 20);

      for (let i = 0; i < 3; i++) {
        setTimeout(() => createShootingStar(true), i * 100);
      }
    };

    const drawNebula = () => {
      const gradients = [
        {
          x1: 0,
          y1: 0,
          x2: canvas.width,
          y2: canvas.height,
          colors: [
            { stop: 0, color: "rgba(59, 130, 246, 0.1)" },
            { stop: 0.3, color: "rgba(139, 92, 246, 0.05)" },
            { stop: 0.7, color: "rgba(236, 72, 153, 0.08)" },
            { stop: 1, color: "rgba(59, 130, 246, 0.1)" },
          ],
        },
        {
          x1: canvas.width,
          y1: 0,
          x2: 0,
          y2: canvas.height,
          colors: [
            { stop: 0, color: "rgba(139, 92, 246, 0.08)" },
            { stop: 0.5, color: "rgba(59, 130, 246, 0.03)" },
            { stop: 1, color: "rgba(34, 197, 94, 0.06)" },
          ],
        },
      ];

      gradients.forEach((gradientConfig) => {
        const gradient = ctx.createLinearGradient(
          gradientConfig.x1,
          gradientConfig.y1,
          gradientConfig.x2,
          gradientConfig.y2
        );
        gradientConfig.colors.forEach((color) => {
          gradient.addColorStop(color.stop, color.color);
        });
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
    };

    const drawStars = () => {
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(
          timeRef.current * star.twinkleSpeed + star.twinkleOffset
        );
        let currentOpacity = star.opacity + twinkle * 0.3;

        const distance = getDistance(
          mouseRef.current.x,
          mouseRef.current.y,
          star.x,
          star.y
        );
        if (distance < 100) {
          currentOpacity += (1 - distance / 100) * 0.5;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, currentOpacity)})`;
        ctx.fill();

        if (currentOpacity > 0.7) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${
            (currentOpacity - 0.7) * 0.3
          })`;
          ctx.fill();
        }
      });
    };

    const drawOrbitalRings = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      [150, 220, 300, 380, 480].forEach((radius, index) => {
        const mouseDistance = getDistance(
          mouseRef.current.x,
          mouseRef.current.y,
          centerX,
          centerY
        );
        const ringOpacity =
          0.05 + Math.sin(timeRef.current * 0.001 + index) * 0.02;
        const proximityEffect =
          Math.max(0, 1 - Math.abs(mouseDistance - radius) / 100) * 0.1;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${
          ringOpacity + proximityEffect
        })`;
        ctx.lineWidth = 1 + proximityEffect * 2;
        ctx.stroke();
      });
    };

    const drawPlanets = () => {
      planetsRef.current.forEach((planet) => {
        const mouseDistance = getDistance(
          mouseRef.current.x,
          mouseRef.current.y,
          planet.centerX,
          planet.centerY
        );
        const gravitationalEffect =
          Math.max(0, 1 - mouseDistance / 300) * 0.002;

        if (
          keysRef.current.has("ShiftLeft") ||
          keysRef.current.has("ShiftRight")
        ) {
          planet.speed =
            planet.originalSpeed +
            gravitationalEffect * (mouseDistance < 200 ? 1 : -1);
        } else {
          planet.speed = planet.originalSpeed;
        }

        planet.angle += planet.speed;

        const x = planet.centerX + Math.cos(planet.angle) * planet.radius;
        const y = planet.centerY + Math.sin(planet.angle) * planet.radius;

        planet.trail.push({ x, y, opacity: 1 });
        if (planet.trail.length > (planet.isHovered ? 30 : 20)) {
          planet.trail.shift();
        }

        planet.trail.forEach((point, index) => {
          const trailOpacity =
            (index / planet.trail.length) * (planet.isHovered ? 0.5 : 0.3);
          ctx.beginPath();
          ctx.arc(
            point.x,
            point.y,
            planet.size * (planet.isHovered ? 0.4 : 0.3),
            0,
            Math.PI * 2
          );
          ctx.fillStyle = planet.color.replace(")", `, ${trailOpacity})`);
          ctx.fill();
        });

        const currentSize = planet.size * (1 + planet.glowIntensity * 0.3);

        ctx.beginPath();
        ctx.arc(x, y, currentSize, 0, Math.PI * 2);

        const planetGradient = ctx.createRadialGradient(
          x - currentSize * 0.3,
          y - currentSize * 0.3,
          0,
          x,
          y,
          currentSize
        );
        planetGradient.addColorStop(0, planet.color);
        planetGradient.addColorStop(1, planet.color.replace(")", ", 0.6)"));

        ctx.fillStyle = planetGradient;
        ctx.fill();

        const glowSize = currentSize * (1.5 + planet.glowIntensity * 0.5);
        const glowOpacity = 0.1 + planet.glowIntensity * 0.2;

        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = planet.color.replace(")", `, ${glowOpacity})`);
        ctx.fill();
      });
    };

    const drawRippleEffects = () => {
      rippleEffectsRef.current = rippleEffectsRef.current.filter((ripple) => {
        ripple.radius += 3;
        ripple.life -= 0.02;
        ripple.opacity = ripple.life;

        if (ripple.life <= 0) return false;

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (ripple.radius > 20) {
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius - 20, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(100, 200, 255, ${ripple.opacity * 0.3})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        return true;
      });
    };

    const drawInteractiveParticles = () => {
      interactiveParticlesRef.current = interactiveParticlesRef.current.filter(
        (particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.98;
          particle.vy *= 0.98;
          particle.life -= 0.02;
          particle.size *= 0.99;

          if (particle.life <= 0) return false;

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color.replace(")", `, ${particle.life})`);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = particle.color.replace(
            ")",
            `, ${particle.life * 0.3})`
          );
          ctx.fill();
          return true;
        }
      );
    };

    const drawShootingStars = () => {
      shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
        star.x += star.vx;
        star.y += star.vy;
        star.life -= 0.01;
        star.opacity = star.life;

        if (star.life <= 0) return false;

        const gradient = ctx.createLinearGradient(
          star.x,
          star.y,
          star.x - star.vx * star.length,
          star.y - star.vy * star.length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(
          0.5,
          `rgba(100, 200, 255, ${star.opacity * 0.7})`
        );
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(
          star.x - star.vx * star.length,
          star.y - star.vy * star.length
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.stroke();
        return true;
      });
    };

    // --- RocketLoader funksiyalari AnimatedBackgroundga ko'chirilgan ---
    const drawRocketPlanet = () => {
      const rocketPlanetCenterX = canvas.width / 2;
      const rocketPlanetCenterY = canvas.height / 2;

      const currentPlanetRadius = ROCKET_ANIM_AREA_SIZE * 0.12;

      // Draw Planet
      const gradient = ctx.createRadialGradient(
        rocketPlanetCenterX - currentPlanetRadius * 0.3,
        rocketPlanetCenterY - currentPlanetRadius * 0.3,
        0,
        rocketPlanetCenterX,
        rocketPlanetCenterY,
        currentPlanetRadius
      );
      gradient.addColorStop(0, "hsl(190, 60%, 55%)");
      gradient.addColorStop(0.7, "hsl(190, 60%, 45%)");
      gradient.addColorStop(1, "hsl(190, 60%, 25%)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(
        rocketPlanetCenterX,
        rocketPlanetCenterY,
        currentPlanetRadius,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.strokeStyle = "hsl(190, 60%, 35%)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(
        rocketPlanetCenterX + currentPlanetRadius * 0.3,
        rocketPlanetCenterY - currentPlanetRadius * 0.2,
        currentPlanetRadius * 0.2,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(
        rocketPlanetCenterX - currentPlanetRadius * 0.4,
        rocketPlanetCenterY + currentPlanetRadius * 0.3,
        currentPlanetRadius * 0.15,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      ctx.shadowColor = "hsl(200, 80%, 60%)";
      ctx.shadowBlur = 15;
      ctx.strokeStyle = "hsl(200, 80%, 60%)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        rocketPlanetCenterX,
        rocketPlanetCenterY,
        currentPlanetRadius + 5,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawRocketOrbitPath = () => {
      const rocketPlanetCenterX = canvas.width / 2;
      const rocketPlanetCenterY = canvas.height / 2;
      const currentOrbitRadius = ROCKET_ANIM_AREA_SIZE * 0.25;

      ctx.strokeStyle = "hsl(262, 50%, 40%)";
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(
        rocketPlanetCenterX,
        rocketPlanetCenterY,
        currentOrbitRadius,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    };

    const drawRocket = () => {
      const rocketPlanetCenterX = canvas.width / 2;
      const rocketPlanetCenterY = canvas.height / 2;
      const currentOrbitRadius = ROCKET_ANIM_AREA_SIZE * 0.25;

      const rocketX =
        rocketPlanetCenterX -
        Math.cos(rocketAngleRef.current) * currentOrbitRadius;
      const rocketY =
        rocketPlanetCenterY -
        Math.sin(rocketAngleRef.current) * currentOrbitRadius;

      ctx.save();
      ctx.translate(rocketX, rocketY);
      // Raketaning tumshug'i harakat yo'nalishiga qarab turishi uchun
      ctx.rotate(rocketAngleRef.current + Math.PI * 2);

      // Rocket body (main cylinder)
      ctx.fillStyle = "hsl(0, 0%, 90%)";
      ctx.fillRect(-3, -5, 6, 15);

      // Triangular nose cone (pointing forward)
      ctx.fillStyle = "hsl(0, 0%, 95%)";
      ctx.beginPath();
      ctx.moveTo(0, -15); // Sharp point at front (adjusted to be more pointy)
      ctx.lineTo(-3, -5); // Left side of triangle (base)
      ctx.lineTo(3, -5); // Right side of triangle (base)
      ctx.closePath();
      ctx.fill();

      // Rocket window/cockpit
      ctx.fillStyle = "hsl(200, 80%, 70%)";
      ctx.beginPath();
      ctx.arc(0, -8, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Rocket fins at the back
      ctx.fillStyle = "hsl(0, 0%, 70%)";
      // Left fin
      ctx.beginPath();
      ctx.moveTo(-3, 8);
      ctx.lineTo(-6, 12);
      ctx.lineTo(-3, 10);
      ctx.closePath();
      ctx.fill();

      // Right fin
      ctx.beginPath();
      ctx.moveTo(3, 8);
      ctx.lineTo(6, 12);
      ctx.lineTo(3, 10);
      ctx.closePath();
      ctx.fill();

      // Main body details
      ctx.fillStyle = "hsl(0, 0%, 60%)";
      ctx.fillRect(-3, 0, 6, 1);
      ctx.fillRect(-3, 5, 6, 1);

      // Rocket fire/exhaust with dynamic animation
      const baseFireHeight = 8;
      const fireFlicker =
        Math.sin(rocketAngleRef.current * 15) * 2 +
        Math.cos(rocketAngleRef.current * 12) * 1.5;
      const fireHeight = baseFireHeight + fireFlicker;

      // Multiple exhaust flames for more realistic effect
      const exhaustPositions = [-1.5, 0, 1.5];

      exhaustPositions.forEach((xOffset, index) => {
        const individualFlicker =
          Math.sin(rocketAngleRef.current * 15 + (index * Math.PI) / 3) * 1.5;
        const flameHeight = fireHeight + individualFlicker;

        const fireGradient = ctx.createLinearGradient(
          0,
          10,
          0,
          10 + flameHeight
        );
        fireGradient.addColorStop(0, "hsl(15, 100%, 80%)");
        fireGradient.addColorStop(0.3, "hsl(25, 100%, 70%)");
        fireGradient.addColorStop(0.7, "hsl(45, 100%, 60%)");
        fireGradient.addColorStop(1, "hsl(60, 80%, 50%)");

        ctx.fillStyle = fireGradient;
        ctx.beginPath();
        ctx.moveTo(xOffset - 1, 10);
        ctx.lineTo(xOffset + 1, 10);
        ctx.lineTo(xOffset + 0.5, 10 + flameHeight);
        ctx.lineTo(xOffset - 0.5, 10 + flameHeight);
        ctx.closePath();
        ctx.fill();
      });

      ctx.restore();
    };
    // --- RocketLoader funksiyalari tugadi ---

    const animate = () => {
      timeRef.current += 1;

      // Clear canvas with space gradient background
      const spaceGradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );
      spaceGradient.addColorStop(0, "#0f0f23");
      spaceGradient.addColorStop(0.5, "#1a1a2e");
      spaceGradient.addColorStop(1, "#16213e");

      ctx.fillStyle = spaceGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawNebula();
      drawStars();
      drawOrbitalRings();
      drawPlanets(); // Existing planets around the center

      // --- RocketLoader chizish funksiyalarini chaqirish ---
      drawRocketOrbitPath();
      drawRocketPlanet();
      drawRocket();
      rocketAngleRef.current += ROCKET_ORBIT_SPEED; // Raketa burchagini yangilash
      // --- RocketLoader chizish funksiyalari tugadi ---

      drawRippleEffects();
      drawInteractiveParticles();
      drawShootingStars();

      // Auto-create shooting stars occasionally
      if (Math.random() < 0.003) {
        createShootingStar(false);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Event listeners
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("click", handleClick);
    window.addEventListener("resize", resizeCanvas);

    resizeCanvas();
    animate();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-crosshair"
      style={{ zIndex: 0 }}
    />
  );
}
