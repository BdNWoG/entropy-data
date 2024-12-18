"use client";

import React, { useState, useEffect } from "react";
import { AiOutlineCopy, AiOutlineSave, AiOutlinePicture } from "react-icons/ai";
import { FiSettings, FiLogIn, FiStar } from "react-icons/fi";
import { MdColorLens } from "react-icons/md";
import Image from "next/image";
import { Layout, PlotlyHTMLElement } from "plotly.js";
import { SketchPicker } from "react-color";
import { useSession, signIn, signOut } from "next-auth/react";

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
  const { data: session } = useSession();
  const [Plotly, setPlotly] = useState<typeof import("plotly.js-dist-min") | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isColorPanelOpen, setIsColorPanelOpen] = useState(false);
  const [isLogoPanelOpen, setIsLogoPanelOpen] = useState(false);
  const [newSourceImage, setNewSourceImage] = useState(sourceImage);
  const [isSaving, setIsSaving] = useState(false); // Loading state

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

  const getExportLayout = (originalLayout: Partial<Layout>, source: string): Partial<Layout> => {
    const scaleFactor = 2.0; // Scale factor for everything

    type Title = string | { text?: string; font?: Partial<Plotly.Font> };
  
    const scaleFont = (font?: Partial<Plotly.Font>) => {
      if (font && font.size) font.size = font.size * scaleFactor;
    };
  
    const normalizeTitle = (title: Title, defaultText: string) => {
      if (typeof title === "string") {
        return { text: title || defaultText, font: { size: 14, color: "white" } };
      } else {
        return {
          text: title?.text || defaultText,
          font: { ...title?.font, size: (title?.font?.size || 14), color: "white" },
        };
      }
    };
  
    const xTitle = normalizeTitle(originalLayout.xaxis?.title || "", "Date");
    const yTitle = normalizeTitle(originalLayout.yaxis?.title || "", "Value");
    const y2Title = normalizeTitle(originalLayout.yaxis2?.title || "", "Value (Right)");
    const mainTitle = normalizeTitle(originalLayout.title || "", "Main Title");
  
    scaleFont(mainTitle.font);
    scaleFont(xTitle.font);
    scaleFont(yTitle.font);
    scaleFont(y2Title.font);
  
    const layout: Partial<Layout> = {
      title: {
        text: mainTitle.text,
        font: mainTitle.font,
        xanchor: "center",
        x: 0.5, // Center the title
      },
      plot_bgcolor: "#030d1c",
      paper_bgcolor: "#030d1c",
      font: { size: 14 * scaleFactor, color: "white" },
      xaxis: {
        ...(originalLayout.xaxis || {}),
        title: xTitle,
        tickfont: { size: 14 * scaleFactor, color: "white" },
        showgrid: false,
        linecolor: "white",
        rangeslider: { visible: false },
      },
      yaxis: {
        ...(originalLayout.yaxis || {}),
        title: yTitle,
        tickfont: { size: 14 * scaleFactor, color: "white" },
        showgrid: true,
        gridcolor: "rgba(173, 176, 181, 0.6)",
        linecolor: "white",
      },
      yaxis2: {
        ...(originalLayout.yaxis2 || {}),
        overlaying: "y",
        side: "right",
        title: y2Title,
        tickfont: { size: 14 * scaleFactor, color: "white" },
        showgrid: false,
        linecolor: "white",
      },
      legend: {
        orientation: "h",
        yanchor: "top",
        y: -0.1,
        xanchor: "center",
        x: 0.5,
        font: { size: 14 * scaleFactor, color: "white" },
      },
      annotations: [
        {
          text: `<b>${source}</b> <br>Date: ${new Date().toLocaleDateString()}`,
          font: { size: 13 * scaleFactor, color: "white" },
          showarrow: false,
          xref: "paper",
          yref: "paper",
          x: 0.99,
          y: -0.15,
          xanchor: "right",
          yanchor: "bottom",
          bgcolor: "#1f2c56",
          bordercolor: "white",
          borderwidth: 1,
          borderpad: 4,
        },
      ],
      images: [
        {
          source: sourceImage,
          xref: "paper",
          yref: "paper",
          x: 0.5,
          y: 0.5,
          sizex: 0.3,
          sizey: 0.3,
          xanchor: "center",
          yanchor: "middle",
          opacity: 0.25,
          layer: "above",
        },
      ],
      margin: {
        l: 100 * scaleFactor,
        r: 100 * scaleFactor,
        t: 100 * scaleFactor,
        b: 100 * scaleFactor,
      },
    };
  
    return layout;
  };  

  const savePlotWithKaleido = async (format: "png" | "jpeg") => {
    if (!Plotly || !plotRef.current) {
      alert("Plotly or plot reference not available.");
      return;
    }

    setIsSaving(true);

    try {
      const plotElement = plotRef.current as unknown as ExtendedPlotlyHTMLElement;
      const originalLayout = plotElement.layout || {};
      const exportLayout = getExportLayout(originalLayout, source);

      const plotData = plotElement.data;
      const layout = exportLayout;

      // Define width, height, scale for ultra high resolution
      const width = 2000;
      const height = 1600;
      const scale = 3;

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
        let errorMessage = `Failed to export plot`;
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
      link.download = format === "jpeg" ? "plot_high_res.jpg" : "plot_high_res.png";
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
        {/* Save Plot Button (PNG by default) */}
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

        {/* Copy Plot Button (PNG) */}
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
        <div
          className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
          onClick={() => {
            if (session) {
              toggleProfilePopup();
            } else {
              signIn("google");
            }
          }}
        >
          {session && session.user?.image ? (
            <Image
              src={session.user.image}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full h-8 w-8 mb-2"
            />
          ) : (
            <FiLogIn className="h-8 w-8 text-borderBlue mb-2" />
          )}
          <span className="text-sm text-center">
            {session ? "Profile" : "Sign In"}
          </span>
        </div>

        {/* Upgrade Button */}
        {session && (
          <div
            className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
            onClick={() => {
              // Handle upgrade logic here
              // For example, navigate to a premium signup page
              window.location.href = "/upgrade"; // Replace with your upgrade route
            }}
          >
            <FiStar className="h-8 w-8 text-borderBlue mb-2" />
            <span className="text-sm text-center">Upgrade</span>
          </div>
        )}
      </div>

      {/* Profile Section */}
      {session && isProfileOpen && (
        <div className="absolute right-6 top-20 w-64 bg-white text-black rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center mb-4">
            <Image
              src={session.user.image || "https://via.placeholder.com/150"}
              alt="Profile"
              width={50}
              height={50}
              className="rounded-full"
            />
            <div className="ml-4">
              <p className="text-lg font-semibold">{session.user.name}</p>
              <p className="text-sm text-gray-600">{session.user.email}</p>
              <p className="text-sm text-gray-600 capitalize">
                Tier: {session.user.tier}
              </p>
            </div>
          </div>
          <button
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
            onClick={() => {
              signOut();
              setIsProfileOpen(false);
            }}
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
                        onChangeComplete={(newColor) => updateColor(index, newColor.hex)}
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
    </header>
  );
};

export default Header;
