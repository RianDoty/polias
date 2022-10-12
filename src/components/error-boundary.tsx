import React, { Component, FunctionComponent } from "react";

class ErrorBoundary extends Component<
  { fallback?: FunctionComponent; children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    console.log(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        <this.props.fallback />
      ) : (
        <>
          <h1>Something went wrong.</h1>
          <h4 style={{ color: "LightCoral", backgroundColor: "FireBrick" }}>
            {this.state.error?.stack}
          </h4>
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
