import { useEffect, useRef } from 'react';
import { Engine, Render, Bodies, World, Events, Body, Vector, Composite, Common } from 'matter-js';

// Constants for language blocks
const LANGUAGE_BLOCK_CONSTANTS = {
  GRAVITY_Y: 0.5, // Moderate gravity for a smoother drop
  GRAVITY_SCALE: 0.001,
  PARTICLE_SIZE: { MIN_WIDTH: 100, MAX_WIDTH: 250, HEIGHT: 50, BORDER_RADIUS: 25 }, // Adjusted size
  PARTICLE_COUNT: 15,
  PARTICLE_DENSITY: 0.0005, // Slightly lower density
  PARTICLE_FRICTION: 0.002,
  PARTICLE_FRICTION_AIR: 0.02, // More air friction for smoother fall
  PARTICLE_RESTITUTION: 0.4, // Less bounce
  PARTICLE_VELOCITY: { MIN: -0.2, MAX: 0.2 }, // Slower initial velocity
  COLLISION_DAMPING: 0.9,
  MAX_PARTICLES: 60,
  LABELS: ["Interactive Designs","Journey Maps","Look Book","Prototypes","Wireframes","Collateral","UI Designs","Surveys","Communications","Illustration Services","Stakeholder Meetings","Analytics","Usability Testing","Booth","Database Management","Pitch Decks","Presentations","OOH","Brand Archetypes","Marketing Strategy","QA","API Development","Customer Experience","eCommerce","Web","CRM Integrations","Social Media","Web","Strategic Marketing","Social Media Assets","Custom Websites","Mobile Applications","UI\/UX","Intranets","Moodboards","Blitz","Investor Portals","Launch","Print\/Digital Adverts","SEO","Advertising","Logos","Infographics","PPC","Content Development","Personas","UI Design","Visual Design","Interaction Design","Brand Strategy","Brand Identity","Branding","Empathy Maps"]
};

