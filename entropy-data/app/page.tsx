"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CSVPanel from "../components/CSVPanel";
import { PlotData, Customization } from "../components/types";
import { colors as defaultColors } from "../components/colors";

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
    yAxisRightTitle: "",       // Add missing properties with default values
    yAxisRightPrefix: "",
    yAxisRightSuffix: "",
    showGrid: true,
    xAxisType: "date",
    source: "Source: ",
    fill: true,
    stacked: true,
    chartType: "line",
  });

  const [colors, setColors] = useState<string[]>([...defaultColors]);

  const [sourceImage, setSourceImage] = useState("https://i.imgur.com/1u4DIOJ.png");

  const updateCustomization = (updates: Partial<Customization>) => {
    setCustomization((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Header
        plotRef={plotRef}
        source={customization.source}
        colors={colors}
        setColors={setColors}
        sourceImage={sourceImage} 
        setSourceImage={setSourceImage}
      />
      <div className="flex-grow flex">
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <PlotPanel
            plotData={plotData}
            customization={customization}
            plotRef={plotRef}
            colors={colors}
            sourceImage={sourceImage} 
          />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <CSVPanel setPlotData={setPlotData} />
        </div>
      </div>
      <Footer customization={customization} setCustomization={updateCustomization} />
    </div>
  );
}
