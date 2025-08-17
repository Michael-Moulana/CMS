
# *CMS – Content Management System*

A full-stack CMS that enables admins to create, update, and organize content (Navigations and Pages) across webpages. Built with **Node.js**, **React.js**, and **MongoDB**.

---

# *Table of Contents*

* [Features](#-features)
* [API Documentation](#-api-documentation)
* [Usage](#-usage)
* [Getting Started](#-getting-started)
* [Prerequisites](#-prerequisites)  
* [Run Locally](#-run-locally)   
   

---

# *Features*

* **Authentication & Authorization** (JWT-based)  
* **Pages Management**
* **Site Navigation Management**
* **Admin Dashboard** for managing content  
* **Responsive Frontend** built with React + Tailwind  

---

# *API Documentation*

Navigation Endpoints

* GET /api/navigation: Retrieve all navigation items.

* POST /api/navigation: Create a new navigation item.

* PUT /api/navigation/:id: Update an existing navigation item.

* DELETE /api/navigation/:id: Delete a navigation item.

Pages Endpoints

* GET /api/pages: Retrieve all pages.

* POST /api/pages: Create a new page.

* PUT /api/pages/:id: Update an existing page.

* DELETE /api/pages/:id: Delete a page.


---

# *Usage*

In order to use the CMS, you need to be authenticated all the time. So, the first step to use the app is registering, then login, and then you will get navigated to the dashboard where you can choose which CRUD you want to do, and directed to specific page.

* Login & Register: Access the login page at /login and /register.
* Admin Dashboard: Access the dashboard at /dashboard to manage content.
* Page Management: Access the page management route at /dashboard/page to perform CRUD operations.
* Navigation Management: Access the navigation management route at /dashboard/navigation to perform CRUD operations.
* User Profile: Access the profile management at /profile to see a logged in user credentials and perform update operation.
  
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


