"use client";

import { useEffect, useRef } from "react";
import Plotly, { Layout, Data } from "plotly.js-dist-min";
import { PlotData } from "./types";

interface PlotPanelProps {
  plotData: PlotData | null;
}

const PlotPanel: React.FC<PlotPanelProps> = ({ plotData }) => {
  const plotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (plotData && plotRef.current) {
      const traces: Data[] = Object.entries(plotData).map(([label, { timestamp, value }], index) => ({
        x: timestamp,
        y: value,
        type: "scatter",
        mode: "lines",
        name: label,
        fill: "tonexty",
        stackgroup: "one",
        line: { width: 3, color: getColor(index) },
        fillcolor: getFillColor(index),
      }));

      const layout: Partial<Layout> = {
        title: {
          text: "<b>Total $ Value in Canonical Bridges</b><br><sup><span style='color:#9ecff2'>Other includes Mantle, Linea, and Starknet</span></sup>",
          font: { family: "sans-serif", size: 30, color: "white" },
          xanchor: "center",
          x: 0.5,
        },
        plot_bgcolor: "#030d1c",
        paper_bgcolor: "#030d1c",
        font: { size: 14, color: "white" },
        xaxis: {
          type: "date",
          tickformat: "%b %Y",
          tickfont: { size: 14, color: "white" },
          showline: true,
          linewidth: 2,
          linecolor: "#D1D5DB",
          showspikes: false,
          showgrid: false,
          rangeslider: { visible: true },
        },
        yaxis: {
          tickprefix: "$",
          showgrid: true,
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
          autorange: true,
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
            text: `Source: DeFi Llama <br>Date: ${new Date().toLocaleDateString()}`,
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
      };

      Plotly.react(plotRef.current, traces, layout);
    } else if (plotRef.current) {
      // Ensure complete removal by unmounting and clearing the innerHTML
      Plotly.purge(plotRef.current);
      plotRef.current.innerHTML = "";
    }
  }, [plotData]);

  return (
    <div className="flex-1 bg-panel border-2 border-borderBlue rounded-xl shadow-lg p-4 box-border">
      {plotData ? (
        // Conditionally render the chart container only when plotData exists
        <div
          ref={plotRef}
          style={{ width: "100%", height: "100%" }}
          key={plotData ? "plot-container" : "empty-container"} // Force DOM reset with unique key
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
