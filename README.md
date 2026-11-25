# WeAssist – Item & Purchase Management System

A full-stack web application developed using **Node.js, Express.js, MySQL, HTML, CSS, and JavaScript** to manage item categories, inventory, purchases, purchase history, and stock availability.

## Features

### Item Type Management
- Create, view, update, and delete item types.
- Prevent deletion of item types associated with existing items.
- Automatically refresh item type dropdown options.

### Item Management
- Add and view items.
- Update item details.
- Activate and deactivate items.
- Delete items without purchase history.
- Preserve items with purchase history by marking them inactive.
- Track current stock and availability.

### Purchase Management
- Create purchases with unique Order IDs.
- Add multiple items to a purchase.
- Validate item status and available stock.
- Update existing purchases.
- Automatically adjust stock when purchases are created or updated.
- Maintain purchase history.

### Stock Availability
- View current stock for all items.
- Display In Stock and Out of Stock status.
- Refresh stock information after changes.

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Frontend structure |
| CSS3 | Styling |
| JavaScript | Frontend functionality |
| Node.js | Backend runtime |
| Express.js | REST API |
| MySQL | Database |
| mysql2 | Database connectivity |
| dotenv | Environment configuration |
| Nodemon | Development server |

## Project Structure

```text
Weassist project/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── itemTypeController.js
│   │   ├── itemController.js
│   │   └── purchaseController.js
│   ├── routes/
│   │   ├── itemTypeRoutes.js
│   │   ├── itemRoutes.js
│   │   └── purchaseRoutes.js
│   ├── .env
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── database/
│   └── weassist_db.sql
├── screenshots/
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites
- Node.js
- MySQL Server
- MySQL Workbench
- Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/aktharahamed168/weassist-item-purchase-management.git
cd weassist-item-purchase-management
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Import the Database

Import `database/weassist_db.sql` using MySQL Workbench.

Database name: `weassist_db`

### 4. Configure Environment Variables

Create `backend/.env`:

```env
db_host=localhost
db_user=root
db_password=YOUR_MYSQL_PASSWORD
db_name=weassist_db
```

Replace `YOUR_MYSQL_PASSWORD` with your local MySQL password.

**Never upload `.env` to GitHub.**

### 5. Run the Application

Development mode:

```bash
npm run dev
```

Or:

```bash
npm start
```

### 6. Open in Browser

```text
http://localhost:5000
```

## API Endpoints

Base URL: `http://localhost:5000/api`

### Item Types

| Method | Endpoint | Description |
|---|---|---|
| GET | `/item-types` | Get all item types |
| POST | `/item-types` | Create an item type |
| PUT | `/item-types/:id` | Update an item type |
| DELETE | `/item-types/:id` | Delete an item type |

### Items

| Method | Endpoint | Description |
|---|---|---|
| GET | `/items` | Get all items |
| GET | `/items/:id` | Get item by ID |
| POST | `/items` | Create an item |
| PUT | `/items/:id` | Update an item |
| DELETE | `/items/:id` | Delete or deactivate an item |

### Purchases

| Method | Endpoint | Description |
|---|---|---|
| GET | `/purchases` | Get purchase history |
| GET | `/purchases/:id` | Get purchase details |
| POST | `/purchases` | Create a purchase |
| PUT | `/purchases/:id` | Update a purchase |

Purchase deletion is not supported, preserving historical records.

## Database Tables

- `item_types` – Stores item categories.
- `items` – Stores item details and available stock.
- `purchases` – Stores purchase order information.
- `purchase_items` – Stores items and quantities associated with purchases.

## Backend Concepts

- REST API architecture.
- MySQL database connectivity.
- SQL JOIN operations.
- Backend input validation.
- Foreign key constraints.
- Database transactions using BEGIN, COMMIT, and ROLLBACK.
- Stock deduction and restoration.
- Error handling.

## Validation and Testing

The application validates:
- Duplicate Order IDs.
- Missing item details.
- Invalid item types.
- Zero or negative quantities.
- Inactive items.
- Insufficient stock.
- Item deletion with existing purchase history.

## Screenshots

Application screenshots will be added to the `screenshots/` directory.

## Author

**Akthar Ahamed**

GitHub: https://github.com/aktharahamed168

---

Developed as a project assignment for **Karthika Consulting & Solutions Pvt. Ltd.**
