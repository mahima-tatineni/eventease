# EventEase - Online Event Registration Portal

## Overview
EventEase is an online event registration portal designed exclusively for MLRIT students. The platform allows students to browse, register for events, and track their attendance, while providing admins with tools to manage events and monitor registrations.

## Features
- **Student Features:**
  - Browse and register for events using MLRIT email.
  - View registered events and their attendance status.

- **Admin Features:**
  - Create, edit, and delete events.
  - View all student registrations for events.
  - Mark attendance for participants.

## Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (jQuery)
- **Backend:** PHP or Node.js
- **Database:** MySQL

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd eventease
   ```
3. Set up the database:
   - Import the SQL schema located in `sql/schema.sql` into your MySQL database.

4. Configure environment variables:
   - Copy `.env.example` to `.env` and update the necessary configurations.

5. Start the backend server:
   - For PHP, ensure your server is running (e.g., XAMPP, WAMP).
   - For Node.js, run:
     ```
     npm install
     npm start
     ```

## Usage
- Access the application via your web browser at `http://localhost/eventease/index.html`.
- Students can log in using their MLRIT email addresses.
- Admins can manage events through the admin dashboard.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.