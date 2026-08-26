import React, { useMemo, useEffect, useRef } from 'react';
import { Plyr, APITypes } from 'plyr-react';
import 'plyr-react/plyr.css';
import { X } from 'lucide-react';

interface CustomVideoPlayerProps {
  url: string;
  onClose?: () => void;
}

export default function CustomVideoPlayer({ url, onClose }: CustomVideoPlayerProps) {
  const playerRef = useRef<APITypes>(null);

  // Determine provider and videoId/src
  let provider = 'html5';
  let videoId = url;

  if (url.includes('<iframe')) {
    provider = 'iframe';
    const match = url.match(/src=["'](.*?)["']/);
    if (match && match[1]) {
      videoId = match[1];
    }
  } else if (url.includes('iframe.mediadelivery.net')) {
    provider = 'iframe';
    videoId = url;
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    provider = 'youtube';
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/
    );
    if (match && match[1]) {
      videoId = match[1];
    }
  } else if (url.includes('vimeo.com')) {
    provider = 'vimeo';
    const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (match && match[1]) {
      videoId = match[1];
    }
  }

  const plyrProps = useMemo(() => {
    if (provider === 'youtube' || provider === 'vimeo') {
      return {
        source: {
          type: 'video' as const,
          sources: [
            {
              src: videoId,
              provider: provider as 'youtube' | 'vimeo',
            },
          ],
        },
        options: {
          autoplay: true,
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'captions',
            'settings',
            'pip',
            'airplay',
            'fullscreen',
          ],
          settings: ['quality', 'speed', 'loop'],
          youtube: { noCookie: false, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 },
        },
      };
    } else if (provider === 'html5') {
      return {
        source: {
          type: 'video' as const,
          sources: [
            {
              src: url,
              type: 'video/mp4',
            },
          ],
        },
        options: {
          autoplay: true,
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'captions',
            'settings',
            'pip',
            'airplay',
            'fullscreen',
          ],
          settings: ['quality', 'speed', 'loop'],
        },
      };
    }
    return null;
  }, [provider, videoId, url]);

  return (
    <div
      className="relative w-full h-full flex flex-col justify-center bg-black overflow-hidden rounded-2xl shadow-2xl border border-white/10 group"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Watermark Logo */}
      <div className="absolute top-4 right-4 pointer-events-none opacity-40 mix-blend-overlay z-10 flex items-center gap-2">
        <span className="text-white font-black tracking-widest uppercase text-sm md:text-base drop-shadow-md">
          إشرح طب
        </span>
      </div>

      {/* Close Button overlay */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-50 bg-black/50 hover:bg-red-500/80 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="إغلاق الفيديو"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="w-full h-full rounded-2xl overflow-hidden custom-plyr-theme">
        {provider === 'iframe' && (
          <iframe
            src={videoId || null}
            className="w-full h-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Video player"
          />
        )}

        {plyrProps && (
          <Plyr ref={playerRef} source={plyrProps.source} options={plyrProps.options} />
        )}
      </div>

      <style>{`
        .custom-plyr-theme {
          width: 100%;
          height: 100%;
        }
        .custom-plyr-theme .plyr {
          height: 100%;
          --plyr-color-main: #8e1f2c; /* Burgundy Color */
          --plyr-video-background: #000;
          font-family: 'Cairo', sans-serif;
        }
        .custom-plyr-theme .plyr__video-wrapper {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
