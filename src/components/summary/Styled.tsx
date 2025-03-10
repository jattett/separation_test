import styled from "styled-components";

export const ModalContainer = styled.div`
  padding: 20px;
  border: 1px solid rgb(221, 221, 221);
  border-radius: 10px;
  position: fixed;
  width: 80vw;
  height: 80vh;
  max-width: 700px;
  background-color: #fff;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  color: #000;
  overflow: auto;
  font-size: 14px;
  background: rgb(138, 138, 236);
  display: flex;
  flex-direction: column;

  /* 중앙 정렬 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 15px;
  h3 {
    margin-bottom: 10px;
    color: #fff;
    font-weight: 700;
    font-size: 24px;
  }
  .chart-wrapper {
    background-color: #fff;
    border-radius: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    &.v2 {
      margin-top: 30px;
      min-height: 50vh;
      justify-content: center;
      align-items: center;
    }
  }

  .result-area {
    background-color: #fff;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    h4 {
      font-size: 16px;
    }
    ul {
      margin-top: 0px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 14px;
      h4 {
        font-weight: 700;
      }
      li {
        margin-left: 10px;
        &:first-child {
          margin-top: 10px;
        }
      }
    }
  }
`;

/* 🔥 클로즈 버튼 스타일 */
export const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #fff;
  transition: all 0.3s;

  &:hover {
    color: red;
    background-color: transparent;
  }
`;
