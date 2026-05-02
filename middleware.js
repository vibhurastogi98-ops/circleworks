import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/employees',
  '/payroll',
  '/settings',
  '/me',
  '/onboarding',
  '/benefits',
  '/time',
  '/compliance',
  '/reports',
  '/agency',
  '/hiring',
  '/learning',
  '/performance',
  '/contractors',
  '/accountant-portal',
];

function isProtected(pathname) {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

export default async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (!isProtected(pathname)) return NextResponse.next();

  const token = req.cookies.get('session')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || ''));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
