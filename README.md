# 📦 CoreInventory – Inventory Management System

CoreInventory is a modular **Inventory Management System (IMS)** designed to digitize and streamline stock operations within a business.

The system replaces **manual registers, spreadsheets, and scattered tracking methods** with a **centralized, real-time inventory management platform**.

It helps organizations efficiently manage **products, stock movements, warehouse transfers, deliveries, and inventory adjustments**.

---

# 🚀 Project Objective

The goal of CoreInventory is to:

- Provide **real-time visibility of stock levels**
- Reduce **manual errors in inventory tracking**
- Improve **warehouse management and product flow**
- Centralize all **inventory operations in a single platform**

---

# 👥 Target Users

### Inventory Managers
- Manage incoming and outgoing stock
- Monitor stock levels and reports
- Track warehouse operations

### Warehouse Staff
- Handle product transfers
- Perform picking and shelving
- Conduct inventory counting

---

# 🔐 Authentication

The system includes secure authentication features:

- User **Sign Up**
- User **Login**
- **OTP-based Password Reset**
- Redirect to **Inventory Dashboard after login**

---

# 📊 Dashboard

The dashboard provides a **snapshot of all inventory operations**.

### Dashboard KPIs

- Total Products in Stock
- Low Stock / Out of Stock Items
- Pending Receipts
- Pending Deliveries
- Internal Transfers Scheduled

### Dynamic Filters

Users can filter inventory data by:

- **Document Type**
  - Receipts
  - Delivery Orders
  - Internal Transfers
  - Adjustments

- **Status**
  - Draft
  - Waiting
  - Ready
  - Done
  - Canceled

- **Warehouse / Location**
- **Product Category**

---

# 🧭 Navigation Structure

The application is organized into the following modules:

### 1. Products
- Create and update products
- Manage product categories
- View stock availability per location
- Configure reordering rules

### 2. Operations

Operations handle all stock movements inside the system.

#### Receipts (Incoming Stock)

Used when goods arrive from suppliers.

**Process**
1. Create a new receipt
2. Add supplier and products
3. Enter received quantities
4. Validate receipt → stock increases automatically

Example:
```
Receive 50 units of Steel Rods
Stock updated: +50
```

---

#### Delivery Orders (Outgoing Stock)

Used when products are shipped to customers.

**Process**
1. Pick items
2. Pack items
3. Validate delivery → stock decreases automatically

Example:
```
Sales order for 10 chairs
Stock updated: -10
```

---

#### Internal Transfers

Used to move stock within the organization.

Examples:
- Main Warehouse → Production Floor
- Rack A → Rack B
- Warehouse 1 → Warehouse 2

All transfers are recorded in the **stock movement history**.

---

#### Inventory Adjustments

Used to correct differences between:

- Recorded inventory
- Physical inventory count

**Steps**
1. Select product and location
2. Enter the counted quantity
3. System updates the stock automatically
4. Adjustment recorded in the ledger

Example:
```
3 kg steel damaged
Stock updated: -3
```

---

# 🏢 Warehouse Management

CoreInventory supports **multi-warehouse environments**.

Features include:

- Warehouse configuration
- Location-based stock tracking
- Internal stock movement between warehouses

---

# 🔎 Additional Features

- Low stock alerts
- SKU-based product search
- Smart filtering options
- Inventory movement history
- Centralized stock ledger
- Real-time stock updates

---

# 📦 Example Inventory Flow

### Step 1 – Receive Goods from Vendor

Receive **100 kg Steel**

```
Stock: +100
```

---

### Step 2 – Move to Production Rack

Internal Transfer:

```
Main Store → Production Rack
```

Total stock remains the same, but the **location is updated**.

---

### Step 3 – Deliver Finished Goods

Deliver **20 steel units**

```
Stock: -20
```

---

### Step 4 – Adjust Damaged Items

```
3 kg steel damaged
Stock: -3
```

All these operations are recorded in the **stock ledger**.

---

# 📐 Mockup / Design

Project mockup created using Excalidraw:

https://link.excalidraw.com/l/65VNwvy7c4X/3ENvQFu9o8R

---

# 🛠️ System Modules

- Authentication
- Dashboard
- Product Management
- Receipts (Incoming Stock)
- Delivery Orders (Outgoing Stock)
- Internal Transfers
- Inventory Adjustments
- Warehouse Management
- Stock Ledger

---

# 📄 License

This project is developed for **learning and development purposes**.

---

# ⭐ Conclusion

CoreInventory simplifies inventory management by providing a **centralized, real-time system for tracking products, stock movements, and warehouse operations**.

It helps businesses **reduce errors, improve efficiency, and maintain accurate inventory records**.
