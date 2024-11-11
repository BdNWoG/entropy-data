"use client";

import { useEffect, useRef, useImperativeHandle } from "react";
import { Layout, Data } from "plotly.js-dist-min"; // Import types only for use in typing
import { PlotData } from "./types";

interface Customization {
  title: string;
  subtitle: string;
  xAxisTitle: string;
  yAxisTitle: string;
  yAxisPrefix: string;
  yAxisSuffix: string;
  yAxisMax: number | "";
  yAxisRightTitle?: string;
  yAxisRightPrefix?: string;
  yAxisRightSuffix?: string;
  showGrid: boolean;
  xAxisType: "date" | "category" | "linear";
  source: string;
  fill: boolean;
  stacked: boolean;
  chartType: "line" | "bar" | "100%" | "bar-line";
}

interface PlotPanelProps {
  plotData: PlotData | null;
  customization: Customization;
  plotRef: React.RefObject<HTMLDivElement>;
}

const PlotPanel: React.FC<PlotPanelProps> = ({ plotData, customization, plotRef }) => {
  const internalPlotRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(plotRef, () => internalPlotRef.current as HTMLDivElement);

  useEffect(() => {
    const loadPlotlyAndRender = async () => {
      const Plotly = await import("plotly.js-dist-min");

      if (plotData && internalPlotRef.current) {
        const traces: Data[] = Object.entries(plotData).map(([label, { timestamp, value }], index) => ({
          x: timestamp,
          y: value,
          type: customization.chartType === "line" ? "scatter" : "bar",
          mode: customization.chartType === "line" ? "lines" : undefined,
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
            rangeslider: { visible: customization.chartType !== "bar-line" },
          },
          yaxis: {
            title: customization.yAxisTitle,
            tickprefix: customization.yAxisPrefix,
            ticksuffix: customization.yAxisSuffix,
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
          yaxis2: {
            title: customization.yAxisRightTitle || "",
            tickprefix: customization.yAxisRightPrefix || "",
            ticksuffix: customization.yAxisRightSuffix || "",
            overlaying: "y",
            side: "right",
            showline: true,
            linewidth: 2,
            linecolor: "white",
            zeroline: true,
            zerolinewidth: 2,
            zerolinecolor: "white",
          },
          legend: {
            orientation: "h",
            yanchor: "bottom",
            y: -0.25,
            xanchor: "center",
            x: 0.5,
            font: { size: 16, color: "white" },
          },
          margin: { l: 100, r: 100, t: 100, b: 100 },
          annotations: [
            {
              text: `${customization.source} <br>Date: ${new Date().toLocaleDateString()}`,
              font: { size: 8, color: "white" },
              showarrow: false,
              xref: "paper",
              yref: "paper",
              x: 0.99,
              y: -0.15,
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
    };

    loadPlotlyAndRender();
  }, [plotData, customization]);

  return (
    <div className="flex-1 bg-panel border-2 border-borderBlue rounded-xl shadow-lg p-4 box-border">
      {plotData != null ? (
        <div ref={internalPlotRef} style={{ width: "100%", height: "100%" }} />
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          <p>No data to display. Please import or create CSV data.</p>
        </div>
      )}
    </div>
  );
};

// Define the color palette
const colors = [
  "#213147", "#4a4a4a", "#0557f5", "#ff677d", "#9ecff2", "#ffcdb2",
  "#ffd1dc", "#e0e3d1", "#16553b", "#959595", "#9ab4e6", "#ffa060",
  "#a172c3", "#4a6db1", "#041d7e", "#04e3c9"
];

// Get color based on index
const getColor = (index: number) => colors[index % colors.length];

// Get fill color with 0.5 opacity
const getFillColor = (index: number) => {
  const color = colors[index % colors.length];
  const [r, g, b] = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, 0.5)`;
};

// Convert hex color to RGB
const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
};

export default PlotPanel;
