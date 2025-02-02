import { useState } from "react";
import axios from "axios";

function App() {
  const [method, setMethod] = useState("POST");
  const [bodys, setbodys] = useState([{ name: "", value: "" }]);
  const [apiUrl, setApiUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestStructure, setRequestStructure] = useState(null);
  const [generated, setGenerated] = useState(false);
  const [fileType, setFileType] = useState("");

  const addbody = () => setbodys([...bodys, { name: "", value: "" }]);

  const updatebody = (index, field, value) => {
    const newbodys = [...bodys];
    newbodys[index][field] = value;
    setbodys(newbodys);
  };

  const generateApi = async () => {
    setLoading(true);
    setGenerated(false);
    try {
      const bodyData = bodys.reduce((acc, body) => {
        if (body.name) acc[body.name] = body.value;
        return acc;
      }, {});

      const res = await axios.post("http://localhost:8000/generate-api", {
        method,
        body: bodyData,
        body_type: "JSON",
        file_type: fileType,
      });

      setApiUrl(`http://localhost:8000${res.data.api_url}`);
      setRequestStructure({ method, body: bodyData, file_type: fileType });
      setGenerated(true);
    } catch (error) {
      console.error("Error generating API", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <header className="w-full text-left pl-3 bg-orange-500 text-white py-1  text-base font-bold font-mono shadow-md">
        <svg
          width="50px"
          height="50px"
          viewBox="-1.6 -1.6 19.20 19.20"
          version="1.1"
          fill="#f6f4f4"
          className="pl-4"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path
              fill="#fdf7f7"
              d="M2.1 3.1c0.2 1.3 0.4 1.6 0.4 2.9 0 0.8-1.5 1.5-1.5 1.5v1c0 0 1.5 0.7 1.5 1.5 0 1.3-0.2 1.6-0.4 2.9-0.3 2.1 0.8 3.1 1.8 3.1s2.1 0 2.1 0v-2c0 0-1.8 0.2-1.8-1 0-0.9 0.2-0.9 0.4-2.9 0.1-0.9-0.5-1.6-1.1-2.1 0.6-0.5 1.2-1.1 1.1-2-0.3-2-0.4-2-0.4-2.9 0-1.2 1.8-1.1 1.8-1.1v-2c0 0-1 0-2.1 0s-2.1 1-1.8 3.1z"
            ></path>{" "}
            <path
              fill="#fdf7f7"
              d="M13.9 3.1c-0.2 1.3-0.4 1.6-0.4 2.9 0 0.8 1.5 1.5 1.5 1.5v1c0 0-1.5 0.7-1.5 1.5 0 1.3 0.2 1.6 0.4 2.9 0.3 2.1-0.8 3.1-1.8 3.1s-2.1 0-2.1 0v-2c0 0 1.8 0.2 1.8-1 0-0.9-0.2-0.9-0.4-2.9-0.1-0.9 0.5-1.6 1.1-2.1-0.6-0.5-1.2-1.1-1.1-2 0.2-2 0.4-2 0.4-2.9 0-1.2-1.8-1.1-1.8-1.1v-2c0 0 1 0 2.1 0s2.1 1 1.8 3.1z"
            ></path>{" "}
          </g>
        </svg>
        Mock API
      </header>
      <div className="max-w-5xl w-full p-6 mt-6 bg-white shadow-lg rounded-lg">
        <div className="mb-4">
          <label className="block text-lg font-medium">Select Method:</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="border p-2 mt-2 w-full rounded-lg"
          >
            <option>POST</option>
            <option>GET</option>
            <option>DELETE</option>
          </select>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-medium">Body Params:</h2>
          {bodys.map((body, index) => (
            <div key={index} className="flex items-center mt-2">
              <input
                className="border p-2 w-1/2 rounded-lg bg-orange-100"
                value={body.name}
                onChange={(e) => updatebody(index, "name", e.target.value)}
                placeholder={`Name ${index + 1}`}
              />
              <input
                className="border p-2 w-1/2 rounded-lg bg-orange-100 ml-2"
                value={body.value}
                onChange={(e) => updatebody(index, "value", e.target.value)}
                placeholder={`Value ${index + 1}`}
              />
            </div>
          ))}
          <button
            onClick={addbody}
            className="mt-2 bg-orange-500 text-white p-2 rounded-lg"
          >
            + Add More
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-medium">Select File Type:</h2>
          <select
            onChange={(e) => setFileType(e.target.value)}
            value={fileType}
            className="border p-2 w-full rounded-lg"
          >
            <option value="">Select File Type</option>
            <option value="image">Image</option>
            <option value="pdf">PDF</option>
            <option value="text">Text File</option>
          </select>
        </div>

        <div className="mt-4">
          <button
            onClick={generateApi}
            className="bg-orange-500 text-white p-3 w-full rounded-lg"
            disabled={loading}
          >
            {loading ? "Generating API..." : "Generate API"}
          </button>
        </div>

        {generated && (
          <div className="mt-6 p-4 bg-gray-100 shadow-md rounded-lg">
            <h3 className="text-lg font-medium">Generated API:</h3>
            <p className="text-blue-600 mt-2 break-words">{apiUrl}</p>
            <h3 className="text-lg font-medium mt-4">Request Structure:</h3>
            <div className="bg-white p-4 rounded-lg mt-2 border">
              <pre>{JSON.stringify(requestStructure, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
