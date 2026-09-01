import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

type MainPageProps = {
  handleUrl?: (url: string) => void;
};

export const MainPage = ({ handleUrl }: MainPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex justify-center items-center bg-gray-100 h-96 max-w-lg w-full rounded-lg text-3xl flex-col gap-7 border-stone-800">
        <Upload className="size-30 text-slate-700" />
        <label className="rounded-3xl bg-slate-700 text-white px-8 py-3 text-lg font-medium hover:cursor-pointer hover:bg-slate-800 transition-all shadow-md">
          Browse PDF
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const fileUrl = URL.createObjectURL(file);
                console.log("Uploaded file URL:", fileUrl);
                handleUrl?.(fileUrl);
                navigate("/Editing");
              }
            }}
          />
        </label>

        <p className="text-mist-700 text-sm opacity-65">
          Drop PDF file to modify
        </p>
      </div>
    </div>
  );
};
