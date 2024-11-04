// components/Footer.tsx
import React from "react";
import { Customization } from "../components/types";

interface FooterProps {
    customization: Customization;
    setCustomization: (customization: Partial<Customization>) => void;
  }

const Footer: React.FC<FooterProps> = ({ customization, setCustomization }) => {
  return (
    <footer className="bg-panel text-white h-64 p-8 shadow-lg">
      <h2 className="text-2xl mb-6">Customization</h2>
      <div className="grid gap-4 grid-cols-2">
        <div>
          <label className="block mb-2">Title</label>
          <input
            type="text"
            value={customization.title}
            onChange={(e) => setCustomization({ title: e.target.value })}
            className="bg-borderBlue text-white w-full p-2 rounded-md"
          />
        </div>
        <div>
          <label className="block mb-2">Subtitle</label>
          <input
            type="text"
            value={customization.subtitle}
            onChange={(e) => setCustomization({ subtitle: e.target.value })}
            className="bg-borderBlue text-white w-full p-2 rounded-md"
          />
        </div>
        <div>
          <label className="block mb-2">X Axis Title</label>
          <input
            type="text"
            value={customization.xAxisTitle}
            onChange={(e) => setCustomization({ xAxisTitle: e.target.value })}
            className="bg-borderBlue text-white w-full p-2 rounded-md"
          />
        </div>
        <div>
          <label className="block mb-2">Y Axis Title</label>
          <input
            type="text"
            value={customization.yAxisTitle}
            onChange={(e) => setCustomization({ yAxisTitle: e.target.value })}
            className="bg-borderBlue text-white w-full p-2 rounded-md"
          />
        </div>
        <div>
          <label className="block mb-2">Y Axis Prefix</label>
          <input
            type="text"
            value={customization.yAxisPrefix}
            onChange={(e) => setCustomization({ yAxisPrefix: e.target.value })}
            className="bg-borderBlue text-white w-full p-2 rounded-md"
          />
        </div>
        <div>
          <label className="block mb-2">Y Axis Max</label>
          <input
            type="number"
            value={customization.yAxisMax}
            onChange={(e) => setCustomization({ yAxisMax: Number(e.target.value) || "" })}
            className="bg-borderBlue text-white w-full p-2 rounded-md"
          />
        </div>
        <div>
          <label className="block mb-2">Show Grid</label>
          <input
            type="checkbox"
            checked={customization.showGrid}
            onChange={(e) => setCustomization({ showGrid: e.target.checked })}
            className="bg-borderBlue text-white w-full p-2 rounded-md"
          />
        </div>
        <div>
          <label className="block mb-2">X Axis Type</label>
          <select
            value={customization.xAxisType}
            onChange={(e) => setCustomization({ xAxisType: e.target.value as "date" | "category" | "linear" })}
            className="bg-borderBlue text-white w-full p-2 rounded-md"
          >
            <option value="date">Date</option>
            <option value="category">Category</option>
            <option value="linear">Linear</option>
          </select>
        </div>
        <div>
          <label className="block mb-2">Source</label>
          <input
            type="text"
            value={customization.source}
            onChange={(e) => setCustomization({ source: e.target.value })}
            className="bg-borderBlue text-white w-full p-2 rounded-md"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
