# CS499 Database Capstone Project

## Overview

The project is a full-stack web application designed to demonstrate proficiency in software engineering, database design, and secure coding practices. The application features a React frontend and a Node.js/Express backend, providing a platform for managing and interacting with a relational database.

## Features

- **Frontend**: Built with React, offering a responsive and intuitive user interface.

- **Backend**: Developed with Node.js and Express, handling API requests and server-side logic.

- **Database**: Utilizes MongoDB for data storage and management.

- **Security**: Implements best practices to protect against common vulnerabilities such as SQL injection.

## Project Structure

```

CS499-database/
├── client/             # React frontend
├── server/             # Node.js/Express backend
├── README.md           # Project documentation

```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)

- [npm](https://www.npmjs.com/) (v6 or higher)

- [MySQL](https://www.mysql.com/) or [PostgreSQL](https://www.postgresql.org/) database

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Thomas-Christian/CS499-database.git
   cd CS499-database
   ```


2. **Set up the backend**:

   ```bash
   cd server
   npm install
   # Configure your database connection in the .env file
   npm start
   ```


3. **Set up the frontend**:

   ```bash
   cd client
   npm install
   npm start
   ```


4. **Access the application**:

   Open your browser and navigate to `http://localhost:3000`.

## Usage

The application allows users to perform CRUD (Create, Read, Update, Delete) operations on the database through a user-friendly interface. It serves as a practical demonstration of integrating frontend and backend technologies with a relational database.

## Security Considerations

Security is a critical aspect of this project. Measures have been implemented to prevent common vulnerabilities:

- **SQL Injection**: All database queries use parameterized statements to prevent injection attacks.

- **Input Validation**: User inputs are validated on both the client and server sides to ensure data integrity.

- **Error Handling**: Comprehensive error handling is in place to manage unexpected issues gracefully.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- [React](https://reactjs.org/)

- [Node.js](https://nodejs.org/)

- [Express](https://expressjs.com/)

- [MongoDB](https://www.mongodb.com/)

