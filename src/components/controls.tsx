type ControlsProps = {
  pageNumber: number;
  totalPages: number;
  handlePrevPage: () => void;
  handleNextPage: () => void;
};

export function Controls({
  pageNumber,
  totalPages,
  handlePrevPage,
  handleNextPage,
}: ControlsProps) {
  return (
    <div className="w-full flex p-4 bg-gray-800 text-white justify-center items-center gap-6 shadow-md sticky top-0 z-10">
      <button
        onClick={handlePrevPage}
        disabled={pageNumber <= 1}
        className="bg-white text-black px-4 py-1.5 rounded font-medium hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
      >
        Prev Page
      </button>

      <span className="text-white font-medium text-sm sm:text-base select-none">
        Page {pageNumber} {totalPages > 0 ? `of ${totalPages}` : ""}
      </span>

      <button
        onClick={handleNextPage}
        disabled={totalPages > 0 && pageNumber >= totalPages}
        className="bg-white text-black px-4 py-1.5 rounded font-medium hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
      >
        Next Page
      </button>
    </div>
  );
}
