"use client"

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CSVPanel from "../components/CSVPanel";
import PlotPanel from "../components/PlotPanel";
import { PlotData } from "../components/types";

export default function Home() {
  const [plotData, setPlotData] = useState<PlotData | null>(null);

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Header />
      <div className="flex-grow flex">
        <PlotPanel plotData={plotData} />
        <CSVPanel setPlotData={setPlotData} />
      </div>
      <Footer />
    </div>
  );
}
