import { useState } from "react";
import { Card, Title, Text } from "@tremor/react";
import api from "../services/api";

const mensaCountries = [
  "Argentina", "Australia", "Austria", "Belgium", "Bosnia & Herzegovina", "Brazil", 
  "Bulgaria", "Canada", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Finland", 
  "France", "Germany", "Greece", "Hong Kong", "Hungary", "India", "Indonesia", "Italy", 
  "Japan", "Luxembourg", "Malaysia", "Mexico", "Montenegro", "Netherlands", "New Zealand", 
  "North Macedonia", "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Romania", 
  "Serbia", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", 
  "Sweden", "Switzerland", "Taiwan", "Turkey", "UK", "USA", "International Participant"
];

interface PhotoSubmission {
  file: File | null;
  preview: string | null;
  title: string;
  description: string;
}

export default function Upload() {
  const [step, setStep] = useState(1);
  
  // Step 1: Participant Info
  const [participantInfo, setParticipantInfo] = useState({
    fullName: "",
    email: "",
    nationalMensa: "",
    memberNumber: ""
  });

  // Step 2: Photos
  const [photos, setPhotos] = useState<PhotoSubmission[]>([
    { file: null, preview: null, title: "", description: "" },
    { file: null, preview: null, title: "", description: "" },
    { file: null, preview: null, title: "", description: "" }
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleParticipantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    const newPhotos = [...photos];
    newPhotos[index].file = selectedFile;
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPhotos[index].preview = reader.result as string;
        setPhotos([...newPhotos]);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      newPhotos[index].preview = null;
      setPhotos(newPhotos);
    }
  };

  const handlePhotoChange = (index: number, field: 'title' | 'description', value: string) => {
    const newPhotos = [...photos];
    newPhotos[index][field] = value;
    setPhotos(newPhotos);
  };

  const handleUploadAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setStatus(null);

    try {
      // Upload each photo that has a file
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (photo.file) {
          const formData = new FormData();
          formData.append("file", photo.file);
          formData.append("title", photo.title);
          formData.append("description", photo.description);
          formData.append("category", "LONGEVITY"); // Theme 2026
          
          await api.post("/photos/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }
      
      setStatus({ type: "success", msg: "Photos uploaded successfully! You can now see them in the evaluation panel." });
      
      // Reset photos
      setPhotos([
        { file: null, preview: null, title: "", description: "" },
        { file: null, preview: null, title: "", description: "" },
        { file: null, preview: null, title: "", description: "" }
      ]);
    } catch (err: any) {
      setStatus({ type: "error", msg: "Error uploading photos. Make sure the server is active." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 relative z-10">
      <div className="mb-12 flex items-center gap-4">
        <img src="/logo.png" alt="PhotoCup" className="h-14 w-auto object-contain" />
        <div>
          <Title className="text-white text-4xl font-black tracking-tighter uppercase">MY <span className="text-mensa-orange">SUBMISSIONS</span></Title>
          <Text className="text-gray-400 font-medium">PhotoCup 2026 • Participant Portal • Theme: LONGEVITY</Text>
        </div>
      </div>

      {step === 1 ? (
        // STEP 1: Participant Information
        <div className="max-w-3xl mx-auto">
          <Card className="glass border-white/5 rounded-3xl p-8">
            <div className="mb-6">
              <h2 className="text-white text-2xl font-bold uppercase mb-2">Participant Information</h2>
              <p className="text-gray-400 text-sm">Complete your details before uploading your photographs</p>
            </div>
            
            <form onSubmit={handleParticipantSubmit} className="space-y-6">
              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Full Name</Text>
                <input 
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                  placeholder="e.g: John Smith" 
                  value={participantInfo.fullName}
                  onChange={(e) => setParticipantInfo({...participantInfo, fullName: e.target.value})}
                  required
                />
              </div>

              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Email</Text>
                <input 
                  type="email"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                  placeholder="email@example.com" 
                  value={participantInfo.email}
                  onChange={(e) => setParticipantInfo({...participantInfo, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">National Mensa</Text>
                <select 
                  value={participantInfo.nationalMensa} 
                  onChange={(e) => setParticipantInfo({...participantInfo, nationalMensa: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                  required
                >
                  <option value="" className="bg-[#0a0a0a]">Select your country</option>
                  {mensaCountries.map(country => (
                    <option key={country} value={country} className="bg-[#0a0a0a] text-white">{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Member Number</Text>
                <input 
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                  placeholder="e.g: 123456" 
                  value={participantInfo.memberNumber}
                  onChange={(e) => setParticipantInfo({...participantInfo, memberNumber: e.target.value})}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-mensa-orange hover:bg-mensa-orange/90 text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] shadow-lg hover:scale-[1.01] active:scale-95 transition-all"
              >
                Continue to Photo Upload →
              </button>
            </form>
          </Card>
        </div>
      ) : (
        // STEP 2: Photo Upload (up to 3 photos)
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold">Participante: <span className="text-mensa-orange">{participantInfo.fullName}</span></p>
              <p className="text-gray-400 text-sm">{participantInfo.nationalMensa} • Member #{participantInfo.memberNumber}</p>
            </div>
            <button 
              onClick={() => setStep(1)}
              className="text-gray-400 hover:text-white text-sm font-bold underline"
            >
              ← Edit data
            </button>
          </div>

          <form onSubmit={handleUploadAll} className="space-y-6">
            {photos.map((photo, index) => (
              <Card key={index} className="glass border-white/5 rounded-3xl p-8">
                <h3 className="text-white text-xl font-bold mb-6 uppercase">Photo {index + 1} {index === 0 && <span className="text-mensa-orange text-sm">(Required)</span>}</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Title</Text>
                      <input 
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                        placeholder="e.g: Sunrise in the Alps" 
                        value={photo.title}
                        onChange={(e) => handlePhotoChange(index, 'title', e.target.value)}
                        required={index === 0 || !!photo.file}
                      />
                    </div>

                    <div>
                      <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Description</Text>
                      <textarea 
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-mensa-orange outline-none transition-all"
                        rows={4}
                        value={photo.description}
                        onChange={(e) => handlePhotoChange(index, 'description', e.target.value)}
                        placeholder="Tell us the context of the photo..."
                      />
                    </div>
                  </div>

                  <div>
                    <Text className="text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">High Resolution File</Text>
                    <label className="flex flex-col items-center justify-center w-full h-full min-h-[280px] border-2 border-white/10 border-dashed rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all overflow-hidden relative group">
                      {photo.preview ? (
                        <>
                          <img src={photo.preview} className="w-full h-full object-cover" alt={`Preview ${index + 1}`} />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Text className="text-white font-bold uppercase text-[10px] tracking-widest">Change Image</Text>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <span className="text-4xl mb-2">📸</span>
                          <p className="mb-2 text-sm text-gray-400"><span className="font-bold">Click to upload</span></p>
                          <p className="text-xs text-gray-500">JPG, PNG (MAX. 10MB)</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(index, e)}
                        className="hidden" 
                        required={index === 0}
                      />
                    </label>
                    {photo.file && <div className="mt-2 text-xs text-mensa-orange font-bold">✓ {photo.file.name}</div>}
                  </div>
                </div>
              </Card>
            ))}

            {status && (
              <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest ${status.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                {status.msg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isUploading || !photos[0].file}
              className="w-full bg-mensa-orange hover:bg-mensa-orange/90 text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] shadow-lg hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
            >
              {isUploading ? "UPLOADING..." : "SUBMIT TO COMPETITION"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
