import React, { useEffect, useRef } from 'react';
import { Engine, Render, Bodies, World, Events, Body, Common } from 'matter-js';

// Constants for language blocks
const LANGUAGE_BLOCK_CONSTANTS = {
  GRAVITY_Y: 0.5,
  GRAVITY_SCALE: 0.001,
  PARTICLE_SIZE: { MIN_WIDTH: 100, MAX_WIDTH: 250, HEIGHT: 50, BORDER_RADIUS: 25 },
  PARTICLE_COUNT: 15,
  PARTICLE_DENSITY: 0.0005,
  PARTICLE_FRICTION: 0.002,
  PARTICLE_FRICTION_AIR: 0.02,
  PARTICLE_RESTITUTION: 0.4,
  PARTICLE_VELOCITY: { MIN: -0.2, MAX: 0.2 },
  COLLISION_DAMPING: 0.9,
  MAX_PARTICLES: 60,
  LABELS: [
    "Frontend Development",
    "Backend Development",
    "Full Stack Projects",
    "JavaScript Frameworks",
    "Server-Side Technologies",
    "Databases",
    "API Development",
    "Cloud Services",
    "DevOps",
    "Version Control",
    "Performance Optimization",
    "Security Best Practices",
    "Responsive Design",
    "Cross-Browser",
    "Testing",
    "QA",
    "Portfolio Projects",
    "Technical Writing",
    // New Additions
    "React",
    "Next.js",
    "Tailwind CSS",
    "Node.js",
    "Laravel",
    "Ruby",
    "Rails",
    "PHP",
    "WordPress",
    "MUI (Material-UI)",
    "Chakra UI"
  ]
};

