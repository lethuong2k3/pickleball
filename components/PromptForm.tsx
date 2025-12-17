/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';
import React, {useCallback, useEffect, useState} from 'react';
import {
  AspectRatio,
  GenerateVideoParams,
  GenerationMode,
  ImageFile,
  Resolution,
  VeoModel,
  VideoFile,
} from '../types';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  SparklesIcon,
} from './icons';

// Cấu hình cứng cho trải nghiệm "Booking"
const MODEL = VeoModel.VEO_FAST; 
const ASPECT_RATIO = AspectRatio.LANDSCAPE;
const RESOLUTION = Resolution.P720;

// Các tùy chọn Booking (Prompt tiếng Anh để AI hiểu tốt nhất, hiển thị tiếng Việt)
const COURT_TYPES = [
    { id: 'pro-blue', name: 'Sân Cứng Chuyên Nghiệp (Xanh)', prompt: 'a professional pickleball court with blue and green surface' },
    { id: 'indoor', name: 'Nhà Thi Đấu Elite (Trong nhà)', prompt: 'a high-end indoor wooden floor pickleball court with stadium seating' },
    { id: 'clay', name: 'Sân Đất Nện (Ngoài trời)', prompt: 'a red clay outdoor pickleball court' },
    { id: 'rooftop', name: 'Sân Thượng Cyberpunk', prompt: 'a neon-lit pickleball court on a skyscraper rooftop at night' },
    { id: 'beach', name: 'Resort Biển', prompt: 'a pickleball court next to a sunny tropical beach' },
];

const TIMES = [
    { id: 'morning', name: '08:00 Sáng (Nắng sớm)', prompt: 'bright morning sunlight, clear sky' },
    { id: 'noon', name: '12:00 Trưa (Nắng gắt)', prompt: 'harsh overhead sunlight, vibrant colors' },
    { id: 'sunset', name: '06:00 Chiều (Hoàng hôn)', prompt: 'cinematic golden hour lighting, long shadows' },
    { id: 'night', name: '08:00 Tối (Đèn pha)', prompt: 'dramatic artificial floodlights, night time' },
];

const ACTIVITIES = [
    { id: 'empty', name: 'Chỉ Sân (Sân trống)', prompt: 'empty court, peaceful atmosphere' },
    { id: 'match', name: 'Trận Đấu Đôi', prompt: 'action shot of a doubles pickleball match with players moving fast' },
    { id: 'training', name: 'Tập Luyện 1 Người', prompt: 'a single player practicing serves with a ball machine' },
];

const CustomSelect: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}> = ({label, value, onChange, children}) => (
  <div className="mb-4">
    <label className="text-xs uppercase tracking-wider block mb-2 font-bold text-lime-400">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-4 pr-10 py-3 text-white appearance-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all hover:bg-slate-750">
        {children}
      </select>
      <ChevronDownIcon
        className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-lime-500"
      />
    </div>
  </div>
);

interface PromptFormProps {
  onGenerate: (params: GenerateVideoParams) => void;
  initialValues?: GenerateVideoParams | null;
}

const PromptForm: React.FC<PromptFormProps> = ({
  onGenerate,
  initialValues,
}) => {
  // Trạng thái Booking
  const [courtId, setCourtId] = useState(COURT_TYPES[0].id);
  const [timeId, setTimeId] = useState(TIMES[0].id);
  const [activityId, setActivityId] = useState(ACTIVITIES[0].id);
  const [players, setPlayers] = useState('4 Người');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const court = COURT_TYPES.find(c => c.id === courtId) || COURT_TYPES[0];
      const time = TIMES.find(t => t.id === timeId) || TIMES[0];
      const activity = ACTIVITIES.find(a => a.id === activityId) || ACTIVITIES[0];

      // Tạo prompt tiếng Anh ngầm định
      const constructedPrompt = `Cinematic video of ${court.prompt}, ${time.prompt}, showing ${activity.prompt}, photorealistic, 4k, high detailed, slow motion camera movement`;

      // Kiểm tra chế độ Extend
      const isExtend = initialValues?.mode === GenerationMode.EXTEND_VIDEO;
      
      onGenerate({
        prompt: isExtend && initialValues?.prompt ? initialValues.prompt : constructedPrompt,
        model: MODEL,
        aspectRatio: ASPECT_RATIO,
        resolution: RESOLUTION,
        mode: isExtend ? GenerationMode.EXTEND_VIDEO : GenerationMode.TEXT_TO_VIDEO,
        inputVideo: initialValues?.inputVideo,
        inputVideoObject: initialValues?.inputVideoObject,
        isLooping: false,
      });
    },
    [courtId, timeId, activityId, onGenerate, initialValues]
  );

  // Chế độ Extend Video (Mở rộng clip) - Hiển thị form prompt text
  if (initialValues?.mode === GenerationMode.EXTEND_VIDEO) {
      const [localPrompt, setLocalPrompt] = useState(initialValues.prompt);
      return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="w-full max-w-xl mx-auto bg-slate-800 p-6 rounded-2xl border border-lime-500/30">
             <h3 className="text-xl font-bold text-lime-400 mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" /> Mở Rộng Video
             </h3>
             <label className="text-xs uppercase tracking-wider block mb-2 font-bold text-gray-400">
                 Điều gì xảy ra tiếp theo?
             </label>
             <textarea 
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                placeholder="Ví dụ: Máy quay zoom ra xa để thấy khán giả vỗ tay..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent min-h-[100px]"
             />
             <button
              type="submit"
              className="mt-4 w-full py-4 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold text-lg rounded-xl transition-colors shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2"
            >
              Tạo Video Mở Rộng <ArrowRightIcon className="w-5 h-5" />
            </button>
        </form>
      );
  }

  // Chế độ Booking mặc định
  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomSelect
                label="Chọn Loại Sân"
                value={courtId}
                onChange={(e) => setCourtId(e.target.value)}
            >
                {COURT_TYPES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </CustomSelect>

            <CustomSelect
                label="Thời Gian Đặt"
                value={timeId}
                onChange={(e) => setTimeId(e.target.value)}
            >
                {TIMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </CustomSelect>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <CustomSelect
                label="Không Khí / Hoạt Động"
                value={activityId}
                onChange={(e) => setActivityId(e.target.value)}
            >
                {ACTIVITIES.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </CustomSelect>

             <div className="mb-4">
                <label className="text-xs uppercase tracking-wider block mb-2 font-bold text-lime-400">
                    Số Người Chơi
                </label>
                <input 
                    type="text" 
                    value={players}
                    onChange={(e) => setPlayers(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-4 pr-4 py-3 text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
            </div>
        </div>

        <div className="pt-4 border-t border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 text-sm">Tổng Chi Phí</span>
                <span className="text-2xl font-bold text-white">200.000đ <span className="text-sm font-normal text-slate-500">/ giờ</span></span>
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold text-lg rounded-xl transition-colors shadow-[0_0_20px_rgba(132,204,22,0.4)] flex items-center justify-center gap-2 group"
              aria-label="Generate video"
            >
              <span>Kiểm tra & Xem trước trực tiếp</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-xs text-slate-500 mt-3">
                Mô phỏng trực tiếp được tạo bởi công nghệ Google Veo AI
            </p>
        </div>
      </form>
    </div>
  );
};

export default PromptForm;