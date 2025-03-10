import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop } from 'react-icons/fa'; // 🔥 마이크 & 정지 아이콘 추가
import styled, { keyframes, css } from 'styled-components';
import { Button, FileForm } from './Styled';
import lamejs from 'lamejs';

const API_KEY = '9908b0de5b704b80a20bb799d7803ad9';

interface Transcript {
  speaker: number;
  text: string;
}

interface Props {
  onTranscript: (transcript: Transcript[]) => void;
}

const pulse = keyframes`
  0% { box-shadow: 0 0 10px rgba(255, 0, 0, 0.3); }
  50% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.7); }
  100% { box-shadow: 0 0 10px rgba(255, 0, 0, 0.3); }
`;

const RecorderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Timer = styled.p`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const RecordButton = styled.button<{ $isRecording: boolean }>`
  background-color: ${(props) => (props.$isRecording ? '#ff4d4d' : '#4caf50')};
  border: none;
  color: white;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  transition: background 0.3s ease-in-out;
  box-shadow: ${(props) => (props.$isRecording ? '0 0 20px rgba(255, 0, 0, 0.7)' : '0 0 10px rgba(0, 255, 0, 0.7)')};

  ${(props) =>
    props.$isRecording &&
    css`
      animation: ${pulse} 1.5s infinite;
    `}
`;

const AudioProcessor: React.FC<Props> = ({ onTranscript }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null); // 🔥 녹음된 파일 저장 변수
  const [time, setTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/mp3'];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAudioBlob(null);
    }
  };

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      audioChunks.current = [];
      setTime(0);

      setFile(null);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/mp3' });
        console.log('🎤 생성된 오디오 Blob:', audioBlob);
        console.log('🔊 Blob 크기 (bytes):', audioBlob.size);
        setAudioBlob(audioBlob); // ✅ MP3 변환 전 저장
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('마이크 접근 오류:', error);
    }
  };

  const handleStopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUpload = async () => {
    if (!file && !audioBlob) {
      alert('파일을 선택하거나 녹음을 해주세요.');
      return;
    }

    const uploadFile = file || new File([audioBlob!], 'recording.mp3', { type: 'audio/mp3' });

    if (!allowedTypes.includes(uploadFile.type)) {
      alert('지원되지 않는 파일 형식입니다. 오디오 파일만 업로드해주세요.');
      return;
    }

    setLoading(true);
    setProgress(5);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', formData, {
        headers: { Authorization: API_KEY },
      });

      const audioUrl = uploadResponse.data.upload_url;
      setProgress(30);

      const response = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        { audio_url: audioUrl, speaker_labels: true, language_code: 'ko' },
        { headers: { Authorization: API_KEY, 'Content-Type': 'application/json' } }
      );

      const transcriptId = response.data.id;
      setProgress(35);

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
      <RecorderContainer>
        <Timer>⏳ {time} 초</Timer>
        <RecordButton onClick={isRecording ? handleStopRecording : handleStartRecording} $isRecording={isRecording}>
          {isRecording ? <FaStop /> : <FaMicrophone />}
        </RecordButton>
      </RecorderContainer>

      <FileForm>
        <input type="file" id="fileUpload" onChange={handleFileChange} />
        <label className="fileUploadlabel" htmlFor="fileUpload">
          {file ? file.name : '선택된 파일 없음'}
        </label>

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
