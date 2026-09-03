const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

async function generatePDF() {
  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await doc.embedFont(StandardFonts.Courier);

  const PAGE_WIDTH = 595.28; // A4
  const PAGE_HEIGHT = 841.89;
  const MARGIN = 45;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

  function createPage(pageNumber, totalPages) {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    
    // Header Bar
    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - 35,
      width: PAGE_WIDTH,
      height: 35,
      color: rgb(0.12, 0.16, 0.22),
    });

    page.drawText("PDF Editor Architecture Guide: Fabric.js Elements in Canvas", {
      x: MARGIN,
      y: PAGE_HEIGHT - 23,
      size: 10,
      font: fontBold,
      color: rgb(0.9, 0.95, 1.0),
    });

    // Footer
    page.drawText(`Page ${pageNumber} of ${totalPages}`, {
      x: PAGE_WIDTH - MARGIN - 70,
      y: 20,
      size: 9,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText("Generated for React 19 + Fabric.js v7 + PDF.js", {
      x: MARGIN,
      y: 20,
      size: 9,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    return page;
  }

  // ================= PAGE 1 =================
  let p1 = createPage(1, 3);
  let y = PAGE_HEIGHT - 65;

  p1.drawText("Fabric.js Integration in canvas.tsx", {
    x: MARGIN,
    y: y,
    size: 20,
    font: fontBold,
    color: rgb(0.1, 0.2, 0.4),
  });
  y -= 25;

  p1.drawText("A Comprehensive Technical Guide to the Layered Canvas Architecture", {
    x: MARGIN,
    y: y,
    size: 11,
    font: fontRegular,
    color: rgb(0.35, 0.4, 0.45),
  });
  y -= 30;

  // Section 1
  p1.drawText("1. The Dual-Layer Canvas Architecture", {
    x: MARGIN,
    y: y,
    size: 14,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.5),
  });
  y -= 18;

  const text1 = [
    "Previously, canvas.tsx only displayed rendered PDF pages, while canvas2.tsx was an isolated",
    "white canvas. To allow drawing and editing directly on top of PDF documents, we merged them",
    "into a synchronized Dual-Layer Architecture:",
    "",
    "  - Layer 0 (Bottom): A standard HTML5 canvas that renders the PDF page bitmap via PDF.js.",
    "  - Layer 1 (Top): An interactive Fabric.js canvas positioned absolutely at (top: 0, left: 0)",
    "    with a transparent background, allowing the PDF document underneath to remain fully visible.",
  ];
  for (const line of text1) {
    p1.drawText(line, { x: MARGIN + 5, y: y, size: 9.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    y -= 14;
  }
  y -= 10;

  // Diagram box
  p1.drawRectangle({
    x: MARGIN,
    y: y - 85,
    width: CONTENT_WIDTH,
    height: 90,
    color: rgb(0.96, 0.97, 0.99),
    borderColor: rgb(0.8, 0.85, 0.92),
    borderWidth: 1,
  });

  p1.drawText("[Document Viewport Container] (relative, shadow-2xl, border)", {
    x: MARGIN + 12,
    y: y - 20,
    size: 9.5,
    font: fontBold,
    color: rgb(0.2, 0.3, 0.5),
  });
  p1.drawText(" |-- Layer 0: <canvas ref={pdfCanvasRef} className='block' /> (PDF Bitmap)", {
    x: MARGIN + 20,
    y: y - 40,
    size: 9,
    font: fontMono,
    color: rgb(0.3, 0.3, 0.3),
  });
  p1.drawText(" |-- Layer 1: <div className='absolute top-0 left-0 z-10'><canvas ref={fabricCanvasElRef} /></div>", {
    x: MARGIN + 20,
    y: y - 60,
    size: 9,
    font: fontMono,
    color: rgb(0.1, 0.45, 0.2),
  });
  p1.drawText("             (Fabric.js Transparent Interactive Annotation Overlay)", {
    x: MARGIN + 40,
    y: y - 75,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 105;

  // Section 2
  p1.drawText("2. Key State and References Introduced", {
    x: MARGIN,
    y: y,
    size: 14,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.5),
  });
  y -= 18;

  const stateItems = [
    ["canvasSize", "{ width, height }", "Stores current pixel dimensions of the PDF page."],
    ["pdfCanvasRef", "HTMLCanvasElement", "Direct reference to the bottom PDF bitmap canvas."],
    ["fabricCanvasElRef", "HTMLCanvasElement", "Direct reference to the upper Fabric canvas element."],
    ["fabricInstanceRef", "FabricCanvas", "Active instance of Fabric Canvas for imperative operations."],
    ["fabricCanvas", "FabricCanvas (State)", "Allows the Settings component to trigger reactive UI re-renders."],
    ["pageAnnotationsRef", "Record<number, any>", "Dictionary holding serialized JSON of shapes per page."],
  ];

  for (const [name, type, desc] of stateItems) {
    p1.drawText(`- ${name}`, { x: MARGIN + 5, y: y, size: 9.5, font: fontBold, color: rgb(0.1, 0.3, 0.6) });
    p1.drawText(`(${type}) : ${desc}`, { x: MARGIN + 120, y: y, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    y -= 16;
  }

  // ================= PAGE 2 =================
  let p2 = createPage(2, 3);
  y = PAGE_HEIGHT - 65;

  p2.drawText("3. Zoom Synchronization & Mathematical Precision", {
    x: MARGIN,
    y: y,
    size: 14,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.5),
  });
  y -= 20;

  const text2 = [
    "Problem: When scaling a PDF document using PDF.js, only the PDF background was resizing.",
    "Fabric shapes stayed the exact same pixel size and drifted out of position relative to the document.",
    "",
    "Solution: Fabric.js native setZoom(scale) method:",
    "In PDF.js, document coordinates are calculated in unscaled typographical points (72 pt = 1 inch):",
    "                 viewport_pixel = pdf_point * scale",
    "",
    "By setting Fabric internal zoom equal to the PDF scale factor (fabricCanvas.setZoom(scale)),",
    "Fabric coordinates become 1:1 with PDF points:",
    "                 fabric_pixel = fabric_point * scale",
    "",
    "Result: Every drawn rectangle, circle, and text element stays permanently glued to its exact spot",
    "on the PDF document at 50%, 100%, 200%, or any custom zoom level.",
  ];

  for (const line of text2) {
    p2.drawText(line, { x: MARGIN + 5, y: y, size: 9.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    y -= 14;
  }
  y -= 10;

  // Code Block for Zoom
  p2.drawRectangle({
    x: MARGIN,
    y: y - 105,
    width: CONTENT_WIDTH,
    height: 105,
    color: rgb(0.14, 0.16, 0.2),
  });

  const zoomCode = [
    "// Synchronizing Fabric Dimensions & Zoom upon PDF page render:",
    "const viewport = page.getViewport({ scale });",
    "pdfCanvas.width = viewport.width;",
    "pdfCanvas.height = viewport.height;",
    "setCanvasSize({ width: viewport.width, height: viewport.height });",
    "",
    "if (fabricInstanceRef.current) {",
    "  fabricInstanceRef.current.setDimensions({ width: viewport.width, height: viewport.height });",
    "  fabricInstanceRef.current.setZoom(scale); // Scales all elements in sync with PDF",
    "  fabricInstanceRef.current.renderAll();",
    "}"
  ];

  let codeY = y - 16;
  for (const line of zoomCode) {
    p2.drawText(line, { x: MARGIN + 12, y: codeY, size: 8.5, font: fontMono, color: rgb(0.85, 0.9, 0.95) });
    codeY -= 9.5;
  }
  y -= 125;

  // Section 4
  p2.drawText("4. Per-Page Annotation Persistence", {
    x: MARGIN,
    y: y,
    size: 14,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.5),
  });
  y -= 20;

  const text4 = [
    "In multi-page documents, annotations created on Page 1 must not appear on Page 2.",
    "We implemented page-level serialization and restoration:",
    "",
    "1. When pageNumber changes:",
    "   - Serialize current shapes to JSON: pageAnnotationsRef.current[prevPage] = fCanvas.toJSON()",
    "   - Clear the canvas: fCanvas.clear()",
    "   - If annotations exist for the new page: fCanvas.loadFromJSON(savedData)",
    "   - Immediately re-apply fCanvas.setZoom(scale) to preserve the active zoom level.",
  ];

  for (const line of text4) {
    p2.drawText(line, { x: MARGIN + 5, y: y, size: 9.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    y -= 14;
  }

  // ================= PAGE 3 =================
  let p3 = createPage(3, 3);
  y = PAGE_HEIGHT - 65;

  p3.drawText("5. Integrated Toolbars & Shape Creation Handlers", {
    x: MARGIN,
    y: y,
    size: 14,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.5),
  });
  y -= 20;

  const tools = [
    ["addRectangle()", "Creates a Rect({ width: 120, height: 80, fill: '#3b82f6' }) and sets it active."],
    ["addCircle()", "Creates a FabricCircle({ radius: 50, fill: '#ef4444' }) and sets it active."],
    ["addText()", "Creates an editable Textbox({ fontSize: 22, fill: '#1f2937' }) and sets it active."],
  ];

  for (const [fn, desc] of tools) {
    p3.drawText(`- ${fn}`, { x: MARGIN + 5, y: y, size: 9.5, font: fontBold, color: rgb(0.1, 0.3, 0.6) });
    p3.drawText(`: ${desc}`, { x: MARGIN + 95, y: y, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    y -= 16;
  }
  y -= 10;

  p3.drawText("6. Properties Panel & UI Layout", {
    x: MARGIN,
    y: y,
    size: 14,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.5),
  });
  y -= 20;

  const uiItems = [
    ["Left Floating Palette", "Fixed pill on the left (Square, Circle, Type icons) to add shapes anytime."],
    ["Right Properties Panel", "Mounts <Settings canvas={fabricCanvas} />. Selecting any shape opens controls"],
    ["", "for width, height, circle diameter, text font size, and color picker."],
    ["Bottom-Right Zoom Bar", "Zoom Out, Percentage display (click to reset), Zoom In, and Reset buttons."],
  ];

  for (const [title, desc] of uiItems) {
    if (title) {
      p3.drawText(`- ${title}:`, { x: MARGIN + 5, y: y, size: 9.5, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      p3.drawText(desc, { x: MARGIN + 140, y: y, size: 9, font: fontRegular, color: rgb(0.25, 0.25, 0.25) });
    } else {
      p3.drawText(desc, { x: MARGIN + 140, y: y, size: 9, font: fontRegular, color: rgb(0.25, 0.25, 0.25) });
    }
    y -= 15;
  }
  y -= 15;

  // Summary box
  p3.drawRectangle({
    x: MARGIN,
    y: y - 100,
    width: CONTENT_WIDTH,
    height: 100,
    color: rgb(0.94, 0.98, 0.94),
    borderColor: rgb(0.6, 0.85, 0.6),
    borderWidth: 1,
  });

  p3.drawText("Architecture Verification & Quality Checklist", {
    x: MARGIN + 12,
    y: y - 20,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.5, 0.2),
  });

  const checklist = [
    "[x] Dual-Layer Alignment: PDF canvas and Fabric overlay are pixel-aligned at (0, 0).",
    "[x] Synchronized Zoom: fabricCanvas.setZoom(scale) guarantees 1:1 vector scaling.",
    "[x] Zero TypeScript Errors: Passes npx tsc --noEmit with 0 issues.",
    "[x] Dynamic Cleanup: All render tasks and Fabric instances are safely disposed on unmount.",
  ];

  let checkY = y - 38;
  for (const item of checklist) {
    p3.drawText(item, { x: MARGIN + 15, y: checkY, size: 8.5, font: fontRegular, color: rgb(0.15, 0.35, 0.15) });
    checkY -= 14;
  }

  // Save PDF
  const pdfBytes = await doc.save();
  const outputPath = path.resolve(__dirname, "../../Fabric_Canvas_Integration_Guide.pdf");
  fs.writeFileSync(outputPath, pdfBytes);
  console.log("PDF generated successfully at:", outputPath);
}

generatePDF().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
