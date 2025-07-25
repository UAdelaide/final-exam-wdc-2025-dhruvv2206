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

    app.get('/api/dogs', async (req, res) => {
        try {
          const [rows] = await connection.query(`
            SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username
            FROM Dogs
            JOIN Users ON Dogs.owner_id = Users.user_id;
          `);
          res.json(rows);
        } catch (err) {
          res.status(500).json({ error: 'Failed to fetch dogs.' });
        }
      });

      app.get('/api/walkrequests/open', async (req, res) => {
        try {
          const [rows] = await connection.query(`
            SELECT WalkRequests.request_id, Dogs.name AS dog_name, WalkRequests.requested_time, WalkRequests.duration_minutes, WalkRequests.location, Users.username AS owner_username
            FROM WalkRequests
            JOIN Dogs ON WalkRequests.dog_id = Dogs.dog_id
            JOIN Users ON Dogs.owner_id = Users.user_id
            WHERE WalkRequests.status = 'open';
          `);
          res.json(rows);
        } catch (err) {
          res.status(500).json({ error: 'Failed to fetch open walk requests.' });
        }
      });

      app.get('/api/walkers/summary', async (req, res) => {
        try {
          const [rows] = await connection.query(`
            SELECT
              U.username AS walker_username,
              COUNT(R.rating_id) AS total_ratings,
              ROUND(AVG(R.rating), 1) AS average_rating,
              COUNT(CASE WHEN WR.status = 'completed' THEN 1 END) AS completed_walks
            FROM Users U
            LEFT JOIN WalkApplications WA ON U.user_id = WA.walker_id
            LEFT JOIN WalkRequests WR ON WA.request_id = WR.request_id
            LEFT JOIN WalkRatings R ON WR.request_id = R.request_id
            WHERE U.role = 'walker'
            GROUP BY U.username;
          `);
          res.json(rows);
        } catch (err) {
          res.status(500).json({ error: 'Failed to fetch walker summary.' });
        }
      });

      (async () => {
        try {
          connection = await mysql.createConnection(dbConfig);
          await seedDatabase();

          app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
          });
        } catch (err) {
          console.error('Failed to start:', err);
        }
      })();

