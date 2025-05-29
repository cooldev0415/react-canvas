import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './CanvasAnimation.css';

interface CircleProps {
  x: number;
  y: number;
  r: number;
  fill?: string;
  stroke?: {
    width: number;
    color: string;
  };
  opacity?: number;
}

class Circle {
  x: number;
  y: number;
  r: number;
  fill?: string;
  stroke?: {
    width: number;
    color: string;
  };
  opacity?: number;

  constructor(opts: CircleProps) {
    this.x = opts.x;
    this.y = opts.y;
    this.r = opts.r;
    this.fill = opts.fill;
    this.stroke = opts.stroke;
    this.opacity = opts.opacity;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.opacity || 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    if (this.stroke) {
      ctx.strokeStyle = this.stroke.color;
      ctx.lineWidth = this.stroke.width;
      ctx.stroke();
    }
    if (this.fill) {
      ctx.fillStyle = this.fill;
      ctx.fill();
    }
    ctx.closePath();
    ctx.globalAlpha = 1;
  }
}

const CanvasAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animations = useRef<gsap.core.Tween[]>([]);
  const bgColor = useRef("#FF6138");

  const colorPicker = {
    colors: ["#FF6138", "#FFBE53", "#2980B9", "#282741"],
    index: 0,
    next() {
      this.index = this.index++ < this.colors.length - 1 ? this.index : 0;
      return this.colors[this.index];
    },
    current() {
      return this.colors[this.index];
    }
  };

  const removeAnimation = (animation: gsap.core.Tween) => {
    const index = animations.current.indexOf(animation);
    if (index > -1) {
      animations.current.splice(index, 1);
      animation.kill();
    }
  };

  const calcPageFillRadius = (x: number, y: number, cW: number, cH: number) => {
    const l = Math.max(x - 0, cW - x);
    const h = Math.max(y - 0, cH - y);
    return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
  };

  const handleEvent = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let pageX: number, pageY: number;
    if ('touches' in e) {
      e.preventDefault();
      pageX = e.touches[0].pageX;
      pageY = e.touches[0].pageY;
    } else {
      pageX = (e as MouseEvent).pageX;
      pageY = (e as MouseEvent).pageY;
    }

    const currentColor = colorPicker.current();
    const nextColor = colorPicker.next();
    const targetR = calcPageFillRadius(pageX, pageY, canvas.width, canvas.height);
    const rippleSize = Math.min(200, (canvas.width * 0.4));
    const minCoverDuration = 0.75;

    const pageFill = new Circle({
      x: pageX,
      y: pageY,
      r: 0,
      fill: nextColor
    });

    const fillAnimation = gsap.to(pageFill, {
      r: targetR,
      duration: Math.max(targetR / 2000, minCoverDuration),
      ease: "power2.out",
      onComplete: () => {
        bgColor.current = pageFill.fill || "#FF6138";
        removeAnimation(fillAnimation);
      }
    });

    const ripple = new Circle({
      x: pageX,
      y: pageY,
      r: 0,
      fill: currentColor,
      stroke: {
        width: 3,
        color: currentColor
      },
      opacity: 1
    });

    const rippleAnimation: gsap.core.Tween = gsap.to(ripple, {
      r: rippleSize,
      opacity: 0,
      duration: 0.9,
      ease: "power2.out",
      onComplete: () => removeAnimation(rippleAnimation)
    });

    const particles: Circle[] = [];
    for (let i = 0; i < 32; i++) {
      const particle = new Circle({
        x: pageX,
        y: pageY,
        fill: currentColor,
        r: Math.random() * 24 + 24
      });
      particles.push(particle);
    }

    const particlesAnimation: gsap.core.Tween = gsap.to(particles, {
      x: (i: number) => particles[i].x + (Math.random() * rippleSize * 2 - rippleSize),
      y: (i: number) => particles[i].y + (Math.random() * rippleSize * 2.3 - rippleSize * 1.15),
      r: 0,
      duration: 1 + Math.random() * 0.3,
      ease: "power2.out",
      onComplete: () => removeAnimation(particlesAnimation)
    });

    animations.current.push(fillAnimation, rippleAnimation, particlesAnimation);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const cW = window.innerWidth;
      const cH = window.innerHeight;
      canvas.width = cW * devicePixelRatio;
      canvas.height = cH * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };

    const animate = () => {
      ctx.fillStyle = bgColor.current;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      animations.current.forEach((anim) => {
        const targets = anim.targets() as Circle[];
        targets.forEach((target) => {
          target.draw(ctx);
        });
      });
      requestAnimationFrame(animate);
    };

    const handleInactiveUser = () => {
      const inactive = setTimeout(() => {
        const fauxClick = new MouseEvent("mousedown", {
          clientX: canvas.width / 2,
          clientY: canvas.height / 2
        });
        document.dispatchEvent(fauxClick);
      }, 2000);

      const clearInactiveTimeout = () => {
        clearTimeout(inactive);
        document.removeEventListener("mousedown", clearInactiveTimeout);
        document.removeEventListener("touchstart", clearInactiveTimeout);
      };

      document.addEventListener("mousedown", clearInactiveTimeout);
      document.addEventListener("touchstart", clearInactiveTimeout);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("mousedown", handleEvent);
    document.addEventListener("touchstart", handleEvent);
    handleInactiveUser();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("mousedown", handleEvent);
      document.removeEventListener("touchstart", handleEvent);
      animations.current.forEach(anim => anim.kill());
    };
  }, []);

  return <canvas ref={canvasRef} id="c" />;
};

export default CanvasAnimation; 