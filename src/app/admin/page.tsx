import React from 'react';
import { redirect } from 'next/navigation';

// Entry point — redirect to dashboard (authenticated state assumed for demo)
export default function HomePage() {
  redirect('/login-screen');
}