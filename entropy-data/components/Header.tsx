"use client";

import React, { useState, useEffect } from "react";
import { AiOutlineCopy, AiOutlineSave, AiOutlinePicture } from "react-icons/ai";
import { FiSettings, FiLogIn, FiStar, FiDownload } from "react-icons/fi";
import { MdColorLens } from "react-icons/md";
import Image from "next/image";
import { Layout, PlotlyHTMLElement } from "plotly.js";
import { SketchPicker } from "react-color";

interface HeaderProps {
  plotRef: React.RefObject<HTMLDivElement>;
  source: string;
  colors: string[];
  setColors: (colors: string[]) => void;
  sourceImage: string;
  setSourceImage: (image: string) => void;
}

type ExtendedPlotlyHTMLElement = PlotlyHTMLElement & {
  layout: Partial<Layout> & { annotations?: Array<Partial<Plotly.Annotations>> };
};

const Header: React.FC<HeaderProps> = ({
  plotRef,
  source,
  colors,
  setColors,
  sourceImage,
  setSourceImage,
}) => {
  const [Plotly, setPlotly] = useState<typeof import("plotly.js-dist-min") | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isColorPanelOpen, setIsColorPanelOpen] = useState(false);
  const [isLogoPanelOpen, setIsLogoPanelOpen] = useState(false);
  const [newSourceImage, setNewSourceImage] = useState(sourceImage);
  const [isSaving, setIsSaving] = useState(false); // Added loading state

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

  const toggleLogoPanel = () => {
    setNewSourceImage(sourceImage);
    setIsLogoPanelOpen(!isLogoPanelOpen);
  };

  const applyLogoChange = () => {
    setSourceImage(newSourceImage);
    setIsLogoPanelOpen(false);
  };

  const getExportLayout = (originalLayout: Partial<Layout>, source: string): Partial<Layout> => ({
    ...originalLayout,
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
    showlegend: true,
    legend: {
      orientation: "h",
      yanchor: "top",
      y: -0.1,
      xanchor: "center",
      x: 0.5,
      font: { size: 13, color: "white" },
    },
  });

  const savePlotWithKaleido = async (format: "png" | "jpeg" | "svg") => {
    if (!Plotly || !plotRef.current) {
      alert("Plotly or plot reference not available.");
      return;
    }

    setIsSaving(true);

    try {
      const plotElement = plotRef.current as unknown as ExtendedPlotlyHTMLElement;
      const originalLayout = plotElement.layout || {};
      const exportLayout = getExportLayout(originalLayout, source);

      // Construct the figure JSON that Kaleido can use
      const plotData = plotElement.data;
      const layout = exportLayout;

      // Define width, height, scale for ultra high resolution
      const width = 2000;
      const height = 1600;
      const scale = 3;

      // Make POST request to the Kaleido export endpoint (needs to be implemented server-side)
      const response = await fetch("/api/kaleidoExport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plotData,
          layout,
          format,
          width,
          height,
          scale,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to export plot${format === 'svg' ? ' as SVG' : ''}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error("Failed to parse error response as JSON:", parseError);
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = format === "svg" ? "plot_high_res.svg" : "plot_high_res.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to export plot:", error.message);
        alert(`Failed to export plot: ${error.message}`);
      } else {
        console.error("Failed to export plot:", error);
        alert("Failed to export plot due to an unexpected error.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const copyPlotWithKaleido = async () => {
    if (!Plotly || !plotRef.current) {
      alert("Plotly or plot reference not available.");
      return;
    }

    try {
      const plotElement = plotRef.current as unknown as ExtendedPlotlyHTMLElement;
      const originalLayout = plotElement.layout || {};
      const exportLayout = getExportLayout(originalLayout, source);

      const plotData = plotElement.data;
      const layout = exportLayout;

      const width = 2000;
      const height = 1600;
      const scale = 3;

      const response = await fetch("/api/kaleidoExport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plotData,
          layout,
          format: "png",
          width,
          height,
          scale,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to export plot";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error("Failed to parse error response as JSON:", parseError);
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const imageDataUrl = URL.createObjectURL(blob);

      if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        const fetchedBlob = await (await fetch(imageDataUrl)).blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": fetchedBlob }),
        ]);
        alert("Plot copied to clipboard.");
      } else {
        alert("Your browser does not support Clipboard API for images.");
      }

      window.URL.revokeObjectURL(imageDataUrl);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to copy plot:", error.message);
        alert(`Failed to copy plot: ${error.message}`);
      } else {
        console.error("Failed to copy plot:", error);
        alert("Failed to copy plot due to an unexpected error.");
      }
    }
  };

  const handleApplyColors = () => {
    setIsColorPanelOpen(false);
  };

  return (
    <header className="bg-panel text-white h-32 flex items-center p-6 shadow-lg relative">
      <div className="text-3xl font-semibold mr-auto">Dashboard</div>

      <div className="flex flex-grow justify-around items-center gap-4">
        {/* Save Plot Button (PNG/JPEG using Kaleido) */}
        <div
          className={`flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors ${
            isSaving ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={isSaving ? undefined : () => savePlotWithKaleido("png")}
        >
          {isSaving ? (
            <span className="loader h-8 w-8 mb-2"></span>
          ) : (
            <AiOutlineSave className="h-8 w-8 text-borderBlue mb-2" />
          )}
          <span className="text-sm text-center">Save</span>
        </div>

        {/* Copy Plot Button (PNG using Kaleido) */}
        <div
          className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors"
          onClick={copyPlotWithKaleido}
        >
          <AiOutlineCopy className="h-8 w-8 text-borderBlue mb-2" />
          <span className="text-sm text-center">Copy</span>
        </div>

        {/* Add Logo Button */}
        <div
          className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors"
          onClick={toggleLogoPanel}
        >
          <AiOutlinePicture className="h-8 w-8 text-borderBlue mb-2" />
          <span className="text-sm text-center">Add Logo</span>
        </div>

        {/* Change Theme Button */}
        <div className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors">
          <FiSettings className="h-8 w-8 text-borderBlue mb-2" />
          <span className="text-sm text-center">Change Theme</span>
        </div>

        {/* Customize Colors Button */}
        <div
          className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors"
          onClick={toggleColorPanel}
        >
          <MdColorLens className="h-8 w-8 text-borderBlue mb-2" />
          <span className="text-sm text-center">Customize Colors</span>
        </div>

        {/* Sign In Button */}
        <div className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors">
          <FiLogIn className="h-8 w-8 text-borderBlue mb-2" />
          <span className="text-sm text-center">Sign In</span>
        </div>

        {/* Upgrade Button */}
        <div className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors">
          <FiStar className="h-8 w-8 text-borderBlue mb-2" />
          <span className="text-sm text-center">Upgrade</span>
        </div>

        {/* Download SVG Button (using Kaleido) */}
        <div
          className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors"
          onClick={() => savePlotWithKaleido("svg")}
        >
          <FiDownload className="h-8 w-8 text-borderBlue mb-2" />
          <span className="text-sm text-center">Download SVG</span>
        </div>
      </div>

      {/* Profile Section */}
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

        {/* Color Panel Modal */}
        {isColorPanelOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative bg-white text-black rounded-lg shadow-lg p-8 w-[80%] h-[80%]">
              <button
                onClick={() => setIsColorPanelOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
              >
                &times;
              </button>

              <h3 className="text-xl font-semibold mb-6">Customize Colors</h3>

              <div className="grid grid-cols-4 gap-6 overflow-y-auto h-[calc(100%-6rem)]">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 p-4 border rounded-lg shadow"
                  >
                    <span
                      className="w-12 h-12 rounded-full border"
                      style={{ backgroundColor: color }}
                    />

                    <input
                      type="text"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="border p-2 rounded-md w-full text-center"
                    />

                    <div className="w-full flex justify-center">
                      <SketchPicker
                        color={color}
                        onChangeComplete={(newColor) =>
                          updateColor(index, newColor.hex)
                        }
                        disableAlpha
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleApplyColors}
                  className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logo Panel Modal */}
        {isLogoPanelOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative bg-white text-black rounded-lg shadow-lg p-8 w-[80%] max-w-md">
              <button
                onClick={toggleLogoPanel}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
              >
                &times;
              </button>

              <h3 className="text-xl font-semibold mb-6">Update Logo</h3>
              <div className="mb-4">
                <label
                  htmlFor="logo-url"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Logo URL:
                </label>
                <input
                  id="logo-url"
                  type="text"
                  value={newSourceImage}
                  onChange={(e) => setNewSourceImage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter logo image URL"
                />
              </div>

              <div className="flex justify-center mb-6">
                <Image
                  src={newSourceImage || "https://via.placeholder.com/150"}
                  alt="Logo Preview"
                  width={400}
                  height={400}
                  className="rounded-lg border"
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={applyLogoChange}
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
