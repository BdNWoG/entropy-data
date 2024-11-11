"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CSVPanel from "../components/CSVPanel";
import { PlotData, Customization } from "../components/types";

// Dynamically import PlotPanel with SSR disabled
const PlotPanel = dynamic(() => import("../components/PlotPanel"), { 
  ssr: false, 
  loading: () => <div>Loading Plot...</div> // Fallback while Plotly loads on the client side
});

export default function Home() {
  const [plotData, setPlotData] = useState<PlotData | null>(null);
  const plotRef = useRef<HTMLDivElement | null>(null);

  const [customization, setCustomization] = useState<Customization>({
    title: "",
    subtitle: "",
    xAxisTitle: "Date",
    yAxisTitle: "Value",
    yAxisPrefix: "$",
    yAxisSuffix: "",
    yAxisMax: "",
    showGrid: true,
    xAxisType: "date",
    source: "Source: ",
    fill: true,
    stacked: true,
    chartType: "line",
  });

  // Function to update customization state
  const updateCustomization = (updates: Partial<Customization>) => {
    setCustomization((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Header plotRef={plotRef} source={customization.source} />
      <div className="flex-grow flex">
        {/* Render PlotPanel only if plotData is available */}
        {plotData ? (
          <PlotPanel plotData={plotData} customization={customization} plotRef={plotRef} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            No data loaded. Please upload a CSV file.
          </div>
        )}
        <CSVPanel setPlotData={setPlotData} />
      </div>
      <Footer customization={customization} setCustomization={updateCustomization} />
    </div>
  );
}
