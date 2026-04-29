import React from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/auth/authSlice';

/**
 * The current backend only authenticates users and does not expose role/permission checks.
 * Keep this wrapper so existing routes do not need permission-specific backend support.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render if permitted
 * @param {React.ReactNode} props.fallback - Optional component to render if not permitted
 */
export default function RequirePermission({ children, fallback = null }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  return children || fallback;
}