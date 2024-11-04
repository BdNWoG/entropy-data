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
    yAxisMax: number | ""; // yAxisMax can be a number or an empty string
    showGrid: boolean;
    xAxisType: "date" | "category" | "linear"; // xAxisType has specific allowed values
    source: string;
  }
  