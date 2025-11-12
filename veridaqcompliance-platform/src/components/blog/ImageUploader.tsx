import React, { useState, useRef } from 'react';
import { Upload, Link2, Image, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = "Featured Image",
  placeholder = "https://images.pexels.com/photos/..."
}) => {
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Simulate upload delay and processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate a demo URL (in production, this would upload to Supabase Storage)
      const demoImageUrls = [
        'https://images.pexels.com/photos/6177712/pexels-photo-6177712.jpeg',
        'https://images.pexels.com/photos/7414284/pexels-photo-7414284.jpeg',
        'https://images.pexels.com/photos/5582597/pexels-photo-5582597.jpeg',
        'https://images.pexels.com/photos/7413915/pexels-photo-7413915.jpeg',
        'https://images.pexels.com/photos/8728380/pexels-photo-8728380.jpeg'
      ];
      
      const randomUrl = demoImageUrls[Math.floor(Math.random() * demoImageUrls.length)];
      onChange(randomUrl);

      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-6 right-6 bg-success-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span class="font-semibold">📷 Image uploaded successfully! (Demo)</span>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);

    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-neutral-700">
        {label}
      </label>

      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-neutral-100 rounded-xl">
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            uploadMode === 'url'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Link2 className="w-4 h-4" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('upload')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            uploadMode === 'upload'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {uploadMode === 'url' ? (
        /* URL Input */
        <div>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="modern-input focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300 hover:border-neutral-300 transition-all shadow-sm"
          />
          <p className="text-xs text-neutral-500 mt-2">
            💡 Use high-quality images from Pexels, Unsplash, or your own CDN
          </p>
        </div>
      ) : (
        /* File Upload */
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
              dragOver
                ? 'border-primary-400 bg-primary-50'
                : uploading
                ? 'border-warning-300 bg-warning-50'
                : 'border-neutral-300 bg-neutral-50 hover:border-primary-300 hover:bg-primary-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploading ? (
              <div className="space-y-4">
                <div className="w-12 h-12 border-4 border-warning-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div>
                  <div className="font-semibold text-warning-800">Uploading Image...</div>
                  <div className="text-sm text-warning-700">Please wait while we process your image</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900 mb-2">
                    {dragOver ? 'Drop your image here' : 'Upload Featured Image'}
                  </div>
                  <div className="text-sm text-neutral-600 mb-4">
                    Drag and drop an image, or click to browse
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-primary"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Choose Image
                  </button>
                </div>
                <div className="text-xs text-neutral-500">
                  Supports JPG, PNG, WebP • Max 5MB • Recommended: 1200x630px
                </div>
              </div>
            )}
          </div>

          {/* Demo Notice */}
          <div className="mt-3 p-3 bg-accent-50 border border-accent-200 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="text-accent-600">🧪</span>
              <div>
                <div className="font-semibold text-accent-800 text-sm">Demo Mode</div>
                <div className="text-accent-700 text-xs">
                  Upload simulation - generates demo image URL. In production, files would be uploaded to Supabase Storage.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {value && (
        <div className="relative">
          <div className="aspect-video bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
            <img 
              src={value} 
              alt="Featured preview"
              srcSet={`
                ${value}?w=400 400w,
                ${value}?w=600 600w,
                ${value}?w=800 800w,
                ${value}?w=1200 1200w
              `}
              sizes="(max-width: 640px) 100vw, 400px"
              loading="lazy"
              width="400"
              height="225"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors shadow-lg"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;