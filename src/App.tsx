import { Controls } from "./components/controls";
import { useState } from "react";
import { Canvas } from "./components/canvas";
import { MainPage } from "./components/mainPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export function App() {
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) =>
      totalPages > 0 ? Math.min(totalPages, prev + 1) : prev + 1,
    );
  };

  const handleUrl = (fileUrl: string) => {
    setUrl(fileUrl);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage handleUrl={handleUrl} />} />
        <Route
          path="/Editing"
          element={
            <div className="min-h-screen bg-gray-100 flex flex-col items-center disabled:">
              <Controls
                pageNumber={pageNumber}
                totalPages={totalPages}
                handlePrevPage={handlePrevPage}
                handleNextPage={handleNextPage}
              />
              <main className="w-full flex-1 flex justify-center items-start p-6 overflow-auto">
                <Canvas
                  pageNumber={pageNumber}
                  pdfUrl={url || undefined}
                  onLoadSuccess={(num) => setTotalPages(num)}
                />
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
