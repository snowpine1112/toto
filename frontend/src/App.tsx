import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { MatchDetail } from '@/pages/MatchDetail';
import { Leagues } from '@/pages/Leagues';
import { LeagueDetail } from '@/pages/LeagueDetail';
import { cn } from '@/utils/cn';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={cn(
        'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      )}
    >
      {children}
    </Link>
  );
}

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg text-blue-700">
            Toto Score Advisor
          </Link>
          <nav className="flex gap-1">
            <NavLink to="/">ダッシュボード</NavLink>
            <NavLink to="/leagues">リーグ</NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
          <Route path="/leagues" element={<Leagues />} />
          <Route path="/leagues/:id" element={<LeagueDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
