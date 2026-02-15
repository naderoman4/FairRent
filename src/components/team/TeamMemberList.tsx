'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Shield, User } from 'lucide-react';

interface Member {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  profile: { email: string; full_name: string | null };
}

interface Props {
  members: Member[];
  currentUserId: string;
  ownerId: string;
}

export function TeamMemberList({ members, currentUserId, ownerId }: Props) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = async (userId: string) => {
    if (!confirm('Retirer ce membre de l\'équipe ?')) return;
    setRemoving(userId);

    try {
      await fetch('/api/teams', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      router.refresh();
    } catch {
      // Ignore
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Membre</th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Rôle</th>
            <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const isOwner = member.user_id === ownerId;
            const isSelf = member.user_id === currentUserId;
            const canRemove = !isOwner && !isSelf && currentUserId === ownerId;

            return (
              <tr key={member.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.profile.full_name || member.profile.email}
                    </p>
                    {member.profile.full_name && (
                      <p className="text-xs text-muted-foreground">{member.profile.email}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {member.role === 'admin' ? (
                      <>
                        <Shield className="h-3 w-3" />
                        Admin
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3" />
                        Membre
                      </>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {canRemove && (
                    <button
                      onClick={() => handleRemove(member.user_id)}
                      disabled={removing === member.user_id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
