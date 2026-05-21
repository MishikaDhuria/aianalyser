import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import { LogOut, User, Flame, Award } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between shadow-lg">
      <Link to="/" className="flex items-center space-x-2">
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          ⚡ AI Interviewer
        </span>
      </Link>

      <div className="flex items-center space-x-6">
        {isAuthenticated && user ? (
          <>
            {/* Gamification Streak & XP */}
            <div className="flex items-center space-x-4 bg-slate-900/60 px-4 py-1.5 rounded-full border border-white/5">
              <div className="flex items-center space-x-1" title="Practice Streak">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                <span className="text-sm font-semibold text-orange-400">{user.stats?.streak || 0} Days</span>
              </div>
              <div className="w-[1px] h-4 bg-white/10" />
              <div className="flex items-center space-x-1" title="XP Points">
                <Award className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-semibold text-purple-300">{user.stats?.xp || 0} XP</span>
              </div>
            </div>

            {/* Profile widget */}
            <Link to="/settings" className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-between justify-center text-cyan-300 text-sm font-bold capitalize">
                {user.username.charAt(0)}
              </div>
              <span className="text-sm font-medium hidden md:inline">{user.username}</span>
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 transition-colors p-1"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-sm font-semibold text-white shadow-lg transition-all"
          >
            Get Started
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
