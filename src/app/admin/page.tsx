import React from 'react';
import { redirect } from 'next/navigation';
import { domainConfig } from '@/config/domain';

// Entry point — redirect to dashboard (authenticated state assumed for demo)
export default function HomePage() {
  redirect('/admin/login-screen');
}
