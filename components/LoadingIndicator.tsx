/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Đang kiểm tra lịch trống...",
  "Đang giữ chỗ cho bạn...",
  "Đang khởi động vợt...",
  "Đang căng lưới...",
  "Veo AI đang tạo mô phỏng sân đấu...",
  "Đang đo tốc độ gió...",
  "Đang tăng độ bám sân...",
  "Đang kẻ vạch Non-Volley Zone...",
  "Thu thập điểm ảnh cho cú giao bóng...",
  "Sắp sẵn sàng cho trận đấu...",
  "Đang render kết cấu 4K...",
  "Hình dung cú đánh chiến thắng..."
];

const LoadingIndicator: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-lime-500/20 shadow-2xl">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-t-transparent border-lime-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-lime-500/20 rounded-full animate-pulse"></div>
        </div>
      </div>
      <h2 className="text-2xl font-bold mt-8 text-white">Đang xử lý đặt sân</h2>
      <p className="mt-2 text-lime-300 text-center transition-opacity duration-500 font-medium">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingIndicator;