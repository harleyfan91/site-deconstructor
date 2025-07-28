import { FastifyRequest, FastifyReply } from 'fastify';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email?: string;
      [key: string]: any;
    };
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !data.user) {
      console.error('Auth error:', error);
      return reply.code(401).send({ error: 'Invalid token' });
    }

    // Attach user to request
    request.user = {
      id: data.user.id,
      email: data.user.email,
      ...data.user,
    };
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return reply.code(401).send({ error: 'Authentication failed' });
  }
}

// Optional middleware - doesn't fail if no auth provided
export async function optionalAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No auth provided, continue without user
    return;
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (!error && data.user) {
      request.user = {
        id: data.user.id,
        email: data.user.email,
        ...data.user,
      };
    }
  } catch (error) {
    // Silent fail for optional auth
    console.warn('Optional auth failed:', error);
  }
}