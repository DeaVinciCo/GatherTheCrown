import { supabaseAdmin } from './supabaseAdmin';

export interface RoomJoinOptions {
  accessToken?: string;
}

export interface AuthenticatedRoomUser {
  userId: string;
}

export async function verifyRoomAccess(options: RoomJoinOptions): Promise<AuthenticatedRoomUser> {
  const accessToken = options.accessToken;
  if (!accessToken) {
    throw new Error('Missing room access token');
  }

  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new Error('Invalid room access token');
  }

  return { userId: data.user.id };
}
