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