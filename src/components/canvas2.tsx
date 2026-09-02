import { useEffect, useRef, useState } from "react";
import { Canvas, Rect } from "fabric";
import { Square } from "lucide-react";
import { Circle } from "lucide-react";
import { Circle as Circlee } from "fabric";
import Settings from "./setting";
const Canvas2 = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: 700,
        height: 700,
      });
      initCanvas.backgroundColor = "#fff";

      initCanvas.renderAll();
      setCanvas(initCanvas);

      return () => {
        initCanvas.dispose();
      };
    }
  }, []);

  const addRectangle = () => {
    if (canvas) {
      const rect = new Rect({
        top: 100,
        left: 100,
        width: 100,
        height: 60,
        fill: "#3b82f6",
      });
      canvas.add(rect);
    }
  };
  const addCircle = () => {
    if (canvas) {
      const circle = new Circlee({
        top: 100,
        left: 100,
        radius: 100,
        fill: "Black",
      });
      canvas.add(circle);
    }
  };

  return (
    <>
      <div className="text-center flex items-center justify-start flex-col  min-h-screen bg-gray-300 ">
        <div className="flex flex-col gap-8  p-5 fixed top-2/4 -translate-y-6/12 left-4 bg-black text-white">
          <Square onClick={addRectangle} />
          <Circle onClick={addCircle} />
          <Square onClick={addRectangle} />
          <Square onClick={addRectangle} />
        </div>
        <canvas id="canvas" ref={canvasRef}></canvas>
        <Settings canvas={canvas} />
      </div>
    </>
  );
};

export default Canvas2;
