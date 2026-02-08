import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Card, 
  Title, 
  Text, 
  TabGroup, 
  TabList, 
  Tab, 
  TabPanels, 
  TabPanel,
  BarChart,
  DonutChart,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Metric,
  Flex,
  Grid,
  ProgressBar,
  TextInput,
  Select,
  SelectItem
} from "@tremor/react";
import { 
  Upload, 
  Users, 
  Camera, 
  Trophy, 
  Globe, 
  Trash2, 
  Eye, 
  Search,
  Plus,
  Flag,
  TrendingUp,
  Award
} from "lucide-react";
import api from "../services/api";

interface Photo {
  id: number;
  title: string;
  description: string;
  file_path: string;
  category: string;
  country: string;
  author: string;
  author_email: string;
  created_at: string;
  avg_score: number;
  vote_count: number;
}

interface Participant {
  id: number;
  email: string;
  full_name: string;
  mensa_number: string;
  photo_count: number;
}

interface Stats {
  country: string;
  total_photos: number;
  total_participants: number;
  category_data: { name: string; value: number }[];
  leaderboard: { id: number; title: string; author: string; score: number; category: string }[];
}

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Nature");
  const [participantEmail, setParticipantEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [photosRes, participantsRes, statsRes] = await Promise.all([
        api.get("/api/v1/photos/coordinator/my-country-photos"),
        api.get("/api/v1/photos/coordinator/participants"),
        api.get("/api/v1/photos/coordinator/stats")
      ]);
      setPhotos(photosRes.data.photos || []);
      setParticipants(participantsRes.data.participants || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error loading coordinator data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle || !participantEmail) {
      setUploadMessage("Please complete all required fields");
      return;
    }

    setUploading(true);
    setUploadMessage("");

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);
    formData.append("description", uploadDescription);
    formData.append("category", uploadCategory);
    formData.append("participant_email", participantEmail);

    try {
      await api.post("/api/v1/photos/coordinator/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUploadMessage("✅ Photo uploaded successfully");
      // Reset form
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      setParticipantEmail("");
      // Reload data
      loadData();
    } catch (error: any) {
      setUploadMessage(`❌ Error: ${error.response?.data?.detail || "Upload error"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: number) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    
    try {
      await api.delete(`/api/v1/photos/coordinator/remove/${photoId}`);
      setPhotos(photos.filter(p => p.id !== photoId));
      setSelectedPhoto(null);
    } catch (error: any) {
      alert(error.response?.data?.detail || "Error al eliminar");
    }
  };

  const filteredPhotos = photos.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mensa-orange"></div>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-mensa-blue/20 to-mensa-orange/20 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-mensa-orange/20">
            <Flag className="w-8 h-8 text-mensa-orange" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              National Coordinator Panel
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-mensa-orange font-bold">{user?.country || "Country not assigned"}</span>
              <span>•</span>
              <span>{user?.full_name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4 mb-8">
        <Card className="glass border-white/10">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-400">Country Photos</Text>
              <Metric className="text-white">{stats?.total_photos || 0}</Metric>
            </div>
            <Camera className="w-8 h-8 text-mensa-orange" />
          </Flex>
        </Card>
        <Card className="glass border-white/10">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-400">Participants</Text>
              <Metric className="text-white">{stats?.total_participants || 0}</Metric>
            </div>
            <Users className="w-8 h-8 text-mensa-blue" />
          </Flex>
        </Card>
        <Card className="glass border-white/10">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-400">Best Score</Text>
              <Metric className="text-white">
                {stats?.leaderboard?.[0]?.score || 0}
              </Metric>
            </div>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </Flex>
        </Card>
        <Card className="glass border-white/10">
          <Flex alignItems="start">
            <div>
              <Text className="text-gray-400">Active Categories</Text>
              <Metric className="text-white">{stats?.category_data?.length || 0}</Metric>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </Flex>
        </Card>
      </Grid>

      {/* Main Tabs */}
      <TabGroup index={activeTab} onIndexChange={setActiveTab}>
        <TabList className="glass border-white/10 rounded-xl p-1">
          <Tab className="text-white data-[state=active]:bg-mensa-orange/20 data-[state=active]:text-mensa-orange rounded-lg px-4 py-2 font-bold">
            <Camera className="w-4 h-4 inline mr-2" />
            Galería
          </Tab>
          <Tab className="text-white data-[state=active]:bg-mensa-orange/20 data-[state=active]:text-mensa-orange rounded-lg px-4 py-2 font-bold">
            <Upload className="w-4 h-4 inline mr-2" />
            Upload Photo
          </Tab>
          <Tab className="text-white data-[state=active]:bg-mensa-orange/20 data-[state=active]:text-mensa-orange rounded-lg px-4 py-2 font-bold">
            <Users className="w-4 h-4 inline mr-2" />
            Participants
          </Tab>
          <Tab className="text-white data-[state=active]:bg-mensa-orange/20 data-[state=active]:text-mensa-orange rounded-lg px-4 py-2 font-bold">
            <Award className="w-4 h-4 inline mr-2" />
            Top 5
          </Tab>
        </TabList>

        <TabPanels>
          {/* Gallery Tab */}
          <TabPanel>
            <Card className="glass border-white/10 mt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <Title className="text-white flex items-center gap-2">
                  <Camera className="text-mensa-orange" />
                  Photos from {user?.country}
                </Title>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Search className="w-4 h-4 text-gray-400" />
                  <TextInput
                    placeholder="Search by title, author or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>

              {filteredPhotos.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No photos from {user?.country} yet</p>
                  <p className="text-sm mt-2">Upload the first photo from the "Upload Photo" tab</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPhotos.map(photo => (
                    <div 
                      key={photo.id}
                      className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-mensa-orange/50 transition-all"
                    >
                      <div className="aspect-square bg-white/5">
                        <img
                          src={`/api/v1/${photo.file_path}`}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.jpg";
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-bold text-white truncate">{photo.title}</h3>
                          <p className="text-sm text-gray-300">{photo.author}</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge color="orange">{photo.category}</Badge>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setSelectedPhoto(photo)}
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(photo.id)}
                                className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {photo.vote_count > 0 && (
                        <div className="absolute top-2 right-2">
                          <Badge color="yellow" className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {photo.avg_score}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabPanel>

          {/* Upload Tab */}
          <TabPanel>
            <Card className="glass border-white/10 mt-6 max-w-2xl mx-auto">
              <Title className="text-white flex items-center gap-2 mb-6">
                <Upload className="text-mensa-orange" />
                Upload Photo for {user?.country}
              </Title>

              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email del Participante *
                  </label>
                  <TextInput
                    placeholder="participante@email.com"
                    value={participantEmail}
                    onChange={(e) => setParticipantEmail(e.target.value)}
                    className="bg-white/5 border-white/10"
                    type="email"
                    required
                  />
                  <Text className="text-gray-500 text-xs mt-1">
                    If the participant doesn't exist, they will be created automatically
                  </Text>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Foto *
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-mensa-orange/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="photo-upload"
                      required
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      {uploadFile ? (
                        <div className="text-mensa-orange">
                          <Camera className="w-8 h-8 mx-auto mb-2" />
                          <p className="font-medium">{uploadFile.name}</p>
                          <p className="text-sm text-gray-400">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          <Plus className="w-8 h-8 mx-auto mb-2" />
                          <p>Click to select an image</p>
                          <p className="text-sm">JPG, PNG, WEBP up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <TextInput
                    placeholder="Photo title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Optional photo description..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-mensa-orange/50"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <Select 
                    value={uploadCategory} 
                    onValueChange={setUploadCategory}
                    className="bg-white/5 border-white/10"
                  >
                    <SelectItem value="Nature">Naturaleza</SelectItem>
                    <SelectItem value="Portrait">Retrato</SelectItem>
                    <SelectItem value="Architecture">Arquitectura</SelectItem>
                    <SelectItem value="Street">Calle</SelectItem>
                    <SelectItem value="Abstract">Abstracto</SelectItem>
                    <SelectItem value="Macro">Macro</SelectItem>
                    <SelectItem value="Landscape">Paisaje</SelectItem>
                  </Select>
                </div>

                {uploadMessage && (
                  <div className={`p-3 rounded-lg ${uploadMessage.startsWith("✅") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {uploadMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 bg-gradient-to-r from-mensa-orange to-orange-600 rounded-xl font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Photo
                    </>
                  )}
                </button>
              </form>
            </Card>
          </TabPanel>

          {/* Participants Tab */}
          <TabPanel>
            <Card className="glass border-white/10 mt-6">
              <Title className="text-white flex items-center gap-2 mb-6">
                <Users className="text-mensa-orange" />
                Participants from {user?.country}
              </Title>

              {participants.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No registered participants from {user?.country}</p>
                </div>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell className="text-gray-400">Name</TableHeaderCell>
                      <TableHeaderCell className="text-gray-400">Email</TableHeaderCell>
                      <TableHeaderCell className="text-gray-400">Nº Mensa</TableHeaderCell>
                      <TableHeaderCell className="text-gray-400 text-right">Photos</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {participants.map(p => (
                      <TableRow key={p.id} className="hover:bg-white/5">
                        <TableCell className="text-white font-medium">{p.full_name}</TableCell>
                        <TableCell className="text-gray-400">{p.email}</TableCell>
                        <TableCell className="text-gray-400">{p.mensa_number || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Badge color={p.photo_count > 0 ? "green" : "gray"}>
                            {p.photo_count}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabPanel>

          {/* Top 5 Tab */}
          <TabPanel>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass border-white/10">
                <Title className="text-white flex items-center gap-2 mb-6">
                  <Trophy className="text-yellow-500" />
                  Top 5 Photos from {user?.country}
                </Title>

                {!stats?.leaderboard || stats.leaderboard.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No scored photos yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.leaderboard.map((photo, index) => (
                      <div 
                        key={photo.id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                          index === 0 ? "bg-yellow-500/20 text-yellow-500" :
                          index === 1 ? "bg-gray-400/20 text-gray-400" :
                          index === 2 ? "bg-orange-700/20 text-orange-700" :
                          "bg-white/10 text-gray-500"
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate">{photo.title}</p>
                          <p className="text-sm text-gray-400">{photo.author}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-xl text-mensa-orange">{photo.score}</p>
                          <Badge size="xs" color="blue">{photo.category}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="glass border-white/10">
                <Title className="text-white flex items-center gap-2 mb-6">
                  <Camera className="text-mensa-orange" />
                  Distribution by Category
                </Title>

                {!stats?.category_data || stats.category_data.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No category data</p>
                  </div>
                ) : (
                  <DonutChart
                    className="h-64"
                    data={stats.category_data}
                    category="value"
                    index="name"
                    colors={["orange", "blue", "emerald", "violet", "rose", "amber"]}
                    valueFormatter={(value) => `${value} photos`}
                    showLabel={true}
                  />
                )}
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={`/api/v1/${selectedPhoto.file_path}`}
                alt={selectedPhoto.title}
                className="w-full max-h-[60vh] object-contain bg-black"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-black text-white">{selectedPhoto.title}</h2>
              <p className="text-gray-400 mt-1">{selectedPhoto.description}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Badge color="orange">{selectedPhoto.category}</Badge>
                <Badge color="blue">{selectedPhoto.country}</Badge>
                {selectedPhoto.vote_count > 0 && (
                  <Badge color="yellow" className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {selectedPhoto.avg_score} ({selectedPhoto.vote_count} votes)
                  </Badge>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400">
                  <strong className="text-white">Autor:</strong> {selectedPhoto.author}
                </p>
                <p className="text-sm text-gray-400">
                  <strong className="text-white">Email:</strong> {selectedPhoto.author_email}
                </p>
                <p className="text-sm text-gray-400">
                  <strong className="text-white">Subida:</strong> {new Date(selectedPhoto.created_at).toLocaleDateString("es-ES")}
                </p>
              </div>
              <button
                onClick={() => handleDelete(selectedPhoto.id)}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
