import { useState, useEffect } from "react";
import { Canvas, FabricObject } from "fabric";

interface SettingsProps {
  canvas: Canvas | null;
}

const Settings = ({ canvas }: SettingsProps) => {
  const [selectedObject, setSelectedObject] = useState<
    FabricObject | any | null
  >(null);
  const [width, setWidth] = useState<number | string>("");
  const [height, setHeight] = useState<number | string>("");
  const [diameter, setDiameter] = useState<number | string>("");
  const [fontSize, setFontSize] = useState<number | string>("");
  const [color, setColor] = useState<string>("#3b82f6");

  useEffect(() => {
    if (canvas) {
      canvas.on("selection:created", (e: any) => {
        handleObjectSelection(e.selected?.[0]);
      });
      canvas.on("selection:updated", (e: any) => {
        handleObjectSelection(e.selected?.[0]);
      });
      canvas.on("selection:cleared", () => {
        setSelectedObject(null);
        clearSetting();
      });
      canvas.on("object:modified", (e: any) => {
        handleObjectSelection(e.target);
      });
      canvas.on("object:scaling", (e: any) => {
        handleObjectSelection(e.target);
      });
    }
  }, [canvas]);

  const handleObjectSelection = (object: any) => {
    if (!object) return;

    setSelectedObject(object);

    const fillColor = typeof object.fill === "string" ? object.fill : "#3b82f6";
    setColor(fillColor);

    if (object.type === "rect") {
      setWidth(Math.round(object.width * (object.scaleX || 1)));
      setHeight(Math.round(object.height * (object.scaleY || 1)));
      setDiameter("");
      setFontSize("");
    } else if (object.type === "circle") {
      setDiameter(Math.round(object.radius * 2 * (object.scaleX || 1)));
      setHeight("");
      setWidth("");
      setFontSize("");
    } else if (
      object.type === "textbox" ||
      object.type === "text" ||
      object.type === "i-text"
    ) {
      setFontSize(Math.round(object.fontSize || 20));
      setWidth("");
      setHeight("");
      setDiameter("");
    }
  };

  const clearSetting = () => {
    setColor("#3b82f6");
    setDiameter("");
    setHeight("");
    setWidth("");
    setFontSize("");
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setWidth(isNaN(initValue) ? "" : initValue);

    if (
      selectedObject &&
      selectedObject.type === "rect" &&
      !isNaN(initValue) &&
      initValue >= 0
    ) {
      selectedObject.set({ width: initValue / (selectedObject.scaleX || 1) });
      canvas?.renderAll();
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setFontSize(isNaN(initValue) ? "" : initValue);

    if (
      selectedObject &&
      (selectedObject.type === "textbox" ||
        selectedObject.type === "text" ||
        selectedObject.type === "i-text") &&
      !isNaN(initValue) &&
      initValue > 0
    ) {
      selectedObject.set({ fontSize: initValue });
      canvas?.renderAll();
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setHeight(isNaN(initValue) ? "" : initValue);

    if (
      selectedObject &&
      selectedObject.type === "rect" &&
      !isNaN(initValue) &&
      initValue >= 0
    ) {
      selectedObject.set({ height: initValue / (selectedObject.scaleY || 1) });
      canvas?.renderAll();
    }
  };

  const handleDiameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setDiameter(isNaN(initValue) ? "" : initValue);

    if (
      selectedObject &&
      selectedObject.type === "circle" &&
      !isNaN(initValue) &&
      initValue >= 0
    ) {
      selectedObject.set({
        radius: initValue / 2 / (selectedObject.scaleX || 1),
      });
      canvas?.renderAll();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setColor(value);

    if (selectedObject) {
      selectedObject.set({ fill: value });
      canvas?.renderAll();
    }
  };

  if (!selectedObject) {
    return null;
  }

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 bg-neutral-900/95 backdrop-blur-md text-white p-5 rounded-xl border border-neutral-700 shadow-2xl min-w-[220px] text-left z-50">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          {selectedObject.type === "rect"
            ? "Rectangle"
            : selectedObject.type === "circle"
              ? "Circle"
              : selectedObject.type === "textbox" ||
                  selectedObject.type === "text" ||
                  selectedObject.type === "i-text"
                ? "Text"
                : "Shape"}{" "}
          Properties
        </span>
      </div>

      {selectedObject.type === "rect" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-neutral-400 font-medium">
              Width (px)
            </label>
            <input
              type="number"
              value={width}
              onChange={handleWidthChange}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="e.g. 100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-neutral-400 font-medium">
              Height (px)
            </label>
            <input
              type="number"
              value={height}
              onChange={handleHeightChange}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="e.g. 60"
            />
          </div>
        </div>
      )}

      {selectedObject.type === "circle" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-neutral-400 font-medium">
            Diameter (px)
          </label>
          <input
            type="number"
            value={diameter}
            onChange={handleDiameterChange}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="e.g. 100"
          />
        </div>
      )}

      {(selectedObject.type === "textbox" ||
        selectedObject.type === "text" ||
        selectedObject.type === "i-text") && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-neutral-400 font-medium">
            Font Size (px)
          </label>
          <input
            type="number"
            value={fontSize}
            onChange={handleFontSizeChange}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="e.g. 20"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5 pt-1">
        <label className="text-xs text-neutral-400 font-medium">Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color.startsWith("#") ? color : "#3b82f6"}
            onChange={handleColorChange}
            className="w-9 h-9 rounded cursor-pointer bg-transparent border-0 p-0"
          />
          <input
            type="text"
            value={color}
            onChange={handleColorChange}
            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-md px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#3b82f6"
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
