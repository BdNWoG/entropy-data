import React, { useState } from "react";
import { Customization } from "../components/types";

interface FooterProps {
  customization: Customization;
  setCustomization: (customization: Partial<Customization>) => void;
}

const Footer: React.FC<FooterProps> = ({ customization, setCustomization }) => {
  const [showingFirstSet, setShowingFirstSet] = useState(true);

  const handleToggleSet = () => setShowingFirstSet(!showingFirstSet);

  return (
    <footer className="bg-panel text-white h-70 p-8 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl">Customization</h2>
        <div className="flex gap-4">
          <div>
            <label className="mr-2">Chart Type:</label>
            <select
              value={customization.chartType}
              onChange={(e) =>
                setCustomization({ chartType: e.target.value as "line" | "bar" | "100%" | "bar-line" })
              }
              className="bg-borderBlue text-white px-3 py-2 rounded-md"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="100%">100% Chart</option>
              <option value="bar-line">Bar and Line Chart</option>
            </select>
          </div>
          <button
            onClick={handleToggleSet}
            className="bg-borderBlue hover:bg-blue-600 px-4 py-2 rounded-md"
          >
            {showingFirstSet ? "More Options" : "Basic Options"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-4">
        {showingFirstSet ? (
          <>
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
              <label className="block mb-2">Source</label>
              <input
                type="text"
                value={customization.source}
                onChange={(e) => setCustomization({ source: e.target.value })}
                className="bg-borderBlue text-white w-full p-2 rounded-md"
              />
            </div>
            <div>
              <label className="block mb-2">Y Axis Title (Left)</label>
              <input
                type="text"
                value={customization.yAxisTitle}
                onChange={(e) => setCustomization({ yAxisTitle: e.target.value })}
                className="bg-borderBlue text-white w-full p-2 rounded-md"
              />
            </div>
            <div>
              <label className="block mb-2">Y Axis Title (Right)</label>
              <input
                type="text"
                value={customization.yAxisRightTitle || ""}
                onChange={(e) => setCustomization({ yAxisRightTitle: e.target.value })}
                className="bg-borderBlue text-white w-full p-2 rounded-md"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block mb-2">Filled</label>
              <select
                value={customization.fill ? "filled" : "not filled"}
                onChange={(e) =>
                  setCustomization({ fill: e.target.value === "filled" })
                }
                className="bg-borderBlue text-white w-full p-2 rounded-md"
              >
                <option value="filled">Filled</option>
                <option value="not filled">Not Filled</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Stacked</label>
              <select
                value={customization.stacked ? "stacked" : "not stacked"}
                onChange={(e) =>
                  setCustomization({ stacked: e.target.value === "stacked" })
                }
                className="bg-borderBlue text-white w-full p-2 rounded-md"
              >
                <option value="stacked">Stacked</option>
                <option value="not stacked">Not Stacked</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Y Axis Prefix (Left)</label>
              <input
                type="text"
                value={customization.yAxisPrefix}
                onChange={(e) => setCustomization({ yAxisPrefix: e.target.value })}
                className="bg-borderBlue text-white w-full p-2 rounded-md"
              />
            </div>
            <div>
              <label className="block mb-2">Y Axis Suffix (Left)</label>
              <input
                type="text"
                value={customization.yAxisSuffix || ""}
                onChange={(e) => setCustomization({ yAxisSuffix: e.target.value })}
                className="bg-borderBlue text-white w-full p-2 rounded-md"
              />
            </div>
            <div>
              <label className="block mb-2">Y Axis Max (Left)</label>
              <input
                type="number"
                value={customization.yAxisMax}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomization({ yAxisMax: value === "" ? "" : Number(value) });
                }}
                className="bg-borderBlue text-white w-full p-2 rounded-md"
              />
            </div>
            <div>
              <label className="block mb-2">Y Axis Prefix (Right)</label>
              <input
                type="text"
                value={customization.yAxisRightPrefix || ""}
                onChange={(e) => setCustomization({ yAxisRightPrefix: e.target.value })}
                className="bg-borderBlue text-white w-full p-2 rounded-md"
              />
            </div>
            <div>
              <label className="block mb-2">Y Axis Suffix (Right)</label>
              <input
                type="text"
                value={customization.yAxisRightSuffix || ""}
                onChange={(e) => setCustomization({ yAxisRightSuffix: e.target.value })}
                className="bg-borderBlue text-white w-full p-2 rounded-md"
              />
            </div>
          </>
        )}
      </div>
    </footer>
  );
};

export default Footer;
