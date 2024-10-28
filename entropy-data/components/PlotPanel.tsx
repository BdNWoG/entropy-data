"use client";

import { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist-min"; // Use Plotly.js directly
import { Layout, Data } from "plotly.js-dist-min";

interface PlotData {
    [key: string]: {
        timestamp: string[];
        value: number[];
    };
}

interface PlotPanelProps {
    plotData: PlotData | null;
}

const PlotPanel: React.FC<PlotPanelProps> = ({ plotData }) => {
    const plotRef = useRef<HTMLDivElement | null>(null); // Reference to the plot div

    useEffect(() => {
        if (plotData && plotRef.current) {
        const traces: Data[] = Object.entries(plotData).map(
            ([key, { timestamp, value }]) => ({
            x: timestamp,
            y: value,
            type: "scatter",
            mode: "lines",
            name: key.charAt(0).toUpperCase() + key.slice(1),
            fill: "tonexty",
            line: { width: 3 },
            })
        );

        const layout: Partial<Layout> = {
            title: "<b>Total $ Value in Canonical Bridges</b>",
            plot_bgcolor: "#030d1c",
            paper_bgcolor: "#030d1c",
            font: { color: "white" },
            xaxis: { type: "date", tickformat: "%b %Y" },
            yaxis: { rangemode: "tozero" },
            legend: { orientation: "h" },
        };

        Plotly.newPlot(plotRef.current, traces, layout);
        }
    }, [plotData]); // Re-run when plotData changes

    return (
        <div className="flex-1 bg-panel border-2 border-borderBlue rounded-xl shadow-lg p-4 box-border">
        <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
};

export default PlotPanel;
