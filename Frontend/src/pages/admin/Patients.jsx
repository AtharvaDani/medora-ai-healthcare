import { useEffect, useState } from 'react';
import { adminService, } from '../../services/adminService';
import { showMessage } from '../../services/messageService';

export default function Patients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    adminService
      .getAllUsers()
      .then((list) => setPatients(list.filter((u) => u.role === 'User')))
      .catch((error) => console.error('Error fetching users:', error));
  }, []);

  const permitPatient = async (id) => {
    try {
      await adminService.permit(id);
      showMessage('Patient Access Permitted', 3000);
    } catch (err) {
      console.error('Permit failed:', err);
    }
  };

  const blockPatient = async (id) => {
    try {
      await adminService.block(id);
      showMessage('Patient Access Blocked', 3000);
    } catch (err) {
      console.error('Block failed:', err);
    }
  };

  return (
    <>
      <h3 className="mt-5 mb-3 text-primary" style={{ textAlign: 'center' }}>Users List</h3>

      <div className="table-responsive">
        <table className="table table-hover table-bordered shadow-sm">
          <thead className="table-dark">
            <tr>
              <th scope="col">Patient Name</th>
              <th scope="col">Misconduct Score</th>
              <th scope="col">Reason</th>
              <th scope="col">Access</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td className="align-middle">{patient.username}</td>
                <td className="align-middle text-danger fw-bold">{patient.misconductScore || 'N/A'}</td>
                <td className="align-middle text-muted">{patient.misconductReason || 'No reason provided'}</td>
                <td className="align-middle">
                  <button className="btn btn-sm btn-success me-2" onClick={() => permitPatient(patient.id)}>Permit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => blockPatient(patient.id)}>Block</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {patients.length === 0 && <p className="text-center text-muted mt-3">No patients found.</p>}
    </>
  );
}
