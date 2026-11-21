import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import '../styles/features.scss';

const COLORS = ['#0d9488', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#64748b', '#ec4899'];
const STATUS_COLORS: Record<string, string> = { Pending: '#f59e0b', Confirmed: '#0d9488', Cancelled: '#ef4444' };

const shortDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function Panel({ title, children, empty }: { title: string; children: JSX.Element; empty?: boolean }) {
  return (
    <div className="panel">
      <h5>{title}</h5>
      {empty ? <div className="text-muted py-5 text-center">No data yet</div> : <div className="chart-box">{children}</div>}
    </div>
  );
}

export default function AnalyticsDashboard({ data, admin }: { data: any; admin: boolean }) {
  const t = data.totals;
  // Show only business hours that have data, plus a little context around them.
  const hours: any[] = (data.appointmentsByHour as any[]).filter((h) => h.hour >= 7 && h.hour <= 21);
  const sum = (rows: any[]) => rows.reduce((a, r) => a + r.count, 0);

  const stats: [string, any][] = admin
    ? [['Doctors', t.doctors], ['Patients', t.patients], ['Appointments', t.appointments],
       ['Slot booking rate', t.bookingRate + '%'], ['Avg. rating', t.reviews ? t.averageRating + ' ★' : '-']]
    : [['Appointments', t.appointments], ['Upcoming', t.upcoming], ['Unique patients', t.uniquePatients],
       ['Reviews', t.reviews], ['Avg. rating', t.reviews ? t.averageRating + ' ★' : '-']];

  return (
    <>
      <div className="stat-grid">
        {stats.map(([lbl, num]) => (
          <div className="stat" key={lbl}><div className="num">{num}</div><div className="lbl">{lbl}</div></div>
        ))}
      </div>

      <div className="chart-grid">
        <Panel title="Appointments (last 14 days + next 7)" empty={sum(data.appointmentsByDay) === 0}>
          <ResponsiveContainer>
            <LineChart data={data.appointmentsByDay} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6eeee" />
              <XAxis dataKey="date" tickFormatter={shortDate} fontSize={11} interval={3} />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip labelFormatter={(l) => shortDate(String(l))} />
              <Line type="monotone" dataKey="count" name="Appointments" stroke="#0d9488" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Busiest hours" empty={sum(hours) === 0}>
          <ResponsiveContainer>
            <BarChart data={hours} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6eeee" />
              <XAxis dataKey="label" fontSize={11} interval={1} />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" name="Appointments" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Appointment status" empty={sum(data.appointmentsByStatus) === 0}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data.appointmentsByStatus} dataKey="count" nameKey="status" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {data.appointmentsByStatus.map((s: any, i: number) => <Cell key={i} fill={STATUS_COLORS[s.status] ?? COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Rating distribution" empty={sum(data.ratingDistribution) === 0}>
          <ResponsiveContainer>
            <BarChart data={data.ratingDistribution} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6eeee" />
              <XAxis dataKey="stars" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" name="Reviews" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        {admin && (
          <Panel title="Appointments by speciality" empty={!data.appointmentsBySpeciality?.length}>
            <ResponsiveContainer>
              <BarChart data={data.appointmentsBySpeciality} layout="vertical" margin={{ top: 8, right: 12, bottom: 0, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6eeee" />
                <XAxis type="number" allowDecimals={false} fontSize={11} />
                <YAxis type="category" dataKey="speciality" width={100} fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" name="Appointments" fill="#0d9488" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        )}

        {admin && (
          <div className="panel">
            <h5>Top-rated doctors</h5>
            {data.topDoctors?.length ? (
              <table className="mini">
                <thead><tr><th>Doctor</th><th>Rating</th><th>Reviews</th><th>Appts</th></tr></thead>
                <tbody>
                  {data.topDoctors.map((d: any) => (
                    <tr key={d.doctorId}>
                      <td>{d.name}<div className="text-muted small">{d.speciality}</div></td>
                      <td><strong>{d.rating}</strong> ★</td><td>{d.reviews}</td><td>{d.appointments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="text-muted py-5 text-center">No reviews yet</div>}
          </div>
        )}
      </div>
    </>
  );
}
