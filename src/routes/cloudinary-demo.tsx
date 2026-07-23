import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import React, { useState } from "react";
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  Sparkles,
  Sliders,
  Zap,
} from "lucide-react";
import { PageShell, Reveal, GradientItalic } from "@/components/PageShell";
import { uploadAssetServerFn, getOptimizedImageUrl } from "@/lib/cloudinary";

export const Route = createFileRoute("/cloudinary-demo")({
  component: CloudinaryDemo,
  head: () => ({
    meta: [
      { title: "Cloudinary Demo — GURMITRAA" },
      {
        name: "description",
        content: "Interactive media uploader and optimization demo powered by Cloudinary.",
      },
    ],
    links: [{ rel: "canonical", href: "/cloudinary-demo" }],
  }),
});

function CloudinaryDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transformation states
  const [width, setWidth] = useState(400);
  const [quality, setQuality] = useState(70);
  const [blur, setBlur] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setUploadResult(null);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Convert file to base64 string
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });
      reader.readAsDataURL(file);
      const fileBase64 = await base64Promise;

      const result = await uploadAssetServerFn({
        data: {
          fileBase64,
          filename: file.name,
        },
      });

      setUploadResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload file to Cloudinary.");
    } finally {
      setLoading(false);
    }
  };

  const optimizedUrl = uploadResult
    ? getOptimizedImageUrl(uploadResult.public_id, {
        width,
        quality,
      })
    : null;

  const copyToClipboard = () => {
    if (optimizedUrl) {
      navigator.clipboard.writeText(optimizedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <PageShell>
      {/* HERO */}
      <section className="relative -mt-20 pt-40 pb-24 bg-navy-deep text-white overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(255,122,0,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-xs uppercase tracking-[0.3em] text-orange mb-6">
            Cloudinary Integration
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-balance"
          >
            Media & <GradientItalic text="Assets" /> uploader.
          </motion.h1>
          <p className="mt-8 max-w-2xl text-lg text-white/70">
            Upload your images securely to Cloudinary, apply real-time optimizations, and optimize
            delivery performance.
          </p>
        </div>
      </section>

      {/* UPLOADER & DISPLAY SECTION */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-12">
          {/* Controls & Form */}
          <div className="lg:col-span-5 space-y-8">
            <Reveal>
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <h3 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                  <Upload className="text-orange" size={22} />
                  Upload Asset
                </h3>

                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="border-2 border-dashed border-border hover:border-orange rounded-2xl p-6 text-center cursor-pointer transition relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {previewUrl ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-mist">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="py-8 space-y-3">
                        <div className="h-12 w-12 rounded-xl bg-orange/10 grid place-items-center mx-auto text-orange group-hover:scale-110 transition">
                          <ImageIcon size={24} />
                        </div>
                        <div className="text-sm font-semibold">Click to choose or drag image</div>
                        <div className="text-xs text-muted-foreground">
                          PNG, JPG, WebP up to 10MB
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      {error}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: file && !loading ? 1.02 : 1 }}
                    whileTap={{ scale: file && !loading ? 0.98 : 1 }}
                    type="submit"
                    disabled={!file || loading}
                    className="w-full group inline-flex items-center justify-center gap-2 rounded-xl bg-orange px-6 py-4 font-semibold text-white glow-orange disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Uploading to Cloudinary...
                      </>
                    ) : (
                      <>
                        Upload secure asset
                        <ArrowRight
                          size={18}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </Reveal>

            {uploadResult && (
              <Reveal delay={0.1}>
                <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
                  <h3 className="font-display text-2xl font-bold flex items-center gap-2">
                    <Sliders className="text-orange" size={22} />
                    Transformations
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Width (px)</span>
                        <span className="font-semibold">{width}px</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="1200"
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        className="w-full accent-orange"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Quality (%)</span>
                        <span className="font-semibold">{quality}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full accent-orange"
                      />
                    </div>
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          {/* Results Comparison */}
          <div className="lg:col-span-7 space-y-8">
            {uploadResult ? (
              <Reveal delay={0.2}>
                <div className="bg-card border border-border rounded-3xl p-8 space-y-8 h-full">
                  <div>
                    <h3 className="font-display text-2xl font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="text-orange" size={22} />
                      Optimized Asset Delivery
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Cloudinary automatically delivers the asset in the optimal format (like AVIF
                      or WebP) and quality level for your browser.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Raw uploaded image */}
                    <div className="space-y-3">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        Original Image
                      </div>
                      <div className="aspect-square rounded-2xl overflow-hidden border border-border bg-mist">
                        <img
                          src={uploadResult.secure_url}
                          alt="Original"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Raw Dimensions: {uploadResult.width} × {uploadResult.height}px <br />
                        Format: {uploadResult.format}
                      </div>
                    </div>

                    {/* Cloudinary optimized image */}
                    <div className="space-y-3">
                      <div className="text-xs uppercase tracking-widest text-orange flex items-center gap-1">
                        <Zap size={12} className="fill-orange" />
                        Cloudinary Optimized
                      </div>
                      <div className="aspect-square rounded-2xl overflow-hidden border border-orange bg-mist relative">
                        <img
                          src={optimizedUrl || ""}
                          alt="Optimized"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Applied Dimensions: {width}px Width <br />
                        Format: auto (WebP/AVIF fallback) <br />
                        Quality: {quality} (Auto-smart)
                      </div>
                    </div>
                  </div>

                  {/* Delivery URL block */}
                  <div className="bg-mist border border-border rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        Cloudinary URL
                      </span>
                      <button
                        onClick={copyToClipboard}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange hover:text-orange-glow transition"
                      >
                        {copied ? (
                          <>
                            <Check size={14} /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Copy URL
                          </>
                        )}
                      </button>
                    </div>
                    <code className="block text-xs select-all break-all bg-card p-3 rounded-lg border border-border font-mono max-h-24 overflow-y-auto">
                      {optimizedUrl}
                    </code>
                  </div>
                </div>
              </Reveal>
            ) : (
              <div className="h-full min-h-[400px] rounded-3xl border-2 border-dashed border-border grid place-items-center text-center p-8 bg-card/50">
                <div className="space-y-3 max-w-sm">
                  <ImageIcon size={40} className="text-muted-foreground/40 mx-auto" />
                  <h4 className="font-display font-semibold text-lg">No asset uploaded yet</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload an image in the left panel to trigger Cloudinary's real-time optimization
                    engine and preview results here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
