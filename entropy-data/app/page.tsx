"use client";

import { useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CSVPanel from "../components/CSVPanel";
import PlotPanel from "../components/PlotPanel";
import { PlotData, Customization } from "../components/types";

export default function Home() {
  const [plotData, setPlotData] = useState<PlotData | null>(null);
  
  // Reference to the plot container div in PlotPanel
  const plotRef = useRef<HTMLDivElement | null>(null);

  // Define customization state with default values and correct types
  const [customization, setCustomization] = useState<Customization>({
    title: "Total $ Value in Canonical Bridges",
    subtitle: "Other includes Mantle, Linea, and Starknet",
    xAxisTitle: "Date",
    yAxisTitle: "Value",
    yAxisPrefix: "$",
    yAxisMax: "", // yAxisMax can be a number or an empty string
    showGrid: true,
    xAxisType: "date", // Default xAxisType is date
    source: "Source: DeFi Llama",

    // New properties for chart customization
    fill: true, // Default to filled for line charts
    stacked: true, // Default to stacked
    chartType: "line", // Default to line chart
  });

  // Function to update the customization options
  const updateCustomization = (updates: Partial<Customization>) => {
    setCustomization((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Pass plotRef to Header so it can handle "Copy" and "Save" functionalities */}
      <Header plotRef={plotRef} />
      <div className="flex-grow flex">
        {/* Pass plotData, customization, and plotRef to PlotPanel */}
        <PlotPanel plotData={plotData} customization={customization} plotRef={plotRef} />
        {/* Pass setPlotData to CSVPanel */}
        <CSVPanel setPlotData={setPlotData} />
      </div>
      {/* Pass customization and updateCustomization to Footer */}
      <Footer customization={customization} setCustomization={updateCustomization} />
    </div>
  );
}