const LanguageCanvasAnimation: React.FC = () => {
  const scene = useRef<HTMLDivElement>(null);
  const isPressed = useRef(false);
  const engine = useRef(Engine.create());
  const render = useRef<Matter.Render | null>(null);
  const frameId = useRef<number | null>(null);
  const particles = useRef<Matter.Body[]>([]);
  const colors = ['transparent', '#000000', 'transparent'];
  const currentColorIndex = useRef(0);

  const getNextColor = () => {
    currentColorIndex.current = (currentColorIndex.current + 1) % colors.length;
    return colors[currentColorIndex.current];
  };

  const createLabeledBody = (x: number, y: number, label: string, color: string) => {
    const textWidth = label.length * 8 + 60;
    const width = Math.max(LANGUAGE_BLOCK_CONSTANTS.PARTICLE_SIZE.MIN_WIDTH, Math.min(LANGUAGE_BLOCK_CONSTANTS.PARTICLE_SIZE.MAX_WIDTH, textWidth));
    const height = LANGUAGE_BLOCK_CONSTANTS.PARTICLE_SIZE.HEIGHT;
    const borderRadius = LANGUAGE_BLOCK_CONSTANTS.PARTICLE_SIZE.BORDER_RADIUS;

    const body = Bodies.rectangle(x, y, width, height, {
      chamfer: { radius: borderRadius },
      restitution: LANGUAGE_BLOCK_CONSTANTS.PARTICLE_RESTITUTION,
      friction: LANGUAGE_BLOCK_CONSTANTS.PARTICLE_FRICTION,
      frictionAir: LANGUAGE_BLOCK_CONSTANTS.PARTICLE_FRICTION_AIR,
      density: LANGUAGE_BLOCK_CONSTANTS.PARTICLE_DENSITY,
      render: {
        fillStyle: color,
        strokeStyle: '#000000',
        lineWidth: 1,
      },
      label: label,
    });

    Body.setVelocity(body, {
      x: LANGUAGE_BLOCK_CONSTANTS.PARTICLE_VELOCITY.MIN + Math.random() * (LANGUAGE_BLOCK_CONSTANTS.PARTICLE_VELOCITY.MAX - LANGUAGE_BLOCK_CONSTANTS.PARTICLE_VELOCITY.MIN),
      y: LANGUAGE_BLOCK_CONSTANTS.PARTICLE_VELOCITY.MIN + Math.random() * (LANGUAGE_BLOCK_CONSTANTS.PARTICLE_VELOCITY.MAX - LANGUAGE_BLOCK_CONSTANTS.PARTICLE_VELOCITY.MIN)
    });

    return body;
  };

  useEffect(() => {
    const handleResize = () => {
      if (render.current) {
        render.current.options.width = window.innerWidth;
        render.current.options.height = window.innerHeight;
        render.current.canvas.width = window.innerWidth;
        render.current.canvas.height = window.innerHeight;
      }
    };

    const initializeMatter = () => {
      if (!scene.current) {
        console.error('Scene element not found!');
        return;
      }

      const cw = window.innerWidth;
      const ch = window.innerHeight;

      engine.current.world.gravity.y = LANGUAGE_BLOCK_CONSTANTS.GRAVITY_Y;
      engine.current.world.gravity.scale = LANGUAGE_BLOCK_CONSTANTS.GRAVITY_SCALE;

      const createdRender = Render.create({
        element: scene.current,
        engine: engine.current,
        options: {
          width: cw,
          height: ch,
          wireframes: false,
          background: 'transparent',
        },
      });
      render.current = createdRender;

      // const dockHeight = 70;
      // const dockWidth = 240;
      // const dockWall = Bodies.rectangle(
      //   cw / 2,
      //   ch - dockHeight / 2,
      //   dockWidth,
      //   dockHeight,
      //   { isStatic: true, render: { fillStyle: 'transparent' } }
      // )
      const walls = [
        Bodies.rectangle(cw / 2, -10, cw, 20, { isStatic: true, render: { fillStyle: 'transparent' } }),
        Bodies.rectangle(-10, ch / 2, 20, ch, { isStatic: true, render: { fillStyle: 'transparent' } }),
        Bodies.rectangle(cw / 2, ch + 10, cw, 20, { isStatic: true, render: { fillStyle: 'transparent' } }),
        Bodies.rectangle(cw + 10, ch / 2, 20, ch, { isStatic: true, render: { fillStyle: 'transparent' } }),
        // dockWall
      ];

      World.add(engine.current.world, walls);

      for (let i = 0; i < LANGUAGE_BLOCK_CONSTANTS.PARTICLE_COUNT; i++) {
        const x = Math.random() * cw;
        const y = ch * 0.7 + Math.random() * (ch * 0.2);
        const label = Common.choose(LANGUAGE_BLOCK_CONSTANTS.LABELS);
        const color = getNextColor();
        const particle = createLabeledBody(x, y, label, color);
        particles.current.push(particle);
        World.add(engine.current.world, particle);
      }

      Events.on(engine.current, 'collisionStart', (event) => {
        event.pairs.forEach((pair) => {
          const { bodyA, bodyB } = pair;
          Body.setVelocity(bodyA, {
            x: bodyA.velocity.x * LANGUAGE_BLOCK_CONSTANTS.COLLISION_DAMPING,
            y: bodyA.velocity.y * LANGUAGE_BLOCK_CONSTANTS.COLLISION_DAMPING
          });
          Body.setVelocity(bodyB, {
            x: bodyB.velocity.x * LANGUAGE_BLOCK_CONSTANTS.COLLISION_DAMPING,
            y: bodyB.velocity.y * LANGUAGE_BLOCK_CONSTANTS.COLLISION_DAMPING
          });
        });
      });

      Render.run(render.current);

      const context = render.current.context;
      Events.on(render.current, 'afterRender', () => {
        particles.current.forEach(particle => {
          const label = (particle as any).label;
          const textColor = particle.render.fillStyle === '#000000' ? '#FFFFFF' : '#000000';

          context.save();
          context.translate(particle.position.x, particle.position.y);
          context.rotate(particle.angle);

          context.font = '18px Arial';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillStyle = textColor;

          context.fillText(label, 0, 0);

          context.restore();
        });
      });

      const step = () => {
        Engine.update(engine.current, 1000 / 60);
        frameId.current = requestAnimationFrame(step);
      };

      step();

      window.addEventListener('resize', handleResize);

    };

    const timeoutId = setTimeout(initializeMatter, 50);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      if (render.current) {
        Events.off(render.current, 'afterRender');
        Render.stop(render.current);
        if (render.current.canvas) {
          render.current.canvas.remove();
          // @ts-ignore
          render.current.canvas = null;
          // @ts-ignore
          render.current.context = null;
        }
      }
      World.clear(engine.current.world, false);
      Engine.clear(engine.current);
      if (render.current) {
        render.current.textures = {};
      }
    };
  }, []);

  // const handleDown = () => {
  //   isPressed.current = true;
  // };

  const handleAddCircle = (e: React.MouseEvent) => {
    if (engine.current && scene.current) {
      const rect = scene.current.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      const label = Common.choose(LANGUAGE_BLOCK_CONSTANTS.LABELS);
      const color = getNextColor();
      const newBody = createLabeledBody(canvasX, canvasY, label, color);

      World.add(engine.current.world, newBody);
      particles.current.push(newBody);

      if (particles.current.length > LANGUAGE_BLOCK_CONSTANTS.MAX_PARTICLES) {
        const oldestParticle = particles.current.shift();
        if (oldestParticle) {
          World.remove(engine.current.world, oldestParticle);
        }
      }
      isPressed.current = false;
    }
  };

  return (
    <div
      // onMouseDown={handleDown}
      onMouseDown={handleAddCircle}
      // onMouseUp={handleAddCircle}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      <div ref={scene} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default LanguageCanvasAnimation;
