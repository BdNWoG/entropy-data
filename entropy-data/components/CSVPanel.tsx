"use client";

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { PlotData } from "./types";

interface CSVPanelProps {
  setPlotData: (data: PlotData | null) => void;
}

const CSVPanel: React.FC<CSVPanelProps> = ({ setPlotData }) => {
  const [editableData, setEditableData] = useState<string[][] | null>(null);
  const [tableHeight, setTableHeight] = useState<number>(0);
  const [view, setView] = useState<"initial" | "table">("initial");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggingType, setDraggingType] = useState<"row" | "column" | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateTableHeight = () => {
      if (containerRef.current && buttonRowRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const buttonRowHeight = buttonRowRef.current.clientHeight;
        const padding = 16;
        setTableHeight(containerHeight - buttonRowHeight - padding);
      }
    };

    updateTableHeight();
    window.addEventListener("resize", updateTableHeight);

    return () => {
      window.removeEventListener("resize", updateTableHeight);
    };
  }, []);

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const data = result.data as string[][]; // Parsed CSV data
          setEditableData(data);
          setView("table");
        },
        error: (error) => console.error("Error parsing CSV:", error),
      });
    }
  };

  const handleEditCell = (rowIndex: number, cellIndex: number, value: string) => {
    setEditableData((prevData) => {
      if (prevData) {
        const updatedData = [...prevData];
        updatedData[rowIndex][cellIndex] = value;
        return updatedData;
      }
      return prevData;
    });
  };

  const handleCancel = () => {
    setEditableData(null);
    setPlotData(null);
    setView("initial");
  };

  const handleAddRow = () => {
    if (editableData) {
      const newRow = new Array(editableData[0].length).fill("");
      setEditableData([...editableData, newRow]);
    }
  };

  const handleAddColumn = () => {
    if (editableData) {
      const updatedData = editableData.map((row) => [...row, ""]);
      setEditableData(updatedData);
    }
  };

  const handleDeleteRow = () => {
    if (editableData && editableData.length > 1) {
      const updatedData = editableData.slice(0, -1);
      setEditableData(updatedData);
    }
  };

  const handleDeleteColumn = () => {
    if (editableData && editableData[0].length > 1) {
      const updatedData = editableData.map((row) => row.slice(0, -1));
      setEditableData(updatedData);
    }
  };

  const handleCreateCSV = () => {
    const blankCSV = Array.from({ length: 3 }, () => new Array(3).fill(""));
    setEditableData(blankCSV);
    setView("table");
  };

  const handleReorderRows = (sourceIndex: number, targetIndex: number) => {
    if (editableData) {
      const updatedData = [...editableData];
      const [movedRow] = updatedData.splice(sourceIndex, 1);
      updatedData.splice(targetIndex, 0, movedRow);
      setEditableData(updatedData);
    }
  };

  const handleReorderColumns = (sourceIndex: number, targetIndex: number) => {
    if (editableData) {
      const updatedData = editableData.map((row) => {
        const newRow = [...row];
        const [movedCell] = newRow.splice(sourceIndex, 1);
        newRow.splice(targetIndex, 0, movedCell);
        return newRow;
      });
      setEditableData(updatedData);
    }
  };

  const handleDragStart = (index: number, type: "row" | "column") => {
    setDraggedIndex(index);
    setDraggingType(type);
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex !== null && draggingType) {
      if (draggingType === "row") {
        handleReorderRows(draggedIndex, targetIndex);
      } else if (draggingType === "column") {
        handleReorderColumns(draggedIndex, targetIndex);
      }
      setDraggedIndex(null);
      setDraggingType(null);
    }
  };

  useEffect(() => {
    if (view === "initial") {
      setPlotData(null);
    }
  }, [view, setPlotData]);

  useEffect(() => {
    if (editableData) {
      const processCSVData = (data: string[][]) => {
        if (!data || data.length < 2) return;

        const xValues = data.slice(1).map((row) => row[0]);
        const plotData: PlotData = {};

        data[0].slice(1).forEach((header, columnIndex) => {
          plotData[header] = {
            timestamp: xValues,
            value: data.slice(1).map((row) => parseFloat(row[columnIndex + 1] || "0")),
          };
        });

        console.log("Updated plotData:", plotData); // Debug log to verify data
        setPlotData(plotData);
      };
      processCSVData(editableData);
    }
  }, [editableData, setPlotData]);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-panel border-2 border-borderBlue rounded-xl shadow-lg p-4 box-border"
    >
      {view === "initial" ? (
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <label
            htmlFor="csv-upload"
            className="bg-borderBlue text-white px-6 py-3 rounded-md cursor-pointer hover:bg-blue-600 transition-colors"
          >
            Import CSV
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
          />
          <button
            onClick={handleCreateCSV}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
          >
            Create CSV
          </button>
        </div>
      ) : (
        <div className="relative h-full flex flex-col">
          <div ref={buttonRowRef} className="flex gap-2 mb-4">
            <button
              onClick={handleAddRow}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Row
            </button>
            <button
              onClick={handleAddColumn}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Column
            </button>
            <button
              onClick={handleCancel}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div
            className="flex-grow overflow-auto border border-borderBlue rounded-md"
            style={{ height: `${tableHeight}px` }}
          >
            <div className="w-full overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    {editableData?.[0].map((header, columnIndex) => (
                      <th
                        key={columnIndex}
                        className="border border-borderBlue px-4 py-2 text-white bg-blue-600 top-0 relative group"
                        draggable
                        onDragStart={() => handleDragStart(columnIndex, "column")}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(columnIndex)}
                      >
                        {header}
                        <button
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 text-red-500 hidden group-hover:block"
                          onClick={() => handleDeleteColumn()}
                        >
                          ✕
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {editableData?.slice(1).map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="even:bg-panel odd:bg-black group"
                      draggable
                      onDragStart={() => handleDragStart(rowIndex, "row")}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(rowIndex)}
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-borderBlue px-4 py-2 text-white relative"
                        >
                          {cellIndex === 0 && (
                            <button
                              className="absolute left-1 top-1/2 transform -translate-y-1/2 text-red-500 hidden group-hover:block"
                              onClick={() => handleDeleteRow()}
                            >
                              ✕
                            </button>
                          )}
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) =>
                              handleEditCell(rowIndex + 1, cellIndex, e.target.value)
                            }
                            className="bg-transparent text-white w-full"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVPanel;
