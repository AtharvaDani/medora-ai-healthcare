import { useEffect, useState } from 'react';
import { adminService, } from '../../services/adminService';
import { showMessage } from '../../services/messageService';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);

  const loadDoctors = async () => {
    try {
      const list = await adminService.getAllUsers();
      setDoctors(list.filter((u) => u.role?.toLowerCase() === 'doctor'));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    // Step 1: trigger backend feedback analysis, Step 2: load doctors (even if analysis fails)
    adminService
      .triggerSmartAnalysis()
      .catch((err) => console.error('Failed to trigger feedback analysis:', err))
      .finally(loadDoctors);
  }, []);

  const permitDoctor = async (id) => {
    try {
      await adminService.permit(id);
      showMessage('Doctor permitted', 3000);
      loadDoctors();
    } catch (err) {
      console.error('Permit failed:', err);
    }
  };

  const blockDoctor = async (id) => {
    try {
      await adminService.block(id);
      showMessage('Doctor Access Blocked', 3000);
      loadDoctors();
    } catch (err) {
      console.error('Block failed:', err);
    }
  };

  return (
    <>
      <h3 className="mt-4 mb-3 text-primary" style={{ textAlign: 'center' }}>Doctors List</h3>

      <div className="table-responsive">
        <table className="table table-hover table-bordered shadow-sm">
          <thead className="table-dark">
            <tr>
              <th scope="col">Doctor Name</th>
              <th scope="col">Feedback Analysis</th>
              <th scope="col">Access</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td className="align-middle">{doctor.username}</td>
                <td className="align-middle text-muted">
                  {doctor.feedbackAnalysis ? doctor.feedbackAnalysis : 'Analyzing feedback...'}
                </td>
                <td className="align-middle">
                  <button className="btn btn-sm btn-success me-2" style={{ margin: 5 }} onClick={() => permitDoctor(doctor.id)}>Permit</button>
                  <button className="btn btn-sm btn-danger" style={{ margin: 5 }} onClick={() => blockDoctor(doctor.id)}>Block</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {doctors.length === 0 && <p className="text-center text-muted mt-3">No doctors found.</p>}
    </>
  );
}