const LanguageCanvasAnimation = () => {
  const scene = useRef<HTMLDivElement>(null);
  const isPressed = useRef(false);
  const engine = useRef(Engine.create());
  const render = useRef<Matter.Render | null>(null);
  const frameId = useRef<number | null>(null);
  const updateCount = useRef(0); // Ref to track engine updates
  const particles = useRef<Matter.Body[]>([]);
  const colors = ['#FF6138', '#FFBE53', '#2980B9', '#282741', '#000000'];
  const currentColorIndex = useRef(0);

  const getNextColor = () => {
    currentColorIndex.current = (currentColorIndex.current + 1) % colors.length;
    return colors[currentColorIndex.current];
  };

  // Function to create a labeled body
  const createLabeledBody = (x: number, y: number, label: string, color: string) => {
    // Estimate width based on text length and a base size
    const textWidth = label.length * 8 + 60; // Adjusted approximation
    const width = Math.max(LANGUAGE_BLOCK_CONSTANTS.PARTICLE_SIZE.MIN_WIDTH, Math.min(LANGUAGE_BLOCK_CONSTANTS.PARTICLE_SIZE.MAX_WIDTH, textWidth));
    const height = LANGUAGE_BLOCK_CONSTANTS.PARTICLE_SIZE.HEIGHT;
    const borderRadius = LANGUAGE_BLOCK_CONSTANTS.PARTICLE_SIZE.BORDER_RADIUS;

    const body = Bodies.rectangle(x, y, width, height, {
      chamfer: { radius: borderRadius }, // For rounded corners
      restitution: LANGUAGE_BLOCK_CONSTANTS.PARTICLE_RESTITUTION,
      friction: LANGUAGE_BLOCK_CONSTANTS.PARTICLE_FRICTION,
      frictionAir: LANGUAGE_BLOCK_CONSTANTS.PARTICLE_FRICTION_AIR,
      density: LANGUAGE_BLOCK_CONSTANTS.PARTICLE_DENSITY,
      render: {
        fillStyle: color,
      },
      label: label, // Store label in the body itself
    });

    // Add initial velocity
    Body.setVelocity(body, {
      x: LANGUAGE_BLOCK_CONSTANTS.PARTICLE_VELOCITY.MIN + Math.random() * (LANGUAGE_BLOCK_CONSTANTS.PARTICLE_VELOCITY.MAX - LANGUAGE_BLOCK_CONSTANTS.PARTICLE_VELOCITY.MIN),
      y: LANGUAGE_BLOCK_CONSTANTS.PARTICLE_VELOCITY.MIN + Math.random() * (LANGUAGE_BLOCK_CONSTANTS.PARTICLE_VELOCITY.MAX - LANGUAGE_BLOCK_CONSTANTS.PARTICLE_VELOCITY.MIN)
    });

    return body;
  };

  useEffect(() => {
    console.log('Matter.js useEffect running...');
    if (!scene.current) {
      console.error('Scene element not found!');
      return;
    }

    const cw = window.innerWidth;
    const ch = window.innerHeight;
    console.log('Canvas dimensions:', cw, ch);

    // Set gravity for smooth drop
    engine.current.world.gravity.y = LANGUAGE_BLOCK_CONSTANTS.GRAVITY_Y;
    engine.current.world.gravity.scale = LANGUAGE_BLOCK_CONSTANTS.GRAVITY_SCALE;
    console.log('World gravity:', engine.current.world.gravity);

    const createdRender = Render.create({
      element: scene.current,
      engine: engine.current,
      options: {
        width: cw,
        height: ch,
        wireframes: false,
        background: 'transparent', // Use transparent background
      },
    });
    render.current = createdRender; // Assign created render to ref

    // Add walls
    const walls = [
      Bodies.rectangle(cw / 2, -10, cw, 20, { isStatic: true, render: { fillStyle: 'transparent' } }),
      Bodies.rectangle(-10, ch / 2, 20, ch, { isStatic: true, render: { fillStyle: 'transparent' } }),
      Bodies.rectangle(cw / 2, ch + 10, cw, 20, { isStatic: true, render: { fillStyle: 'transparent' } }),
      Bodies.rectangle(cw + 10, ch / 2, 20, ch, { isStatic: true, render: { fillStyle: 'transparent' } }),
    ];

    World.add(engine.current.world, walls);

    // Add initial labeled particles
    for (let i = 0; i < LANGUAGE_BLOCK_CONSTANTS.PARTICLE_COUNT; i++) {
      const x = Math.random() * cw;
      const y = Math.random() * (ch * 0.2); // Spawn near the top (within the top 20% of the height)
      const label = Common.choose(LANGUAGE_BLOCK_CONSTANTS.LABELS);
      const color = getNextColor();
      const particle = createLabeledBody(x, y, label, color);
      particles.current.push(particle);
      World.add(engine.current.world, particle);
    }

    // Add collision events for particle interaction
    Events.on(engine.current, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        // Apply velocity damping on collision
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

    // Start the renderer
    Render.run(render.current);

    // Custom rendering for text labels
    const context = render.current.context;
    Events.on(render.current, 'afterRender', () => {
      if (updateCount.current > 30) { // Only draw text after 30 updates
        particles.current.forEach(particle => {
          const label = (particle as any).label;
          const textColor = particle.render.fillStyle === '#000000' ? '#FFFFFF' : '#000000';

          context.save(); // Save the current context state
          context.translate(particle.position.x, particle.position.y); // Translate to the particle's center
          context.rotate(particle.angle); // Rotate by the particle's angle

          context.font = '18px Arial'; // Set font properties after transformations
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillStyle = textColor;

          context.fillText(label, 0, 0); // Draw text at the new origin (particle's center)

          context.restore(); // Restore the context state
        });
      }
    });

    // Animation loop
    const step = () => {
      Engine.update(engine.current, 1000 / 60); // 60 FPS for smoother animation
      updateCount.current++; // Increment update count
      frameId.current = requestAnimationFrame(step);
    };

    step(); // Start the loop

    // Handle window resize
    const handleResize = () => {
      if (render.current) {
        render.current.options.width = window.innerWidth;
        render.current.options.height = window.innerHeight;
        render.current.canvas.width = window.innerWidth;
        render.current.canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      console.log('Matter.js cleanup running...');
      window.removeEventListener('resize', handleResize);
      if (frameId.current) {
        cancelAnimationFrame(frameId.current); // Cancel the animation frame
      }
      if (render.current) {
        // Remove the afterRender event listener
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

  const handleDown = () => {
    isPressed.current = true;
  };

  const handleUp = () => {
    isPressed.current = false;
  };

  const handleAddCircle = (e: React.MouseEvent) => {
    if (isPressed.current && engine.current && scene.current) {
      // Adjust mouse coordinates to canvas
      const rect = scene.current.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      const label = Common.choose(LANGUAGE_BLOCK_CONSTANTS.LABELS);
      const color = getNextColor();
      const newBody = createLabeledBody(canvasX, canvasY, label, color);

      World.add(engine.current.world, newBody);
      particles.current.push(newBody);

      // Limit total number of particles
      if (particles.current.length > LANGUAGE_BLOCK_CONSTANTS.MAX_PARTICLES) {
        const oldestParticle = particles.current.shift();
        if (oldestParticle) {
          World.remove(engine.current.world, oldestParticle);
        }
      }
    }
  };

  return (
    <div
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onMouseMove={handleAddCircle}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      <div ref={scene} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default LanguageCanvasAnimation;