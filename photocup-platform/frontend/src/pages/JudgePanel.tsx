import { useState, useEffect } from "react";
import { Card, Title, Text, Button, Badge, Grid, Metric, Divider } from "@tremor/react";
import api, { BASE_URL } from "../services/api";

interface Photo {
  id: number;
  title: string;
  category: string;
  description: string;
  country: string;
  file_path: string;
  avg_score?: number; // Para detectar si fue evaluada
}

export default function JudgePanel() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [scores, setScores] = useState({ impact: 0, technique: 0, composition: 0, story: 0 });
  const [comment, setComment] = useState("");
  const [evaluatedPhotos, setEvaluatedPhotos] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await api.get("/photos/");
      setPhotos(response.data);
    } catch (err) {
      console.error("Error fetching photos");
    }
  };

  const handleScoreSubmit = async () => {
    if (!selectedPhoto) return;
    try {
      const formData = new FormData();
      formData.append("impact", scores.impact.toString());
      formData.append("technique", scores.technique.toString());
      formData.append("composition", scores.composition.toString());
      formData.append("story", scores.story.toString());
      formData.append("comment", comment);

      await api.post(`/photos/${selectedPhoto.id}/score`, formData);
      
      // Marcar como evaluada
      setEvaluatedPhotos(prev => new Set([...prev, selectedPhoto.id]));
      
      alert("Score submitted successfully");
      setSelectedPhoto(null);
      setScores({ impact: 0, technique: 0, composition: 0, story: 0 });
      setComment("");
    } catch (err) {
      alert("Error submitting score");
    }
  };

  const isPhotoEvaluated = (photoId: number) => {
    const photo = photos.find(p => p.id === photoId);
    return evaluatedPhotos.has(photoId) || (photo?.avg_score !== undefined && photo.avg_score > 0);
  };

  return (
    <div className="p-8 pb-20 relative z-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="PhotoCup" className="h-14 w-auto object-contain" />
          <div>
            <Title className="text-white text-4xl font-black tracking-tighter uppercase">PANEL <span className="text-mensa-orange">JURADO</span></Title>
            <Text className="text-gray-400 font-medium">Evaluation of high-impact works • PhotoCup 2026</Text>
          </div>
        </div>
        <Badge color="orange" className="font-bold uppercase tracking-widest px-4 py-2 rounded-full">Open Evaluation Phase</Badge>
      </div>

      <Grid numItemsLg={3} className="gap-8">
        {/* Gallery List */}
        <div className="lg:col-span-1 space-y-4 max-h-[75vh] overflow-y-auto pr-3 custom-scrollbar">
          {photos.map((p) => {
            const evaluated = isPhotoEvaluated(p.id);
            return (
              <Card 
                key={p.id} 
                className={`glass cursor-pointer transition-all hover:scale-[1.02] border-white/5 rounded-2xl p-4 relative ${selectedPhoto?.id === p.id ? 'border-mensa-orange/50 bg-white/10 ring-1 ring-mensa-orange/30' : 'hover:bg-white/[0.07]'}`}
                onClick={() => setSelectedPhoto(p)}
              >
                {/* Indicador de evaluación */}
                <div className="absolute top-3 right-3">
                  {evaluated ? (
                    <div className="bg-green-500/20 border-2 border-green-500 rounded-full p-1.5 flex items-center justify-center">
                      <span className="text-green-400 text-sm">✓</span>
                    </div>
                  ) : (
                    <div className="bg-red-500/20 border-2 border-red-500 rounded-full p-1.5 flex items-center justify-center">
                      <span className="text-red-400 text-xs font-bold">!</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-5">
                  <div className="w-20 h-20 bg-white/5 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl border border-white/5 shadow-inner overflow-hidden">
                    {p.file_path ? (
                      <img 
                        src={p.file_path.startsWith('http') ? p.file_path : `${BASE_URL}/${p.file_path}`} 
                        className="w-full h-full object-cover" 
                        alt={p.title} 
                      />
                    ) : (
                      "📸"
                    )}
                  </div>
                  <div className="flex-1">
                    <Text className="font-black text-white text-lg tracking-tight uppercase leading-tight">{p.title}</Text>
                    <Text className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{p.category} | {p.country}</Text>
                    {evaluated && (
                      <div className="mt-1">
                        <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider">✓ Evaluated</span>
                      </div>
                    )}
                    {!evaluated && (
                      <div className="mt-1">
                        <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider">Pending</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Scoring Detail */}
        <div className="lg:col-span-2">
          {selectedPhoto ? (
            <Card className="glass border-white/5 rounded-[2.5rem] p-10 shadow-3xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <Title className="text-white text-3xl font-black uppercase tracking-tighter">{selectedPhoto.title}</Title>
                  <div className="mt-2 flex gap-2">
                    <Badge color="blue" className="text-[10px] uppercase font-black">{selectedPhoto.category}</Badge>
                    <Badge color="slate" className="text-[10px] uppercase font-black">{selectedPhoto.country}</Badge>
                  </div>
                </div>
                <Text className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">ID: #00{selectedPhoto.id}</Text>
              </div>
              
              <div className="aspect-video bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group relative overflow-hidden shadow-2xl mb-8">
                {selectedPhoto.file_path ? (
                  <img 
                    src={selectedPhoto.file_path.startsWith('http') ? selectedPhoto.file_path : `${BASE_URL}/${selectedPhoto.file_path}`} 
                    className="w-full h-full object-contain" 
                    alt={selectedPhoto.title} 
                  />
                ) : (
                  <Text className="text-gray-600 font-black uppercase tracking-[0.3em] opacity-50 group-hover:opacity-100 transition-opacity">Visualización de la obra</Text>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
              </div>

              <div className="p-6 glass border-white/5 rounded-2xl italic leading-relaxed text-gray-400">
                "{selectedPhoto.description}"
              </div>

              <div className="my-12 border-t border-white/5 flex items-center justify-center">
                <span className="bg-[#020817] px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-mensa-orange -mt-[18px]">Evaluation Scale</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {["impact", "technique", "composition", "story"].map((criterion) => (
                  <div key={criterion} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <Text className="capitalize font-black text-white text-xs tracking-widest uppercase">{criterion}</Text>
                      <span className="text-2xl font-black text-mensa-orange">{scores[criterion as keyof typeof scores]}</span>
                    </div>
                    <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      {/* Dynamic Background Bar */}
                      <div 
                        className="absolute inset-y-0 left-0 bg-mensa-orange transition-all duration-300 ease-out"
                        style={{ width: `${(scores[criterion as keyof typeof scores] || 1) * 10}%` }}
                      ></div>
                      {/* Interaction Slider */}
                      <input 
                        type="range" min="1" max="10" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        value={scores[criterion as keyof typeof scores]}
                        onChange={(e) => setScores({...scores, [criterion]: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-gray-500 font-bold tracking-tighter uppercase px-1">
                      <span>Beginner</span>
                      <span>Master</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <Text className="text-gray-400 mb-3 uppercase text-[10px] tracking-widest font-bold">Judge's Confidential Comments</Text>
                <textarea 
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 text-white focus:ring-2 focus:ring-mensa-orange outline-none transition-all placeholder-gray-700"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Justify the strengths or technical weaknesses..."
                />
              </div>

              <button 
                className="mt-10 w-full bg-mensa-orange hover:bg-mensa-orange/90 text-white font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em]"
                onClick={handleScoreSubmit}
              >
                Confirm and Save Evaluation
              </button>
            </Card>
          ) : (
            <Card className="glass border-white/10 border-dashed rounded-[2.5rem] h-[80vh] flex flex-col items-center justify-center text-center p-20">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 animate-pulse">
                <span className="text-5xl opacity-40">🎞️</span>
              </div>
              <Title className="text-white text-2xl font-black uppercase tracking-tight">Select a masterpiece</Title>
              <Text className="text-gray-500 mt-2 max-w-sm mx-auto">Browse the gallery on the left to start the technical and artistic evaluation process.</Text>
            </Card>
          )}
        </div>
      </Grid>
    </div>
  );
}
