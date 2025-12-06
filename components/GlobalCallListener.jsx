'use client';
import React from 'react';

// Global call listener disabled for Vercel deployments. Returning null
// avoids creating socket connections in the serverless environment.
export default function GlobalCallListener() {
  return null;
}
