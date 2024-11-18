"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CSVPanel from "../components/CSVPanel";
import { PlotData, Customization } from "../components/types";

const PlotPanel = dynamic(() => import("../components/PlotPanel"), { ssr: false });

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

  const updateCustomization = (updates: Partial<Customization>) => {
    setCustomization((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Header plotRef={plotRef} source={customization.source} />
      <div className="flex-grow flex">
        <PlotPanel plotData={plotData} customization={customization} plotRef={plotRef} />
        <CSVPanel setPlotData={setPlotData} />
      </div>
      <Footer customization={customization} setCustomization={updateCustomization} />
    </div>
  );
}
