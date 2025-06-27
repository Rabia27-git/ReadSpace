import axios from "axios";
import Comments from "./chats/Comments.jsx"; 
import {FaUser} from "react-icons/fa";
import { useState,useEffect } from "react";
import {useNavigate} from "react-router-dom"

const Club = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [clubs, setClubs] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await axios.get("http://localhost:3000/clubs");
        setClubs(res.data);
      } catch (err) {
        console.log("Error fetching clubs:", err);
      }
    };

    const fetchJoinedClubs = async () => {
      if (!userId) return;

      try {
        const res = await axios.get(
          `http://localhost:3000/users/${userId}/joined-clubs`
        );
        setJoinedClubs(res.data.joinedClubs || []);
      } catch (error) {
        console.log("Error fetching joined clubs:", error);
      }
    };

    fetchClubs();
    fetchJoinedClubs();
  }, [userId]);

  const handleJoinClub = async (club) => {
    if (!userId) return alert("Please log in");

    try {
      const res = await axios.post(
        `http://localhost:3000/users/${userId}/join-club/${club._id}`
      );
      setJoinedClubs(res.data.joinedClubs);
    } catch (error) {
      console.log("Error joining club:", error);
    }
  };

  const openChat = (club) => {
    setSelectedClub(club);
  };

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #f5e0c0,#c9e2f4)",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
          background: "linear-gradient(to right, #f5e0c0,#c9e2f4)",
          borderBottom: "1px solid #ccc",
          borderRadius: "0 0 10px 10px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "38px", fontWeight: "bold" }}>
          Clubs Page
        </h1>

        <input
          type="text"
          placeholder="Search your club"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            width: "250px",
          }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#154577",
              color: "#fff",
              border: "none",
              borderRadius: "50px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize:"20px"
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/Profile")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#154577",
              color: "#fff",
              border: "none",
              borderRadius: "50px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize:"20px"
            }}
          >
            <span style={{ marginRight: "5px" }}><FaUser/></span> Profile
          </button>
        </div>
      </div>

      {/* Main content: club cards and joined clubs/chat */}
      <div style={{ display: "flex", marginTop: "20px" }}>
        {/* Club Cards */}
        <div
          style={{ flex: 3, display: "flex", flexWrap: "wrap", gap: "20px" }}
        >
          {filteredClubs.map((club) => (
            <div
              key={club._id}
              style={{
                background: "#fff",
                padding: "15px",
                borderRadius: "8px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                width: "250px",
                minHeight: "380px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <img
                src={`http://localhost:3000/images/${club.imag}`}
                alt={club.name}
                style={{ width: "100%", borderRadius: "5px" }}
              />
              <h2 style={{ margin: "0 0 10px" }}>{club.name}</h2>
              <p style={{ margin: 0 }}>{club.description}</p>
              <p>
                <strong>Members:</strong> {club.memb || 0}
              </p>

              <button
                onClick={() => handleJoinClub(club)}
                style={{
                  marginTop: "auto",
                  padding: "6px 12px",
                  backgroundColor: "#154577",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Join
              </button>
            </div>
          ))}
        </div>

        {/* Joined Clubs + Chat */}
        <div
          style={{
            flex: 1.2,
            marginLeft: "20px",
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            padding: "15px",
            display: "flex",
            flexDirection: "column",
            maxHeight: "80vh",
          }}
        >
          <h3 style={{ textAlign: "center" }}>Joined Clubs</h3>

          {/* Wrapper that takes remaining vertical space and splits it between list & chat */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            
            {/* Joined Clubs List - scrollable only if needed */}
            <div
              style={{
                flexShrink: 1,
                overflowY: "auto",
                maxHeight: selectedClub ? "calc(100% - 220px)" : "100%", // leave space for chat if selected
                marginBottom: "10px",
              }}
            >
              {joinedClubs.length === 0 && <p>No clubs joined yet.</p>}
              {joinedClubs.map((club) => (
                <div
                  key={club._id}
                  onClick={() => openChat(club)}
                  style={{
                    cursor: "pointer",
                    padding: "8px",
                    borderBottom: "1px solid #eee",
                    fontSize: "19px",
                    background:
                      selectedClub && selectedClub._id === club._id
                        ? "#444"
                        : "transparent",
                    color:
                      selectedClub && selectedClub._id === club._id
                        ? "#fff"
                        : "#000",
                    borderRadius: "5px",
                  }}
                >
                  {club.name}
                </div>
              ))}
            </div>

            {/* Chat Box - fixed height */}
            {selectedClub && (
              <div
                style={{
                  flexShrink: 0,
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  padding: "10px",
                  height: "250px",
                  overflowY: "auto",
                }}
              >
                <Comments
                  userId={userId}
                  clubId={selectedClub._id}
                  clubName={selectedClub.name}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Club;
