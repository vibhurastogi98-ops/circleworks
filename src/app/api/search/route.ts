import { NextResponse } from 'next/server';
import { db } from '@/db';
import { employees, users } from '@/db/schema';
import { eq, or, ilike, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    // Guest Mode: Authentication disabled
    const userId = "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD";

    // Find the user's company
    const [userEmployee] = await db
      .select({ companyId: employees.companyId })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(users.clerkUserId, userId));

    if (!userEmployee || !userEmployee.companyId) {
      return NextResponse.json({ results: [] });
    }

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // Search live employees in the same company
    const results = await db
      .select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        jobTitle: employees.jobTitle,
        department: employees.department,
      })
      .from(employees)
      .where(and(
        eq(employees.companyId, userEmployee.companyId),
        or(
          ilike(employees.firstName, `%${query}%`),
          ilike(employees.lastName || '', `%${query}%`),
          ilike(employees.jobTitle || '', `%${query}%`)
        )
      ))
      .limit(10);

    const formattedResults = results.map(emp => ({
      type: 'EMPLOYEES',
      id: `emp_${emp.id}`,
      title: `${emp.firstName} ${emp.lastName || ''}`.trim(),
      subtitle: `${emp.jobTitle || 'Team Member'} · ${emp.department || 'General'}`,
      icon: 'User',
      url: `/employees/${emp.id}`
    }));

    // Add some static pages for navigation (safely)
    const staticPages = [
      { type: 'PAGES', id: 'page_1', title: 'Dashboard', subtitle: 'Main Overview', icon: 'LayoutDashboard', url: '/dashboard' },
      { type: 'PAGES', id: 'page_2', title: 'People Directory', subtitle: 'Manage Employees', icon: 'Users', url: '/employees' },
      { type: 'PAGES', id: 'page_3', title: 'Payroll Run', subtitle: 'Execute Payments', icon: 'DollarSign', url: '/payroll' },
    ].filter(p => p.title.toLowerCase().includes(query.toLowerCase()));

    return NextResponse.json({ results: [...formattedResults, ...staticPages] });
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ results: [] });
  }
}
