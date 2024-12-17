"use client";

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { parse, format } from "date-fns"; // For date parsing and formatting
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

  const targetDateFormat = "yyyy-MM-dd"; // Fixed date format

  const dateFormats = [
    "yyyy-MM-dd",
    "MM/dd/yyyy",
    "dd-MM-yyyy",
    "dd/MM/yyyy",
    "MMM dd, yyyy",
    "MMMM dd, yyyy",
    "yyyy/MM/dd",
    "MM-dd-yyyy",
    "yyyy-MM-dd HH:mm:ss",
    "MM/dd/yyyy HH:mm:ss",
    "dd-MM-yyyy HH:mm:ss",
    "yyyyMMdd",
    "dd MMM yyyy",
    "MMM dd, yyyy h:mm a",
    "yyyy-MM-dd'T'HH:mm:ss",
    "yyyy-MM-dd HH:mm:ss.SSS",
    "M/d/yy",
  ];

  useEffect(() => {
    const updateTableHeight = () => {
      if (containerRef.current && buttonRowRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const buttonRowHeight = buttonRowRef.current.clientHeight;
        const padding = 30;
        setTableHeight(containerHeight - buttonRowHeight - padding * 1000);
      }
    };

    updateTableHeight();
    window.addEventListener("resize", updateTableHeight);

    return () => {
      window.removeEventListener("resize", updateTableHeight);
    };
  }, []);

  const sortAndGroupByDate = (data: string[][]): string[][] => {
    if (data.length < 2) return data; // No sorting needed for empty or header-only data

    const header = data[0];
    const body = data.slice(1);

    // Standardize dates and group rows by date
    const groupedData: Record<string, number[]> = {};

    body.forEach((row) => {
      const date = standardizeDate(row[0]); // Standardized date
      if (!date) return; // Skip rows with invalid dates

      if (!groupedData[date]) {
        groupedData[date] = new Array(row.length - 1).fill(0); // Initialize an array to sum values
      }

      row.slice(1).forEach((value, index) => {
        const numericValue = parseFloat(value) || 0; // Parse numeric values, default to 0
        groupedData[date][index] += numericValue; // Sum up values
      });
    });

    // Convert grouped data back into an array and sort by date
    const sortedGroupedData = Object.entries(groupedData)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()) // Sort by date
      .map(([date, values]) => [date, ...values.map((v) => v.toString())]); // Format back to strings

    return [header, ...sortedGroupedData];
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          let data = result.data as string[][]; // Parsed CSV data
          data = sortAndGroupByDate(data); // Sort and group data by the first column (dates)
          setEditableData(data);
          setView("table");
        },
        error: (error) => console.error("Error parsing CSV:", error),
      });
    }
  };

  const handleSortAndGroupByDate = () => {
    if (editableData) {
      const sortedAndGroupedData = sortAndGroupByDate(editableData);
      setEditableData(sortedAndGroupedData);
    }
  };

  const standardizeDate = (date: string | undefined | null): string => {
    if (!date || typeof date !== "string") {
      return "";
    }

    // Remove ' UTC' if present
    const adjustedDate = date.includes("UTC") ? date.replace(" UTC", "") : date;

    for (const formatString of dateFormats) {
      try {
        const parsedDate = parse(adjustedDate, formatString, new Date());

        if (!isNaN(parsedDate.getTime())) {
          // Check if the year is a two-digit year
          const year = parsedDate.getFullYear();
          if (year < 100) {
            // Adjust two-digit year to 20xx
            parsedDate.setFullYear(year + 2000);
          }
          return format(parsedDate, targetDateFormat); // Return the formatted date
        }
      } catch {
        // Ignore and try the next format
        continue;
      }
    }

    return date; // Return the original date if no format matched
  };

  const handleEditCell = (rowIndex: number, cellIndex: number, value: string) => {
    setEditableData((prevData) => {
      if (prevData) {
        const updatedData = [...prevData];
        updatedData[rowIndex][cellIndex] = cellIndex === 0 ? standardizeDate(value) : value;
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

  const handleDeleteColumn = (columnIndex: number) => {
    if (editableData && editableData[0].length > 1) {
      const updatedData = editableData.map((row) => {
        const newRow = [...row];
        newRow.splice(columnIndex, 1); // Remove the specific column
        return newRow;
      });
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

  const handleTransposeCSV = () => {
    if (editableData) {
      const transposedData = editableData[0].map((_, colIndex) =>
        editableData.map((row) => row[colIndex])
      );
      setEditableData(transposedData);
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

        const xValues = data.slice(1).map((row) => standardizeDate(row[0])); // Process dates in the first column
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
      style={{ height: "450px", width: "100%", maxWidth: "50vw" }} // Fixed box size
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
            <button
              onClick={handleTransposeCSV}
              className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
            >
              Flip CSV
            </button>
            <button
              onClick={handleSortAndGroupByDate}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
            >
              Fix Date
            </button>
          </div>

          <div
            className="flex-grow border border-borderBlue rounded-md overflow-hidden"
            style={{
              height: `${tableHeight}px`, // Fixed height for the table
              width: "100%",
              overflowY: "auto", // Enable vertical scrolling
              overflowX: "auto",
            }}
          >
            <div className="overflow-x-auto h-full">
              <table className="min-w-max table-auto border-collapse">
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
                        <input
                          type="text"
                          value={header}
                          onChange={(e) => handleEditCell(0, columnIndex, e.target.value)}
                          className="bg-transparent text-white w-full text-center"
                        />
                        <button
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 text-red-500 hidden group-hover:block"
                          onClick={() => handleDeleteColumn(columnIndex)} // Pass the column index here
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
