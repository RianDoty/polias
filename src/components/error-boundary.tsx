import React, { Component, FunctionComponent } from "react";

class ErrorBoundary extends Component<
  { fallbackComponent?: FunctionComponent; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallbackComponent ? (
        <this.props.fallbackComponent />
      ) : (
        <h1>Something went wrong.</h1>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
