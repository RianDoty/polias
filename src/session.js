const { localStorage } = window;

function initSession(socket) {
  const sessionID = localStorage.getItem('sessionID')
  
  if (sessionID) {
    socket.auth = { sessionID }
    socket.connect() 
  }
  
  socket.on("session", ({ sessionID, userID, username }) => {
    socket.auth = { sessionID };

    localStorage.setItem("sessionID", sessionID);

    socket.userID = userID;
  });
}

export default initSession;
