import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSse } from "../context/SseContext";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [roomId, setRoomId] = useState("");
  const [lanes, setLanes] = useState(4);
  const navigate = useNavigate();
  const { connect, disconnect, messages, error, isConnected } = useSse();

  const handleCreateRoom = async () => {
    if (!nickname || lanes < 2 || lanes > 10) return;

    const bodyData = { nickname, lanes };
    try {
      const res = await fetch("http://localhost:9090/create/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const { roomId, winRailNo } = await res.json();
      console.log("당첨 레인:", winRailNo);

      if (roomId) {
        // 방 ID를 기반으로 SSE 연결 시작
        setRoomId(roomId);
        connect(roomId);
        // if (isConnected) {
        //console.log(isConnected);
        navigate(`/game/${roomId}?playerId=${roomId}&nickname=${nickname}`);
        //}
      }
    } catch (error) {
      console.error("방 생성 오류:", error);
    }
  };

  // 방 참여 함수
  const handleJoinRoom = async () => {
    if (!nickname || !roomId) return; // 방 ID와 닉네임이 있어야 참여 가능

    const bodyData = { roomId, nickname };
    try {
      const res = await fetch("http://localhost:9090/join/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const message = await res.json();
      console.log(message); // 방 참여 성공 메시지
      // 방에 참여한 후 추가 작업 (예: 게임 화면으로 이동)
      if (res.ok) {
        connect(roomId);
        navigate(`/game/${roomId}?playerId=${roomId}&nickname=${nickname}`);
      }
    } catch (error) {
      console.error("방 참여 오류:", error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
      }}>
      <div
        style={{
          padding: "1.5rem",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          maxWidth: "28rem",
          width: "100%",
        }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: "#1f2937",
          }}>
          사다리타기 게임
        </h1>
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              color: "#4b5563",
              marginBottom: "0.25rem",
            }}>
            닉네임
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
              outline: "none",
              boxShadow: "0 0 0 2px transparent",
              transition: "box-shadow 0.2s",
            }}
            placeholder="닉네임 입력"
            onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #8b5cf6")}
            onBlur={(e) => (e.target.style.boxShadow = "0 0 0 0 transparent")}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              color: "#4b5563",
              marginBottom: "0.25rem",
            }}>
            참여 인원수 (2~10)
          </label>
          <input
            type="number"
            value={lanes}
            onChange={(e) => setLanes(Number(e.target.value))}
            min="2"
            max="10"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
              outline: "none",
              boxShadow: "0 0 0 2px transparent",
              transition: "box-shadow 0.2s",
            }}
            onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #8b5cf6")}
            onBlur={(e) => (e.target.style.boxShadow = "0 0 0 0 transparent")}
          />
        </div>
        <button
          onClick={() => {
            handleCreateRoom();
          }}
          style={{
            width: "100%",
            padding: "0.5rem 1rem",
            backgroundColor: "#8b5cf6",
            color: "white",
            borderRadius: "0.375rem",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.3s",
            opacity: !nickname || lanes < 2 || lanes > 10 ? 0.5 : 1,
          }}
          disabled={!nickname || lanes < 2 || lanes > 10}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#7c3aed")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#8b5cf6")}>
          방 생성
        </button>

        <button
          onClick={handleJoinRoom}
          style={{
            width: "100%",
            padding: "0.5rem 1rem",
            backgroundColor: "#34d399",
            color: "white",
            borderRadius: "0.375rem",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.3s",
            opacity: !nickname || !roomId ? 0.5 : 1,
          }}
          disabled={!nickname || !roomId}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#10b981")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#34d399")}>
          방 참여
        </button>
      </div>
    </div>
  );
}
