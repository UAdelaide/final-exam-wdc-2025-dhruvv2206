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
            await connection.query(`
            INSERT INTO Users (username, email, password_hash, role) VALUES
            ('alice123', 'alice@example.com', 'hashed123', 'owner'),
            ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
            ('carol123', 'carol@example.com', 'hashed789', 'owner');
            `);

            await connection.query(`
            INSERT INTO Dogs (owner_id, name, size) VALUES
            (1, 'Max', 'medium'),
            (3, 'Bella', 'small');
            `);

            await connection.query(`
            INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
            (1, '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
            (2, '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted');
          `);
        }
      } catch (err) {
        console.error('Seeding error:', err);
      }
    }

    