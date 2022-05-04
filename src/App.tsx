import React from "react";
import { Router } from "wouter";
import PageRouter from "./components/router";
import socket from "./socket";

import "./styles/App.css";

import TopBar from "./components/top-bar";

import { UsernameProvider } from "./contexts/username";
import { SocketProvider } from "./contexts/socket";

function App() {
  return (
    <div className="App">
      <UsernameProvider>
        <SocketProvider value={socket}>
          <TopBar />
          <Router>
            <main className="app-main">
              <PageRouter />
            </main>
          </Router>
        </SocketProvider>
      </UsernameProvider>
    </div>
  );
}

export default App;
