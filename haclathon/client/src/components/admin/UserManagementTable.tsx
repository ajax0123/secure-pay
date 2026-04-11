import { User } from '../../types/user';

interface Props {
  users: User[];
  onFreeze: (userId: string) => Promise<void>;
  onUnfreeze: (userId: string) => Promise<void>;
}

export const UserManagementTable = ({ users, onFreeze, onUnfreeze }: Props) => {
  return (
    <section className="overflow-x-auto rounded-2xl border border-slate-700 bg-card-dark">
      <table className="min-w-full text-sm text-slate-300">
        <thead className="text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Risk</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Freeze Reason</th>
            <th className="px-4 py-3">Control</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id || user._id} className="border-t border-slate-800">
              <td className="px-4 py-3">{user.decrypted_name || user.name}</td>
              <td className="px-4 py-3">{user.decrypted_email || user.email}</td>
              <td className="px-4 py-3">{user.risk_score}</td>
              <td className="px-4 py-3">{user.account_frozen ? 'Frozen' : 'Active'}</td>
              <td className="px-4 py-3">{user.freeze_reason || '-'}</td>
              <td className="px-4 py-3">
                {user.account_frozen ? (
                  <button className="rounded-md bg-success px-3 py-1 text-xs text-white" onClick={() => void onUnfreeze(user.id || user._id || '')}>
                    Unfreeze
                  </button>
                ) : (
                  <button className="rounded-md bg-danger px-3 py-1 text-xs text-white" onClick={() => void onFreeze(user.id || user._id || '')}>
                    Freeze
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
