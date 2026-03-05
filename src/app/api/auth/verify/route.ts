import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { consumeNonce, createSession } from '@/lib/auth';

// POST /api/auth/verify — verify SIWE signature, create session
export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json();

    if (!message || !signature) {
      return NextResponse.json(
        { error: 'message and signature required' },
        { status: 400 }
      );
    }

    const siweMessage = new SiweMessage(message);

    // Verify the nonce hasn't been used and hasn't expired
    if (!consumeNonce(siweMessage.nonce)) {
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 401 }
      );
    }

    // Verify the signature
    const result = await siweMessage.verify({ signature });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Create session cookie
    await createSession(result.data.address);

    return NextResponse.json({
      ok: true,
      wallet: result.data.address.toLowerCase(),
    });
  } catch (error) {
    console.error('SIWE verify error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 401 }
    );
  }
}
