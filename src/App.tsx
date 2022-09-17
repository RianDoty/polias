import React from "react";
import { Router } from "wouter";
import PageRouter from "./components/router";
import "./styles/App.css";

import TopBar from "./components/top-bar";

import { UsernameProvider } from "./contexts/username";
import ErrorBoundary from "./components/error-boundary";

function App() {
  return (
    <div className="App">
      <UsernameProvider def={localStorage.getItem("username")}>
        <TopBar />
        <Router>
          <main className="app-main">
            <ErrorBoundary>
              <PageRouter />
            </ErrorBoundary>
          </main>
        </Router>
      </UsernameProvider>
    </div>
  );
}

export default App;
