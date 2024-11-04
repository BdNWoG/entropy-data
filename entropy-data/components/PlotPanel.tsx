"use client";

import { useEffect, useRef, useImperativeHandle } from "react";
import Plotly, { Layout, Data } from "plotly.js-dist-min";
import { PlotData } from "./types";

interface Customization {
  title: string;
  subtitle: string;
  xAxisTitle: string;
  yAxisTitle: string;
  yAxisPrefix: string;
  yAxisMax: number | "";
  showGrid: boolean;
  xAxisType: "date" | "category" | "linear";
  source: string;
  fill: boolean;
  stacked: boolean;
  chartType: "line" | "bar";
}

interface PlotPanelProps {
  plotData: PlotData | null;
  customization: Customization;
  plotRef: React.RefObject<HTMLDivElement>;
}

const PlotPanel: React.FC<PlotPanelProps> = ({ plotData, customization, plotRef }) => {
  const internalPlotRef = useRef<HTMLDivElement | null>(null);

  // Expose internalPlotRef to plotRef passed from Home component
  useImperativeHandle(plotRef, () => internalPlotRef.current as HTMLDivElement);

  useEffect(() => {
    if (plotData && internalPlotRef.current) {
      // Render the plot if plotData is present
      const traces: Data[] = Object.entries(plotData).map(([label, { timestamp, value }], index) => ({
        x: timestamp,
        y: value,
        type: customization.chartType === "line" ? "scatter" : "bar", // Determine type based on chartType
        mode: customization.chartType === "line" ? "lines" : undefined, // Only set mode for line charts
        name: label,
        fill: customization.chartType === "line" && customization.fill ? "tonexty" : undefined,
        stackgroup: customization.stacked && customization.chartType === "line" ? "one" : undefined,
        marker: { color: getColor(index) },
        line: customization.chartType === "line" ? { width: 3, color: getColor(index) } : undefined,
        fillcolor: customization.chartType === "line" && customization.fill ? getFillColor(index) : undefined,
      }));

      const layout: Partial<Layout> = {
        title: {
          text: `<b>${customization.title}</b><br><sup><span style='color:#9ecff2'>${customization.subtitle}</span></sup>`,
          font: { family: "sans-serif", size: 30, color: "white" },
          xanchor: "center",
          x: 0.5,
        },
        plot_bgcolor: "#030d1c",
        paper_bgcolor: "#030d1c",
        font: { size: 14, color: "white" },
        xaxis: {
          title: customization.xAxisTitle,
          type: customization.xAxisType,
          tickformat: customization.xAxisType === "date" ? "%b %Y" : undefined,
          tickfont: { size: 14, color: "white" },
          showline: true,
          linewidth: 2,
          linecolor: "#D1D5DB",
          showspikes: false,
          showgrid: customization.showGrid,
          rangeslider: { visible: customization.xAxisType === "date" },
        },
        yaxis: {
          title: customization.yAxisTitle,
          tickprefix: customization.yAxisPrefix,
          showgrid: customization.showGrid,
          gridcolor: "rgba(173, 176, 181, 0.6)",
          griddash: "dash",
          tickfont: { size: 14, color: "white" },
          showline: true,
          linewidth: 2,
          linecolor: "white",
          zeroline: true,
          zerolinewidth: 2,
          zerolinecolor: "white",
          rangemode: "tozero",
          autorange: customization.yAxisMax === "" ? true : false,
          range: customization.yAxisMax !== "" ? [0, customization.yAxisMax] : undefined,
        },
        legend: {
          orientation: "h",
          yanchor: "bottom",
          y: -0.15,
          xanchor: "left",
          x: 0,
          font: { size: 16, color: "white" },
        },
        margin: { l: 100, r: 100, t: 100, b: 80 },
        images: [
          {
            source: "https://i.imgur.com/1u4DIOJ.png",
            xref: "paper",
            yref: "paper",
            x: 0.5,
            y: 0.5,
            sizex: 0.3,
            sizey: 0.3,
            xanchor: "center",
            yanchor: "middle",
            opacity: 0.15,
            layer: "above",
          },
        ],
        annotations: [
          {
            text: `${customization.source} <br>Date: ${new Date().toLocaleDateString()}`,
            font: { size: 8, color: "white" },
            showarrow: false,
            xref: "paper",
            yref: "paper",
            x: 0.99,
            y: -0.14,
            xanchor: "right",
            yanchor: "bottom",
            bgcolor: "#1f2c56",
            bordercolor: "white",
            borderwidth: 1,
            borderpad: 4,
          },
        ],
        barmode: customization.stacked && customization.chartType === "bar" ? "stack" : undefined,
      };

      Plotly.react(internalPlotRef.current, traces, layout);
    } else if (plotData === null && internalPlotRef.current) {
      Plotly.purge(internalPlotRef.current);
      internalPlotRef.current.innerHTML = "";
    }
  }, [plotData, customization]);

  return (
    <div className="flex-1 bg-panel border-2 border-borderBlue rounded-xl shadow-lg p-4 box-border">
      {plotData != null ? (
        <div
          ref={internalPlotRef}
          key={plotData ? "plot-present" : "plot-null"} 
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          <p>No data to display. Please import or create CSV data.</p>
        </div>
      )}
    </div>
  );
};

const getColor = (index: number) => {
  const colors = ["#12AAFF", "#f50557", "#2ca02c", "#f57c00", "#ccccff"];
  return colors[index % colors.length];
};

const getFillColor = (index: number) => {
  const fillColors = [
    "rgba(18, 170, 255, 0.5)",
    "rgba(245, 5, 87, 0.5)",
    "rgba(44, 160, 44, 0.5)",
    "rgba(245, 124, 0, 0.5)",
    "rgba(204, 204, 255, 0.5)",
  ];
  return fillColors[index % fillColors.length];
};

export default PlotPanel;
