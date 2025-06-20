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
    try{
        const[user]