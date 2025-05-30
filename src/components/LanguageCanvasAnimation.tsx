import { useEffect, useRef } from 'react';
import { Engine, Render, Bodies, World, Events } from 'matter-js';

const LanguageCanvasAnimation = () => {
  const scene = useRef<HTMLDivElement>(null);
  const isPressed = useRef(false);
  const engine = useRef(Engine.create());
  const render = useRef<Matter.Render | null>(null); // Keep render ref
  const frameId = useRef<number | null>(null); // Ref for animation frame ID

  useEffect(() => {
    console.log('Matter.js useEffect running...');
    if (!scene.current) {
      console.error('Scene element not found!');
      return;
    }

    const cw = window.innerWidth;
    const ch = window.innerHeight;
    console.log('Canvas dimensions:', cw, ch);

    // Set gravity
    engine.current.world.gravity.y = 1;
    engine.current.world.gravity.scale = 0.01; // Adjusted for faster fall (10x default)
    console.log('World gravity:', engine.current.world.gravity);

    const createdRender = Render.create({
      element: scene.current,
      engine: engine.current,
      options: {
        width: cw,
        height: ch,
        wireframes: false,
        background: '#f0f0f0', // Visible background for debugging
      },
    });
    render.current = createdRender; // Assign created render to ref

    // Add walls
    const walls = [
      Bodies.rectangle(cw / 2, -10, cw, 20, { isStatic: true }),
      Bodies.rectangle(-10, ch / 2, 20, ch, { isStatic: true }),
      Bodies.rectangle(cw / 2, ch + 10, cw, 20, { isStatic: true }),
      Bodies.rectangle(cw + 10, ch / 2, 20, ch, { isStatic: true }),
    ];

    World.add(engine.current.world, walls);

    // Manual animation loop
    const step = () => {
      Engine.update(engine.current, 1000 / 60); // Update engine state
      Render.world(render.current as Matter.Render); // Render the updated world
      frameId.current = requestAnimationFrame(step); // Request next frame
    };

    step(); // Start the loop

    // Cleanup
    return () => {
      console.log('Matter.js cleanup running...');
      if (frameId.current) {
        cancelAnimationFrame(frameId.current); // Cancel the animation frame
      }
      if (render.current) {
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
      const ball = Bodies.circle(canvasX, canvasY, 10 + Math.random() * 30, {
        mass: 10,
        restitution: 0.9,
        friction: 0.005,
        render: {
          fillStyle: '#0000ff',
        },
      });
      console.log('Ball created at:', { x: canvasX, y: canvasY });
      World.add(engine.current.world, [ball]);
    }
  };

  return (
    <div
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onMouseMove={handleAddCircle}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
    >
      <div ref={scene} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default LanguageCanvasAnimation;