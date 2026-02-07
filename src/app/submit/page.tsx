import { Navbar } from '@/components/Navbar';
import { PhotoUploader } from '@/components/PhotoUploader';

export default function SubmitPage() {
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            <Navbar />

            <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Submit your Entry</h1>
                    <p className="text-gray-400">PhotoCup 2026: "Enigma in Chaos"</p>
                </div>

                <PhotoUploader />

                <div className="mt-20 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-500 border-t border-white/5 pt-10">
                    <div>
                        <h4 className="text-white font-bold mb-2">Copyright & Usage</h4>
                        <p>By submitting, you agree to the Terms and Conditions. You retain full copyright while granting Mensa a non-exclusive license for event promotion.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-2">Automatic Validation</h4>
                        <p>Our system validates EXIF data to ensure capture dates match competition rules. High-quality JPG or PNG files are required.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
