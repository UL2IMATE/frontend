import { Controls } from "./components/controls";
import { useState } from "react";
import { Canvas } from "./components/canvas";

export function App() {
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => (totalPages > 0 ? Math.min(totalPages, prev + 1) : prev + 1));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <Controls
        pageNumber={pageNumber}
        totalPages={totalPages}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
      />
      <main className="w-full flex-1 flex justify-center items-start p-6 overflow-auto">
        <Canvas
          pageNumber={pageNumber}
          pdfUrl="/sample.pdf"
          onLoadSuccess={(num) => setTotalPages(num)}
        />
      </main>
    </div>
  );
}

export default App;
