import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const response = await api.post("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      const { access_token, user } = response.data;
      
      login(access_token, user);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : "Login error (Check that the backend is active)");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#020817] overflow-hidden">
      {/* Background blobs for login */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-mensa-blue/20 rounded-full blur-[120px] animate-blob"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-mensa-orange/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md p-10 space-y-8 glass rounded-[2rem] shadow-2xl relative z-10 border-white/5 mx-4">
        <div className="text-center">
          <div className="mb-6">
            <img src="/logo.jpg" alt="PhotoCup 2026" className="h-20 w-auto mx-auto object-contain" />
          </div>
          <p className="mt-4 text-sm text-gray-400 font-medium tracking-wide uppercase">
            Capture the Best Picture
          </p>
          <p className="mt-2 text-xs text-mensa-orange font-bold tracking-widest uppercase">
            Theme: Longevity
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="p-4 text-xs font-bold text-red-400 bg-red-900/20 border border-red-900/50 rounded-xl">{error}</div>}
          <div className="space-y-4">
            <div>
              <input
                type="email"
                required
                className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mensa-orange transition-all"
                placeholder="Corporate email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mensa-orange transition-all"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 bg-mensa-orange text-white text-sm font-black rounded-2xl shadow-lg hover:shadow-mensa-orange/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest hover:bg-mensa-orange/90"
            >
              Sign In
            </button>
          </div>
        </form>
        <div className="pt-6 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            Mensa International © 2026 • Secure Access
          </p>
        </div>
      </div>
    </div>
  );
}
