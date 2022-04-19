import React from "react";
import { Router } from "wouter";
import PageRouter from "./components/router";

import "./styles/App.css";
import useUser from "./hooks/user";

import TopBar from "./components/top-bar";

import UserContext from "./contexts/user";

function App() {
  const user = useUser()
  
  return (
    <div className="App">
      <UserContext.Provider value={user}>
        <TopBar/>
        <Router>
          <main className="app-main">
            <PageRouter/>
          </main>
        </Router>
      </UserContext.Provider>
    </div>
  );
}

export default App;
