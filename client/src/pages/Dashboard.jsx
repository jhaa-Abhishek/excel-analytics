import { useState, useEffect, useRef } from "react";
import API from "../utils/api";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import { downloadAsPDF, downloadAsPNG } from "../utils/exportReport";
// import { downloadAsPDF, downloadAsPNG } from "./../utils/exportReport.ts";
import Plot from "react-plotly.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [chartType, setChartType] = useState("bar");
  const reportRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login"); // redirect to login page
  };

  // const handleUpload = async () => {
  //   if (!file) return alert("Please select a file");
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   try {
  //     const res = await API.post("/upload", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //     });

  //     setColumns(res.data.columns);
  //     setData(res.data.data);
  //   } catch (err) {
  //     console.log(err);
  //     alert("Upload failed");
  //   }
  // };
  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setColumns(res.data.columns);
      setData(res.data.data);

      // ✅ Add new item at top of history and select it
      setHistory((prev) => [res.data, ...prev]);
      setSelectedHistoryId(res.data._id);

      setFile(null);
    } catch (err) {
      console.log(err);
      alert("Upload failed");
    }
  };

  // Prepare chart data
  const chartData = {
    labels: data.map((row) => row[xAxis]),
    datasets: [
      {
        label: `${yAxis} vs ${xAxis}`,
        data: data.map((row) => Number(row[yAxis])),
        backgroundColor: "rgba(0, 29, 249, 0.635)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  // Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get("/history", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };
    fetchHistory();
  }, []);

  // Load old data when user clicks a history item
  const loadHistory = async (id) => {
    try {
      const res = await API.get(`/history/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setColumns(res.data.columns);
      setData(res.data.data);

      // ✅ highlight the selected history
      setSelectedHistoryId(id);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  //delete history item
  const deleteHistory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this upload?")) return;

    try {
      await API.delete(`/history/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // ✅ Remove from history state
      setHistory((prev) => prev.filter((item) => item._id !== id));

      // If the deleted item was currently selected, clear preview
      if (selectedHistoryId === id) {
        setSelectedHistoryId(null);
        setColumns([]);
        setData([]);
      }
    } catch (err) {
      console.error("Failed to delete history item", err);
      alert("Delete failed");
    }
  };

  //rename history item
  const renameHistory = async (item) => {
    if (!item.newName || item.newName === item.filename) {
      setHistory((prev) =>
        prev.map((h) => (h._id === item._id ? { ...h, editing: false } : h))
      );
      return;
    }

    try {
      const res = await API.put(
        `/history/${item._id}/rename`,
        { newName: item.newName },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setHistory((prev) =>
        prev.map((h) =>
          h._id === item._id ? { ...res.data, editing: false } : h
        )
      );
    } catch (err) {
      console.error("Rename failed", err);
      alert("Rename failed");
    }
  };

  //prepare 3d charts
  const plotly3DData = [
    {
      x: data.map((row) => row[xAxis]),
      y: data.map((row) => Number(row[yAxis])),
      z: data.map((_, i) => i), // Use index as Z or add another column for Z
      mode: "markers",
      type: "scatter3d",
      marker: { size: 5, color: "blue" },
    },
  ];

  const plotly3DLayout = {
    margin: { l: 0, r: 0, b: 0, t: 0 },
    scene: {
      xaxis: { title: xAxis },
      yaxis: { title: yAxis },
      zaxis: { title: "Index" },
    },
  };

  return (
    <div className="flex h-screen">
      {/* <div className="p-6 flex"> */}
      {/* Upload History Panel */}

      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r p-4 flex flex-col">
        <h3 className="font-bold mb-4">Upload History</h3>
        <ul className="flex-1 overflow-y-auto space-y-2">
          {history.map((item) => (
            <li
              key={item._id}
              className={`group flex justify-between items-center p-2 rounded transition ${
                selectedHistoryId === item._id
                  ? "bg-blue-100 border border-blue-500"
                  : "hover:bg-gray-200"
              }`}
            >
              <div
                onClick={() => loadHistory(item._id)}
                className="cursor-pointer flex-1"
              >
                <input
                  type="text"
                  value={item.editing ? item.newName : item.filename}
                  onChange={(e) =>
                    setHistory((prev) =>
                      prev.map((h) =>
                        h._id === item._id
                          ? { ...h, newName: e.target.value }
                          : h
                      )
                    )
                  }
                  onBlur={() => renameHistory(item)}
                  className={`bg-transparent border-none outline-none w-full ${
                    item.editing ? "border-b border-blue-500" : ""
                  }`}
                  readOnly={!item.editing}
                />
                <p className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Rename Button */}
              <button
                onClick={() =>
                  setHistory((prev) =>
                    prev.map((h) =>
                      h._id === item._id
                        ? { ...h, editing: !h.editing, newName: h.filename }
                        : h
                    )
                  )
                }
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                ✎
              </button>

              {/* Delete Button */}
              <button
                onClick={() => deleteHistory(item._id)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">
          You are logged in as{" "}
          <span className="text-blue-600">{user?.role}</span>
        </h2>

        {/* File Upload */}
        <div className="mt-4">
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button
            className="ml-2 px-4 py-1 bg-blue-600 text-white rounded"
            onClick={handleUpload}
          >
            Upload
          </button>
        </div>

        {/* Axis Selectors */}
        {columns.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Select X and Y Axis</h3>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="border p-2 mr-2"
            >
              <option value="">X Axis</option>
              {columns.map((col) => (
                <option key={col}>{col}</option>
              ))}
            </select>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="border p-2"
            >
              <option value="">Y Axis</option>
              {columns.map((col) => (
                <option key={col}>{col}</option>
              ))}
            </select>
          </div>
        )}

        {/* Chart Type Selector */}
        {xAxis && yAxis && (
          <div className="mt-6">
            <label className="mr-2 font-semibold">Select Chart Type: </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="border p-2"
            >
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="pie">Pie</option>
              <option value="3d">3D Scatter</option>
            </select>
          </div>
        )}

        {/* Render Chart */}
        {/* {xAxis && yAxis && data.length > 0 && (
        <div className="mt-6 w-full max-w-3xl">
          {chartType === "bar" && <Bar data={chartData} />}
          {chartType === "line" && <Line data={chartData} />}
          {chartType === "pie" && <Pie data={chartData} />}
        </div>
      )} */}

        {/* Report / Chart Section (this will be exported) */}
        <div ref={reportRef} className="bg-white shadow-md p-4 rounded-lg mt-6">
          <h2 className="text-lg font-semibold mb-2">Selected Data Report</h2>

          {/* Render Chart */}
          {xAxis && yAxis && data.length > 0 && (
            <div className="w-full max-w-3xl">
              {chartType === "bar" && <Bar data={chartData} />}
              {chartType === "line" && <Line data={chartData} />}
              {chartType === "pie" && <Pie data={chartData} />}
              {chartType === "3d" && (
                <Plot
                  data={plotly3DData}
                  layout={plotly3DLayout}
                  style={{ width: "100%", height: "500px" }}
                />
              )}
            </div>
          )}

          {/* Data Preview */}
          {data.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Data Preview</h3>
              <div className="overflow-x-auto max-h-64 border rounded">
                <table className="min-w-full table-auto text-sm">
                  <thead>
                    <tr>
                      {columns.map((col) => (
                        <th key={col} className="border px-2 py-1">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        {columns.map((col) => (
                          <td key={col} className="border px-2 py-1">
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Download Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => downloadAsPNG(reportRef)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Download PNG
          </button>
          <button
            onClick={() => downloadAsPDF(reportRef)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
