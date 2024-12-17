"use client";

export const colors = [
    "#213147", "#4a4a4a", "#0557f5", "#ff677d", "#9ecff2", "#ffcdb2",
    "#ffd1dc", "#e0e3d1", "#16553b", "#959595", "#9ab4e6", "#ffa060",
    "#a172c3", "#4a6db1", "#041d7e", "#04e3c9"
];

export const getColor = (index: number, customColors: string[]) =>
    customColors[index % customColors.length];

export const getFillColor = (index: number, customColors: string[]) => {
    const color = getColor(index, customColors);
    const [r, g, b] = hexToRgb(color);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
};

const hexToRgb = (hex: string) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
};
