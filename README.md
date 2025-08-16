
# *CMS – Content Management System*

A full-stack CMS that enables admins to create, update, and organize content (NAvigations and Pages) across webpages. Built with **Node.js**, **React.js**, and **MongoDB**.

---

# *Table of Contents*

* [Features](#-features)  
* [Getting Started](#-getting-started)  
* [Run Locally](#-run-locally)   
   

---

# *Features*

* 🔐 **Authentication & Authorization** (JWT-based)  
* 📝 **Pages Management** (Create, update, delete webpages)  
* 🧭 **Site Navigation Management** (Custom navigation menus)  
* 📊 **Admin Dashboard** for managing content  
* ⚡ **Responsive Frontend** built with React + Tailwind  

---

# *Getting Started*

Follow these instructions to set up the project locally.  

## *Prerequisites*

Make sure you have installed:  

* [Node.js](https://nodejs.org/) (v18+)  
* [MongoDB](https://www.mongodb.com/)  
* [Git](https://git-scm.com/)  

---

# *Run Locally*

Clone the project:  

```bash
git clone https://github.com/Michael-Moulana/CMS.git
cd CMS
```

Backend Setup

```bash
cd backend
npm install
```

Create a .env file in /backend with:

```bash
MONGO_URI=mongodb://localhost:27017/cms
JWT_SECRET=your_secret_key
PORT=5001
```

Start the backend server:

```bash
npm run dev
```

Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```
The frontend will be available at:
👉 http://localhost:3000
