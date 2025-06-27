import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const navigate = useNavigate();



  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.log("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleChangePassword = async () => {
    const userId = localStorage.getItem("userId");
    if (!newPassword) return alert("Please enter a new password");

    
    try {
      await axios.put(`http://localhost:3000/users/${userId}/changePassword`, {
        newPassword
      });
      alert("Password updated successfully!");
      setNewPassword("");
      setChangePasswordMode(false);
    } catch (error) {
      alert("Failed to update password");
    }
  };

  if (!user) return <div>Loading...</div>;

  const totalBooks =
    (user.books?.wantToRead?.length || 0) +
    (user.books?.inProgress?.length || 0) +
    (user.books?.finished?.length || 0);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(to right, #f5e0c0, #c9e2f4)"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
        width: "350px",
        textAlign: "center"
      }}>
        <h2>User Profile</h2>
        <p><strong>Name:</strong> {user.fullName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Join Date:</strong> {new Date(user.joinDate).toLocaleDateString()}</p>
        <p><strong>Total Books:</strong> {totalBooks}</p>

        {changePasswordMode ? (
          <div style={{ marginBottom: "15px" }}>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                padding: "10px",
                width: "100%",
                marginBottom: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc"
              }}
            />
            <button
              onClick={handleChangePassword}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                backgroundColor: "#2ecc71",
                color: "white",
                border: "none",
                marginBottom: "10px"
              }}
            >
              Submit
            </button>
          </div>
        ) : (
          <button
            onClick={() => setChangePasswordMode(true)}
            style={{
              margin: "10px",
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none"
            }}
          >
            Change Password
          </button>
        )}

        <button
          onClick={handleLogout}
          style={{
            margin: "10px",
            padding: "10px 20px",
            borderRadius: "8px",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
