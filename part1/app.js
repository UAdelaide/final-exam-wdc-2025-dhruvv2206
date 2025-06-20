const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 8080;

const dbConfig = {
    host: 'localhost',
    user: 'root',
    database: 'DogWalkService'
  };

  let connection;

async function seedDatabase() {
    try {
        const [users] = await connection.query('SELECT COUNT(*) as count FROM Users');
        if (users[0].count === 0) {
            await connection.query(''
            INSERT INTO Users (username, email, password_hash, role) VALUES
            ('alice123', 'alice@example.com', 'hashed123', 'owner'),
            ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
            ('carol123', 'carol@example.com', 'hashed789', 'owner');
          `);

await connection.query('