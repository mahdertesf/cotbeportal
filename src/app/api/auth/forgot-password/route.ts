import { NextResponse, type NextRequest } from 'next/server';
// In a real app, you'd use usersStore or a database to check if email exists
// and generate a secure, unique, time-limited token.
// For this mock, we'll just simulate success.

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Valid email is required' }, { status: 400 });
    }

    console.log('Forgot password request for email:', email);
    // Simulate sending an email.
    // TODO: In a real app, generate a token, save it with user ID and expiry, and email it.

    return NextResponse.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error("Forgot password error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error processing request', error: errorMessage }, { status: 500 });
  }
}
