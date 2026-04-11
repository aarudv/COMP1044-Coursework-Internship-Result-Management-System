# COMP1044-Coursework-Internship-Result-Management-System
Internship Result Management System. A full-stack web application (PHP, MySQL, JS/HTML/CSS) designed to digitize university internship assessments. Features include role-based access control (Admin/Assessor), relational database management, standardized grading automation, and interactive UI.


# Project Setup

## Requirements
- MAMP
- Web browser
- phpMyAdmin

---

## How to Run

### 1. Move Files
Extract the project and place the folder into:

```
MAMP/htdocs/
```

---

### 2. Start Server
Open MAMP and start:
- Apache
- MySQL

---

### 3. Import Database
1. Go to: http://localhost/phpMyAdmin  
2. Create a new database (e.g. `project_db`)  
3. Click **Import**  
4. Select the `.sql` file and import  

---

### 4. Check Login Details
In phpMyAdmin:
- Open the `users` table (or relevant table)
- Find credentials for:
  - Admin
  - Accessor/User

---

### 5. Run Project
Open in browser:

```
http://localhost/your-project-folder
```

---

## Access

- **Admin Dashboard** → full access  
- **Accessor/User Dashboard** → limited access  

Use the credentials from the database.

---

## Notes
- Ensure the database name matches the one in the code  
- Check `config.php` or `db.php` if connection fails  
