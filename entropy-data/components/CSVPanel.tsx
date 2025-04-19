"use client";

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { parse, format } from "date-fns";
import { PlotData } from "./types";

interface CSVPanelProps {
  setPlotData: (data: PlotData | null) => void;
}

const CSVPanel: React.FC<CSVPanelProps> = ({ setPlotData }) => {
  // ────────────────────────────────────────────────
  // state & refs
  // ────────────────────────────────────────────────
  const [editableData, setEditableData] = useState<string[][] | null>(null);
  const [tableHeight, setTableHeight] = useState<number>(0);
  const [view, setView] = useState<"initial" | "table">("initial");

  // drag‑and‑drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggingType, setDraggingType] = useState<"row" | "column" | null>(null);

  // API import modal
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiInput, setApiInput] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRowRef = useRef<HTMLDivElement | null>(null);

  // ────────────────────────────────────────────────
  // date helpers
  // ────────────────────────────────────────────────
  const targetDateFormat = "yyyy-MM-dd";
  const dateFormats = [
    "yyyy-MM-dd","MM/dd/yyyy","dd-MM-yyyy","dd/MM/yyyy","MMM dd, yyyy","MMMM dd, yyyy","yyyy/MM/dd","MM-dd-yyyy","yyyy-MM-dd HH:mm:ss","MM/dd/yyyy HH:mm:ss","dd-MM-yyyy HH:mm:ss","yyyyMMdd","dd MMM yyyy","MMM dd, yyyy h:mm a","yyyy-MM-dd'T'HH:mm:ss","yyyy-MM-dd HH:mm:ss.SSS","M/d/yy",
  ];

  // ────────────────────────────────────────────────
  // size calculations
  // ────────────────────────────────────────────────
  useEffect(() => {
    const updateTableHeight = () => {
      if (containerRef.current && buttonRowRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const buttonRowHeight = buttonRowRef.current.clientHeight;
        const padding = 30;
        setTableHeight(containerHeight - buttonRowHeight - padding);
      }
    };
    updateTableHeight();
    window.addEventListener("resize", updateTableHeight);
    return () => window.removeEventListener("resize", updateTableHeight);
  }, []);

  // ────────────────────────────────────────────────
  // CSV helpers
  // ────────────────────────────────────────────────
  const standardizeDate = (date: string | undefined | null): string => {
    if (!date || typeof date !== "string") return "";
    const adjusted = date.includes("UTC") ? date.replace(" UTC", "") : date;
    for (const fmt of dateFormats) {
      try {
        const parsed = parse(adjusted, fmt, new Date());
        if (!isNaN(parsed.getTime())) {
          if (parsed.getFullYear() < 100) parsed.setFullYear(parsed.getFullYear() + 2000);
          return format(parsed, targetDateFormat);
        }
      } catch { /* continue */ }
    }
    return date;
  };

  const sortAndGroupByDate = (data: string[][]): string[][] => {
    if (data.length < 2) return data;
    const header = data[0];
    const body = data.slice(1);
    const grouped: Record<string, number[]> = {};
    body.forEach((row) => {
      const d = standardizeDate(row[0]);
      if (!d) return;
      if (!grouped[d]) grouped[d] = new Array(row.length - 1).fill(0);
      row.slice(1).forEach((v, i) => grouped[d][i] += parseFloat(v) || 0);
    });
    const sorted = Object.entries(grouped)
      .sort(([a],[b])=>new Date(a).getTime()-new Date(b).getTime())
      .map(([d,vals])=>[d,...vals.map(String)]);
    return [header,...sorted];
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      complete: ({ data }) => {
        const csv = sortAndGroupByDate(data as string[][]);
        setEditableData(csv);
        setView("table");
      },
      error: (err) => console.error(err),
    });
  };

  // ────────────────────────────────────────────────
  // API import workflow
  // ────────────────────────────────────────────────
  const openApiModal = () => setIsApiModalOpen(true);
  const closeApiModal = () => { setIsApiModalOpen(false); setApiInput(""); };

  const handleApiConfirm = async () => {
    const input = apiInput.trim();
    if (!input) return alert("Textbox is empty");

    try {
      let csvText = "";

      // 1️⃣ raw CSV pasted
      if (input.includes(",") || input.includes("\n")) {
        csvText = input;
      }
      // 2️⃣ full URL to CSV
      else if (input.startsWith("http")) {
        const res = await fetch(input);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        csvText = await res.text();
      }
      // 3️⃣ assume it is a Dune query ID → call our backend to run the Python script
      else {
        const res = await fetch("/api/duneCsv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queryId: input }),
        });
        if (!res.ok) throw new Error(`Dune fetch failed (${res.status})`);
        csvText = await res.text();
      }

      // parse & load
      Papa.parse(csvText, {
        complete: ({ data }) => {
          const csv = sortAndGroupByDate(data as string[][]);
          setEditableData(csv);
          setView("table");
          closeApiModal();
        },
        error: (err) => {
          console.error(err);
          alert("Failed to parse CSV.");
        },
      });
    } catch (err) {
      console.error(err);
      alert("Import failed – check console for details.");
    }
  };

  // ────────────────────────────────────────────────
  // Table manipulation helpers
  // ────────────────────────────────────────────────
  const handleAddRow = () => editableData && setEditableData([...editableData, new Array(editableData[0].length).fill("")]);
  const handleAddColumn = () => editableData && setEditableData(editableData.map(r => [...r, ""]));
  const handleDeleteRow = () => editableData && editableData.length>1 && setEditableData(editableData.slice(0,-1));
  const handleDeleteColumn = (idx:number)=> editableData&&editableData[0].length>1 && setEditableData(editableData.map(r=>r.filter((_,i)=>i!==idx)));
  const handleReorderRows = (src:number,tgt:number)=>editableData&&setEditableData(prev=>{const d=[...prev!];const [r]=d.splice(src,1);d.splice(tgt,0,r);return d});
  const handleReorderCols = (src:number,tgt:number)=>editableData&&setEditableData(prev=>prev!.map(r=>{const row=[...r];const [c]=row.splice(src,1);row.splice(tgt,0,c);return row;}));
  const handleTranspose = ()=>editableData&&setEditableData(editableData[0].map((_,c)=>editableData.map(r=>r[c])));
  const handleCancel = ()=>{setEditableData(null);setPlotData(null);setView("initial");};
    
  const handleDragStart=(idx:number,type:"row"|"column")=>{setDraggedIndex(idx);setDraggingType(type);}  ;
  const handleDrop = (tgt: number) => {
    if (draggedIndex === null || !draggingType) return;
  
    if (draggingType === "row") {
      handleReorderRows(draggedIndex, tgt);
    } else {
      handleReorderCols(draggedIndex, tgt);
    }
  
    setDraggedIndex(null);
    setDraggingType(null);
  };
  // update plot
  useEffect(()=>{
    if(!editableData) return;
    const [header,...rows]=editableData;
    if(!rows.length) return;
    const timestamps = rows.map(r=>standardizeDate(r[0]));
    const plot:PlotData={};
    header.slice(1).forEach((h,ci)=>{
      plot[h]={timestamp:timestamps,value:rows.map(r=>parseFloat(r[ci+1]||"0"))};
    });
    setPlotData(plot);
  },[editableData,setPlotData, standardizeDate]);

  // ────────────────────────────────────────────────
  // render
  // ────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="flex-1 bg-panel border-2 border-borderBlue rounded-xl shadow-lg p-4 box-border" style={{height:"450px",width:"100%",maxWidth:"50vw"}}>
      {/* Initial */}
      {view==="initial"?(
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <button onClick={openApiModal} className="bg-borderBlue text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors">Import by API</button>
          <label htmlFor="csv-upload" className="bg-borderBlue text-white px-6 py-3 rounded-md cursor-pointer hover:bg-blue-600 transition-colors">Import CSV</label>
          <input id="csv-upload" type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          <button onClick={()=>{const blank=Array.from({length:3},()=>new Array(3).fill(""));setEditableData(blank);setView("table");}} className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors">Create CSV</button>
        </div>
      ):(
        /* Table */
        <div className="relative h-full flex flex-col">
          <div ref={buttonRowRef} className="flex gap-2 mb-4 flex-wrap">
            <button onClick={handleAddRow} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">Add Row</button>
            <button onClick={handleAddColumn} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">Add Column</button>
            <button onClick={handleCancel} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">Cancel</button>
            <button onClick={handleTranspose} className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors">Flip CSV</button>
            <button onClick={() => editableData && setEditableData(sortAndGroupByDate(editableData))} className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors">Fix Date</button>
          </div>
          {/* table */}
          <div className="flex-grow border border-borderBlue rounded-md overflow-hidden" style={{height:`${tableHeight}px`,overflowY:"auto",overflowX:"auto"}}>
            <div className="overflow-x-auto h-full">
              <table className="min-w-max table-auto border-collapse">
                <thead>
                  <tr>
                    {editableData?.[0].map((h,ci)=>(
                      <th key={ci} className="border border-borderBlue px-4 py-2 text-white bg-blue-600 top-0 relative group" draggable onDragStart={()=>handleDragStart(ci,"column")} onDragOver={e=>e.preventDefault()} onDrop={()=>handleDrop(ci)}>
                        <input value={h} onChange={e=>setEditableData(d=>d&&d.map((r,i)=>i===0?r.map((c,j)=>j===ci?e.target.value:c):r))} className="bg-transparent text-white w-full text-center" />
                        <button className="absolute right-1 top-1/2 transform -translate-y-1/2 text-red-500 hidden group-hover:block" onClick={()=>handleDeleteColumn(ci)}>✕</button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {editableData?.slice(1).map((row,ri)=>(
                    <tr key={ri} className="even:bg-panel odd:bg-black group" draggable onDragStart={()=>handleDragStart(ri,"row")} onDragOver={e=>e.preventDefault()} onDrop={()=>handleDrop(ri)}>
                      {row.map((cell,ci)=>(
                        <td key={ci} className="border border-borderBlue px-4 py-2 text-white relative">
                          {ci===0&&<button className="absolute left-1 top-1/2 transform -translate-y-1/2 text-red-500 hidden group-hover:block" onClick={handleDeleteRow}>✕</button>}
                          <input value={cell} onChange={e=>setEditableData(d=>{if(!d)return d;const nd=[...d];nd[ri+1][ci]=ci===0?standardizeDate(e.target.value):e.target.value;return nd;})} className="bg-transparent text-white w-full" />
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

      {/* API Modal */}
      {isApiModalOpen&&(
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative bg-white text-black rounded-lg shadow-lg p-8 w-[80%] max-w-md">
            <button onClick={closeApiModal} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold">&times;</button>
            <h3 className="text-xl font-semibold mb-6">Import by API</h3>
            <div className="mb-4">
              <label htmlFor="api-input" className="block text-sm font-medium text-gray-700 mb-2">API Endpoint, Dune Query ID, or CSV Text:</label>
              <textarea id="api-input" rows={4} value={apiInput} onChange={e=>setApiInput(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1234567  (Dune query ID)   OR   https://example.com/data.csv   OR   paste CSV here" />
            </div>
            <div className="flex justify-center">
              <button onClick={handleApiConfirm} className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVPanel;
