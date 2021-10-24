/*
per funzionare la websocket chat ha bisogno di due processi:
lanciare gli script server.js e client.js da due terminal differenti
server.js gestisce la connessione e scambio dati ws (websocket) su porta 6969
client.js esegue il rendering della pagina html dove ci sta la gui x la chat
*/

// librerie richieste
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
//
// dichiaro le variabili
const port = 6969;
const server = http.createServer(express);
const wss = new WebSocket.Server({ server });
//
wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        let msg = data.toString("utf8");
        client.send(msg);
      }
    });
  });
});
//
server.listen(6969, "0.0.0.0");
