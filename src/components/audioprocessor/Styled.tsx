import styled from 'styled-components';

export const Button = styled.button`
  border: none;
  padding: 10px;
  color: #fff;
  border-radius: 10px;
  background-color: #7c3aed;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
  cursor: pointer;
  box-sizing: border-box;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
  &:hover {
    background-color: #573396;
  }
`;

export const FileForm = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  max-width: 400px;
  .fileUploadlabel {
    font-size: 14px;
    color: #fff;
    background: #2e2e3e;
    box-sizing: border-box;
    height: 40px;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 120px;
    &:hover {
      background: #7f7f7f;
    }
  }

  /* 숨겨진 기본 파일 입력 필드 */
  input[type='file'] {
    display: none;
  }
`;
