"use client";

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";

const CSVPanel = () => {
    const [csvData, setCsvData] = useState<string[][] | null>(null);
    const [editableData, setEditableData] = useState<string[][] | null>(null);
    const [tableHeight, setTableHeight] = useState<number>(0);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const buttonRowRef = useRef<HTMLDivElement | null>(null);

    // Calculate the available height dynamically
    useEffect(() => {
        const updateTableHeight = () => {
            if (containerRef.current && buttonRowRef.current) {
                const containerHeight = containerRef.current.clientHeight;
                const buttonRowHeight = buttonRowRef.current.clientHeight;
                const availableHeight = containerHeight - buttonRowHeight - 16; // Extra padding/margin
                setTableHeight(availableHeight);
            }
        };

        // Calculate height on load and on window resize
        updateTableHeight();
        window.addEventListener("resize", updateTableHeight);

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener("resize", updateTableHeight);
        };
    }, []);

    const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                complete: (result) => {
                    setCsvData(result.data as string[][]);
                    setEditableData(result.data as string[][]); // Set editable version
                },
                error: (error) => {
                    console.error("Error parsing CSV:", error);
                },
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
        setCsvData(null);
        setEditableData(null);
    };

    return (
        <div
            ref={containerRef}
            className="flex-1 bg-panel border-2 border-borderBlue rounded-xl shadow-lg p-4 box-border"
        >
            {csvData ? (
                <div className="relative h-full flex flex-col">
                    {/* Import and Cancel Buttons */}
                    <div ref={buttonRowRef} className="flex gap-2 mb-4">
                        <label
                            htmlFor="csv-upload"
                            className="bg-borderBlue text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 transition-colors"
                        >
                            Import
                        </label>
                        <button
                            onClick={handleCancel}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <input
                            id="csv-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleCSVUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Scrollable Table Container */}
                    <div
                        className="flex-grow overflow-auto border border-borderBlue rounded-md"
                        style={{ height: `${tableHeight}px` }}
                    >
                        <table className="w-full min-w-max table-auto border-collapse">
                            <thead>
                                <tr>
                                    {editableData?.[0].map((header, index) => (
                                        <th
                                            key={index}
                                            className={`border border-borderBlue px-4 py-2 text-white bg-blue-600 sticky top-0 ${
                                                index === 0 ? 'left-0 z-10' : ''
                                            }`}
                                            style={{ backgroundColor: index === 0 ? '#2563eb' : '' }}
                                        >
                                            {header}
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
                                                    cellIndex === 0 ? 'sticky left-0 z-10' : ''
                                                }`}
                                                style={{
                                                    backgroundColor: cellIndex === 0 ? '#1e3a8a' : '',
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
            ) : (
                <div className="h-full flex flex-col items-center justify-center">
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
                </div>
            )}
        </div>
    );
};

export default CSVPanel;
