import React, { useState, useEffect } from "react";
import { AiOutlineCopy, AiOutlineSave, AiOutlinePicture } from "react-icons/ai";
import { FiSettings, FiLogIn, FiStar } from "react-icons/fi";
import { MdColorLens } from "react-icons/md";
import Image from "next/image";
import { Layout, PlotlyHTMLElement } from "plotly.js";
import { SketchPicker } from "react-color";

interface HeaderProps {
  plotRef: React.RefObject<HTMLDivElement>;
  source: string;
  colors: string[];
  setColors: (colors: string[]) => void;
}

// Custom type for Extended Plotly HTMLElement
type ExtendedPlotlyHTMLElement = PlotlyHTMLElement & {
  layout: Partial<Layout> & { annotations?: Array<Partial<Plotly.Annotations>> };
};

const Header: React.FC<HeaderProps> = ({ plotRef, source, colors, setColors }) => {
  const [Plotly, setPlotly] = useState<typeof import("plotly.js-dist-min") | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Load Plotly dynamically once
  useEffect(() => {
    const loadPlotly = async () => {
      try {
        const plotlyModule = await import("plotly.js-dist-min");
        setPlotly(plotlyModule);
      } catch (error) {
        console.error("Failed to load Plotly:", error);
      }
    };

    loadPlotly();
  }, []);

  const [isColorPanelOpen, setIsColorPanelOpen] = useState(false);

  const toggleColorPanel = () => {
    setIsColorPanelOpen(!isColorPanelOpen);
  };

  const updateColor = (index: number, newColor: string) => {
    const updatedColors = [...colors];
    updatedColors[index] = newColor;
    setColors(updatedColors);
  };

  const toggleProfilePopup = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const getExportLayout = (originalLayout: Partial<Layout>, source: string): Partial<Layout> => ({
    ...originalLayout,
    xaxis: {
      ...originalLayout.xaxis,
      rangeslider: { visible: false },
    },
    sliders: [],
    updatemenus: [],
    showlegend: true,
    legend: {
      orientation: "h",
      yanchor: "top",
      y: -0.1,
      xanchor: "center",
      x: 0.5,
      font: { size: 13, color: "white" },
    },
    annotations: [
      {
        text: `<b>${source}</b> <br>Date: ${new Date().toLocaleDateString()}`,
        font: { size: 14, color: "white" },
        showarrow: false,
        xref: "paper",
        yref: "paper",
        x: 0.99,
        y: -0.1,
        xanchor: "right",
        yanchor: "bottom",
        bgcolor: "#1f2c56",
        bordercolor: "white",
        borderwidth: 1,
        borderpad: 6,
      },
    ],
  });

  const copyPlot = async () => {
    if (!Plotly || !plotRef.current) {
      alert("Plotly or plot reference not available.");
      return;
    }

    const plotElement = plotRef.current as unknown as ExtendedPlotlyHTMLElement;
    const originalLayout = plotElement.layout || {};

    try {
      const exportLayout = getExportLayout(originalLayout, source);

      await Plotly.update(plotRef.current, {}, exportLayout);

      const imageDataUrl = await Plotly.toImage(plotRef.current, {
        format: "png",
        width: 1600,
        height: 1200,
      });

      if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        const blob = await (await fetch(imageDataUrl)).blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
      } else {
        alert("Your browser does not support Clipboard API for images.");
      }
    } catch (error) {
      console.error("Failed to copy plot:", error);
      alert("Failed to copy plot. Please try again.");
    }
  };

  const savePlot = async () => {
    if (!Plotly || !plotRef.current) {
      alert("Plotly or plot reference not available.");
      return;
    }
  
    const plotElement = plotRef.current as unknown as ExtendedPlotlyHTMLElement;
    const originalLayout = plotElement.layout || {};
  
    try {
      const exportLayout = getExportLayout(originalLayout, source);
      await Plotly.update(plotRef.current, {}, exportLayout);
  
      await Plotly.downloadImage(plotRef.current, {
        format: "png",
        width: 1600,
        height: 1200,
        filename: "plot",
      });
    } catch (error) {
      console.error("Failed to save plot:", error);
      alert("Failed to save plot. Please try again.");
    } finally {
      await Plotly.relayout(plotRef.current, originalLayout);
    }
  };  

  return (
    <header className="bg-panel text-white h-32 flex items-center p-6 shadow-lg relative">
      <div className="text-3xl font-semibold mr-auto">Dashboard</div>

      <div className="flex flex-grow justify-around items-center gap-4">
        <div
          className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors"
          onClick={copyPlot}
        >
          <AiOutlineCopy className="h-8 w-8 text-borderBlue mb-2" />
          <span className="text-sm text-center">Copy</span>
        </div>

        <div
          className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors"
          onClick={savePlot}
        >
          <AiOutlineSave className="h-8 w-8 text-borderBlue mb-2" />
          <span className="text-sm text-center">Save</span>
        </div>

        <div className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors">
          <AiOutlinePicture className="h-8 w-8 text-borderBlue mb-2" />
          <span className="text-sm text-center">Add Logo</span>
        </div>

        <div className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors">
          <FiSettings className="h-8 w-8 text-borderBlue mb-2" />
          <span className="text-sm text-center">Change Theme</span>
        </div>

        <div className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors"
          onClick={toggleColorPanel}>
          <MdColorLens className="h-8 w-8 text-borderBlue mb-2" />
          <span className="text-sm text-center">Customize Colors</span>
        </div>

        <div className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors">
          <FiLogIn className="h-8 w-8 text-borderBlue mb-2" />
          <span className="text-sm text-center">Sign In</span>
        </div>

        <div className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors">
          <FiStar className="h-8 w-8 text-borderBlue mb-2" />
          <span className="text-sm text-center">Upgrade</span>
        </div>
      </div>

      <div className="ml-6 relative">
        <button
          onClick={toggleProfilePopup}
          className="w-16 h-16 rounded-full overflow-hidden border-2 border-white focus:outline-none focus:ring-2 focus:ring-blue-400 hover:scale-105 transition-transform"
        >
          <Image
            src="https://via.placeholder.com/150"
            alt="Profile"
            width={150}
            height={150}
            className="w-full h-full object-cover"
          />
        </button>

        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg p-4 z-50">
            <p className="text-lg font-semibold mb-2">John Doe</p>
            <p className="text-sm mb-4">johndoe@example.com</p>
            <button
              className="w-full bg-blue-500 text-white py-1 rounded-md hover:bg-blue-600 transition"
              onClick={() => alert("Logging out...")}
            >
              Log Out
            </button>
          </div>
        )}

        {isColorPanelOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative bg-white text-black rounded-lg shadow-lg p-8 w-[80%] h-[80%]">
              {/* Close Button */}
              <button
                onClick={() => setIsColorPanelOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
              >
                &times;
              </button>

              <h3 className="text-xl font-semibold mb-6">Customize Colors</h3>

              {/* Grid Layout for Colors */}
              <div className="grid grid-cols-4 gap-6 overflow-y-auto h-[calc(100%-6rem)]">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 p-4 border rounded-lg shadow"
                  >
                    {/* Color Preview */}
                    <span
                      className="w-12 h-12 rounded-full border"
                      style={{ backgroundColor: color }}
                    />

                    {/* Hex Code Input */}
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="border p-2 rounded-md w-full text-center"
                    />

                    {/* Color Picker */}
                    <div className="w-full flex justify-center">
                      <SketchPicker
                        color={color}
                        onChangeComplete={(newColor) => updateColor(index, newColor.hex)}
                        disableAlpha
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Apply Button */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    // Logic to apply changes can go here
                    setIsColorPanelOpen(false);
                  }}
                  className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
