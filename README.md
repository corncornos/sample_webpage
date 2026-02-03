# Car Inventory Management System - MVP

A complete Minimum Viable Product (MVP) for managing a car dealership inventory with sales tracking, user management, and dashboard analytics.

## Features

✅ **Vehicle Inventory Management**
- Add, view, edit, and delete vehicles
- Track stock ID, brand, model, year, variant, color, transmission, fuel type, mileage
- Manage purchase and selling prices
- Add notes and remarks

✅ **Inventory Search & Filter**
- Search by brand, model, year
- Filter by status (Available, Reserved, Sold)
- Sort by price and date added
- Real-time table view

✅ **Sales Tracking**
- Record sales with buyer information
- Track payment method (Cash, Financing, Cheque)
- Auto-mark vehicle as Sold
- View sales history

✅ **Dashboard**
- Total vehicles count
- Available vehicles
- Sold vehicles count
- Total inventory value
- Total sales sum
- Recent sales list

✅ **User Access Control**
- Admin: Full access (CRUD, user management, delete)
- Staff: Add and update vehicles only

## Tech Stack

- **Frontend**: HTML5 + CSS3 + Bootstrap 5 + Vanilla JavaScript
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
sample_webpage/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── routes/
│   │   ├── auth.js              # Login/Register endpoints
│   │   ├── vehicles.js          # Vehicle CRUD endpoints
│   │   ├── sales.js             # Sales tracking endpoints
│   │   └── dashboard.js         # Dashboard stats endpoints
│   ├── server.js                # Express server setup
│   ├── package.json             # Dependencies
│   └── .env                     # Environment variables
├── frontend/
│   ├── index.html               # Main HTML file
│   ├── css/
│   │   └── styles.css           # Custom styles
│   └── js/
│       └── app.js               # Frontend logic
├── database.sql                 # Database schema
└── README.md                    # This file
```

## Prerequisites

Before running the system, ensure you have:

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MySQL** (v5.7 or higher) or XAMPP with MySQL
3. **Git** (optional, for version control)

## Setup Instructions

### Step 1: Set Up the Database

1. Open MySQL command line or PHPMyAdmin (if using XAMPP)
2. Copy and paste the contents of `database.sql`
3. Execute the SQL to create tables and insert sample users

```bash
# If using command line:
mysql -u root -p < database.sql
```

**Sample Login Credentials:**
- Admin: `admin@cardealer.com` / `admin123`
- Staff: `staff@cardealer.com` / `staff123`

### Step 2: Set Up the Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure `.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          # Leave empty if no password (XAMPP default)
DB_NAME=car_inventory_db
DB_PORT=3306
JWT_SECRET=your_secret_key_change_in_production
PORT=5000
```

4. Start the backend server:
```bash
npm start
# Or with nodemon for auto-reload:
npm run dev
```

The server should now be running on `http://localhost:5000`

### Step 3: Access the Frontend

1. In your web browser, navigate to:
```
http://localhost/sample_webpage/frontend/index.html
```

Or if using XAMPP, place the files in `C:\xampp\htdocs\sample_webpage` and access:
```
http://localhost/sample_webpage/frontend/index.html
```

2. Log in with one of the sample credentials above

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user (admin only)

### Vehicles
- `GET /api/vehicles` - Get all vehicles (with filters)
- `GET /api/vehicles/:id` - Get single vehicle
- `POST /api/vehicles` - Add new vehicle (admin/staff)
- `PUT /api/vehicles/:id` - Update vehicle (admin/staff)
- `DELETE /api/vehicles/:id` - Delete vehicle (admin only)

Query Parameters for GET /api/vehicles:
- `brand` - Filter by brand
- `model` - Filter by model
- `year` - Filter by year
- `status` - Filter by status (Available/Reserved/Sold)
- `sortBy` - Sort by 'price' or 'date'
- `order` - Sort order 'asc' or 'desc'

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Record new sale (admin/staff)
- `PUT /api/sales/:id` - Update sale (admin only)
- `DELETE /api/sales/:id` - Delete sale (admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Database Schema

### Users Table
```sql
- id (INT, Primary Key)
- name (VARCHAR)
- email (VARCHAR, Unique)
- password (VARCHAR, hashed)
- role (ENUM: 'admin', 'staff')
- created_at (TIMESTAMP)
```

### Vehicles Table
```sql
- id (INT, Primary Key)
- stock_number (VARCHAR, Unique)
- brand (VARCHAR)
- model (VARCHAR)
- year (INT)
- variant (VARCHAR)
- color (VARCHAR)
- transmission (ENUM: 'Manual', 'Automatic')
- fuel_type (ENUM: 'Petrol', 'Diesel', 'Hybrid', 'Electric')
- mileage (INT)
- purchase_price (DECIMAL)
- selling_price (DECIMAL)
- status (ENUM: 'Available', 'Reserved', 'Sold')
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Sales Table
```sql
- id (INT, Primary Key)
- vehicle_id (INT, Foreign Key → vehicles.id)
- buyer_name (VARCHAR)
- sale_price (DECIMAL)
- payment_method (ENUM: 'Cash', 'Financing', 'Cheque')
- sale_date (DATE)
- created_at (TIMESTAMP)
```

## User Roles & Permissions

### Admin
- View dashboard and all stats
- Add, edit, delete vehicles
- View, record, edit, delete sales
- Create and manage users
- Full system access

### Staff
- View dashboard (limited stats)
- Add and edit vehicles only
- View vehicles list
- Record sales
- Cannot delete vehicles or access user management

## Troubleshooting

### Issue: "Cannot connect to backend"
- Ensure Node.js server is running on port 5000
- Check that MySQL is running
- Verify `.env` configuration

### Issue: "Database connection failed"
- Verify MySQL credentials in `.env`
- Check if `car_inventory_db` database exists
- Ensure MySQL service is running

### Issue: "Login fails"
- Clear browser cache and cookies
- Check database schema is properly initialized
- Verify user exists in `users` table

### Issue: CORS errors
- Backend CORS is configured for all origins (update in production)
- Verify requests are to correct API URL

## Future Enhancements

- Advanced reporting and analytics
- Export inventory to Excel/PDF
- Vehicle photo gallery
- Customer management system
- Finance integration
- Mobile app
- Email notifications
- Barcode scanning
- Maintenance history tracking

## Production Deployment

Before deploying to production:

1. Change `JWT_SECRET` in `.env` to a strong random value
2. Set `NODE_ENV=production`
3. Update CORS to specific domain
4. Enable HTTPS
5. Use environment-specific database credentials
6. Set up proper error logging
7. Implement rate limiting
8. Add input validation and sanitization
9. Use process manager like PM2

## Support & Issues

For issues or feature requests, contact your development team.

---

**Version**: 1.0.0  
**Last Updated**: February 2026
