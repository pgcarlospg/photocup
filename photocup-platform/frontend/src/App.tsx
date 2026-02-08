import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Upload from "./pages/Upload";
import JudgePanel from "./pages/JudgePanel";
import UserManagement from "./pages/UserManagement";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children, roles }: { children: JSX.Element; roles?: string[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

function AppContent() {
  const { user, logout } = useAuth();
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="min-h-screen bg-[#020817] text-white selection:bg-mensa-orange/30">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-mensa-blue/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-mensa-orange/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      {user && (
        <nav className="sticky top-0 z-50 glass border-b border-white/5 p-4 flex justify-between items-center px-8">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/logo.png" alt="PhotoCup 2026" className="h-12 w-auto object-contain" />
            </Link>
            <div className="hidden md:flex space-x-8 text-sm font-semibold tracking-wide uppercase">
              <Link to="/" className="hover:text-mensa-orange transition-colors">Home</Link>
              {(user.role === "PARTICIPANT" || user.role === "ADMIN") && <Link to="/upload" className="hover:text-mensa-orange transition-colors">Upload Photo</Link>}
              {user.role === "JUDGE" && <Link to="/judge" className="hover:text-mensa-orange transition-colors">Evaluate</Link>}
              {(user.role === "ADMIN" || user.role === "JUDGE") && <Link to="/dashboard" className="hover:text-mensa-orange transition-colors">Statistics</Link>}
              {user.role === "NATIONAL_COORDINATOR" && <Link to="/coordinator" className="hover:text-mensa-orange transition-colors">My Country</Link>}
              {user.role === "ADMIN" && <Link to="/users" className="hover:text-mensa-orange transition-colors">Users</Link>}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold">{user.full_name}</div>
              <div className="text-[10px] uppercase tracking-widest text-mensa-orange opacity-80">{user.role}</div>
            </div>
            <button 
              onClick={logout} 
              className="bg-white/5 border border-white/10 px-5 py-2 rounded-full font-bold hover:bg-white/10 transition-all text-sm"
            >
              LOGOUT
            </button>
          </div>
        </nav>
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <div className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center z-10">
              <span className="inline-block py-1 px-4 rounded-full glass text-xs font-bold text-mensa-orange mb-6 uppercase tracking-[0.2em]">
                Mensa International Photography Events
              </span>
              <div className="mb-8">
                <img src="/logo.jpg" alt="PhotoCup 2026" className="h-32 w-auto mx-auto mb-6 object-contain" />
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                  CAPTURE THE<br />
                  <span className="text-mensa-orange italic">BEST PICTURE</span>
                </h1>
                <p className="mt-4 text-2xl md:text-3xl font-bold text-mensa-blue uppercase tracking-wider">
                  Theme: <span className="text-mensa-orange">Longevity</span>
                </p>
              </div>
              <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-12 font-medium">
                Welcome to PhotoCup 2026. Your technical and artistic vision has a place here. 
                Your role is <span className="text-white underline decoration-mensa-orange underline-offset-4">{user?.role}</span>.
              </p>

              <div className="flex flex-wrap justify-center gap-6 mt-12 max-w-5xl mx-auto">
                {(user?.role === "PARTICIPANT" || user?.role === "ADMIN") && (
                  <div role="button" onClick={() => window.location.href="/upload"} className="glass p-8 rounded-3xl hover:bg-white/10 transition-all group cursor-pointer border-mensa-orange/20 w-full sm:w-80">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📷</div>
                    <h3 className="text-xl font-bold mb-2 uppercase">Participate</h3>
                    <p className="text-gray-500 text-sm">Upload your photos and compete globally.</p>
                  </div>
                )}

                <div role="button" onClick={() => setShowRules(true)} className="glass p-8 rounded-3xl hover:bg-white/10 transition-all group cursor-pointer border-green-500/20 w-full sm:w-80">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📋</div>
                  <h3 className="text-xl font-bold mb-2 uppercase">Rules</h3>
                  <p className="text-gray-500 text-sm">Check the contest rules.</p>
                </div>
                
                {user?.role === "JUDGE" && (
                  <div role="button" onClick={() => window.location.href="/judge"} className="glass p-8 rounded-3xl hover:bg-white/10 transition-all group cursor-pointer border-mensa-blue/20 w-full sm:w-80">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚖️</div>
                    <h3 className="text-xl font-bold mb-2 uppercase">Jury</h3>
                    <p className="text-gray-500 text-sm">Evaluate technique and artistic impact.</p>
                  </div>
                )}

                {(user?.role === "ADMIN" || user?.role === "JUDGE") && (
                  <div role="button" onClick={() => window.location.href="/dashboard"} className="glass p-8 rounded-3xl hover:bg-white/10 transition-all group cursor-pointer border-white/5 w-full sm:w-80">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                    <h3 className="text-xl font-bold mb-2 uppercase">Insights</h3>
                    <p className="text-gray-500 text-sm">Analyze the progress and statistics of the contest.</p>
                  </div>
                )}

                {user?.role === "ADMIN" && (
                  <div role="button" onClick={() => window.location.href="/users"} className="glass p-8 rounded-3xl hover:bg-white/10 transition-all group cursor-pointer border-purple-500/20 w-full sm:w-80">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👥</div>
                    <h3 className="text-xl font-bold mb-2 uppercase">Users</h3>
                    <p className="text-gray-500 text-sm">Manage the platform's users.</p>
                  </div>
                )}

                {user?.role === "NATIONAL_COORDINATOR" && (
                  <div role="button" onClick={() => window.location.href="/coordinator"} className="glass p-8 rounded-3xl hover:bg-white/10 transition-all group cursor-pointer border-mensa-orange/30 w-full sm:w-80">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🌍</div>
                    <h3 className="text-xl font-bold mb-2 uppercase">Coordinator Panel</h3>
                    <p className="text-gray-500 text-sm">Manage the photos and participants from your country.</p>
                  </div>
                )}
              </div>

              {/* Rules Modal */}
              {showRules && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowRules(false)}>
                  <div className="glass rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10 p-8" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">PhotoCup Rules</h2>
                        <div className="bg-mensa-orange/10 border border-mensa-orange/30 rounded-xl p-4 mb-4">
                          <h3 className="text-mensa-orange font-bold uppercase tracking-wide text-sm mb-3">🔑 Key Info</h3>
                          <p className="text-white text-sm mb-1">🔹 2026 theme: <span className="text-mensa-orange font-bold">"LONGEVITY"</span></p>
                          <p className="text-white text-sm">🔹 2026 submission deadline: <span className="text-mensa-orange font-bold">31st August - until 12:00 p.m. in the UK</span></p>
                        </div>
                      </div>
                      <button onClick={() => setShowRules(false)} className="text-gray-400 hover:text-white text-2xl font-bold">✕</button>
                    </div>

                    <div className="space-y-6 text-gray-300">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
                        <h3 className="text-green-400 font-black uppercase tracking-wide text-lg mb-4">DOs ✔</h3>
                        <ol className="space-y-3 list-decimal list-inside text-sm">
                          <li>✔ You must be a Mensa member in good standing and you must remain a member in good standing for the duration of the competition.</li>
                          <li>✔ When submitting your photo(s), you must include your full name, membership number, e-mail address and the title(s) of your photo(s).</li>
                          <li>✔ You may submit up to 3 photos (maximum of 3). Each photo should:
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                              <li>be in JPG/JPEG format</li>
                              <li>have a resolution of 150 DPI or higher</li>
                              <li>not exceed 10 MB</li>
                            </ul>
                          </li>
                          <li>✔ In order for the competition to be fair, and in order to allow the judging panel to accurately score your photo(s), you must provide "EXIF data" for each image you submit.</li>
                          <li>✔ "Global Editing" is allowed. Global Editing involves applying changes across the whole image. The following common edits are allowed: cropping, re-framing, straightening. The other Global Editing techniques that we allow are:
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                              <li>colour correction across the whole image; e.g. changing to sepia, greyscale, monochrome.</li>
                              <li>changes to the following settings: light balance, brightness, exposure, contrast, highlights, shadows, saturation, tint, temperature, sharpness, definition.</li>
                            </ul>
                          </li>
                          <li>✔ Each photograph you submit must be your own original work, and you must be the sole and exclusive owner of the copyright and all other intellectual property rights associated with each submitted image.</li>
                        </ol>
                      </div>

                      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                        <h3 className="text-red-400 font-black uppercase tracking-wide text-lg mb-4">DON'Ts ❌</h3>
                        <ol className="space-y-3 list-decimal list-inside text-sm">
                          <li>❌ Pre-dated images (photos taken before 1st January 2025) may not be submitted.</li>
                          <li>❌ AI-generated images will not be accepted. Any such entry will be disqualified, and any member submitting such images will be banned from entering future competitions.</li>
                          <li>❌ Your photo(s) must not include anything that was not naturally captured in the original camera image, such as labels, watermarks, tags, numbers, symbols, letters or words (e.g. your name/signature/initials).</li>
                          <li>❌ Anything beyond the scope of "Global Editing" (see point 5 of DOs, above) is not allowed. Specifically, the following edits are not allowed: removing objects, masking or grading parts of photos, changing only the background colour, targeting your edits so they affect only certain areas, vignetting, noise reduction, the use of AI-powered editing.</li>
                          <li>❌ Any promotion of your entries (or any promotion of your entries by other people or groups on your behalf) is not allowed.</li>
                        </ol>
                      </div>

                      <div className="text-center py-4">
                        <p className="text-2xl font-black text-mensa-orange uppercase tracking-widest">GOOD LUCK!</p>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <button onClick={() => setShowRules(false)} className="bg-mensa-orange hover:bg-mensa-orange/90 text-white font-bold px-8 py-3 rounded-xl uppercase tracking-wider transition-all">
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ProtectedRoute>
        } />
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute roles={["PARTICIPANT", "ADMIN"]}>
              <Upload />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/judge" 
          element={
            <ProtectedRoute roles={["JUDGE"]}>
              <JudgePanel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute roles={["ADMIN", "JUDGE"]}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coordinator" 
          element={
            <ProtectedRoute roles={["NATIONAL_COORDINATOR"]}>
              <CoordinatorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
