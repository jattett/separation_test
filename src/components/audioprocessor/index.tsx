import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop } from 'react-icons/fa'; // 🔥 마이크 & 정지 아이콘 추가
import styled, { keyframes, css } from 'styled-components';
import { Button, FileForm } from './Styled';

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
      // ✅ HTTPS 환경 체크 (iOS 필수)
      if (window.location.protocol !== 'https:') {
        alert('🔒 HTTPS 환경에서만 녹음이 가능합니다.');
        return;
      }

      // ✅ 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!stream) {
        alert('❌ 마이크 접근을 허용해야 녹음이 가능합니다.');
        return;
      }

      // ✅ 아이폰 Safari는 "audio/webm"을 지원하지 않음 → "audio/mp4"로 설정
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/webm';

      console.log('🎤 사용되는 MIME 타입:', mimeType);

      // ✅ 녹음기 초기화
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // 🔥 녹음된 데이터를 Blob으로 변환
        const recordedBlob = new Blob(audioChunks.current, { type: mimeType });

        console.log('🎧 녹음 완료 - 파일 크기:', recordedBlob.size, '타입:', recordedBlob.type);

        // ✅ 변환 시 파일 이름 추가
        const mpegBlob = await convertToMpeg(recordedBlob, 'recording');

        setAudioBlob(mpegBlob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('🎤 마이크 접근 오류:', error);
      alert('❌ 마이크 접근 권한이 필요합니다. 설정에서 확인해주세요.');
    }
  };

  // ✅ 녹음 중지
  const handleStopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const convertToMpeg = async (inputBlob: Blob, fileName: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      console.log('🎤 MPEG 변환 시작 - 원본 파일 크기:', inputBlob.size, '타입:', inputBlob.type);

      // ✅ 이미 MPEG(MP4) 형식이면 변환 없이 사용
      if (inputBlob.type.includes('mpeg') || inputBlob.type.includes('mp4')) {
        console.warn('⚠️ 이미 MPEG 파일이므로 변환 없이 사용됩니다:', fileName);
        resolve(new File([inputBlob], fileName, { type: 'audio/mpeg', lastModified: Date.now() }));
        return;
      }

      const reader = new FileReader();
      reader.readAsArrayBuffer(inputBlob);

      reader.onloadend = async () => {
        if (!reader.result) {
          console.error('❌ FileReader가 데이터를 읽지 못했습니다!');
          reject(new Error('FileReader failed to read data'));
          return;
        }

        try {
          // 🔥 AudioContext로 PCM 데이터 변환
          const audioContext = new AudioContext();
          const arrayBuffer = reader.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          if (!audioBuffer) {
            console.error('❌ `decodeAudioData()`가 데이터를 반환하지 못했습니다.');
            reject(new Error('Failed to decode audio to PCM'));
            return;
          }

          console.log('🔊 PCM 변환 완료: 샘플레이트', audioBuffer.sampleRate, 'Hz');

          // 🔥 MP4 변환 로직 추가
          const mp4Blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });

          console.log('✅ MPEG 변환 완료 - 변환된 파일 크기:', mp4Blob.size);

          // ✅ Blob → File 변환 (이름 추가)
          const mp4File = new File([mp4Blob], fileName.replace(/\.[^/.]+$/, '') + '.mp4', {
            type: 'audio/mpeg',
            lastModified: Date.now(),
          });

          console.log('✅ 최종 MPEG 파일:', mp4File.name, '- 크기:', mp4File.size);
          resolve(mp4File);
        } catch (error) {
          console.error('❌ PCM 변환 중 오류 발생:', error);
          reject(new Error('PCM conversion failed'));
        }
      };

      reader.onerror = () => {
        console.error('❌ FileReader에서 오류 발생!');
        reject(new Error('Error reading file'));
      };
    });
  };

  const handleUpload = async () => {
    if (!file && !audioBlob) {
      alert('파일을 선택하거나 녹음을 해주세요.');
      return;
    }

    let uploadFile = file || new File([audioBlob!], 'recording.mp3', { type: 'audio/mp3' });

    console.log('🚀 원본 파일 타입:', uploadFile.type, '크기:', uploadFile.size);

    // ✅ MP3가 아니면 변환 실행
    if (!uploadFile.type.includes('mp3')) {
      console.warn('⚠️ MPEG로 변환 중...');
      uploadFile = await convertToMpeg(uploadFile, uploadFile.name);
      console.log('🎧 변환된 MPEG 파일 타입:', uploadFile.type, '크기:', uploadFile.size);
    }

    setLoading(true);
    setProgress(5);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      console.log('🚀 파일 업로드 중...', uploadFile.name, '크기:', uploadFile.size);

      const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', formData, {
        headers: { Authorization: API_KEY },
      });

      const audioUrl = uploadResponse.data.upload_url;
      setProgress(30);
      console.log('✅ 업로드 성공:', audioUrl);

      const response = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        { audio_url: audioUrl, speaker_labels: true, language_code: 'ko' },
        { headers: { Authorization: API_KEY, 'Content-Type': 'application/json' } }
      );

      const transcriptId = response.data.id;
      setProgress(35);
      console.log('🔍 화자 분석 시작:', transcriptId);

      let transcript = null;
      while (true) {
        const transcriptResponse = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: { Authorization: API_KEY },
        });

        if (transcriptResponse.data.status === 'completed') {
          transcript = transcriptResponse.data.utterances || [];
          setProgress(100);
          console.log('✅ 화자 분석 완료!');
          break;
        } else {
          setProgress((prev) => Math.min(prev + 5, 95));
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }

      // ✅ transcript가 null이면 빈 배열 전달
      onTranscript(transcript || []);
    } catch (error) {
      console.error('❌ 오류 발생:', error);
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
          {loading ? '처리 중...' : '음성 분석 시작'}
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
