"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CSVPanel from "../components/CSVPanel";
import PlotPanel from "../components/PlotPanel";
import { PlotData } from "../components/types";

export default function Home() {
  const [plotData, setPlotData] = useState<PlotData | null>(null);

  // Define customization state with default values and correct types
  const [customization, setCustomization] = useState({
    title: "Total $ Value in Canonical Bridges",
    subtitle: "Other includes Mantle, Linea, and Starknet",
    xAxisTitle: "Date",
    yAxisTitle: "Value",
    yAxisPrefix: "$",
    yAxisMax: "" as number | "", // yAxisMax is number or empty string
    showGrid: true,
    xAxisType: "date" as "date" | "category" | "linear", // xAxisType with specific union type
    source: "Source: DeFi Llama",
  });

  // Function to update the customization options
  const updateCustomization = (updates: Partial<typeof customization>) => {
    setCustomization((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Header />
      <div className="flex-grow flex">
        {/* Pass plotData and customization to PlotPanel */}
        <PlotPanel plotData={plotData} customization={customization} />
        {/* Pass setPlotData to CSVPanel */}
        <CSVPanel setPlotData={setPlotData} />
      </div>
      {/* Pass customization and updateCustomization to Footer */}
      <Footer customization={customization} setCustomization={updateCustomization} />
    </div>
  );
}
