import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import ErrorBox from '@components/organisms/ErrorBox';
import { STUDENT_DASHBOARD } from '@constants/routes';
import { MESSAGES } from '@constants/app';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorBox
          errorMessage="Something went wrong. Please try again."
          link={STUDENT_DASHBOARD}
          buttonText={MESSAGES.TRY_AGAIN}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
