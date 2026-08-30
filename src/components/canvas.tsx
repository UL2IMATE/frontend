import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type CanvasProps = {
  pageNumber: number;
  pdfUrl?: string;
  onLoadSuccess?: (numPages: number) => void;
};

export function Canvas({
  pageNumber,
  pdfUrl = "/sample.pdf",
  onLoadSuccess,
}: CanvasProps) {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // 1. Load document
  useEffect(() => {
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
  }, [pdfUrl, onLoadSuccess]);

  // 2. Render page with cancellation support
  useEffect(() => {
    if (!pdfDoc) return;

    const targetPage = Math.max(1, Math.min(pageNumber, pdfDoc.numPages));

    // Cancel any previous render that is still drawing
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    let isEffectActive = true;

    pdfDoc
      .getPage(targetPage)
      .then((page) => {
        if (!isEffectActive) return;

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvas,
          canvasContext: canvas.getContext("2d")!,
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
        // PDF.js throws 'RenderingCancelledException' when cancelled — this is expected!
        if (err?.name === "RenderingCancelledException") {
          return;
        }
        console.error("Render error:", err);
      });

    // Cleanup: cancel rendering if user clicks next/prev before render finishes
    return () => {
      isEffectActive = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, pageNumber]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {loading && (
        <p className="text-gray-600 font-medium">Loading PDF document...</p>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          Failed to load PDF: {error}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`shadow-lg border border-gray-300 rounded bg-white ${
          loading || error ? "hidden" : "block"
        }`}
      />
    </div>
  );
}
