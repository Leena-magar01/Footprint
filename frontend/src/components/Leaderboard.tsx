import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export const Leaderboard: React.FC = () => {
  const [board, setBoard] = useState<any[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await api.getLeaderboard();
      setBoard(data.leaderboard);
      setCurrentUserRank(data.currentUserRank);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading Leaderboard...</span>
        </div>
      </div>
    );
  }

  // Check if current user is already in top 10 list
  const isUserInTop10 = board.some(u => u.isCurrentUser);

  return (
    <div className="container pb-5">
      <div className="row g-4">
        {/* Leaderboard Table List */}
        <div className="col-lg-7">
          <div className="eco-card h-100">
            <h1 className="fs-4 fw-bold mb-3 d-flex align-items-center">
              <i className="bi bi-people-fill text-success me-2" aria-hidden="true"></i>
              Global Carbon Standings
            </h1>
            <p className="text-muted small mb-4">Rankings based on total points earned through completed challenges, daily active streaks, and EcoLens image analyses.</p>

            <div className="table-responsive">
              <table className="table table-dark table-hover table-borderless align-middle m-0" style={{ background: 'transparent' }}>
                <thead>
                  <tr className="border-bottom border-secondary border-opacity-10 text-muted small">
                    <th scope="col" style={{ width: '60px' }}>Rank</th>
                    <th scope="col">Eco Advocate</th>
                    <th scope="col" className="text-end">Streak</th>
                    <th scope="col" className="text-end">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`border-bottom border-secondary border-opacity-5 ${item.isCurrentUser ? 'bg-success bg-opacity-5 fw-bold' : ''}`}
                    >
                      <td className="py-3">
                        {item.rank === 1 && <span className="fs-5">🏆</span>}
                        {item.rank === 2 && <span className="fs-5">🥈</span>}
                        {item.rank === 3 && <span className="fs-5">🥉</span>}
                        {item.rank > 3 && <span className="text-white-50 ms-1">{item.rank}</span>}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2.5">
                          <div 
                            className="rounded-circle bg-success bg-opacity-15 d-flex align-items-center justify-content-center fw-bold text-success"
                            style={{ width: '32px', height: '32px', fontSize: '0.9rem', border: item.isCurrentUser ? '1.5px solid var(--eco-primary)' : 'none' }}
                          >
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="d-block">{item.name}</span>
                            <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                              {item.badges[item.badges.length - 1] || 'Green Beginner'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="text-end text-warning py-3">
                        <i className="bi bi-fire me-1" aria-hidden="true"></i>
                        {item.streak}d
                      </td>
                      <td className="text-end text-success fw-bold py-3">{item.points}</td>
                    </tr>
                  ))}
                  
                  {/* Append current user row if outside top 10 */}
                  {!isUserInTop10 && currentUserRank && (
                    <>
                      <tr className="text-center text-muted small">
                        <td colSpan={4} className="py-2 opacity-50">••••••</td>
                      </tr>
                      <tr className="bg-success bg-opacity-5 fw-bold">
                        <td className="py-3">
                          <span className="text-white-50 ms-1">{currentUserRank.rank}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2.5">
                            <div 
                              className="rounded-circle bg-success bg-opacity-20 border border-success border-opacity-40 d-flex align-items-center justify-content-center fw-bold text-success"
                              style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}
                            >
                              {currentUserRank.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="d-block">{currentUserRank.name} (You)</span>
                              <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                                {currentUserRank.badges[currentUserRank.badges.length - 1] || 'Green Beginner'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="text-end text-warning py-3">
                          <i className="bi bi-fire me-1" aria-hidden="true"></i>
                          {currentUserRank.streak}d
                        </td>
                        <td className="text-end text-success fw-bold py-3">{currentUserRank.points}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Badges Achievement System cards */}
        <div className="col-lg-5">
          <div className="eco-card h-100 d-flex flex-column justify-content-between">
            <div>
              <h2 className="fs-5 fw-bold text-white mb-3 d-flex align-items-center">
                <i className="bi bi-shield-shaded text-success me-2" aria-hidden="true"></i>
                Sustainability Badges
              </h2>
              <p className="text-muted small mb-4">Complete eco actions and earn points to advance levels and unlock premium carbon achievements.</p>
              
              <div className="d-flex flex-column gap-3">
                {/* Badge 1 */}
                <div className="d-flex gap-3 align-items-center p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-10">
                  <div className="equiv-icon-container bg-success bg-opacity-10 border border-success border-opacity-20 text-success" style={{ width: '42px', height: '42px', fontSize: '1.25rem' }}>
                    🌱
                  </div>
                  <div>
                    <h3 className="fs-6 fw-bold text-white mb-0.5">Green Beginner</h3>
                    <p className="small text-muted mb-0">Milestone: Starting point. Earned by default upon signup.</p>
                  </div>
                </div>

                {/* Badge 2 */}
                <div className="d-flex gap-3 align-items-center p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-10">
                  <div className="equiv-icon-container bg-info bg-opacity-10 border border-info border-opacity-20 text-info" style={{ width: '42px', height: '42px', fontSize: '1.25rem' }}>
                    🍀
                  </div>
                  <div>
                    <h3 className="fs-6 fw-bold text-white mb-0.5">Eco Starter</h3>
                    <p className="small text-muted mb-0">Milestone: 100 points. Take the first steps toward a sustainable lifestyle.</p>
                  </div>
                </div>

                {/* Badge 3 */}
                <div className="d-flex gap-3 align-items-center p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-10">
                  <div className="equiv-icon-container bg-warning bg-opacity-10 border border-warning border-opacity-20 text-warning" style={{ width: '42px', height: '42px', fontSize: '1.25rem' }}>
                    🌲
                  </div>
                  <div>
                    <h3 className="fs-6 fw-bold text-white mb-0.5">Eco Warrior</h3>
                    <p className="small text-muted mb-0">Milestone: 500 points. Consistent habits making a regular impact.</p>
                  </div>
                </div>

                {/* Badge 4 */}
                <div className="d-flex gap-3 align-items-center p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-10">
                  <div className="equiv-icon-container bg-danger bg-opacity-10 border border-danger border-opacity-20 text-danger" style={{ width: '42px', height: '42px', fontSize: '1.25rem' }}>
                    ⚡
                  </div>
                  <div>
                    <h3 className="fs-6 fw-bold text-white mb-0.5">Carbon Hero</h3>
                    <p className="small text-muted mb-0">Milestone: 1500 points. Champion carbon cutter leading the ranks.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 mt-4 rounded-3 bg-success bg-opacity-5 border border-success border-opacity-10 text-center small text-white-50">
              <i className="bi bi-info-circle-fill text-success me-1.5" aria-hidden="true"></i>
              Points values: +10 pts per logged activity log, +15 pts per EcoLens photo analysis, and +15 to +150 pts per completed challenge.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Leaderboard;
