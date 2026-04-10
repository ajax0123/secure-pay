import { useEffect, useState } from 'react';
import {
  freezeAccountAdminApi,
  getUsersAdminApi,
  unfreezeAccountAdminApi
} from '../api/adminApi';
import { UserManagementTable } from '../components/admin/UserManagementTable';
import { User } from '../types/user';

export const AdminUsersPage = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRes = await getUsersAdminApi();
      setUsers(usersRes.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const freeze = async (userId: string) => {
    await freezeAccountAdminApi(userId, 'Admin manual action');
    await fetchUsers();
  };

  const unfreeze = async (userId: string) => {
    await unfreezeAccountAdminApi(userId);
    await fetchUsers();
  };

  if (loading) {
    return <div className="text-sm text-slate-300">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Manage Users</h2>
      <UserManagementTable users={users} onFreeze={freeze} onUnfreeze={unfreeze} />
    </div>
  );
};
