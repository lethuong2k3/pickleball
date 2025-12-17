/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {ArrowPathIcon, PlusIcon, SparklesIcon} from './icons';

interface VideoResultProps {
  videoUrl: string;
  onRetry: () => void;
  onNewVideo: () => void;
  onExtend: () => void;
  canExtend: boolean;
}

const VideoResult: React.FC<VideoResultProps> = ({
  videoUrl,
  onRetry,
  onNewVideo,
  onExtend,
  canExtend,
}) => {
  return (
    <div className="w-full flex flex-col items-center gap-6 p-6 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-lime-500/30 shadow-2xl">
      <div className="bg-lime-500 text-slate-900 px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase mb-2">
        Đã Xác Nhận Đặt Sân
      </div>
      <h2 className="text-3xl font-bold text-white text-center">
        Xem Trước Sân Đấu Của Bạn
      </h2>
      <div className="w-full max-w-2xl aspect-video rounded-xl overflow-hidden bg-black shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-slate-700 relative group">
        <video
          src={videoUrl}
          controls
          autoPlay
          loop
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors">
          <ArrowPathIcon className="w-5 h-5" />
          Tạo lại mô phỏng
        </button>
        {canExtend && (
          <button
            onClick={onExtend}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
            <SparklesIcon className="w-5 h-5" />
            Mở rộng video (Extend)
          </button>
        )}
        <button
          onClick={onNewVideo}
          className="flex items-center gap-2 px-6 py-3 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold rounded-xl transition-colors shadow-lg shadow-lime-500/20">
          <PlusIcon className="w-5 h-5" />
          Đặt sân khác
        </button>
      </div>
    </div>
  );
};

export default VideoResult;