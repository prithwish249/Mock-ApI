const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfkit = require("pdfkit");
const sharp = require("sharp");

const app = express();
const port = 8000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Store generated API endpoints
const dynamicRoutes = new Map();

// Utility functions for file generation
const fileGenerators = {
  text: (filePath) => {
    fs.writeFileSync(filePath, "Sample text file generated by backend.");
    return Promise.resolve();
  },
  
  pdf: (filePath) => {
    return new Promise((resolve, reject) => {
      const doc = new pdfkit();
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);
      doc.text("Sample PDF File Generated by Backend");
      doc.end();
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  },
  
  image: (filePath) => {
    // Change the extension to .png for proper image format
    const pngFilePath = filePath.replace(/\.image$/, '.png');
    return sharp({
      create: {
        width: 300,
        height: 300,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 }
      }
    })
    .png() // Explicitly specify PNG format
    .toFile(pngFilePath)
    .then(() => {
      // If the original path is different, rename the file
      if (pngFilePath !== filePath) {
        fs.renameSync(pngFilePath, filePath);
      }
    });
  }
};

// Generate API endpoint
app.post("/generate-api", (req, res) => {
  try {
    const { method, body, body_type, file_type } = req.body;
    
    // Validation
    if ((!body || Object.keys(body).length === 0) && (!file_type || file_type.trim() === "")) {
      return res.status(400).json({
        status: "error",
        message: "Empty body and file_type. No API created."
      });
    }

    // Map 'image' file type to proper extension
    const mappedFileType = file_type === 'image' ? 'png' : file_type;
    
    // Generate unique API endpoint
    const apiUrl = `/api/v1/test-${Date.now()}`;
    dynamicRoutes.set(apiUrl, { 
      method, 
      body, 
      body_type, 
      file_type: mappedFileType 
    });
    
    res.json({
      status: "success",
      message: "API generated successfully",
      api_url: apiUrl
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to generate API",
      error: error.message
    });
  }
});

// Handle dynamic API calls
app.all("/api/v1/test-:id", upload.single("file"), async (req, res) => {
  try {
    const apiUrl = `/api/v1/test-${req.params.id}`;
    const route = dynamicRoutes.get(apiUrl);
    
    if (!route) {
      return res.status(404).json({
        status: "error",
        message: "API not found."
      });
    }
    
    const { method, body, body_type, file_type } = route;
    
    // Handle file generation if requested
    if (file_type) {
      const fileName = `sample-file.${file_type}`;
      const filePath = path.join(__dirname, "sample", fileName);
      
      // Ensure sample directory exists
      if (!fs.existsSync(path.join(__dirname, "sample"))) {
        fs.mkdirSync(path.join(__dirname, "sample"), { recursive: true });
      }
      
      // Generate file based on type
      const generator = fileGenerators[file_type === 'png' ? 'image' : file_type];
      if (!generator) {
        return res.status(400).json({
          status: "error",
          message: `Unsupported file type: ${file_type}`
        });
      }
      
      await generator(filePath);
      
      return res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        // Clean up file after download
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('File cleanup error:', unlinkErr);
        });
      });
    }
    
    // Return API response
    res.json({
      status: "success",
      request: {
        method,
        body: body || {},
        body_type
      },
      file: null
    });
    
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});