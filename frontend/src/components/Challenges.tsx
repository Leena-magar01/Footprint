import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Challenges: React.FC = () => {
  const { refreshUser } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const data = await api.getChallenges();
      setChallenges(data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleJoinChallenge = async (challengeId: string) => {
    setActionLoading(challengeId);
    setSuccessMsg(null);
    try {
      await api.joinChallenge(challengeId);
      await fetchChallenges();
    } catch (error: any) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteChallenge = async (userChallengeId: string, challengeId: string) => {
    setActionLoading(challengeId);
    setSuccessMsg(null);
    try {
      const response = await api.completeChallenge(userChallengeId);
      setSuccessMsg(`Challenge Completed! +${response.pointsAwarded} points awarded. Streak updated!`);
      await fetchChallenges();
      refreshUser(); // update navbar points
    } catch (error: any) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading Challenges...</span>
        </div>
      </div>
    );
  }

  const dailyChallenges = challenges.filter(c => c.type === 'daily');
  const weeklyChallenges = challenges.filter(c => c.type === 'weekly');

  return (
    <div className="container pb-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="fw-bold m-0" style={{ fontSize: '2.25rem' }}>Eco Challenges</h1>
          <p className="text-muted m-0">Join daily and weekly challenges to build healthy habits and earn points</p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show" role="alert" style={{ borderRadius: '12px' }}>
          <i className="bi bi-patch-check-fill me-2" aria-hidden="true"></i>
          {successMsg}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setSuccessMsg(null)}></button>
        </div>
      )}

      {/* Daily Challenges Grid */}
      <h2 className="fs-4 fw-bold text-white mb-3 d-flex align-items-center">
        <i className="bi bi-clock-history text-warning me-2" aria-hidden="true"></i>
        Daily Eco Action Items
      </h2>
      <div className="row g-4 mb-5">
        {dailyChallenges.map((challenge) => (
          <div className="col-md-6" key={challenge._id}>
            <div className="eco-card h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="eco-badge badge-green text-uppercase">{challenge.category}</span>
                  <span className="text-warning small fw-bold d-flex align-items-center">
                    <i className="bi bi-star-fill me-1" aria-hidden="true"></i>
                    {challenge.points} pts
                  </span>
                </div>
                <h3 className="fs-5 fw-bold text-white mb-1.5">{challenge.title}</h3>
                <p className="small text-muted mb-4">{challenge.description}</p>
              </div>

              <div>
                {challenge.userStatus === 'completed' ? (
                  <div className="p-2.5 rounded-3 text-center border border-success border-opacity-10 bg-success bg-opacity-5 small text-success fw-bold">
                    <i className="bi bi-check-circle-fill me-1.5" aria-hidden="true"></i>
                    Completed today
                  </div>
                ) : challenge.userStatus === 'active' ? (
                  <button
                    className="w-100 eco-btn-outline py-2 d-flex align-items-center justify-content-center btn-sm"
                    onClick={() => handleCompleteChallenge(challenge.userChallengeId, challenge._id)}
                    disabled={actionLoading === challenge._id}
                  >
                    {actionLoading === challenge._id ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-1.5" aria-hidden="true"></i>
                        Complete Habit
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    className="w-100 eco-btn-primary py-2 d-flex align-items-center justify-content-center btn-sm"
                    onClick={() => handleJoinChallenge(challenge._id)}
                    disabled={actionLoading === challenge._id}
                  >
                    {actionLoading === challenge._id ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <>
                        <i className="bi bi-plus-lg me-1.5" aria-hidden="true"></i>
                        Accept Challenge
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Challenges Grid */}
      <h2 className="fs-4 fw-bold text-white mb-3 d-flex align-items-center">
        <i className="bi bi-calendar-week text-info me-2" aria-hidden="true"></i>
        Weekly Endurance Challenges
      </h2>
      <div className="row g-4">
        {weeklyChallenges.map((challenge) => (
          <div className="col-md-6" key={challenge._id}>
            <div className="eco-card h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="eco-badge badge-violet text-uppercase">{challenge.category}</span>
                  <span className="text-warning small fw-bold d-flex align-items-center">
                    <i className="bi bi-star-fill me-1" aria-hidden="true"></i>
                    {challenge.points} pts
                  </span>
                </div>
                <h3 className="fs-5 fw-bold text-white mb-1.5">{challenge.title}</h3>
                <p className="small text-muted mb-4">{challenge.description}</p>
              </div>

              <div>
                {challenge.userStatus === 'completed' ? (
                  <div className="p-2.5 rounded-3 text-center border border-success border-opacity-10 bg-success bg-opacity-5 small text-success fw-bold">
                    <i className="bi bi-check-circle-fill me-1.5" aria-hidden="true"></i>
                    Accomplished this week
                  </div>
                ) : challenge.userStatus === 'active' ? (
                  <button
                    className="w-100 eco-btn-outline py-2 d-flex align-items-center justify-content-center btn-sm"
                    onClick={() => handleCompleteChallenge(challenge.userChallengeId, challenge._id)}
                    disabled={actionLoading === challenge._id}
                  >
                    {actionLoading === challenge._id ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-1.5" aria-hidden="true"></i>
                        Complete Challenge
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    className="w-100 eco-btn-primary py-2 d-flex align-items-center justify-content-center btn-sm"
                    onClick={() => handleJoinChallenge(challenge._id)}
                    disabled={actionLoading === challenge._id}
                  >
                    {actionLoading === challenge._id ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <>
                        <i className="bi bi-plus-lg me-1.5" aria-hidden="true"></i>
                        Accept Challenge
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Challenges;
