import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { ZoomIn, ZoomOut, RotateCcw, Square, Circle, Type } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Canvas as FabricCanvas,
  Rect,
  Circle as FabricCircle,
  Textbox,
} from "fabric";
import Settings from "./setting";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type CanvasProps = {
  pageNumber: number;
  pdfUrl?: string;
  onLoadSuccess?: (numPages: number) => void;
};

export function Canvas({ pageNumber, pdfUrl, onLoadSuccess }: CanvasProps) {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.5);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricInstanceRef = useRef<FabricCanvas | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  const pageAnnotationsRef = useRef<Record<number, any>>({});
  const prevPageNumberRef = useRef<number>(pageNumber);

  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const navigate = useNavigate();

  const handleZoomIn = () => {
    setScale((prev) => Math.min(Math.round((prev + 0.25) * 100) / 100, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(Math.round((prev - 0.25) * 100) / 100, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1.5);
  };

  useEffect(() => {
    if (fabricCanvasElRef.current && !fabricInstanceRef.current) {
      const initCanvas = new FabricCanvas(fabricCanvasElRef.current, {
        width: canvasSize.width || 800,
        height: canvasSize.height || 1100,
        backgroundColor: "transparent",
        selection: true,
      });
      initCanvas.setZoom(scale);

      fabricInstanceRef.current = initCanvas;
      setFabricCanvas(initCanvas);
    }

    return () => {
      if (fabricInstanceRef.current) {
        fabricInstanceRef.current.dispose();
        fabricInstanceRef.current = null;
        setFabricCanvas(null);
      }
    };
  }, []);

  useEffect(() => {
    if (!pdfUrl) {
      setPdfDoc(null);
      setLoading(false);
      setError(null);
      navigate("/");
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError(null);

    const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });

    loadingTask.promise
      .then((doc) => {
        if (isCancelled) return;
        setPdfDoc(doc);
        setLoading(false);
        if (onLoadSuccess) {
          onLoadSuccess(doc.numPages);
        }
      })
      .catch((err: Error) => {
        if (isCancelled) return;
        console.error("PDF loading error:", err);
        setError(err.message || "Failed to load PDF");
        setLoading(false);
      });

    return () => {
      isCancelled = true;
      loadingTask.destroy();
    };
  }, [pdfUrl, onLoadSuccess, navigate]);

  useEffect(() => {
    const fCanvas = fabricInstanceRef.current;
    if (!fCanvas) return;

    if (prevPageNumberRef.current && prevPageNumberRef.current !== pageNumber) {
      pageAnnotationsRef.current[prevPageNumberRef.current] = fCanvas.toJSON();
    }
    prevPageNumberRef.current = pageNumber;

    fCanvas.clear();

    const savedData = pageAnnotationsRef.current[pageNumber];
    if (savedData) {
      fCanvas.loadFromJSON(savedData).then(() => {
        fCanvas.setZoom(scale);
        fCanvas.renderAll();
      });
    }
  }, [pageNumber, scale]);

  useEffect(() => {
    if (!pdfDoc) return;

    const targetPage = Math.max(1, Math.min(pageNumber, pdfDoc.numPages));

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    let isEffectActive = true;

    pdfDoc
      .getPage(targetPage)
      .then((page) => {
        if (!isEffectActive) return;

        const viewport = page.getViewport({ scale });
        const pdfCanvas = pdfCanvasRef.current;
        if (!pdfCanvas) return;

        pdfCanvas.width = viewport.width;
        pdfCanvas.height = viewport.height;

        setCanvasSize({ width: viewport.width, height: viewport.height });

        if (fabricInstanceRef.current) {
          fabricInstanceRef.current.setDimensions({
            width: viewport.width,
            height: viewport.height,
          });
          fabricInstanceRef.current.setZoom(scale);
          fabricInstanceRef.current.renderAll();
        }

        const renderContext = {
          canvas: pdfCanvas,
          canvasContext: pdfCanvas.getContext("2d")!,
          viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        return renderTask.promise;
      })
      .then(() => {
        renderTaskRef.current = null;
      })
      .catch((err: Error) => {
        if (err?.name === "RenderingCancelledException") {
          return;
        }
        console.error("Render error:", err);
      });

    return () => {
      isEffectActive = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, pageNumber, scale]);

  const addRectangle = () => {
    if (fabricInstanceRef.current) {
      const rect = new Rect({
        top: 100,
        left: 100,
        width: 120,
        height: 80,
        fill: "#3b82f6",
      });
      fabricInstanceRef.current.add(rect);
      fabricInstanceRef.current.setActiveObject(rect);
      fabricInstanceRef.current.renderAll();
    }
  };

  const addCircle = () => {
    if (fabricInstanceRef.current) {
      const circle = new FabricCircle({
        top: 100,
        left: 100,
        radius: 50,
        fill: "#ef4444",
      });
      fabricInstanceRef.current.add(circle);
      fabricInstanceRef.current.setActiveObject(circle);
      fabricInstanceRef.current.renderAll();
    }
  };

  const addText = () => {
    if (fabricInstanceRef.current) {
      const text = new Textbox("Type text here...", {
        top: 100,
        left: 100,
        width: 180,
        fontSize: 22,
        fill: "#1f2937",
        editable: true,
      });
      fabricInstanceRef.current.add(text);
      fabricInstanceRef.current.setActiveObject(text);
      fabricInstanceRef.current.renderAll();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 relative">
      {!pdfUrl && !loading && (
        <div className="p-8 text-center text-gray-500">
          <p className="font-semibold text-lg">No PDF selected</p>
          <p className="text-sm">Please upload a PDF file to begin.</p>
        </div>
      )}
      {loading && pdfUrl && (
        <p className="text-gray-600 font-medium">Loading PDF document...</p>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          Failed to load PDF: {error}
        </div>
      )}

      {/* Floating Toolbar on Left */}
      {pdfDoc && !loading && !error && (
        <div className="flex flex-col gap-5 p-3.5 fixed top-1/2 -translate-y-1/2 left-6 bg-neutral-900 text-white rounded-2xl shadow-2xl z-40 border border-neutral-700">
          <button
            onClick={addRectangle}
            className="p-2.5 hover:bg-neutral-800 rounded-xl transition text-white hover:text-blue-400 cursor-pointer"
            title="Add Rectangle"
          >
            <Square size={22} />
          </button>
          <button
            onClick={addCircle}
            className="p-2.5 hover:bg-neutral-800 rounded-xl transition text-white hover:text-blue-400 cursor-pointer"
            title="Add Circle"
          >
            <Circle size={22} />
          </button>
          <button
            onClick={addText}
            className="p-2.5 hover:bg-neutral-800 rounded-xl transition text-white hover:text-blue-400 cursor-pointer"
            title="Add Text"
          >
            <Type size={22} />
          </button>
        </div>
      )}

      {/* Floating Properties Panel on Right */}
      <Settings canvas={fabricCanvas} />

      {/* Fixed Zoom Controls on Bottom Right */}
      {pdfDoc && !loading && !error && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-neutral-900/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-2xl border border-neutral-700 text-white">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 rounded-lg hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-white cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <span
            onClick={handleResetZoom}
            className="text-xs font-semibold text-white min-w-[3.5rem] text-center cursor-pointer hover:text-blue-400 transition select-none px-1 py-0.5 rounded"
            title="Click to reset zoom"
          >
            {Math.round((scale / 1.5) * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
            className="p-1.5 rounded-lg hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-white cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 ml-1 rounded-lg hover:bg-neutral-800 transition text-neutral-400 hover:text-white cursor-pointer"
            title="Reset to 100%"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      )}

      <div
        className={`relative shadow-2xl border border-gray-300 rounded-lg bg-white overflow-hidden ${
          !pdfUrl || loading || error ? "hidden" : "block"
        }`}
        style={{
          width: canvasSize.width ? `${canvasSize.width}px` : undefined,
          height: canvasSize.height ? `${canvasSize.height}px` : undefined,
        }}
      >
        <canvas ref={pdfCanvasRef} className="block" />
        <div className="absolute top-0 left-0 z-10">
          <canvas ref={fabricCanvasElRef} />
        </div>
      </div>
    </div>
  );
}
