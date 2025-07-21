// import React, { Component } from 'react';

// class ErrorBoundary extends Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false, errorInfo: null };
//   }

//   static getDerivedStateFromError(error) {
//     return { hasError: true }; // Update state to render fallback UI
//   }

//   componentDidCatch(error, errorInfo) {
//     this.setState({ errorInfo });
//     console.error("Error caught by Error Boundary:", error, errorInfo);
//   }

//   render() {
//     if (this.state.hasError) {
//       return <h2>Something went wrong. Please try again later.</h2>;
//     }
//     return this.props.children;
//   }
// }

// export default ErrorBoundary;
