import React from "react";
import ErrorBoundary from "../error-boundary";

import Chat from "./chat";

const MiddleContent = () => {
  return (
    <div className="middle-content">
      <ErrorBoundary>
        <Chat />
      </ErrorBoundary>
    </div>
  );
};

export default MiddleContent;
