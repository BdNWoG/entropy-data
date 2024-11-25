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
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [draggingColumn, setDraggingColumn] = useState<number | null>(null);

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

  const handleDeleteRow = (rowIndex: number) => {
    if (editableData) {
      const updatedData = editableData.filter((_, index) => index !== rowIndex);
      setEditableData(updatedData);
    }
  };

  const handleDeleteColumn = (columnIndex: number) => {
    if (editableData) {
      const updatedData = editableData.map((row) => row.filter((_, index) => index !== columnIndex));
      setEditableData(updatedData);
    }
  };

  const handleCreateCSV = () => {
    const blankCSV = Array.from({ length: 3 }, () => new Array(3).fill(""));
    setEditableData(blankCSV);
    setView("table");
  };

  const handleDragStartRow = (rowIndex: number) => {
    setDraggingIndex(rowIndex);
  };

  const handleDropRow = (targetIndex: number) => {
    if (editableData && draggingIndex !== null) {
      const reorderedData = [...editableData];
      const [movedRow] = reorderedData.splice(draggingIndex, 1);
      reorderedData.splice(targetIndex, 0, movedRow);
      setEditableData(reorderedData);
      setDraggingIndex(null);
    }
  };

  const handleDragStartColumn = (columnIndex: number) => {
    setDraggingColumn(columnIndex);
  };

  const handleDropColumn = (targetIndex: number) => {
    if (editableData && draggingColumn !== null) {
      const reorderedData = editableData.map((row) => {
        const reorderedRow = [...row];
        const [movedColumn] = reorderedRow.splice(draggingColumn, 1);
        reorderedRow.splice(targetIndex, 0, movedColumn);
        return reorderedRow;
      });
      setEditableData(reorderedData);
      setDraggingColumn(null);
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
                        draggable
                        onDragStart={() => handleDragStartColumn(columnIndex)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropColumn(columnIndex)}
                        className="border border-borderBlue px-4 py-2 text-white bg-blue-600 sticky top-0"
                      >
                        {header}
                        <button
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 text-red-500 hidden group-hover:block"
                          onClick={() => handleDeleteColumn(columnIndex)}
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
                      draggable
                      onDragStart={() => handleDragStartRow(rowIndex + 1)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDropRow(rowIndex + 1)}
                      className="even:bg-panel odd:bg-black group"
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-borderBlue px-4 py-2 text-white"
                        >
                          {cellIndex === 0 && (
                            <button
                              className="absolute left-1 top-1/2 transform -translate-y-1/2 text-red-500 hidden group-hover:block"
                              onClick={() => handleDeleteRow(rowIndex + 1)}
                            >
                              ✕
                            </button>
                          )}
                          <input
                            type="text"
                            value={cell || ""}
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
