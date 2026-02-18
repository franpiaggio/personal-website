import { useEffect, useRef } from "react";

const GRID_SIZE = 60;
const RADIUS = 180;
const FADE_SPEED = 0.03;

interface Cell {
  row: number;
  col: number;
  brightness: number;
}

const MouseTrail = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let mouseX = -1;
    let mouseY = -1;
    const cells = new Map<string, Cell>();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // The CSS grid offset within the viewport
      const offsetX = -(scrollX % GRID_SIZE);
      const offsetY = -(scrollY % GRID_SIZE);

      const cols = Math.ceil(canvas.width / GRID_SIZE) + 2;
      const rows = Math.ceil(canvas.height / GRID_SIZE) + 2;

      // Light up grid intersections near the mouse
      if (mouseX > 0 && mouseY > 0) {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const ix = offsetX + c * GRID_SIZE;
            const iy = offsetY + r * GRID_SIZE;
            const dx = ix - mouseX;
            const dy = iy - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < RADIUS) {
              const intensity = 1 - dist / RADIUS;
              // Use absolute grid position as key so brightness persists across scroll
              const absCol = c + Math.floor(scrollX / GRID_SIZE);
              const absRow = r + Math.floor(scrollY / GRID_SIZE);
              const key = `${absRow},${absCol}`;
              const existing = cells.get(key);
              if (existing) {
                existing.brightness = Math.max(existing.brightness, intensity);
              } else {
                cells.set(key, { row: absRow, col: absCol, brightness: intensity });
              }
            }
          }
        }
      }

      // Draw and fade
      const baseCol = Math.floor(scrollX / GRID_SIZE);
      const baseRow = Math.floor(scrollY / GRID_SIZE);

      for (const [key, cell] of cells) {
        if (cell.brightness <= 0) {
          cells.delete(key);
          continue;
        }

        // Convert absolute grid position to viewport position
        const ix = (cell.col - baseCol) * GRID_SIZE + offsetX;
        const iy = (cell.row - baseRow) * GRID_SIZE + offsetY;

        // Skip if off screen
        if (ix < -GRID_SIZE || ix > canvas.width + GRID_SIZE || iy < -GRID_SIZE || iy > canvas.height + GRID_SIZE) {
          cell.brightness = Math.max(0, cell.brightness - FADE_SPEED);
          if (cell.brightness <= 0) cells.delete(key);
          continue;
        }

        const alpha = cell.brightness * 0.4;

        // Glow at intersection
        const gradient = ctx.createRadialGradient(ix, iy, 0, ix, iy, 4);
        gradient.addColorStop(0, `hsla(155, 100%, 50%, ${alpha})`);
        gradient.addColorStop(1, `hsla(155, 100%, 50%, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(ix - 4, iy - 4, 8, 8);

        // Highlight grid lines
        const lineAlpha = cell.brightness * 0.12;
        ctx.strokeStyle = `hsla(155, 100%, 50%, ${lineAlpha})`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(ix, iy);
        ctx.lineTo(ix + GRID_SIZE, iy);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ix, iy);
        ctx.lineTo(ix, iy + GRID_SIZE);
        ctx.stroke();

        cell.brightness = Math.max(0, cell.brightness - FADE_SPEED);
        if (cell.brightness <= 0) cells.delete(key);
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
    />
  );
};

export default MouseTrail;
