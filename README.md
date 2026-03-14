📦 CoreInventory
A modular Inventory Management System (IMS) built to digitize and streamline stock operations. Developed in 8 hours for the Odoo x Indus Hackathon.

🚀 The Problem
Many growing businesses are held back by fragmented inventory tracking. Relying on manual registers, disconnected Excel sheets, and scattered tracking methods leads to human error, stockouts, and wasted time. There is a critical need for a centralized, real-time solution.

💡 Our Solution
CoreInventory replaces chaotic manual processes with a streamlined, real-time web application. We built a fully functional Minimum Viable Product (MVP) that handles secure authentication and live database interactions, allowing business owners to ditch the spreadsheets and manage their warehouse operations digitally.

✨ Core Features
Centralized Stock Dashboard: A real-time, single source of truth for all inventory levels.

Live Database Integration: Fully connected to a Supabase backend to ensure data is persistent, scalable, and instantly updated across all clients.

Secure Authentication: Integrated EmailJS to handle secure, seamless user login and verification flows perfectly.

Intuitive UI: Designed with a clean, responsive interface so warehouse staff can learn and use it with zero training.

🛠️ Tech Stack
Frontend / UI: HTML, CSS, JavaScript (Designed for immediate responsiveness and clarity)

Backend Logic: JavaScript / API Integrations

Database (BaaS): Supabase (PostgreSQL-backed real-time database)

Authentication: EmailJS

👨‍💻 The Team (1st-Year Students)
We divided and conquered to build a full-stack application in under 8 hours:

Maharshi – Database Architect (Supabase Integration & Schema)

Priyanshu & Parth – Backend Developer (Logic & API Routing)

Jenish – UI/Frontend Developer (Interface & User Experience)

Priyanshu – UI/Frontend Developer (Interface & Styling)

## 🛠️ Setup & Installation Guide

Follow these steps to set up and run the project locally.

### 1. Install Recommended VS Code Extensions

For better development experience, install the following extensions in VS Code:

- ESLint
- Prettier – Code Formatter
- DotENV (.env) Support
- SQLite Viewer
- Tailwind CSS IntelliSense

These extensions help with code formatting, linting, environment variable support, database viewing, and Tailwind CSS autocompletion.



### 2. Clone the Repository


git clone <repository-url>


Navigate into the project folder:


cd coreinventory

### 3. Install Dependencies

Install all required packages:

npm install



### 4. Run the Frontend (Client)

Open a new terminal and run:


cd client
npm run dev


### 5. Start the Application

After running the command above, Vite will start the development server.

You can open the application in your browser at:


http://localhost:5173

### 6. Environment Variables

Make sure the `.env` file is properly configured before running the project.  
This file stores important environment variables such as database configuration and API settings.


✅ The application should now be running locally in development mode.
