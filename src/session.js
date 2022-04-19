const { localStorage } = window;

function initSession(socket) {
  const sessionID = localStorage.getItem('sessionID')
  
  if (sessionID) {
    socket.auth = { sessionID }
  }
  
  socket.on("session", ({ sessionID, userID }) => {
    socket.auth = { sessionID };

    localStorage.setItem("sessionID", sessionID);

    socket.userID = userID;
  });
}

export default initSession;
