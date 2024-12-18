"use client";

import { useEffect, useRef, useImperativeHandle } from "react";
import { Layout, Data } from "plotly.js-dist-min";
import { PlotData, Customization } from "./types";
import { getColor, getFillColor } from "./colors"; 

interface PlotPanelProps {
  plotData: PlotData | null;
  customization: Customization;
  plotRef: React.RefObject<HTMLDivElement>;
  colors: string[]; 
  sourceImage: string;
}

const PlotPanel: React.FC<PlotPanelProps> = ({ plotData, customization, plotRef, colors, sourceImage }) => {
  const internalPlotRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(plotRef, () => internalPlotRef.current as HTMLDivElement);

  useEffect(() => {
    if (typeof window !== "undefined" && plotData && internalPlotRef.current) {
      import("plotly.js-dist-min").then((Plotly) => {
        console.log("PlotPanel useEffect triggered with colors:", colors); // Debugging

        let traces: Data[] = [];

        if (customization.chartType === "100%") {
          const summedValues: number[] = plotData[Object.keys(plotData)[0]].timestamp.map(
            (_, idx) =>
              Object.values(plotData).reduce(
                (sum, { value }) => sum + (value[idx] || 0),
                0
              )
          );

          traces = Object.entries(plotData).map(([label, { timestamp, value }], index) => {
            const normalizedY = value.map((v, idx) =>
              summedValues[idx] === 0 ? 0 : (v / summedValues[idx]) * 100
            );

            return {
              x: timestamp,
              y: normalizedY,
              type: "bar",
              name: label,
              marker: { color: colors[index % colors.length] },
            };
          });
        } else if (customization.chartType === "bar-line") {
          const entries = Object.entries(plotData);
          const lastEntryIndex = entries.length - 1;

          traces = entries.map(([label, { timestamp, value }], index) => {
            const isLast = index === lastEntryIndex;

            return {
              x: timestamp,
              y: value,
              type: isLast ? "scatter" : "bar",
              mode: isLast ? "lines" : undefined,
              name: label,
              yaxis: isLast ? "y2" : "y",
              marker: { color: getColor(index, colors) },
              line: isLast ? { width: 3, color: getColor(index, colors) } : undefined,
            };
          });
        } else {
          traces = Object.entries(plotData).map(([label, { timestamp, value }], index) => ({
            x: timestamp,
            y: value,
            type: customization.chartType === "line" ? "scatter" : "bar",
            mode: customization.chartType === "line" ? "lines" : undefined,
            name: label,
            fill:
              customization.chartType === "line" && customization.fill
                ? "tonexty"
                : undefined,
            stackgroup:
              customization.stacked && customization.chartType === "line"
                ? "one"
                : undefined,
            marker: { color: getColor(index, colors) },
            line:
              customization.chartType === "line"
                ? { width: 3, color: getColor(index, colors) }
                : undefined,
            fillcolor:
              customization.chartType === "line" && customization.fill
                ? getFillColor(index, colors)
                : undefined,
          }));
        }

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
            title: customization.xAxisTitle  || "X Axis",
            type: customization.xAxisType  || "date",
            tickformat:
              customization.xAxisType === "date" ? "%b %Y" : undefined,
            tickfont: { size: 14, color: "white" },
            showline: true,
            linewidth: 2,
            linecolor: "#D1D5DB",
            showgrid: customization.showGrid,
            rangeslider: {
              visible: false,
            },
          },
          yaxis: {
            title:
              customization.chartType === "100%"
                ? "Percentage (%)"
                : customization.yAxisTitle || "",
            tickprefix: customization.chartType === "100%" ? "" : customization.yAxisPrefix || "",
            ticksuffix: customization.chartType === "100%" ? "%" : customization.yAxisSuffix || "",
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
            rangemode: customization.chartType === "100%" ? undefined : "tozero",
            autorange: customization.chartType === "100%" 
              ? false 
              : customization.yAxisMax === "" ? true : false,
            range: customization.chartType === "100%" 
              ? [0, 100] 
              : customization.yAxisMax === "" ? undefined : [0, customization.yAxisMax],
          },
          yaxis2: {
            title: customization.yAxisRightTitle || "",
            tickprefix: customization.yAxisRightPrefix || "",
            ticksuffix: customization.yAxisRightSuffix || "",
            overlaying: "y",
            side: "right",
            showgrid: false,
            tickfont: { size: 14, color: "white" },
            linecolor: "white",
          },
          legend: {
            orientation: "h",
            yanchor: "top",
            y: -0.25,
            xanchor: "center",
            x: 0.5,
            font: { size: 16, color: "white" },
          },
          margin: { l: 100, r: 100, t: 100, b: 100 },
          barmode: customization.stacked ? "stack" : undefined,
          images: [
            {
              source: sourceImage,
              xref: "paper",
              yref: "paper",
              x: 0.5,
              y: 0.5,
              sizex: 0.3,
              sizey: 0.3,
              xanchor: "center",
              yanchor: "middle",
              opacity: 0.25,
              layer: "above",
            },
          ],
          annotations: [
            {
              text: `${customization.source} <br>Date: ${new Date().toLocaleDateString()}`,
              font: { size: 13, color: "white" },
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
        };

        if (internalPlotRef.current) {
          Plotly.purge(internalPlotRef.current);
          Plotly.react(internalPlotRef.current, traces, layout);
        }
      });
    } else if (plotData === null && internalPlotRef.current) {
      import("plotly.js-dist-min").then((Plotly) => {
        if (internalPlotRef.current) {
          Plotly.purge(internalPlotRef.current);
          internalPlotRef.current.innerHTML = "";
        }
      });
    }
  }, [plotData, customization, colors, sourceImage]);

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

export default PlotPanel;
