# Nateeja - Smart School Result Card Generator

A modern web-based School Result Card Automation System that automates the process of generating student result cards from Excel files. Built with Next.js and Tailwind CSS.

![Nateeja Banner](public/logo.png)

## Features

### Core Features
- **Excel Upload & Processing** - Upload .xlsx/.xls files with automatic student data extraction
- **4 Professional Templates** - Standard Academic, Narrative Format, Modern Grid, Colorful Kids
- **Adaptive Column Detection** - Auto-detects Name, Roll No, Class, Father Name, and subject columns
- **Batch PDF Generation** - Generate individual result cards for all students in one click
- **Single PDF Download** - Download individual student result cards from the preview modal

### Student Management
- **Student Ranking System** - Top 3 position badges (1st, 2nd, 3rd) + class position for every student
- **Configurable Passing Criteria** - Set passing percentage (25-50%) and fail threshold (1-3 subjects)
- **Promotion Status** - Shows "Promoted to Grade X" or "Retained in Grade X"
- **Data Validation** - Duplicate detection, missing value alerts, incomplete record warnings

### Customization
- **School Identity** - Customize school name, address, academic year, exam type
- **School Logo** - Upload logo with position control (Left, Center, Right)
- **Digital Signatures** - Upload Principal and Class Teacher signatures (PNG/JPG)
- **Contact Information** - Add email, phone, website to result cards
- **Multiple Exam Types** - Final Examination, Mid Term, Pre-Board, Unit Test, Annual Exam

### Result Card Features
- **Result ID & Certificate No** - Unique tracking IDs on every card
- **Subject-wise Pass/Fail** - Each subject shows individual pass/fail status
- **Grade System** - Automatic grading (A+, A, B+, B, C, D, F)
- **Failed Subjects Warning** - Highlights subjects below passing threshold
- **Generated On Timestamp** - Date and time of generation on each card
- **Date/Time Filenames** - PDFs saved with timestamp for easy organization

### User Experience
- **Dark Mode** - Built-in theme toggle (Light/Dark)
- **Collapsible Sidebar** - Responsive navigation with collapse functionality
- **Recent Projects** - Track last 3 processed batches
- **Search & Filter** - Search students by name, roll number, or status
- **Pagination** - 10 students per page with page navigation
- **Settings Persistence** - All settings saved in LocalStorage

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | Framework (App Router) |
| Tailwind CSS | Styling |
| jsPDF | PDF Generation |
| SheetJS (xlsx) | Excel File Processing |
| Lucide React | Icons |
| LocalStorage | Settings Persistence |
| SessionStorage | Temporary File Storage |

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash

# Navigate to project
cd nateeja

# Install dependencies
npm install

# Run development server
npm run dev

License
This project is licensed under the MIT License - see the LICENSE file for details.

Author
Created by Muhammad Bilal

Support
For issues, questions, or suggestions, please open an issue on GitHub.
