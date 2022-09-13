import React, { Component, FunctionComponent } from "react";

class ErrorBoundary extends Component<
  { fallback?: FunctionComponent; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.log(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        <this.props.fallback />
      ) : (
        <h1>Something went wrong.</h1>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
