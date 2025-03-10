import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop } from 'react-icons/fa'; // 🔥 마이크 & 정지 아이콘 추가
import styled, { keyframes, css } from 'styled-components';
import { Button, FileForm } from './Styled';
import * as lame from '@breezystack/lamejs';

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // ✅ 지원되는 형식으로 변경: audio/wav ❌ → audio/webm ✅
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      recorderRef.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const webmBlob = new Blob(audioChunks.current, { type: 'audio/webm' });

        // ✅ 변환 시 파일 이름 추가
        const mp3Blob = await convertToMp3(webmBlob, 'recording');

        setAudioBlob(mp3Blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('🎤 마이크 접근 오류:', error);
    }
  };

  const handleStopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const convertToMp3 = (inputBlob: Blob, fileName: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      console.log('🎤 MP3 변환 시작 - 원본 파일 크기:', inputBlob.size, '타입:', inputBlob.type);

      // ✅ MP3이면 변환하지 않고 바로 리턴
      if (inputBlob.type.includes('mp3')) {
        console.warn('⚠️ 이미 MP3 파일이므로 변환 없이 사용됩니다:', fileName);
        resolve(new File([inputBlob], fileName, { type: 'audio/mp3', lastModified: Date.now() }));
        return;
      }

      const reader = new FileReader();
      reader.readAsArrayBuffer(inputBlob);

      reader.onloadend = () => {
        if (!reader.result) {
          console.error('❌ FileReader가 데이터를 읽지 못했습니다!');
          reject(new Error('FileReader failed to read data'));
          return;
        }

        const audioContext = new AudioContext();
        const arrayBuffer = reader.result as ArrayBuffer;

        audioContext
          .decodeAudioData(arrayBuffer)
          .then((audioBuffer) => {
            if (!audioBuffer) {
              console.error('❌ PCM 변환 실패: `decodeAudioData()`가 데이터를 반환하지 못했습니다.');
              reject(new Error('Failed to decode audio to PCM'));
              return;
            }

            console.log(
              `🔊 PCM 변환 완료: 샘플레이트 ${audioBuffer.sampleRate}Hz, 채널 ${audioBuffer.numberOfChannels}`
            );

            // 🔥 PCM 데이터를 Int16Array로 변환
            const numChannels = audioBuffer.numberOfChannels;
            const sampleRate = audioBuffer.sampleRate;
            const bufferSize = 8192;

            const mp3encoder = new lame.Mp3Encoder(numChannels, sampleRate, 128);
            const mp3Data: Uint8Array[] = [];

            for (let channel = 0; channel < numChannels; channel++) {
              const channelData = audioBuffer.getChannelData(channel);
              if (!channelData || channelData.length === 0) {
                console.error(`❌ 채널 ${channel}에서 PCM 데이터를 가져오지 못했습니다.`);
                reject(new Error(`Failed to retrieve PCM data for channel ${channel}`));
                return;
              }

              console.log(`🎧 채널 ${channel} PCM 데이터 길이:`, channelData.length);

              for (let i = 0; i < channelData.length; i += bufferSize) {
                const chunk = channelData.slice(i, i + bufferSize);
                const pcmChunk = new Int16Array(chunk.length);

                for (let j = 0; j < chunk.length; j++) {
                  pcmChunk[j] = Math.max(-32768, Math.min(32767, chunk[j] * 32768));
                }

                const mp3Buf = mp3encoder.encodeBuffer(pcmChunk);
                if (!mp3Buf || mp3Buf.length === 0) {
                  console.error('❌ MP3 변환 실패: encodeBuffer()가 데이터를 생성하지 못함');
                  reject(new Error('MP3 encoding failed'));
                  return;
                }

                mp3Data.push(mp3Buf);
              }
            }

            const finalMp3Buffer = mp3encoder.flush();
            if (finalMp3Buffer.length > 0) {
              mp3Data.push(finalMp3Buffer);
            }

            const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });

            console.log('✅ MP3 변환 완료 - 변환된 파일 크기:', mp3Blob.size);

            const mp3File = new File([mp3Blob], fileName.replace(/\.[^/.]+$/, '') + '.mp3', {
              type: 'audio/mp3',
              lastModified: Date.now(),
            });

            console.log('✅ 최종 MP3 파일:', mp3File.name, '- 크기:', mp3File.size);
            resolve(mp3File);
          })
          .catch((error) => {
            console.error('❌ PCM 변환 중 오류 발생:', error);
            reject(new Error('PCM conversion failed'));
          });
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
      console.warn('⚠️ MP3로 변환 중...');
      uploadFile = await convertToMp3(uploadFile, uploadFile.name);
      console.log('🎧 변환된 MP3 파일 타입:', uploadFile.type, '크기:', uploadFile.size);
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

      let transcript;
      while (true) {
        const transcriptResponse = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: { Authorization: API_KEY },
        });

        if (transcriptResponse.data.status === 'completed') {
          transcript = transcriptResponse.data.utterances;
          setProgress(100);
          console.log('✅ 화자 분석 완료!');
          break;
        } else {
          setProgress((prev) => Math.min(prev + 5, 95));
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }

      onTranscript(transcript);
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
