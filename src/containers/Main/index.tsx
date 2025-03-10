import React, { useState, useEffect } from "react";
import AudioProcessor from "../../components/audioprocessor";
import Chat from "../../components/chat";
import Summary from "../../components/summary";
import { TitleAnimation, MainStyled } from "./Styled";

interface Message {
  speaker: number;
  text: string;
}

const Main: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [openModal, setOpenModal] = useState(false); // 🔥 모달 상태 추가
  const [chatActive, setChatActive] = useState(false); // 🔥 Chat 활성화 상태 추가

  useEffect(() => {
    if (openModal) {
      document.body.style.overflow = "hidden"; // 🔥 스크롤 차단
    } else {
      document.body.style.overflow = "auto"; // 🔥 모달 닫히면 다시 활성화
    }

    return () => {
      document.body.style.overflow = "auto"; // 🔥 언마운트 시 스크롤 복구
    };
  }, [openModal]); // ✅ openModal이 변경될 때마다 실행 (chatActive는 제외)

  const handleTranscript = (
    transcript: { speaker: number; text: string }[]
  ) => {
    if (transcript.length === 0) return; // 🔥 대화 내용이 없으면 활성화 X

    const SPEAKER_MAP = ["A", "B", "C", "D", "E"];
    const speakerMapping: { [key: number]: string } = {};
    let assignedCount = 0;

    const formattedMessages: Message[] = transcript.map((msg) => {
      if (!(msg.speaker in speakerMapping)) {
        if (assignedCount < SPEAKER_MAP.length) {
          speakerMapping[msg.speaker] = SPEAKER_MAP[assignedCount];
          assignedCount++;
        } else {
          speakerMapping[msg.speaker] = "E";
        }
      }

      return {
        speaker: msg.speaker,
        text: msg.text,
      };
    });

    setMessages(formattedMessages);
    setChatActive(true); // 🔥 Chat이 활성화되었음을 설정 (하지만 실행되지 않음)
  };

  return (
    <MainStyled>
      <TitleAnimation>EchoMind</TitleAnimation>
      <AudioProcessor onTranscript={handleTranscript} />

      {/* ✅ Chat이 렌더링되지만, 실행되지 않음 */}
      {chatActive && (
        <Chat
          messages={messages}
          openModal={openModal}
          setOpenModal={setOpenModal}
        />
      )}

      {/* ✅ openModal이 true일 때만 Summary 실행 */}
      {openModal && <Summary messages={messages} setOpenModal={setOpenModal} />}
    </MainStyled>
  );
};

export default Main;
