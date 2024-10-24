"use client";

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";

const CSVPanel = () => {
    const [editableData, setEditableData] = useState<string[][] | null>(null); // Only use editableData
    const [tableHeight, setTableHeight] = useState<number>(0);
    const [view, setView] = useState<"initial" | "table">("initial"); // Manage view state

    const containerRef = useRef<HTMLDivElement | null>(null);
    const buttonRowRef = useRef<HTMLDivElement | null>(null);

    // Calculate the available height dynamically
    useEffect(() => {
        const updateTableHeight = () => {
            if (containerRef.current && buttonRowRef.current) {
                const containerHeight = containerRef.current.clientHeight;
                const buttonRowHeight = buttonRowRef.current.clientHeight;
                const padding = 16;

                const availableHeight = containerHeight - buttonRowHeight - padding;
                setTableHeight(availableHeight);
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
                    setEditableData(result.data as string[][]);
                    setView("table"); // Switch to table view after import
                },
                error: (error) => console.error("Error parsing CSV:", error),
            });
        }
    };

    const handleEditCell = (rowIndex: number, cellIndex: number, value: string) => {
        if (editableData) {
            const updatedData = [...editableData];
            updatedData[rowIndex][cellIndex] = value;
            setEditableData(updatedData);
        }
    };

    const handleCancel = () => {
        setEditableData(null);
        setView("initial"); // Go back to the initial view
    };

    const handleAddRow = () => {
        if (editableData) {
            const newRow = new Array(editableData[0].length).fill(""); // Create a blank row
            setEditableData([...editableData, newRow]);
        }
    };

    const handleAddColumn = () => {
        if (editableData) {
            const updatedData = editableData.map((row) => [...row, ""]); // Add a blank column
            setEditableData(updatedData);
        }
    };

    const handleDeleteRow = () => {
        if (editableData && editableData.length > 1) {
            setEditableData(editableData.slice(0, -1)); // Remove the last row
        }
    };

    const handleDeleteColumn = () => {
        if (editableData && editableData[0].length > 1) {
            const updatedData = editableData.map((row) => row.slice(0, -1)); // Remove the last column
            setEditableData(updatedData);
        }
    };

    const handleCreateCSV = () => {
        const blankCSV = Array.from({ length: 3 }, () => new Array(3).fill(""));
        setEditableData(blankCSV); // Initialize with a 3x3 blank grid
        setView("table"); // Switch to table view
    };

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
                    {/* Control Buttons */}
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
                            onClick={handleDeleteRow}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                        >
                            Delete Row
                        </button>
                        <button
                            onClick={handleDeleteColumn}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                        >
                            Delete Column
                        </button>
                        <button
                            onClick={handleCancel}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Scrollable Table Container */}
                    <div
                        className="flex-grow overflow-auto border border-borderBlue rounded-md"
                        style={{ height: `${tableHeight}px` }}
                    >
                        <div className="w-full overflow-x-auto">
                            <table className="min-w-full table-auto border-collapse">
                                <thead>
                                    <tr>
                                        {editableData?.[0].map((header, index) => (
                                            <th
                                                key={index}
                                                className={`border border-borderBlue px-4 py-2 text-white bg-blue-600 sticky top-0 ${
                                                    index === 0 ? "left-0 z-10" : ""
                                                }`}
                                                style={{
                                                    backgroundColor: index === 0 ? "#2563eb" : "",
                                                }}
                                            >
                                                {header || `Column ${index + 1}`}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {editableData?.slice(1).map((row, rowIndex) => (
                                        <tr key={rowIndex} className="even:bg-panel odd:bg-black">
                                            {row.map((cell, cellIndex) => (
                                                <td
                                                    key={cellIndex}
                                                    className={`border border-borderBlue px-4 py-2 text-white ${
                                                        cellIndex === 0 ? "sticky left-0 z-10" : ""
                                                    }`}
                                                    style={{
                                                        backgroundColor:
                                                            cellIndex === 0 ? "#1e3a8a" : "",
                                                    }}
                                                >
                                                    <input
                                                        type="text"
                                                        value={cell}
                                                        onChange={(e) =>
                                                            handleEditCell(
                                                                rowIndex + 1,
                                                                cellIndex,
                                                                e.target.value
                                                            )
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
