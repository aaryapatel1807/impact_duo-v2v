import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { prisma } from '../lib/prisma';

const router = Router();

// POST /api/webhooks/clerk
router.post('/clerk', async (req: Request, res: Response) => {
  try {
    const payloadString = JSON.stringify(req.body);
    const headersToSign = req.headers;

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
    let evt: WebhookEvent;

    try {
      evt = wh.verify(payloadString, headersToSign as Record<string, string>) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return res.status(400).json({ error: 'Webhook verification failed' });
    }

    // Handle the webhook event
    const eventType = evt.type;

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url, username } = evt.data;

      try {
        await prisma.user.create({
          data: {
            id, // Use Clerk user ID
            email: email_addresses?.[0]?.email_address || '',
            name: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
            imageUrl: image_url || null,
            username: username || null,
          },
        });

        console.log(`User ${id} created in database`);
      } catch (error) {
        console.error('Error creating user in database:', error);
        // User might already exist, that's okay
      }
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url, username } = evt.data;

      try {
        await prisma.user.update({
          where: { id },
          data: {
            email: email_addresses?.[0]?.email_address || '',
            name: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
            imageUrl: image_url || null,
            username: username || null,
          },
        });

        console.log(`User ${id} updated in database`);
      } catch (error) {
        console.error('Error updating user in database:', error);
      }
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;

      try {
        await prisma.user.delete({
          where: { id: id! },
        });

        console.log(`User ${id} deleted from database`);
      } catch (error) {
        console.error('Error deleting user from database:', error);
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
