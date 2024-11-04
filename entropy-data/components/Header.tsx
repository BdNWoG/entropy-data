// components/Header.tsx
"use client";

import { useState } from "react";
import { AiOutlineCopy, AiOutlineSave, AiOutlinePicture } from "react-icons/ai";
import { FiSettings, FiLogIn, FiStar } from "react-icons/fi";
import { MdColorLens } from "react-icons/md";
import Plotly from "plotly.js-dist-min";

interface HeaderProps {
  plotRef: React.RefObject<HTMLDivElement>; // Accept plotRef as a prop
}

const Header: React.FC<HeaderProps> = ({ plotRef }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const actions = [
    { icon: AiOutlineCopy, label: "Copy", onClick: copyPlot },
    { icon: AiOutlineSave, label: "Save", onClick: savePlot },
    { icon: AiOutlinePicture, label: "Add Logo" },
    { icon: FiSettings, label: "Change Theme" },
    { icon: MdColorLens, label: "Customize Colors" },
    { icon: FiLogIn, label: "Sign In" },
    { icon: FiStar, label: "Upgrade" },
  ];

  const toggleProfilePopup = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Function to copy plot to clipboard
  async function copyPlot() {
    if (plotRef.current) {
      const imageDataUrl = await Plotly.toImage(plotRef.current, { format: "png", width: 800, height: 600 });
      try {
        const blob = await (await fetch(imageDataUrl)).blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        alert("Plot copied to clipboard!");
      } catch (error) {
        console.error("Failed to copy plot:", error);
      }
    }
  }

  // Function to save plot as an image
  async function savePlot() {
    if (plotRef.current) {
      try {
        await Plotly.downloadImage(plotRef.current, { format: "png", width: 800, height: 600, filename: "plot" });
      } catch (error) {
        console.error("Failed to save plot:", error);
      }
    }
  }

  return (
    <header className="bg-panel text-white h-32 flex items-center p-6 shadow-lg relative">
      <div className="text-3xl font-semibold mr-auto">Dashboard</div>

      <div className="flex flex-grow justify-around items-center gap-4">
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors"
            onClick={action.onClick}
          >
            <action.icon className="h-8 w-8 text-borderBlue mb-2" />
            <span className="text-sm text-center">{action.label}</span>
          </div>
        ))}
      </div>

      <div className="ml-6 relative">
        <button
          onClick={toggleProfilePopup}
          className="w-16 h-16 rounded-full overflow-hidden border-2 border-white focus:outline-none focus:ring-2 focus:ring-blue-400 hover:scale-105 transition-transform"
        >
          <img src="https://via.placeholder.com/150" alt="Profile" className="w-full h-full object-cover" />
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
