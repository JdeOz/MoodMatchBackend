const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const fs = require('fs');

const express = require("express");

const app = express();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://moodmatch-57ae2-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Crear nueva canción
app.post("/api/songs", async (req, res) => {
  try {
    const newSong = req.body;
    const docRef = await db.collection("songs").add(newSong);
    return res.status(204).json({message: "Item created successfully", id: docRef.id});
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});


// Agregar base de datos
// app.get("/api/songs_db", async (req, res) => {
//   try {
//     // Lee el archivo JSON de canciones
//     const rawData = fs.readFileSync('songs.json');
//     const songs = JSON.parse(rawData);
//
//     // Agrega cada canción a la base de datos
//     const batch = db.batch();
//     songs.forEach((song) => {
//       const fields = song.fields; // Obtiene el objeto "fields" de cada canción
//
//       // Verifica si el objeto "fields" existe y es un objeto
//       if (fields && typeof fields === 'object') {
//         const newDocRef = db.collection("songs").doc(); // Genera un nuevo ID para cada canción
//         batch.set(newDocRef, fields); // Agrega solo el objeto "fields" a Firestore
//       }
//     });
//
//     // Ejecuta la transacción en batch
//     await batch.commit();
//
//     return res.status(204).json({ message: "Canciones agregadas exitosamente" });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send(error);
//   }
// });

// Crear nueva canción
app.get("/api/songs_total", async (req, res) => {
  try {
    const songsCollection = db.collection("songs");
    const snapshot = await songsCollection.get();
    const totalDocuments = snapshot.size; // Obtiene el tamaño del snapshot, que es el total de documentos en la colección

    return res.status(200).json({ total: totalDocuments });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

app.get("/api/songs/", async (req, res) => {
  try {
    const snapshot = await db.collection("songs").get();
    const songs = [];
    snapshot.forEach((doc) => {
      songs.push({id: doc.id, ...doc.data()});
    });
    return res.status(200).json(songs);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// Obtener una canción en específico
app.get("/api/songs/:id", async (req, res) => {
  try {
    const doc = await db.collection("songs").doc(req.params.id).get();
    return res.status(200).json({id: doc.id, ...doc.data()});
  } catch (error) {
    return res.status(500).json(error);
  }
});


// Eliminar una canción en específico
app.delete("/api/songs/:id", async (req, res) => {
  try {
    await db.collection("songs").doc(req.params.id).delete();
    return res.status(200).json({message: "Item deleted successfully"});
  } catch (error) {
    return res.status(500).json(error);
  }
});


// Actualizar una canción en específico
app.put("/api/songs/:id", async (req, res) => {
  try {
    const updatedSong = req.body;
    await db.collection("songs").doc(req.params.id).update(updatedSong);
    return res.status(200).json({message: "Item updated successfully"});
  } catch (error) {
    return res.status(500).json(error);
  }
});

exports.app = onRequest(app);

