import React, { useEffect, useState } from "react";
import { useUser } from "./UserContext"; // Import UserContext

import medal1 from "./images/medal1.png";
import medal2 from "./images/medal2.png";
import medal3 from "./images/medal3.png";

// Define the fixed color sequence for the first 10 users
const fixedColors = [
  "#2ECC71", // Green
  "#9B59B6", // Purple
  "#8B4513", // Brown
  "#E74C3C", // Red
  "#000000", // Black
  "#2ECC71", // Green
  "#9B59B6", // Purple
  "#8B4513", // Brown
  "#E74C3C", // Red
  "#000000", // Black
];

// Define the color for all other users
const defaultColor = "#FFC300"; // Yellow

const LeaderboardPage: React.FC = () => {
  const { userID } = useUser(); // Access userID from UserContext

  const [ownRanking, setOwnRanking] = useState({
    username: "",
    totalgot: 0,
    position: 0
  });

  const [leaderboardData, setLeaderboardData] = useState<
    Array<{ username: string; totalgot: number; position: number }>
  >([]);
  const [totalUsers, setTotalUsers] = useState("0");

  // Function to save data to localStorage
  const saveToLocalStorage = (key: string, value: any) => {
    const data = {
      value,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Function to retrieve data from localStorage
  const getFromLocalStorage = (key: string, expiry: number = 5 * 60 * 1000) => {
    const dataString = localStorage.getItem(key);
    if (!dataString) return null;

    const data = JSON.parse(dataString);
    const now = new Date().getTime();

    // Check if data is not expired
    if (now - data.timestamp > expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return data.value;
  };

  // Function to get a color for each user based on their position
  const getColorForPosition = (index: number, username: string): string => {
    // If the user is the current user, highlight with yellow
    if (username === ownRanking.username) {
      return "#FFC300"; // Yellow for current user
    }
    // Use fixed colors for the first 10 positions; use yellow for the rest
    return index < 10 ? fixedColors[index] : defaultColor;
  };

  useEffect(() => {
    // Load leaderboard data from localStorage if available
    const storedLeaderboardData = getFromLocalStorage("leaderboardData");
    const storedOwnRanking = getFromLocalStorage("ownRanking");
    const storedTotalUsers = getFromLocalStorage("totalUsers");

    if (storedLeaderboardData) {
      setLeaderboardData(storedLeaderboardData);
    }
    if (storedOwnRanking) {
      setOwnRanking(storedOwnRanking);
    }
    if (storedTotalUsers) {
      setTotalUsers(storedTotalUsers);
    }

    // Fetch latest leaderboard data from the server
    const fetchLeaderboardData = async () => {
      try {
        const initData = window.Telegram.WebApp.initData || ""; // Get initData from Telegram WebApp
        const response = await fetch(
          `https://lionsbackend.lionsgangbot.com/get_user_ranking?UserId=${userID}`,
          {
            headers: {
              "X-Telegram-Init-Data": initData // Add initData to headers
            }
          }
        );

        const data = await response.json();

        console.log(data)

        if (data.requested_user) {
          const userRanking = {
            username: data.requested_user.username,
            totalgot: data.requested_user.totalgot,
            position: data.requested_user.position
          };
          setOwnRanking(userRanking);
          saveToLocalStorage("ownRanking", userRanking);
        }

        if (data.top_users) {
          const formattedLeaderboardData = data.top_users.map((user: any) => ({
            username: user.username,
            totalgot: user.totalgot,
            position: user.rank
          }));
          setLeaderboardData(formattedLeaderboardData);
          saveToLocalStorage("leaderboardData", formattedLeaderboardData);
        }

        if (data.total_users) {
          setTotalUsers(data.total_users);
          saveToLocalStorage("totalUsers", data.total_users);
        }
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    fetchLeaderboardData();
  }, [userID]);

  return (
    <div className="relative text-white z-10 ">
      {/* Added pb-24 for bottom padding */}
      <div className="flex flex-col items-center pt-5 h-[94vh] overflow-y-scroll hide-scrollbar pb-16">
        <h1 className="text-2xl font-bold mb-6 text-[Poppins] text-center w-full text-white">
          Telegram Wall of Fame
        </h1>
        <div className=" w-11/12  rounded-2xl flex items-center justify-between px-4 py-3 mb-10  bg-black/85 border border-gray-300/30">
          <div className="flex items-center">
            <div
              className="rounded-full w-14 h-14 flex items-center justify-center text-lg font-bold text-white"
              style={{ backgroundColor: getColorForPosition(-1, ownRanking.username) }}
            >
              {ownRanking.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="ml-4">
              <p className="text-md font-semibold text-white text-[Poppins]">
                {ownRanking.username}
              </p>
              <p className="text-sm text-[sans-serif] text-gray-200">
                {ownRanking.totalgot.toLocaleString()} Lions
              </p>
            </div>
          </div>
          <p className="text-base font-semibold text-white">#{ownRanking.position}</p>
        </div>
        <div className="px-4 flex justify-start items-start w-full">
          <h1 className="text-[22px] text-white font-[sans-serif] w-full">47.2M holders</h1>
        </div>
        <div className="w-11/12">
          <p className="text-xl font-bold">{totalUsers} holders</p>
          {leaderboardData.map((user, index) => (
            <div
              key={index}
              className="flex items-center justify-between border border-gray-300/30 mb-3 p-2 rounded-lg text-white"
            >
              <div className="flex items-center">
                <div
                  className="rounded-full w-10 h-10 flex items-center justify-center"
                  style={{ backgroundColor: getColorForPosition(index, user.username) }}
                >
                  <h1 className="font-[Poppins] font-semibold text-white">
                    {user.username.slice(0, 2).toUpperCase()}
                  </h1>
                </div>
                <div className="ml-4">
                  <p className="font-bold text-sm">{user.username}</p>
                  <p className="text-gray-400 text-sm">{user.totalgot.toLocaleString()} LIONS</p>
                </div>
              </div>
              {index + 1 > 3 ? (
                <p className="text-white text-sm">#{index + 1}</p>
              ) : index + 1 === 1 ? (
                <div>
                  <img src={medal1} alt="Medal1" height={17} width={17} />
                </div>
              ) : index + 1 === 2 ? (
                <div>
                  <img src={medal2} alt="Medal2" height={17} width={17} />
                </div>
              ) : (
                <div>
                  <img src={medal3} alt="Medal3" height={17} width={17} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
