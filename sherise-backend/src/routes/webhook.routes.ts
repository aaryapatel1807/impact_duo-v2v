import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';
import { prisma } from '../lib/prisma';

const router = Router();

// Minimal shape of the Clerk webhook events this handler consumes.
interface ClerkWebhookEvent {
  type: string;
  data: {
    id?: string;
    email_addresses?: Array<{ email_address?: string }>;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    username?: string | null;
  };
}

function userFieldsFromEvent(data: ClerkWebhookEvent['data']) {
  const email = data.email_addresses?.[0]?.email_address;
  if (!email) {
    // Never write '' into the @unique email column (it collides for a second
    // email-less user). Throwing returns 500 so Clerk retries and the
    // problem stays visible instead of silently corrupting the users table.
    throw new Error(`Clerk webhook event for user ${data.id ?? '?'} carries no email address`);
  }
  return {
    email,
    name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User',
    imageUrl: data.image_url || null,
    username: data.username || null,
  };
}

// POST /api/webhooks/clerk
//
// svix signs the EXACT raw request bytes, so this route must verify the raw
// body. server.ts mounts express.raw() for /api/webhooks before the global
// JSON parser, which makes req.body a Buffer here. (Previously the handler
// verified JSON.stringify(req.body) — a re-serialisation that differs from
// the raw bytes whenever the payload contains non-ASCII characters or
// different spacing, so genuine Clerk deliveries were rejected with 400.)
router.post('/clerk', async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET is not configured');
      return res.status(500).json({ error: 'Webhook is not configured' });
    }

    const payloadString = Buffer.isBuffer(req.body)
      ? req.body.toString('utf8')
      : typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body ?? {});

    const wh = new Webhook(webhookSecret);
    let evt: ClerkWebhookEvent;

    try {
      evt = wh.verify(payloadString, req.headers as Record<string, string>) as ClerkWebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return res.status(400).json({ error: 'Webhook verification failed' });
    }

    // Database errors are NOT caught per-event any more: they propagate to
    // the outer catch and return 500, so Clerk retries the delivery instead
    // of the sync being silently lost behind a 200.
    if (evt.type === 'user.created' && evt.data.id) {
      const fields = userFieldsFromEvent(evt.data);
      await prisma.user.upsert({
        where: { id: evt.data.id },
        create: { id: evt.data.id, ...fields },
        update: {}, // redelivery of user.created must not clobber anything
      });
      console.log(`User ${evt.data.id} created in database`);
    }

    if (evt.type === 'user.updated' && evt.data.id) {
      const fields = userFieldsFromEvent(evt.data);
      // Upsert: an update for a user we never saw created must not no-op.
      await prisma.user.upsert({
        where: { id: evt.data.id },
        create: { id: evt.data.id, ...fields },
        update: fields,
      });
      console.log(`User ${evt.data.id} updated in database`);
    }

    if (evt.type === 'user.deleted' && evt.data.id) {
      // deleteMany is idempotent — deleting an absent user is a success,
      // not an error worth retrying forever.
      await prisma.user.deleteMany({
        where: { id: evt.data.id },
      });
      console.log(`User ${evt.data.id} deleted from database`);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
