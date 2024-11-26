import { useState, useEffect } from "react";
import { AiOutlineCopy, AiOutlineSave, AiOutlinePicture } from "react-icons/ai";
import { FiSettings, FiLogIn, FiStar } from "react-icons/fi";
import { MdColorLens } from "react-icons/md";
import Image from "next/image";
import { Layout, PlotlyHTMLElement } from "plotly.js";

interface HeaderProps {
  plotRef: React.RefObject<HTMLDivElement>;
  source: string;
}

// Custom type for Extended Plotly HTMLElement
type ExtendedPlotlyHTMLElement = PlotlyHTMLElement & {
  layout: Partial<Layout> & { annotations?: Array<Partial<Plotly.Annotations>> };
};

const Header: React.FC<HeaderProps> = ({ plotRef, source }) => {
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

  const toggleProfilePopup = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const copyPlot = async () => {
    if (!Plotly || !plotRef.current) {
      alert("Plotly or plot reference not available.");
      return;
    }

    try {
      const imageDataUrl = await Plotly.toImage(plotRef.current, {
        format: "png",
        width: 800,
        height: 600,
      });

      if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        const blob = await (await fetch(imageDataUrl)).blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        alert("Plot copied to clipboard!");
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
  
    // Safely cast the element to ExtendedPlotlyHTMLElement
    const plotElement = plotRef.current as unknown as ExtendedPlotlyHTMLElement;
    const originalLayout = plotElement.layout || {};
  
    try {
      const downloadLayout: Partial<Layout> = {
        ...originalLayout,
        // Remove the range slider
        xaxis: {
          ...originalLayout.xaxis,
          rangeslider: {
            visible: false, // Disable the range slider
          },
        },
        sliders: [], // Ensure any other sliders are removed
        updatemenus: [], // Remove any interactive menus
        showlegend: true,
        legend: {
          orientation: "h",
          yanchor: "top",
          y: -0.5, // Move the legend up slightly
          xanchor: "center",
          x: 0.5,
          font: { size: 14, color: "white" }, // Increased legend font size
        },
        annotations: [
          // Add updated source annotation
          {
            text: `<b>${source}</b> <br>Date: ${new Date().toLocaleDateString()}`,
            font: { size: 14, color: "white" }, // Increased source font size
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
            borderpad: 6, // Added padding for better aesthetics
          },
        ],
      };
  
      // Apply the new layout for download
      await Plotly.update(plotRef.current, {}, downloadLayout);
  
      // Download the image
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
      // Restore the original layout
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

        <div className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors">
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
      </div>
    </header>
  );
};

export default Header;
