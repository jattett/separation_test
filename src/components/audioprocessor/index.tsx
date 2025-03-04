import React, { useState } from 'react';
import axios from 'axios';

const API_KEY = '9908b0de5b704b80a20bb799d7803ad9'; // 🔥 API 키 직접 입력

interface Transcript {
  speaker: number;
  text: string;
}

interface Props {
  onTranscript: (transcript: Transcript[]) => void;
}

const AudioProcessor: React.FC<Props> = ({ onTranscript }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 🔥 진행도 상태 추가

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('파일을 선택하세요.');

    setLoading(true);
    setProgress(5);

    try {
      // 1️⃣ AssemblyAI에 파일 업로드 (최대 30% 진행)
      setProgress(10);
      const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', file, {
        headers: {
          Authorization: API_KEY,
          'Content-Type': 'application/octet-stream',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 20) / progressEvent.total); // 최대 30%
            setProgress(10 + percentCompleted);
          }
        },
      });

      const audioUrl = uploadResponse.data.upload_url;
      setProgress(30); // 업로드 완료

      // 2️⃣ 한국어로 설정 + 화자 분리 활성화 (최대 70%)
      const response = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        {
          audio_url: audioUrl,
          speaker_labels: true, // 화자 분리 활성화
          language_code: 'ko', // 한국어 설정
        },
        {
          headers: {
            Authorization: API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      const transcriptId = response.data.id;
      setProgress(35);

      // 3️⃣ 변환 완료 여부 확인 (최대 100%)
      let transcript;
      while (true) {
        const transcriptResponse = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: { Authorization: API_KEY },
        });

        if (transcriptResponse.data.status === 'completed') {
          transcript = transcriptResponse.data.utterances;
          setProgress(100); // 완료 시 100%
          break;
        } else {
          setProgress((prev) => Math.min(prev + 5, 95)); // 변환 진행 중 (최대 95%)
          await new Promise((resolve) => setTimeout(resolve, 3000)); // 3초 간격으로 체크
        }
      }

      onTranscript(transcript);
    } catch (error) {
      console.error('오류 발생:', error);
      setProgress(0); // 오류 발생 시 초기화
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? '처리 중...' : '업로드 및 변환'}
      </button>
      {loading && (
        <div style={{ marginTop: '10px', width: '100%', backgroundColor: '#eee' }}>
          <div
            style={{
              width: `${progress}%`,
              backgroundColor: 'blue',
              color: 'white',
              textAlign: 'center',
              padding: '5px 0',
            }}
          >
            {progress}%
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioProcessor;
