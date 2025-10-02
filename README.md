# Image Labeling Studio

![App Screenshot](Screenshot.png)

**Image Labeling Studio** is a cross-platform desktop application built with [Electron](https://www.electronjs.org/) and [TailwindCSS](https://tailwindcss.com/).
It allows you to efficiently manage, label, crop, and segment images for machine learning datasets or computer vision projects.

---

## ✨ Features

* 📂 **Project Management**

  * Create, save, and load labeling projects.
  * Projects store images, annotations, and metadata in a selected directory.
  * Auto-save functionality to prevent data loss.

* 🖼 **Image Management**

  * Add or remove multiple images.
  * Batch import with progress tracking.
  * Restore original images after modifications.
  * View all images in grid layout with search functionality.

* 🏷 **Labeling Modes**

  * **Classification** → Assign multiple labels to images with quick-access common labels.
  * **Segmentation** → Advanced polygon annotation with three powerful tools:
    * **Polygon Tool** → Click to create precise vertex-based masks.
    * **Freehand Tool** → Draw masks naturally with mouse drag.
    * **Magnetic Lasso** → Intelligent edge-snapping tool that automatically detects and follows edges.
  * **Cropping** → Crop images with snapping, aspect lock, and rule-of-thirds grid.

* 🎨 **User Interface**

  * Modern dark theme with color-coded tools
  * Responsive layout optimized for different screen sizes
  * Tooltips and keyboard shortcuts for efficient workflow
  * Visual feedback for active tools and modes
  * Status indicators for saved/unsaved changes

* 🔄 **Navigation**

  * Move between images with arrow keys or navigation buttons
  * Image counter showing current position in dataset
  * Keyboard shortcuts for quick access to tools

* 💾 **Data Export**

  * Projects save automatically every 2 seconds after changes
  * Manual save option available
  * Export annotations in structured JSON format
  * Label usage tracking for common labels feature

---

## 🚀 Installation

### Prerequisites

* [Node.js](https://nodejs.org/) (v18+)
* [npm](https://www.npmjs.com/)

### Clone & Setup

```bash
git clone https://github.com/your-username/image-labeling-studio.git
cd image-labeling-studio
npm install
```

### Run in Development

```bash
npm start
```

### Build Distributable (AppImage, DMG, EXE, etc.)

```bash
npm run dist
```

---

## 🎯 Usage Guide

### Getting Started

1. **Create a New Project**: Click "New Project" and select an empty directory
2. **Add Images**: Click "Add Images" to import your dataset
3. **Choose Mode**: Select Classification, Segmentation, or Crop mode

### Keyboard Shortcuts

* **Arrow Keys**: Navigate between images
* **Z**: Undo last point in segmentation
* **Esc**: Cancel current operation
* **Enter**: Apply crop or finish polygon

---

## 🛠 Technical Details

### Edge Detection Algorithm

The Magnetic Lasso uses:
* **Sobel Operator**: Calculates image gradients in X and Y directions
* **Gradient Magnitude**: Detects edges based on intensity changes
* **Adaptive Thresholding**: User-controlled sensitivity for different image types
* **Spatial Search**: Configurable radius for edge point detection

### Architecture

* **Frontend**: HTML5 Canvas API for rendering, TailwindCSS for styling
* **Backend**: Electron IPC for file system operations
* **State Management**: Centralized state object with auto-save
* **Image Processing**: Client-side processing with optimized algorithms

---

## 📬 Contact

**Ali Ahmadi Esfidi**

📧 Email: [mr-ahmadi2004@outlook.com](mailto:mr-ahmadi2004@outlook.com)
