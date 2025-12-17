/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';
import React, {useCallback, useEffect, useState} from 'react';
import ApiKeyDialog from './components/ApiKeyDialog';
import {CurvedArrowDownIcon} from './components/icons';
import LoadingIndicator from './components/LoadingIndicator';
import PromptForm from './components/PromptForm';
import VideoResult from './components/VideoResult';
import {generateVideo} from './services/geminiService';
import {
  AppState,
  GenerateVideoParams,
  GenerationMode,
  Resolution,
  VideoFile,
} from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastConfig, setLastConfig] = useState<GenerateVideoParams | null>(
    null,
  );
  const [lastVideoObject, setLastVideoObject] = useState<Video | null>(null);
  const [lastVideoBlob, setLastVideoBlob] = useState<Blob | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  // A single state to hold the initial values for the prompt form
  const [initialFormValues, setInitialFormValues] =
    useState<GenerateVideoParams | null>(null);

  // Check for API key on initial load
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        try {
          if (!(await window.aistudio.hasSelectedApiKey())) {
            setShowApiKeyDialog(true);
          }
        } catch (error) {
          console.warn(
            'aistudio.hasSelectedApiKey check failed, assuming no key selected.',
            error,
          );
          setShowApiKeyDialog(true);
        }
      }
    };
    checkApiKey();
  }, []);

  const showStatusError = (message: string) => {
    setErrorMessage(message);
    setAppState(AppState.ERROR);
  };

  const handleGenerate = useCallback(async (params: GenerateVideoParams) => {
    if (window.aistudio) {
      try {
        if (!(await window.aistudio.hasSelectedApiKey())) {
          setShowApiKeyDialog(true);
          return;
        }
      } catch (error) {
        console.warn(
          'aistudio.hasSelectedApiKey check failed, assuming no key selected.',
          error,
        );
        setShowApiKeyDialog(true);
        return;
      }
    }

    setAppState(AppState.LOADING);
    setErrorMessage(null);
    setLastConfig(params);
    // Reset initial form values for the next fresh start
    setInitialFormValues(null);

    try {
      const {objectUrl, blob, video} = await generateVideo(params);
      setVideoUrl(objectUrl);
      setLastVideoBlob(blob);
      setLastVideoObject(video);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error('Video generation failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';

      let userFriendlyMessage = `Tạo video thất bại: ${errorMessage}`;
      let shouldOpenDialog = false;

      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('Requested entity was not found.')) {
          userFriendlyMessage =
            'Không tìm thấy Model. Nguyên nhân có thể do khóa API không hợp lệ hoặc thiếu quyền. Vui lòng kiểm tra lại khóa API.';
          shouldOpenDialog = true;
        } else if (
          errorMessage.includes('API_KEY_INVALID') ||
          errorMessage.includes('API key not valid') ||
          errorMessage.toLowerCase().includes('permission denied')
        ) {
          userFriendlyMessage =
            'Khóa API không hợp lệ hoặc thiếu quyền. Vui lòng chọn một khóa API có bật thanh toán (Billing).';
          shouldOpenDialog = true;
        }
      }

      setErrorMessage(userFriendlyMessage);
      setAppState(AppState.ERROR);

      if (shouldOpenDialog) {
        setShowApiKeyDialog(true);
      }
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastConfig) {
      handleGenerate(lastConfig);
    }
  }, [lastConfig, handleGenerate]);

  const handleApiKeyDialogContinue = async () => {
    setShowApiKeyDialog(false);
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    }
    if (appState === AppState.ERROR && lastConfig) {
      handleRetry();
    }
  };

  const handleNewVideo = useCallback(() => {
    setAppState(AppState.IDLE);
    setVideoUrl(null);
    setErrorMessage(null);
    setLastConfig(null);
    setLastVideoObject(null);
    setLastVideoBlob(null);
    setInitialFormValues(null); // Clear the form state
  }, []);

  const handleTryAgainFromError = useCallback(() => {
    if (lastConfig) {
      setInitialFormValues(lastConfig);
      setAppState(AppState.IDLE);
      setErrorMessage(null);
    } else {
      // Fallback to a fresh start if there's no last config
      handleNewVideo();
    }
  }, [lastConfig, handleNewVideo]);

  const handleExtend = useCallback(async () => {
    if (lastConfig && lastVideoBlob && lastVideoObject) {
      try {
        const file = new File([lastVideoBlob], 'last_video.mp4', {
          type: lastVideoBlob.type,
        });
        const videoFile: VideoFile = {file, base64: ''};

        setInitialFormValues({
          ...lastConfig, // Carry over model, aspect ratio
          mode: GenerationMode.EXTEND_VIDEO,
          prompt: 'Zoom out to reveal the entire tournament crowd cheering', // Default extend prompt for pickleball
          inputVideo: videoFile, // for preview in the form
          inputVideoObject: lastVideoObject, // for the API call
          resolution: Resolution.P720, // Extend requires 720p
          // Reset other media types
          startFrame: null,
          endFrame: null,
          referenceImages: [],
          styleImage: null,
          isLooping: false,
        });

        setAppState(AppState.IDLE);
        setVideoUrl(null);
        setErrorMessage(null);
      } catch (error) {
        console.error('Failed to process video for extension:', error);
        const message =
          error instanceof Error ? error.message : 'An unknown error occurred.';
        showStatusError(`Thất bại khi chuẩn bị mở rộng video: ${message}`);
      }
    }
  }, [lastConfig, lastVideoBlob, lastVideoObject]);

  const renderError = (message: string) => (
    <div className="text-center bg-red-900/20 border border-red-500 p-8 rounded-lg">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Dịch Vụ Gián Đoạn</h2>
      <p className="text-red-300">{message}</p>
      <button
        onClick={handleTryAgainFromError}
        className="mt-6 px-6 py-2 bg-lime-500 rounded-lg hover:bg-lime-600 text-black font-bold transition-colors">
        Thử Đặt Lại
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 flex flex-col font-sans overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      {showApiKeyDialog && (
        <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />
      )}
      <header className="py-6 flex flex-col justify-center items-center px-8 relative z-10 border-b border-lime-500/30 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
            {/* Simple Pickleball Icon approximation */}
            <div className="w-10 h-10 rounded-full bg-lime-400 flex items-center justify-center shadow-[0_0_15px_rgba(163,230,53,0.5)]">
                <div className="w-8 h-8 rounded-full border-2 border-slate-900 grid grid-cols-2 gap-0.5 p-0.5">
                    <div className="bg-slate-900 rounded-full"></div>
                    <div className="bg-slate-900 rounded-full"></div>
                    <div className="bg-slate-900 rounded-full"></div>
                    <div className="bg-slate-900 rounded-full"></div>
                </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Pickleball<span className="text-lime-400">Nexus</span>
            </h1>
        </div>
        <p className="text-sm text-lime-200/80 mt-1 uppercase tracking-widest font-semibold">Đặt Sân & Mô Phỏng Trực Quan</p>
      </header>
      <main className="w-full max-w-4xl mx-auto flex-grow flex flex-col p-4">
        {appState === AppState.IDLE ? (
          <>
            <div className="flex-grow flex flex-col items-center justify-center py-8">
              <div className="relative text-center mb-8">
                <h2 className="text-3xl text-white font-bold mb-2">
                  Đặt Lịch Sân Của Bạn
                </h2>
                <p className="text-slate-400 max-w-md mx-auto">
                    Chọn loại sân và thời gian bạn muốn. AI của chúng tôi sẽ kiểm tra tình trạng trống và tạo mô phỏng trực tiếp về điều kiện sân bãi.
                </p>
              </div>
              <div className="w-full">
                <PromptForm
                    onGenerate={handleGenerate}
                    initialValues={initialFormValues}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            {appState === AppState.LOADING && <LoadingIndicator />}
            {appState === AppState.SUCCESS && videoUrl && (
              <VideoResult
                videoUrl={videoUrl}
                onRetry={handleRetry}
                onNewVideo={handleNewVideo}
                onExtend={handleExtend}
                canExtend={lastConfig?.resolution === Resolution.P720}
              />
            )}
            {appState === AppState.SUCCESS &&
              !videoUrl &&
              renderError(
                'Video đã được tạo nhưng thiếu URL. Vui lòng thử lại.',
              )}
            {appState === AppState.ERROR &&
              errorMessage &&
              renderError(errorMessage)}
          </div>
        )}
      </main>
      <footer className="py-4 text-center text-slate-600 text-xs">
        Được hỗ trợ bởi Google Veo &bull; Trải nghiệm tương lai của thể thao
      </footer>
    </div>
  );
};

export default App;