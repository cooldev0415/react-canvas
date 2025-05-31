import { useState, useEffect } from 'react';

interface MousePosition {
  clientX: number;
  clientY: number;
}

interface EyeProps {
  centerX: number;
  centerY: number;
  rx: number;
  ry: number;
  rotation: number;
  mouse: MousePosition | null;
}

const Eye = (props: EyeProps) => {
  const { centerX, centerY, rx, ry, rotation, mouse } = props;
  const [pupil, setPupil] = useState({ x: centerX, y: centerY });

  useEffect(() => {
    if (!mouse) return;

    let dx = mouse.clientX - centerX;
    let dy = mouse.clientY - centerY;

    const cos = Math.cos(-rotation);
    const sin = Math.sin(-rotation);
    const dxRot = dx * cos - dy * sin;
    const dyRot = dx * sin + dy * cos;

    const ellipseDist = Math.sqrt((dxRot * dxRot) / (rx * rx) + (dyRot * dyRot) / (ry * ry));
    let constrainedDxRot = dxRot;
    let constrainedDyRot = dyRot;
    if (ellipseDist > 1) {
      constrainedDxRot /= ellipseDist;
      constrainedDyRot /= ellipseDist;
    }

    const dxFinal = constrainedDxRot * cos + constrainedDyRot * sin;
    const dyFinal = -constrainedDxRot * sin + constrainedDyRot * cos;

    setPupil({
      x: centerX + dxFinal,
      y: centerY + dyFinal,
    });
  }, [mouse, centerX, centerY, rx, ry, rotation]);

  return (
    <>
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={rx}
        ry={ry}
        fill="transparent"
        stroke="#000"
        strokeWidth="3"
        transform={`rotate(${(rotation * 180) / Math.PI}, ${centerX}, ${centerY})`}
      />
      <circle
        cx={pupil.x}
        cy={pupil.y}
        r="28"  // Bigger pupil
        fill="#000"
        mask={`url(#eyeballMask${centerX})`}
      />
      <defs>
        <mask id={`eyeballMask${centerX}`}>
          <ellipse
            cx={centerX}
            cy={centerY}
            rx={rx}
            ry={ry}
            fill="white"
            transform={`rotate(${(rotation * 180) / Math.PI}, ${centerX}, ${centerY})`}
          />
        </mask>
      </defs>
    </>
  );
};

const FunnySmileFace = () => {
  const [mouse, setMouse] = useState<MousePosition | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const svg = document.getElementById('funnySmileSvg');
      if (!svg) return;
      const bbox = svg.getBoundingClientRect();

      setMouse({
        clientX: event.clientX - bbox.left,
        clientY: event.clientY - bbox.top,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Eye parameters
  const rotation = (45 * Math.PI) / 180;

  return (
    <svg
      id="funnySmileSvg"
      viewBox="0 0 320 220"
      style={{ width: 320, height: 220, background: 'transparent', display: 'block', margin: '0 auto' }}
    >
      {/* Eyes */}
      <Eye centerX={100} centerY={60} rx={30} ry={50} rotation={rotation} mouse={mouse} />
      <Eye centerX={220} centerY={60} rx={30} ry={50} rotation={rotation} mouse={mouse} />

      {/* Smile text on a path */}
      <path
        id="smilePath"
        d="M30,120 Q160,250 280,120"
        fill="transparent"
      />
      <text
        fontSize="13"
        fontFamily="'Luckiest Guy', cursive"
        fill="#000"
      >
        <textPath href="#smilePath" startOffset="10%">
          LET'S CREATE SOMETHING AWESOME
        </textPath>
      </text>
    </svg>
  );
};

export default FunnySmileFace;