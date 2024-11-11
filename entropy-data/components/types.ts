export interface PlotData {
    [key: string]: {
        timestamp: string[];
        value: number[];
    };
}

export interface Customization {
    title: string;
    subtitle: string;
    xAxisTitle: string;
    yAxisTitle: string;
    yAxisPrefix: string;
    yAxisSuffix: string;
    yAxisMax: number | ""; // yAxisMax can be a number or an empty string
    showGrid: boolean;
    xAxisType: "date" | "category" | "linear"; // xAxisType has specific allowed values
    source: string;
  
    // New properties for chart customization
    fill: boolean;          // Determines if area under the line is filled
    stacked: boolean;       // Determines if the chart should be stacked
    chartType: "line" | "bar" | "100%"; // Allows selection between line and bar chart
  }
  