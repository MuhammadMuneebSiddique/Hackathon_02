'use client';

import { useSession } from '@/lib/better-auth-client';

export default function UserSessionInfo() {
  const { data: session, isPending, error, refetch } = useSession();

  if (isPending) {
    return <div>Loading session...</div>;
  }

  if (error) {
    return <div>Error loading session: {error.message}</div>;
  }

  if (!session) {
    return <div>No active session</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-semibold mb-2">User Session Info</h3>
      <div className="space-y-1 text-sm">
        <p><strong>Name:</strong> {session.user?.name || session.user?.email}</p>
        <p><strong>Email:</strong> {session.user?.email}</p>
        <p><strong>ID:</strong> {session.user?.id}</p>
        <p><strong>Expires:</strong> {new Date(session.expiresAt).toLocaleString()}</p>
        <button
          onClick={refetch}
          className="mt-2 text-blue-600 hover:underline text-xs"
        >
          Refresh Session
        </button>
      </div>
    </div>
  );
}