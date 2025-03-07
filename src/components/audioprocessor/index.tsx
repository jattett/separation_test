import React, { useState } from 'react';
import axios from 'axios';
import { Button, FileForm } from './Styled';

const API_KEY = '9908b0de5b704b80a20bb799d7803ad9';

interface Transcript {
  speaker: number;
  text: string;
}

interface Props {
  onTranscript: (transcript: Transcript[]) => void;
}

const AudioProcessor: React.FC<Props> = ({ onTranscript }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null); // 🔥 파일 객체 저장

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('파일을 선택하세요.');

    setLoading(true);
    setProgress(5);

    try {
      setProgress(10);

      // 🔥 `FormData` 사용하여 파일 전송
      const formData = new FormData();
      formData.append('file', file);

      // 🔥 AssemblyAI에 파일 업로드 요청
      const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', formData, {
        headers: {
          Authorization: API_KEY,
          'Content-Type': 'multipart/form-data', // ✅ 변경됨
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 20) / progressEvent.total);
            setProgress(10 + percentCompleted);
          }
        },
      });

      const audioUrl = uploadResponse.data.upload_url;
      setProgress(30);

      // 🔥 AssemblyAI에 변환 요청
      const response = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        { audio_url: audioUrl, speaker_labels: true, language_code: 'ko' },
        { headers: { Authorization: API_KEY, 'Content-Type': 'application/json' } }
      );

      const transcriptId = response.data.id;
      setProgress(35);

      // 🔥 변환 완료 여부 확인
      let transcript;
      while (true) {
        const transcriptResponse = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: { Authorization: API_KEY },
        });

        if (transcriptResponse.data.status === 'completed') {
          transcript = transcriptResponse.data.utterances;
          setProgress(100);
          break;
        } else {
          setProgress((prev) => Math.min(prev + 5, 95));
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }

      onTranscript(transcript);
    } catch (error) {
      console.error('오류 발생:', error);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FileForm>
        <div className="form-wrapper">
          {/* 숨겨진 파일 입력 필드 */}
          <input type="file" id="fileUpload" onChange={handleFileChange} />

          {/* 선택된 파일 이름 표시 */}
          <label className="fileUploadlabel" htmlFor="fileUpload">
            {file ? file.name : '선택된 파일 없음'}
          </label>
        </div>

        <Button onClick={handleUpload} disabled={loading}>
          {loading ? '처리 중...' : '업로드 및 변환'}
        </Button>
      </FileForm>
      {loading && (
        <div style={{ marginTop: '10px', width: '100%', backgroundColor: '#eee', borderRadius: '10px' }}>
          <div
            style={{
              width: `${progress}%`,
              backgroundColor: '#7c3aed',
              color: 'white',
              textAlign: 'center',
              fontSize: '14px',
              borderRadius: '10px 0 0 10px',
              transition: 'All .3s',
            }}
          >
            {progress}%
          </div>
        </div>
      )}
    </>
  );
};

export default AudioProcessor;
