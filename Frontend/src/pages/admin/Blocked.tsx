import { useEffect, useState } from 'react';
import { adminService, User } from '../../services/adminService';
import { showMessage } from '../../services/messageService';

export default function Blocked() {
  const [blocked, setBlocked] = useState<User[]>([]);

  const load = () =>
    adminService
      .getAllUsers()
      .then((list) => setBlocked(list.filter((u) => u.permitted === false)))
      .catch((e) => console.error(e));

  useEffect(() => {
    load();
  }, []);

  const permit = async (id: number) => {
    try {
      await adminService.permit(id);
      showMessage(' User Access Permitted', 3000);
      load();
    } catch (err) {
      console.error('Permit failed:', err);
    }
  };

  return (
    <>
      <h3 className="mt-4 mb-3 text-primary" style={{ textAlign: 'center' }}>Blocked Accounts</h3>

      <div className="table-responsive">
        <table className="table table-hover table-bordered shadow-sm">
          <thead className="table-dark">
            <tr>
              <th scope="col">Doctor Name</th>
              <th scope="col">Access</th>
            </tr>
          </thead>
          <tbody>
            {blocked.map((folk) => (
              <tr key={folk.id}>
                <td className="align-middle">{folk.username}</td>
                <td className="align-middle">
                  <button className="btn btn-sm btn-success me-2" onClick={() => permit(folk.id)}>Permit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {blocked.length === 0 && <p className="text-center text-muted mt-3">No Blocked Accounts Yet.</p>}
    </>
  );
}
