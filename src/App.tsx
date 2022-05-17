import React from "react";
import { Router } from "wouter";
import PageRouter from "./components/router";
import "./styles/App.css";

import TopBar from "./components/top-bar";

import { UsernameProvider } from "./contexts/username";

function App() {
  return (
    <div className="App">
      <UsernameProvider>
        <TopBar />
        <Router>
          <main className="app-main">
            <PageRouter />
          </main>
        </Router>
      </UsernameProvider>
    </div>
  );
}

export default App;
