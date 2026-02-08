import { useState, useEffect } from "react";
import { Card, Title, BarChart, LineChart, Subtitle, DonutChart, Grid, Metric, Text, TabGroup, TabList, Tab, TabPanels, TabPanel, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge, Button, Select, SelectItem } from "@tremor/react";
import api, { BASE_URL } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Trash2, Users, Camera, Scale, Gavel, TrendingUp, BarChart3, CheckCircle2, Download, Image, Globe, Trophy, Star, PieChart, Award, Zap, Cpu, Maximize, BookOpen, Target, Clock, Activity } from "lucide-react";

const getFlagEmoji = (country: string) => {
  const code: Record<string, string> = {
    "España": "🇪🇸", "Spain": "🇪🇸",
    "México": "🇲🇽", "Mexico": "🇲🇽",
    "Argentina": "🇦🇷",
    "Colombia": "🇨🇴",
    "Chile": "🇨🇱",
    "Perú": "🇵🇪", "Peru": "🇵🇪",
    "EEUU": "🇺🇸", "USA": "🇺🇸", "United States": "🇺🇸",
    "Francia": "🇫🇷", "France": "🇫🇷",
    "Italia": "🇮🇹", "Italy": "🇮🇹",
    "Alemania": "🇩🇪", "Germany": "🇩🇪",
    "Reino Unido": "🇬🇧", "UK": "🇬🇧",
    "Brasil": "🇧🇷", "Brazil": "🇧🇷",
    "Japón": "🇯🇵", "Japan": "🇯🇵",
    "Canadá": "🇨🇦", "Canada": "🇨🇦",
    "Australia": "🇦🇺",
    "China": "🇨🇳"
  };
  return code[country] || "🏳️";
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [judges, setJudges] = useState<any[]>([]);
  const [selectedJudge, setSelectedJudge] = useState<string>("");
  const [judgeEvaluations, setJudgeEvaluations] = useState<any>(null);
  const [loadingJudgeData, setLoadingJudgeData] = useState(false);
  const [activeJudgeTab, setActiveJudgeTab] = useState<number>(0);
  const [activeMainTab, setActiveMainTab] = useState<number>(0);

  // Calculate remaining days until August 31, 2026
  const getDaysRemaining = () => {
    const deadline = new Date('2026-08-31T12:00:00');
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  useEffect(() => {
    fetchData();
    fetchJudges();
  }, []);

  useEffect(() => {
    if (selectedJudge) {
      fetchJudgeEvaluations(parseInt(selectedJudge));
    }
  }, [selectedJudge]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorDetails(null);
      const [statsRes, photosRes] = await Promise.all([
        api.get(`/photos/stats?t=${Date.now()}`),
        api.get("/photos/")
      ]);
      setStats(statsRes.data);
      setPhotos(photosRes.data);
    } catch (err: any) {
      console.error("Error fetching data", err);
      setErrorDetails(err.response?.data?.detail || err.message || "Server connection error");
    } finally {
      setLoading(false);
    }
  };

  const fetchJudges = async () => {
    try {
      const response = await api.get("/photos/judges");
      console.log("Jueces cargados desde API:", response.data);
      setJudges(response.data);
      if (response.data.length > 0) {
        setSelectedJudge(response.data[0].id.toString());
      }
    } catch (err: any) {
      console.error("Error fetching judges from API, loading mock data", err);
      console.error("Error details:", err.response?.data);

      // Load mock data as fallback
      try {
        const mockResponse = await fetch('/mock-judges.json');
        const mockData = await mockResponse.json();
        console.log("Jueces cargados desde mock data:", mockData);
        setJudges(mockData);
        if (mockData.length > 0) {
          setSelectedJudge(mockData[0].id.toString());
        }
      } catch (mockErr) {
        console.error("Error loading mock judges data", mockErr);
        setJudges([]);
      }
    }
  };

  const fetchJudgeEvaluations = async (judgeId: number) => {
    try {
      setLoadingJudgeData(true);
      const response = await api.get(`/photos/judges/${judgeId}/evaluations`);
      setJudgeEvaluations(response.data);
    } catch (err: any) {
      console.error("Error fetching judge evaluations", err);
      setJudgeEvaluations(null);
    } finally {
      setLoadingJudgeData(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!window.confirm("Are you sure you want to delete this photo? All its scores will also be deleted.")) {
      return;
    }

    try {
      await api.delete(`/photos/remove-item/${photoId}`);
      // Refresh data
      fetchData();
    } catch (err: any) {
      console.error("Error deleting photo", err);
      alert("Error deleting photo: " + (err.response?.data?.detail || err.message));
    }
  };

  const fetchStats = fetchData; // Keep the name for re-try button

  const handleExport = () => {
    if (!stats || !stats.leaderboard) return;
    const headers = ["ID", "Title", "Author", "Category", "Score"];
    const csvData = (stats.leaderboard || []).map((row: any) => 
      [row.id, `"${row.title || 'Untitled'}"`, `"${row.author || 'Anonymous'}"`, `"${row.category || 'General'}"`, row.score || 0].join(",")
    );
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...csvData].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_photocup_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-20 text-center text-white min-h-screen bg-[#020B1A]">Loading real-time metrics...</div>;
  if (!stats) return (
    <div className="p-20 text-center min-h-screen bg-[#020B1A]">
      <div className="text-red-500 text-xl font-bold mb-4">Error loading statistics</div>
      <div className="text-gray-500 mb-8">{errorDetails}</div>
      <Button onClick={fetchStats} className="bg-mensa-orange border-none hover:bg-mensa-orange/90">Retry Connection</Button>
    </div>
  );

  return (
    <div className="p-6 pb-20 relative z-10 max-w-[1600px] mx-auto">
      {/* Header minimalista con logo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div className="flex items-center gap-5">
          <div className="neomorph-card p-4 rounded-2xl">
            <img src="/logo.png" alt="PhotoCup" className="h-12 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-white text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-500 text-sm font-medium mt-0.5">PhotoCup 2026 Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="neomorph-button px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg"
            onClick={handleExport}
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4 text-white" /> Export
            </span>
          </button>
          <div className="neomorph-card px-5 py-2.5 rounded-xl">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Call for Entries</p>
            <p className="text-mensa-orange text-xs font-bold">{getDaysRemaining()} days remaining</p>
          </div>
        </div>
      </div>
      
      {/* Tabs minimalistas */}
      <TabGroup index={activeMainTab} onIndexChange={(index: number) => {
        setActiveMainTab(index);
        // When the Judges tab (index 5) is selected, refresh the data
        if (index === 5) {
          fetchJudges();
          fetchData();
        }
      }}>
        <div className="neomorph-card rounded-2xl p-1.5 mb-6 inline-flex gap-1">
          <TabList className="border-0 bg-transparent gap-1">
            <Tab className="neomorph-tab px-5 py-2.5 rounded-xl text-sm font-semibold transition-all data-[selected]:bg-mensa-orange data-[selected]:text-white text-gray-500">
              <span className="flex items-center gap-2">
                <PieChart className="w-4 h-4" /> Metrics
              </span>
            </Tab>
            <Tab className="neomorph-tab px-5 py-2.5 rounded-xl text-sm font-semibold transition-all data-[selected]:bg-mensa-orange data-[selected]:text-white text-gray-500">
              <span className="flex items-center gap-2">
                <Image className="w-4 h-4" /> Gallery
              </span>
            </Tab>
            <Tab className="neomorph-tab px-5 py-2.5 rounded-xl text-sm font-semibold transition-all data-[selected]:bg-mensa-orange data-[selected]:text-white text-gray-500">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4" /> Location
              </span>
            </Tab>
            <Tab className="neomorph-tab px-5 py-2.5 rounded-xl text-sm font-semibold transition-all data-[selected]:bg-mensa-orange data-[selected]:text-white text-gray-500">
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Ranking
              </span>
            </Tab>
            <Tab className="neomorph-tab px-5 py-2.5 rounded-xl text-sm font-semibold transition-all data-[selected]:bg-mensa-orange data-[selected]:text-white text-gray-500">
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4" /> Top 10
              </span>
            </Tab>
            <Tab className="neomorph-tab px-5 py-2.5 rounded-xl text-sm font-semibold transition-all data-[selected]:bg-mensa-orange data-[selected]:text-white text-gray-500">
              <span className="flex items-center gap-2">
                <Gavel className="w-4 h-4" /> Judges
              </span>
            </Tab>
          </TabList>
        </div>
        <TabPanels>
          <TabPanel>
            {/* KPI Cards mejoradas con visualización */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {/* Total Participants */}
              <div className="neomorph-card rounded-2xl p-6 hover:shadow-2xl transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mensa-orange/20 to-amber-600/20 flex items-center justify-center neomorph-badge transition-transform group-hover:scale-110">
                    <Users className="w-7 h-7 text-mensa-orange" strokeWidth={2.5} />
                  </div>
                  <div className="neomorph-badge px-3 py-1.5 rounded-xl">
                    <span className="text-mensa-orange text-xs font-bold">+{Math.floor(stats.total_participants * 0.15)} ↗</span>
                  </div>
                </div>
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Active Participants</h3>
                <p className="text-white text-3xl font-bold mb-4">{stats.total_participants}</p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 h-1.5 neomorph-progress rounded-full overflow-hidden">
                    <div className="h-full bg-mensa-orange rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-gray-500 font-semibold">75%</span>
                </div>
              </div>

              {/* Obras Recibidas */}
              <div className="neomorph-card rounded-2xl p-6 hover:shadow-2xl transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mensa-orange/20 to-amber-600/20 flex items-center justify-center neomorph-badge transition-transform group-hover:scale-110">
                    <Camera className="w-7 h-7 text-mensa-orange" strokeWidth={2.5} />
                  </div>
                  <div className="neomorph-badge px-3 py-1.5 rounded-xl">
                    <span className="text-mensa-orange text-xs font-bold">🔥 HOT</span>
                  </div>
                </div>
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Obras Enviadas</h3>
                <p className="text-white text-3xl font-bold mb-4">{stats.total_photos}</p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 h-1.5 neomorph-progress rounded-full overflow-hidden">
                    <div className="h-full bg-mensa-orange rounded-full transition-all duration-1000" 
                         style={{ width: `${Math.min((stats.total_photos / 100) * 100, 100)}%` }}></div>
                  </div>
                  <span className="text-gray-500 font-semibold">{Math.min(stats.total_photos, 100)}/100</span>
                </div>
              </div>

              {/* Evaluaciones */}
              <div className="neomorph-card rounded-2xl p-6 hover:shadow-2xl transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mensa-orange/20 to-amber-600/20 flex items-center justify-center neomorph-badge transition-transform group-hover:scale-110">
                    <Scale className="w-7 h-7 text-mensa-orange" strokeWidth={2.5} />
                  </div>
                  <div className="neomorph-badge px-3 py-1.5 rounded-xl">
                    <span className="text-mensa-orange text-xs font-bold">{Math.floor((stats.total_scores / (stats.total_photos * 3 || 1)) * 100)}%</span>
                  </div>
                </div>
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Evaluations</h3>
                <p className="text-white text-3xl font-bold mb-4">{stats.total_scores}</p>
                <div className="text-gray-500 text-xs">
                  <span className="font-semibold">Goal: </span>{stats.total_photos * 3} evaluations
                </div>
              </div>

              {/* Participating Judges */}
              <div className="neomorph-card rounded-2xl p-6 hover:shadow-2xl transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mensa-orange/20 to-amber-600/20 flex items-center justify-center neomorph-badge transition-transform group-hover:scale-110">
                    <Gavel className="w-7 h-7 text-mensa-orange" strokeWidth={2.5} />
                  </div>
                  <div className="neomorph-badge px-3 py-1.5 rounded-xl">
                    <span className="text-mensa-orange text-xs font-bold">ACTIVO</span>
                  </div>
                </div>
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Judges in Jury</h3>
                <p className="text-white text-3xl font-bold mb-4">{judges.length || 0}</p>
                <div className="text-gray-500 text-xs">
                  {judges.filter(j => j.evaluations > 0).length} judges have voted
                </div>
              </div>
            </div>

            {/* Stats Grid Mejorada */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Weekly Submissions Evolution */}
              <div className="lg:col-span-2 neomorph-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mensa-orange/20 to-amber-600/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-mensa-orange" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-bold">Submission Evolution</h3>
                      <p className="text-gray-500 text-xs">Photographs per week</p>
                    </div>
                  </div>
                  <div className="neomorph-badge px-4 py-2 rounded-xl">
                    <span className="text-mensa-orange text-sm font-bold">Trend</span>
                  </div>
                </div>
                <LineChart
                  className="h-80"
                  data={[
                    { week: 'Week 1', submissions: Math.floor(stats.total_photos * 0.15) },
                    { week: 'Week 2', submissions: Math.floor(stats.total_photos * 0.25) },
                    { week: 'Week 3', submissions: Math.floor(stats.total_photos * 0.35) },
                    { week: 'Week 4', submissions: Math.floor(stats.total_photos * 0.45) },
                    { week: 'Week 5', submissions: Math.floor(stats.total_photos * 0.60) },
                    { week: 'Week 6', submissions: Math.floor(stats.total_photos * 0.75) },
                    { week: 'Week 7', submissions: Math.floor(stats.total_photos * 0.90) },
                    { week: 'Week 8', submissions: stats.total_photos }
                  ]}
                  index="week"
                  categories={["submissions"]}
                  colors={["orange"]}
                  showAnimation={true}
                  yAxisWidth={48}
                  showLegend={false}
                  curveType="natural"
                />
              </div>

              {/* Distribution by Country - Donut */}
              <div className="neomorph-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mensa-orange/20 to-amber-600/20 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-mensa-orange" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-bold">By Country</h3>
                    <p className="text-gray-500 text-xs">{stats.country_data.length} countries</p>
                  </div>
                </div>
                <DonutChart
                  className="h-72"
                  data={stats.country_data.map((c: any) => ({ name: c.name, value: c.Participants }))}
                  category="value"
                  index="name"
                  colors={["orange", "amber", "orange", "amber", "orange", "amber"]}
                  variant="donut"
                  showAnimation={true}
                  showLabel={true}
                />
                <div className="mt-4 space-y-2">
                  {stats.country_data.slice(0, 3).map((country: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-amber-500' : 'bg-orange-500'}`}></div>
                        <span className="text-gray-400">{getFlagEmoji(country.name)} {country.name}</span>
                      </div>
                      <span className="text-white font-bold">{country.Participants}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="neomorph-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mensa-orange/20 to-amber-600/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-mensa-orange" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-bold">Submission Trend</h3>
                    <p className="text-gray-500 text-xs">Recent weeks</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { week: 'Week 1', value: Math.floor(stats.total_photos * 0.2), color: 'bg-green-500' },
                    { week: 'Week 2', value: Math.floor(stats.total_photos * 0.35), color: 'bg-blue-500' },
                    { week: 'Week 3', value: Math.floor(stats.total_photos * 0.25), color: 'bg-mensa-orange' },
                    { week: 'Week 4', value: Math.floor(stats.total_photos * 0.2), color: 'bg-purple-500' },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="text-gray-400 font-semibold">{item.week}</span>
                        <span className="text-white font-bold">{item.value} works</span>
                      </div>
                      <div className="h-3 neomorph-progress rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${(item.value / stats.total_photos) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="neomorph-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mensa-orange/20 to-amber-600/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-mensa-orange" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-bold">Top Contributors</h3>
                    <p className="text-gray-500 text-xs">By country</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {stats.country_data.slice(0, 5).map((country: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-xl neomorph-badge flex items-center justify-center font-bold text-sm ${
                        idx === 0 ? 'text-mensa-orange shadow-[0_0_10px_rgba(255,102,0,0.4)]' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-gray-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className="text-2xl">{getFlagEmoji(country.name)}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{country.name}</p>
                        <div className="h-1.5 mt-1 neomorph-progress rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-mensa-orange rounded-full"
                            style={{ width: `${(country.Participants / Math.max(...stats.country_data.map((c: any) => c.Participants))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-white font-bold text-lg">{country.Participants}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabPanel>
          
          <TabPanel>
            <div className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-mensa-orange/20 flex items-center justify-center">
                    <Image className="w-6 h-6 text-mensa-orange" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-bold">Visual Gallery</h3>
                    <p className="text-gray-500 text-xs">{photos.length} registered works</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <div key={photo.id} className="neomorph-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
                    <div className="aspect-[4/3] bg-[#080d16] relative overflow-hidden">
                      {photo.file_path ? (
                        <img 
                          src={photo.file_path.startsWith('http') ? photo.file_path : `${BASE_URL}/${photo.file_path}`} 
                          className="w-full h-full object-cover" 
                          alt={photo.title}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📸</div>
                      )}
                      
                      {/* Admin Delete Button */}
                      {user?.role === "ADMIN" && (
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute top-3 left-3 w-8 h-8 bg-red-500/80 hover:bg-red-600 rounded-lg flex items-center justify-center text-white transition-all z-20 backdrop-blur-sm shadow-lg group"
                          title="Delete photo"
                        >
                          <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                        </button>
                      )}

                      <div className="absolute top-3 right-3">
                        <span className="neomorph-badge px-3 py-1 rounded-lg text-mensa-orange text-[10px] font-bold uppercase">
                          {photo.category || "General"}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg" title={photo.country || "Global"}>
                          {getFlagEmoji(photo.country || "Global")}
                        </span>
                        <h4 className="text-white text-sm font-bold truncate flex-1">
                          {photo.title}
                        </h4>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full neomorph-badge flex items-center justify-center text-xs font-bold text-mensa-orange">
                            {photo.owner?.full_name?.charAt(0) || "A"}
                          </div>
                          <span className="text-[10px] text-gray-500 font-semibold truncate max-w-[100px]">
                            {photo.owner?.full_name || "Anónimo"}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-600 font-semibold">
                          #{photo.id}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {photos.length === 0 && (
                <div className="neomorph-card rounded-2xl p-20 text-center mt-6">
                  <p className="text-gray-500 text-sm">No works in the gallery yet</p>
                </div>
              )}
            </div>
          </TabPanel>

          <TabPanel>
            <div className="neomorph-card rounded-2xl p-8 mt-6 border border-white/5 bg-[#080d1a]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-mensa-orange/10 flex items-center justify-center border border-mensa-orange/20 text-mensa-orange">
                  <Globe className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-white text-xl font-black">Geographic Distribution</h3>
                  <p className="text-gray-500 text-xs font-medium">{stats.country_data?.length || 0} represented countries</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  {(stats.country_data || []).map((country: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-5 neomorph-card rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-3xl shadow-inner">
                        {getFlagEmoji(country.name)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-black tracking-tight">{country.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Participants</span>
                            <span className="text-mensa-orange font-black text-lg">{country.Participants}</span>
                          </div>
                        </div>
                        <div className="h-2 neomorph-progress rounded-full overflow-hidden bg-white/5">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-mensa-orange rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-1000"
                            style={{ width: `${(country.Participants / Math.max(...stats.country_data.map((c: any) => c.Participants))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!stats.country_data || stats.country_data.length === 0) && (
                    <div className="py-20 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">No location data</div>
                  )}
                </div>
                
                <div className="neomorph-card rounded-3xl bg-[#040914] p-8 border border-white/5 flex flex-col items-center justify-center">
                   <DonutChart
                    className="h-80 w-full"
                    data={stats.country_data.map((c: any) => ({ name: c.name, value: c.Participants }))}
                    category="value"
                    index="name"
                    colors={["orange", "amber"]}
                    showAnimation={true}
                    variant="pie"
                  />
                  <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                    {stats.country_data.slice(0, 4).map((c: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-${["blue", "amber", "orange", "indigo"][i]}-500`}></div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase truncate">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="neomorph-card rounded-2xl p-6 mt-6 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-mensa-orange/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-mensa-orange" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-bold">Full Ranking</h3>
                    <p className="text-gray-500 text-xs">{stats.detailed_ranking?.length || 0} ranked works</p>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Pos</th>
                      <th className="text-left py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Work</th>
                      <th className="text-left py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Author</th>
                      <th className="text-left py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Country</th>
                      <th className="text-right py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Votes</th>
                      <th className="text-right py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Points</th>
                      <th className="text-right py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.detailed_ranking || []).map((item: any, idx: number) => (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4">
                          {idx < 3 ? (
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-bold text-sm ${
                              idx === 0 ? 'bg-mensa-orange/20 text-mensa-orange' : 
                              idx === 1 ? 'bg-gray-400/20 text-gray-300' : 
                              'bg-orange-600/20 text-orange-400'
                            }`}>
                              {idx + 1}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm font-semibold">{idx + 1}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-white font-semibold text-sm">{item.title}</td>
                        <td className="py-4 px-4 text-gray-400 text-xs">{item.author}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getFlagEmoji(item.country)}</span>
                            <span className="text-gray-500 text-xs">{item.country}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`neomorph-badge px-3 py-1 rounded-lg text-xs font-bold ${
                            item.vote_count > 0 ? 'text-mensa-blue' : 'text-gray-600'
                          }`}>
                            {item.vote_count}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-mensa-orange font-bold text-sm">
                          {item.total_points > 0 ? item.total_points : "-"}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`neomorph-badge px-3 py-1.5 rounded-lg font-bold text-sm ${
                            item.avg_score >= 8 ? 'text-mensa-orange shadow-[0_0_10px_rgba(255,102,0,0.3)]' :
                            item.avg_score >= 6 ? 'text-mensa-orange' :
                            item.avg_score > 0 ? 'text-mensa-orange/70' :
                            'text-gray-600'
                          }`}>
                            {item.avg_score > 0 ? item.avg_score : "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!stats.detailed_ranking || stats.detailed_ranking.length === 0) && (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-gray-600 text-sm">No registered works</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="neomorph-card rounded-2xl p-6 mt-6 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Star className="w-6 h-6 text-mensa-orange" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-bold">Top 10 Leaderboard</h3>
                    <p className="text-gray-500 text-xs">Based on {stats.total_scores} evaluations</p>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Pos</th>
                      <th className="text-left py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Work</th>
                      <th className="text-left py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Author</th>
                      <th className="text-left py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Evaluations</th>
                      <th className="text-right py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.leaderboard || []).map((item: any, idx: number) => (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 text-gray-500 font-semibold text-sm">{idx + 1}</td>
                        <td className="py-4 px-4 text-white font-semibold text-sm">{item.title}</td>
                        <td className="py-4 px-4 text-gray-400 text-xs">{item.author}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {item.judgeScores && item.judgeScores.length > 0 ? item.judgeScores.map((js: any, i: number) => (
                              <span key={i} className="neomorph-badge text-[10px] px-2 py-1 rounded-lg text-gray-400">
                                {js.name.split(' ')[0]}: <span className="text-mensa-orange font-bold">{js.score}</span>
                              </span>
                            )) : <span className="text-[10px] text-gray-600">Pending</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`neomorph-badge px-3 py-1.5 rounded-lg font-bold text-sm ${
                            item.score > 0 ? "text-mensa-orange" : "text-gray-600"
                          }`}>
                            {item.score > 0 ? item.score : "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!stats.leaderboard || stats.leaderboard.length === 0) && (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-600 text-sm">No works registered</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="flex flex-col gap-8 mt-6">
              {/* BANNER DISTINTIVO PARA JUECES */}
              <div className="neomorph-card p-1 rounded-3xl bg-gradient-to-r from-mensa-orange to-amber-500 shadow-[0_0_40px_rgba(255,102,0,0.2)]">
                <div className="bg-[#0A1224] rounded-[1.4rem] p-6 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-mensa-orange/10 flex items-center justify-center border border-mensa-orange/30 shadow-[0_0_20px_rgba(255,102,0,0.1)]">
                      <Gavel className="w-9 h-9 text-mensa-orange" strokeWidth={3} />
                    </div>
                    <div>
                      <h2 className="text-white text-3xl font-black uppercase tracking-tighter">Judge Control Tower</h2>
                      <p className="text-gray-400 text-sm font-bold uppercase tracking-widest opacity-70">Synchronized: {new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Panel ID</p>
                      <p className="text-mensa-orange font-black text-sm">ANALYTICS-V2</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-mensa-orange/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-mensa-orange animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* New Analytical Judges Header */}
              <div className="neomorph-card rounded-[2rem] p-8 border border-white/5 bg-gradient-to-br from-[#0A1224] to-[#040A1A]">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
                  <div className="lg:col-span-1">
                    <div className="w-20 h-20 rounded-3xl bg-mensa-orange/10 flex items-center justify-center border border-mensa-orange/20 shadow-[0_0_30px_rgba(255,102,0,0.1)] mb-4">
                      <Gavel className="w-10 h-10 text-mensa-orange" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-white text-2xl font-black uppercase tracking-tight">Jury Panel</h3>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1">Control Tower</p>
                  </div>
                  
                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Strictest Judge</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                          <TrendingUp className="w-4 h-4 rotate-180" />
                        </div>
                        <p className="text-white font-bold">{[...judges].sort((a,b) => (a.avg_score || 0) - (b.avg_score || 0))[0]?.name || '---'}</p>
                      </div>
                    </div>
                    
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Most Generous Judge</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <p className="text-white font-bold">{[...judges].sort((a,b) => (b.avg_score || 0) - (a.avg_score || 0))[0]?.name || '---'}</p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Vote Consensus</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-mensa-orange/10 flex items-center justify-center text-mensa-orange">
                          <Activity className="w-4 h-4" />
                        </div>
                        <p className="text-white font-bold">
                          {Math.floor((judges.reduce((sum, j) => sum + j.evaluations, 0) / (photos.length * judges.length || 1)) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Judges Panel Summary */}
              <div className="neomorph-card rounded-[2rem] p-8 border border-white/5 bg-[#080d1a]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-mensa-orange/10 flex items-center justify-center border border-mensa-orange/20 text-mensa-orange">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-black uppercase tracking-tight">Voting Status by Judge</h3>
                    <p className="text-gray-500 text-xs font-medium">Activity summary and criteria for each evaluation</p>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="py-4 px-4 text-left text-[10px] text-gray-500 font-bold uppercase tracking-widest">#</th>
                        <th className="py-4 px-4 text-left text-[10px] text-gray-500 font-bold uppercase tracking-widest">Judge</th>
                        <th className="py-4 px-4 text-left text-[10px] text-gray-500 font-bold uppercase tracking-widest">Progress</th>
                        <th className="py-4 px-4 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">Votes</th>
                        <th className="py-4 px-4 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">Avg Rating</th>
                        <th className="py-4 px-4 text-right text-[10px] text-gray-500 font-bold uppercase tracking-widest">Last Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...judges].sort((a,b) => b.evaluations - a.evaluations).map((judge, idx) => (
                        <tr key={judge.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                          <td className="py-4 px-4">
                            <span className={`text-[10px] font-black ${idx === 0 ? 'text-mensa-orange' : 'text-gray-700'}`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-gray-400">
                                {judge.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white font-bold text-sm">{judge.name}</p>
                                <p className="text-[10px] text-gray-600 truncate max-w-[120px]">{judge.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 min-w-[150px]">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-mensa-orange rounded-full shadow-[0_0_5px_rgba(255,102,0,0.5)]"
                                  style={{ width: `${(judge.evaluations / (photos.length || 1)) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] font-bold text-gray-500 w-8">
                                {((judge.evaluations / (photos.length || 1)) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-sm font-bold text-white">{judge.evaluations}</span>
                            <span className="text-[10px] text-gray-600"> / {photos.length}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="neomorph-badge px-2.5 py-1 rounded-lg text-mensa-orange font-black text-xs border border-mensa-orange/20">
                              {judge.avg_score?.toFixed(1) || "-"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2 text-gray-500 font-medium">
                              <Clock className="w-3 h-3 text-gray-600" />
                              <span className="text-[10px] uppercase">
                                {judge.last_activity ? new Date(judge.last_activity).toLocaleDateString() : 'No activity'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Individual Judge Section */}
              <div className="neomorph-card rounded-[2rem] p-8 border border-white/5 bg-[#080d1a]">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-mensa-orange flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,102,0,0.3)]">
                      <span className="text-2xl font-bold">👤</span>
                    </div>
                    <div>
                      <h3 className="text-white text-2xl font-black tracking-tight">Individual Analysis</h3>
                      <p className="text-gray-500 text-sm font-medium">View the behavior of each judge</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button
                      onClick={async () => {
                        await fetchJudges();
                        if (selectedJudge) await fetchJudgeEvaluations(parseInt(selectedJudge));
                      }}
                      className="neomorph-button px-6 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:scale-105 active:scale-95"
                    >
                      <span className="flex items-center gap-2">🔄 Refresh</span>
                    </button>
                    <div className="w-full md:w-72">
                      <Select 
                        value={selectedJudge} 
                        onValueChange={setSelectedJudge}
                        className="rounded-2xl border-white/5 bg-white/5 text-white"
                      >
                        {judges.map((judge) => (
                          <SelectItem key={judge.id} value={judge.id.toString()}>
                            {judge.name} ({judge.evaluations} votes)
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>

                {loadingJudgeData ? (
                  <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-12 h-12 border-4 border-mensa-orange border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Analyzing data...</p>
                  </div>
                ) : judgeEvaluations ? (
                  <div className="space-y-10">
                    {/* Judge Profile and Key Metrics */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-1 flex flex-col gap-4">
                        <div className="neomorph-card rounded-2xl p-6 bg-white/5 border border-white/10">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-mensa-blue flex items-center justify-center text-xs font-black">
                              {judgeEvaluations.judge_name.charAt(0)}
                            </div>
                            <div className="truncate">
                              <p className="text-white font-bold truncate">{judgeEvaluations.judge_name}</p>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Jury Member</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500 font-bold">Completed</span>
                              <span className="text-mensa-orange font-black">
                                {((judgeEvaluations.total_evaluations / (photos.length || 1)) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-2 neomorph-progress rounded-full overflow-hidden bg-white/5">
                              <div 
                                className="h-full bg-mensa-orange rounded-full shadow-[0_0_10px_rgba(255,102,0,0.5)]" 
                                style={{ width: `${(judgeEvaluations.total_evaluations / (photos.length || 1)) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-[10px] text-gray-600 text-center font-bold">
                              {judgeEvaluations.total_evaluations} of {photos.length} photos evaluated
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Avg Impact', val: (judgeEvaluations.evaluations.reduce((s:any, e:any) => s + e.impact, 0) / (judgeEvaluations.total_evaluations || 1)).toFixed(1), color: 'text-mensa-orange', icon: <Zap className="w-5 h-5 text-mensa-orange mb-2" /> },
                          { label: 'Avg Technique', val: (judgeEvaluations.evaluations.reduce((s:any, e:any) => s + e.technique, 0) / (judgeEvaluations.total_evaluations || 1)).toFixed(1), color: 'text-mensa-orange', icon: <Cpu className="w-5 h-5 text-mensa-orange mb-2" /> },
                          { label: 'Avg Composition', val: (judgeEvaluations.evaluations.reduce((s:any, e:any) => s + e.composition, 0) / (judgeEvaluations.total_evaluations || 1)).toFixed(1), color: 'text-mensa-orange', icon: <Maximize className="w-5 h-5 text-mensa-orange mb-2" /> },
                          { label: 'Avg Story', val: (judgeEvaluations.evaluations.reduce((s:any, e:any) => s + e.story, 0) / (judgeEvaluations.total_evaluations || 1)).toFixed(1), color: 'text-mensa-orange', icon: <BookOpen className="w-5 h-5 text-mensa-orange mb-2" /> },
                        ].map((metric, i) => (
                          <div key={i} className="neomorph-card rounded-2xl p-5 border border-white/5 bg-white/[0.02]">
                            {metric.icon}
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">{metric.label}</p>
                            <p className={`${metric.color} text-2xl font-black`}>{metric.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* New row of comparative metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="neomorph-card rounded-3xl p-6 bg-white/[0.01] border border-white/5">
                        <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-mensa-orange" /> Score Distribution
                        </h4>
                        <div className="h-48">
                          <BarChart
                            className="h-full"
                            data={[1,2,3,4,5,6,7,8,9,10].map(val => ({
                              score: val.toString(),
                              count: judgeEvaluations.evaluations.filter((e:any) => Math.round(e.avg_score) === val).length
                            }))}
                            index="score"
                            categories={["count"]}
                            colors={["orange"]}
                            showXAxis={true}
                            showYAxis={false}
                            showGridLines={false}
                            showAnimation={true}
                          />
                        </div>
                        <p className="text-[10px] text-gray-600 text-center mt-4 uppercase font-bold tracking-tighter">
                          Rating frequency (1-10)
                        </p>
                      </div>

                      <div className="neomorph-card rounded-3xl p-6 bg-white/[0.01] border border-white/5">
                        <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-mensa-orange" /> Judge Insights
                        </h4>
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-white/5 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500 font-bold uppercase">Strictest Criterion</p>
                              <p className="text-white font-black">
                                {(() => {
                                  const averages = [
                                    { name: 'Impact', val: judgeEvaluations.evaluations.reduce((s:any, e:any) => s + e.impact, 0) / judgeEvaluations.total_evaluations },
                                    { name: 'Technique', val: judgeEvaluations.evaluations.reduce((s:any, e:any) => s + e.technique, 0) / judgeEvaluations.total_evaluations },
                                    { name: 'Comp.', val: judgeEvaluations.evaluations.reduce((s:any, e:any) => s + e.composition, 0) / judgeEvaluations.total_evaluations },
                                    { name: 'Story', val: judgeEvaluations.evaluations.reduce((s:any, e:any) => s + e.story, 0) / judgeEvaluations.total_evaluations },
                                  ].sort((a, b) => a.val - b.val);
                                  return averages[0].name;
                                })()}
                              </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                              <TrendingUp className="w-5 h-5 rotate-180" />
                            </div>
                          </div>
                          
                          <div className="p-4 rounded-2xl bg-white/5 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500 font-bold uppercase">Consistency</p>
                              <p className="text-white font-black">
                                {(() => {
                                  const scores = judgeEvaluations.evaluations.map((e:any) => e.avg_score);
                                  const mean = scores.reduce((a:any, b:any) => a + b, 0) / scores.length;
                                  const variance = scores.reduce((a:any, b:any) => a + Math.pow(b - mean, 2), 0) / scores.length;
                                  const stdDev = Math.sqrt(variance);
                                  return stdDev < 1.5 ? "High" : stdDev < 2.5 ? "Medium" : "Low";
                                })()}
                              </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-mensa-orange/10 flex items-center justify-center text-mensa-orange">
                              <Activity className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detail Tabs */}
                    <TabGroup index={activeJudgeTab} onIndexChange={setActiveJudgeTab}>
                      <TabList className="bg-white/5 p-1 rounded-2xl border border-white/5 max-w-fit mb-6">
                        <Tab className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[selected]:bg-mensa-orange data-[selected]:text-white text-gray-500 transition-all border-none">Votes</Tab>
                        <Tab className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[selected]:bg-mensa-orange data-[selected]:text-white text-gray-500 transition-all border-none">
                          Pending 
                          <span className="ml-2 px-1.5 py-0.5 rounded-lg bg-orange-600/20 text-orange-400 text-[10px]">
                            {photos.length - judgeEvaluations.total_evaluations}
                          </span>
                        </Tab>
                        <Tab className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[selected]:bg-mensa-orange data-[selected]:text-white text-gray-500 transition-all border-none">Judge Ranking</Tab>
                      </TabList>
                      
                      <TabPanels>
                        {/* Votes Cast Tab */}
                        <TabPanel>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-white/5">
                                  <th className="py-4 px-4 text-left text-[10px] text-gray-500 font-bold uppercase tracking-widest">Photo</th>
                                  <th className="py-4 px-4 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">Impact</th>
                                  <th className="py-4 px-4 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">Technique</th>
                                  <th className="py-4 px-4 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">Comp.</th>
                                  <th className="py-4 px-4 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">Story</th>
                                  <th className="py-4 px-4 text-right text-[10px] text-gray-500 font-bold uppercase tracking-widest">Average</th>
                                </tr>
                              </thead>
                              <tbody>
                                {judgeEvaluations.evaluations.map((e: any) => (
                                  <tr key={e.photo_id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all group">
                                    <td className="py-4 px-4">
                                      <p className="text-white text-sm font-bold group-hover:text-mensa-orange transition-colors">{e.photo_title}</p>
                                      <p className="text-[10px] text-gray-600 font-medium">by {e.photo_author}</p>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <div className="w-10 h-10 rounded-xl neomorph-badge flex items-center justify-center mx-auto text-mensa-orange font-black border border-mensa-orange/10">{e.impact}</div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <div className="w-10 h-10 rounded-xl neomorph-badge flex items-center justify-center mx-auto text-mensa-orange font-black border border-mensa-orange/10">{e.technique}</div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <div className="w-10 h-10 rounded-xl neomorph-badge flex items-center justify-center mx-auto text-mensa-orange font-black border border-mensa-orange/10">{e.composition}</div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <div className="w-10 h-10 rounded-xl neomorph-badge flex items-center justify-center mx-auto text-mensa-orange font-black border border-mensa-orange/10">{e.story}</div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                      <span className="text-xl font-black text-white px-4 py-2 rounded-2xl bg-white/5 border border-white/5">{e.avg_score}</span>
                                    </td>
                                  </tr>
                                ))}
                                {judgeEvaluations.evaluations.length === 0 && (
                                  <tr>
                                    <td colSpan={6} className="py-20 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">No votes yet</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </TabPanel>

                        {/* Pending Votes Tab */}
                        <TabPanel>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {photos.filter(p => !judgeEvaluations.evaluations.some((e:any) => e.photo_id === p.id)).map(photo => (
                              <div key={photo.id} className="neomorph-card rounded-2xl p-5 border border-white/5 bg-white/[0.02] flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-[#0a1224] flex items-center justify-center text-gray-700 border border-white/5">
                                  {photo.file_path ? (
                                    <img src={`${BASE_URL}/${photo.file_path}`} className="w-full h-full object-cover rounded-xl" alt="" />
                                  ) : "📸"}
                                </div>
                                <div className="flex-1 truncate">
                                  <p className="text-white font-bold text-sm truncate">{photo.title}</p>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase">{photo.category || 'General'}</p>
                                </div>
                                <div className="neomorph-badge px-2 py-1 rounded-lg">
                                  <span className="text-[10px] text-orange-400 font-black">PENDING</span>
                                </div>
                              </div>
                            ))}
                            {photos.length === judgeEvaluations.total_evaluations && (
                              <div className="col-span-full py-20 text-center">
                                <div className="text-4xl mb-4">🏆</div>
                                <p className="text-white font-black text-lg">All photos evaluated!</p>
                                <p className="text-gray-500 text-sm">This judge has completed their work.</p>
                              </div>
                            )}
                          </div>
                        </TabPanel>

                        {/* Judge Ranking Tab */}
                        <TabPanel>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="text-lg">🔝</span> Their Top 5 Favorites
                              </h4>
                              <div className="space-y-4">
                                {judgeEvaluations.evaluations.slice(0, 5).map((e: any, i: number) => (
                                  <div key={e.photo_id} className="flex items-center gap-4 p-4 neomorph-card rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                                      i === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                                      i === 1 ? 'bg-gray-400/20 text-gray-400' : 
                                      'bg-orange-500/20 text-orange-400'
                                    }`}>
                                      #{i + 1}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-white font-bold text-sm">{e.photo_title}</p>
                                      <p className="text-[10px] text-gray-500">{e.photo_author}</p>
                                    </div>
                                    <div className="text-2xl font-black text-mensa-orange">{e.avg_score}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="neomorph-card rounded-3xl p-6 bg-white/[0.01] border border-white/5 flex flex-col justify-center items-center text-center">
                              <div className="w-24 h-24 rounded-full bg-mensa-orange/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,102,0,0.2)]">
                                <span className="text-4xl">👑</span>
                              </div>
                              <h4 className="text-white font-black text-xl mb-2">Category Preference</h4>
                              <p className="text-gray-500 text-sm mb-6">Based on highest scores</p>
                              <div className="w-full space-y-3">
                                {Array.from(new Set(judgeEvaluations.evaluations.map((e:any) => e.category))).slice(0, 3).map((cat:any, idx) => {
                                  const avg = (judgeEvaluations.evaluations.filter((e:any) => e.category === cat).reduce((s:any, e:any) => s + e.avg_score, 0) / (judgeEvaluations.evaluations.filter((e:any) => e.category === cat).length || 1)).toFixed(1);
                                  return (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                      <span className="text-gray-400 font-bold text-xs uppercase">{cat || 'Gen'}</span>
                                      <span className="text-white font-black">{avg}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </TabPanel>
                      </TabPanels>
                    </TabGroup>
                  </div>
                ) : (
                  <div className="text-center py-20 neomorph-card rounded-3xl bg-white/[0.01] border border-dashed border-white/10">
                    <p className="text-gray-600 font-bold uppercase tracking-widest text-sm mb-4">No se ha seleccionado ningún juez</p>
                    <p className="text-gray-700 text-xs">Elige un juez del desplegable superior para ver su informe detallado</p>
                  </div>
                )}
              </div>

              {/* Gráficos Comparativos Globales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="neomorph-card rounded-[2rem] p-8 border border-white/5 bg-[#080d1a]">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-mensa-orange/10 flex items-center justify-center border border-mensa-orange/20 text-mensa-orange">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-black">Actividad del Panel</h3>
                      <p className="text-gray-500 text-xs font-medium">Volumen de evaluaciones por juez</p>
                    </div>
                  </div>
                  {stats && stats.judge_performance && stats.judge_performance.length > 0 ? (
                    <BarChart
                      className="h-80"
                      data={stats.judge_performance}
                      index="name"
                      categories={["reviews"]}
                      colors={["orange"]}
                      showAnimation={true}
                      showLegend={false}
                      yAxisWidth={40}
                    />
                  ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500 border border-dashed border-white/5 rounded-2xl">
                      Sin datos suficientes
                    </div>
                  )}
                </div>
                
                <div className="neomorph-card rounded-[2rem] p-8 border border-white/5 bg-[#080d1a]">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-mensa-orange/10 flex items-center justify-center border border-mensa-orange/20 text-mensa-orange">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-black">Rigor Index</h3>
                      <p className="text-gray-500 text-xs font-medium">Average score granted</p>
                    </div>
                  </div>
                  {stats && stats.judge_performance && stats.judge_performance.length > 0 ? (
                    <BarChart
                      className="h-80"
                        data={stats.judge_performance}
                        index="name"
                        categories={["avgScore"]}
                        colors={["orange"]}
                        showAnimation={true}
                        showLegend={false}
                        yAxisWidth={40}
                    />
                  ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500 border border-dashed border-white/5 rounded-2xl">
                        Sin datos suficientes
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
