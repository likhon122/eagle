import React, { useEffect, useState } from "react";
import { BsLightningChargeFill } from "react-icons/bs";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { Toaster } from "react-hot-toast";
import { BiLogoTelegram } from "react-icons/bi";
import { BsTwitterX } from "react-icons/bs";
import { FaWallet, FaUserFriends, FaYoutube } from "react-icons/fa";
import { FaRankingStar } from "react-icons/fa6";
import { IoHome } from "react-icons/io5";
import { TfiGift } from "react-icons/tfi";
import "./App.css";
import DailyReward from "./DailyReward";
import FriendsPage from "./Friends";
import { Logo } from "./images"; // Added 'tonIcon'
import doneIcon from "./images/done.png";
import tonIcon from "./images/ton.png"; // Ensure this path is correct
import Leaderboard from "./Leaderboard";
import LoadingScreen from "./LoadingScreen";
import Modal from "./Modal";
import OverlayPage from "./overlaypage";
import { useUser } from "./UserContext";
import Airdrop from "./Airdrop";

declare const Telegram: any;

// Interface for TaskItem component props
interface TaskItemProps {
  icon?: React.ReactNode | string;
  title: string;
  reward?: number;
  requiredFriends?: number; // New prop to define required number of friends
  status?: "not_started" | "loading" | "claimable" | "completed";
  onClick?: () => void;
  onClaim?: () => void;
}

// TaskItem Component: Represents each task in the UI
const TaskItem: React.FC<TaskItemProps> = ({
  icon,
  title,
  reward,
  requiredFriends,
  onClick,
  onClaim,
  status = "not_started"
}) => {
  return (
    <div
      onClick={status === "not_started" && onClick ? onClick : undefined}
      className={`text-white flex items-center justify-between border border-gray-300/30 bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-xl p-2 mb-3 shadow-lg transition-shadow duration-300 ${
        status === "not_started" ? "cursor-pointer hover:shadow-2xl" : ""
      } ${status === "completed" ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {icon ? (
        <div className="flex items-center gap-2">
          <div>
            {typeof icon === "string" ? (
              <img className="h-12 w-12" src={icon} alt={title} />
            ) : (
              <div className="text-[22px] px-[8px] rounded-lg py-2 text-black bg-white">
                {icon}
              </div>
            )}
          </div>
          <div className="text-white">
            <div className="font-bold text-sm text-white">{title}</div>
            {requiredFriends !== undefined && (
              <div className="flex items-center text-xs text-gray-500 mt-1">
                Requires {requiredFriends} Friend
                {requiredFriends > 1 ? "s" : ""}
              </div>
            )}
            {reward !== undefined && (
              <div className="flex items-center text-xs text-gray-400 mt-1">
                +{reward} LION{reward !== 1 ? "S" : ""}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <div className="text-white">
            <div className="font-bold text-sm">{title}</div>
            {requiredFriends !== undefined && (
              <div className="flex items-center text-xs text-gray-500 mt-1">
                Requires {requiredFriends} Friend
                {requiredFriends > 1 ? "s" : ""}
              </div>
            )}
            {reward !== undefined && (
              <div className="flex items-center text-xs text-gray-700 mt-1">
                +{reward} LION{reward !== 1 ? "S" : ""}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="text-gray-300">
        {status === "completed" && (
          <img src={doneIcon} alt="Done" className="w-6 h-6" />
        )}
        {status === "loading" && <div className="loader"></div>}
        {status === "claimable" && onClaim && (
          <button
            onClick={onClaim}
            className="bg-green-500 text-white px-4 py-1 rounded-full hover:bg-green-600 transition-colors duration-300"
          >
            Claim
          </button>
        )}
        {status === "not_started" && reward !== undefined && (
          <>
            <button
              className={`flex items-center justify-center text-white sm:px-4 rounded-full`}
            >
              {title === "Join Telegram channel" ||
              title === "Join our Telegram Group" ? (
                <div className="text-xs bg-gray-200/40 text-white w-[50px] py-1 rounded-full">
                  Join
                </div>
              ) : title === "Follow on X" ? (
                <div className="bg-gray-200/40 text-white w-[50px] py-1 rounded-full flex items-center justify-center">
                  <BsTwitterX size={14} />
                </div>
              ) : title === "Make TON Great Again" ? (
                <img src={tonIcon} alt="TON" className="w-8 h-8" />
              ) : (
                <BsLightningChargeFill className="w-8 h-8" />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const {
    points,
    setPoints,
    userID,
    setUserID,
    setWalletAddress,
    walletid // Added walletid from useUser
  } = useUser();
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<{
    [key: string]: "not_started" | "loading" | "claimable" | "completed";
  }>({});
  const [refertotal, setRefertotal] = useState<number>(0); // Updated: Numeric state for Refertotal
  const [showOverlayPage, setShowOverlayPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("home");
  const [userAdded, setUserAdded] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);

  // New state variable to track if daily reward is available
  const [dailyRewardAvailable, setDailyRewardAvailable] = useState(false);

  // State for fetched tasks
  const [fetchedTasks, setFetchedTasks] = useState<any[]>([]);

  // New state variable to track the current task segment
  const [taskSegment, setTaskSegment] = useState<"LIONS" | "additional">(
    "LIONS"
  );

  // New state to track if wallet connection is being initiated for a specific task
  const [connectingForTask, setConnectingForTask] = useState<string | null>(
    null
  );

  const closeModal = () => setModalMessage(null);

  const closeOverlay = () => {
    setShowOverlayPage(false);
    if (dailyRewardAvailable) {
      setShowDailyReward(true);
    }
  };

  const showAlert = (message: string) => {
    setModalMessage(message);
  };

  const [lastSavedPoints, setLastSavedPoints] = useState<number>(points);

  // Helper function to convert TON to Nanoton
  const tonToNanoton = (value: string): string => {
    if (value !== "") {
      return (parseFloat(value) * 1e9).toString();
    } else return "";
  };

  // Transaction object
  const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 360,
    messages: [
      {
        address: "UQBFS7y8T9aoGXaWXPBFLX_Gw9s-Zp3fj9nxVON6SnRYInMs", // Receiver's wallet address
        amount: tonToNanoton("0.1") // Amount in TON
      }
    ]
  };

  // Function to save points to the backend
  const savePoints = async () => {
    if (!userID) return;
    const initData = window.Telegram.WebApp.initData || "";

    try {
      await fetch("https://lionsbackend.lionsgangbot.com/update_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Init-Data": initData
        },
        body: JSON.stringify({ UserId: userID, totalgot: points })
      });
      console.log("Points saved:", points);
      setLastSavedPoints(points);
    } catch (error) {
      console.error("Failed to save points:", error);
      showAlert("Failed to save points. Please check your connection.");
    }
  };

  // Effect to save points when they change
  useEffect(() => {
    if (points !== lastSavedPoints) {
      savePoints();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  // Function to handle the new Transaction task
  const handleTransactionClick = async (reward: number) => {
    if (!walletid) {
      showAlert("Connect wallet first"); // Replaced 'showModal' with 'showAlert'
      return;
    }
    try {
      const res = await tonConnectUI.sendTransaction(transaction);
      if (res) {
        setTaskStatus((prevState) => ({
          ...prevState,
          Transaction: "completed"
        }));

        // Optionally, you can persist task status to localStorage or backend
        // Here, it's assumed that the backend will handle task status

        setPoints((prevPoints) => prevPoints + reward); // Reward points for task completion
        showAlert("Transaction was successful! You've earned 10,000 Lions.");
        console.log("Transaction was successful");
      }
    } catch (error) {
      console.log("Transaction failed");
      showAlert("Transaction failed. Please try again.");
    }
  };

  // Effect to handle wallet connection status changes
  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        console.log("wallet info: ", wallet);
        // Check if the connection was initiated for the "Connect TON wallet" task
        if (connectingForTask === "task2") {
          // Wallet connected successfully for "Connect TON wallet" task
          saveTaskCompletion("task2", "task2", 1000);
          setConnectingForTask(null);
        }
      } else {
        // Wallet disconnected
        if (connectingForTask === "task2") {
          // If the user was trying to connect for "Connect TON wallet" task
          showAlert("Connect wallet first.");
          setConnectingForTask(null);
        }
      }
    });
    return () => unsubscribe();
  }, [tonConnectUI, connectingForTask]);

  // Effect to set wallet address
  useEffect(() => {
    setWalletAddress(address);
  }, [address, setWalletAddress]);

  // Effect to initialize Telegram WebApp and fetch/add user
  useEffect(() => {
    const initializeTelegram = async () => {
      if (typeof Telegram === "undefined" || !Telegram.WebApp) {
        console.error("Telegram WebApp is not available.");
        showAlert(
          "Telegram WebApp is not available. Please use Telegram to access this app."
        );
        setLoading(false);
        return;
      }

      try {
        Telegram.WebApp.ready();
        const initDataUnsafe = Telegram.WebApp.initDataUnsafe;

        if (!initDataUnsafe || !initDataUnsafe.user) {
          throw new Error("Incomplete Telegram initData.");
        }

        const user = {
          username: initDataUnsafe.user.username || "Default Username",
          userid: initDataUnsafe.user.id
            ? initDataUnsafe.user.id.toString()
            : "",
          startparam: initDataUnsafe.start_param || ""
        };

        if (!user.userid) {
          throw new Error("User ID is missing.");
        }

        setUserID(user.userid);
        await fetchOrAddUser(user.userid, user.startparam, user.username);
      } catch (error) {
        console.error("Initialization error:", error);
        showAlert("Failed to initialize user. Please refresh and try again.");
        setLoading(false);
      }
    };

    initializeTelegram();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Function to fetch or add user based on existence in the backend
  const fetchOrAddUser = async (
    userid: string,
    startparam: string,
    username: string
  ) => {
    try {
      const initData = window.Telegram.WebApp.initData || "";

      const response = await fetch(
        `https://lionsbackend.lionsgangbot.com/get_user?UserId=${userid}`,
        {
          headers: {
            "X-Telegram-Init-Data": initData
          }
        }
      );
      if (response.ok) {
        console.log("User exists in the database.");
        const data = await response.json();
        await loadPoints(userid);
        loadTaskStatus(data);
        setShowOverlayPage(false); // User exists, no need to show overlay
        setUserAdded(false); // User already exists
      } else if (response.status === 404) {
        // User not found, add the user
        await addUser(userid, startparam, username);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("fetchOrAddUser error:", error);
      showAlert(
        "An error occurred while fetching user data. Please try again."
      );
      setLoading(false);
    }
  };

  // Function to add a new user to the backend
  const addUser = async (
    userid: string,
    startparam: string,
    username: string
  ) => {
    const invitedBy = !startparam || userid === startparam ? null : startparam;
    const initData = window.Telegram.WebApp.initData || "";

    try {
      const response = await fetch(
        "https://lionsbackend.lionsgangbot.com/add_user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": initData
          },
          body: JSON.stringify({
            UserId: userid,
            invitedby: invitedBy || undefined,
            Username: username
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add user: ${response.status}`);
      }

      console.log("User added");
      setUserAdded(true); // Indicate that the user has been added
      setShowOverlayPage(true);
      setLoading(false);
    } catch (error) {
      console.error("Error adding user:", error);
      showAlert(
        "Failed to add user. Please check your connection and try again."
      );
      setLoading(false);
    }
  };

  // Function to load user points from the backend
  const loadPoints = async (userid: string) => {
    const initData = window.Telegram.WebApp.initData || "";

    try {
      const response = await fetch(
        `https://lionsbackend.lionsgangbot.com/get_user?UserId=${userid}`,
        {
          headers: {
            "X-Telegram-Init-Data": initData
          }
        }
      );
      const data = await response.json();
      if (data && data.data && data.data.totalgot !== undefined) {
        setPoints(data.data.totalgot);
        setLastSavedPoints(data.data.totalgot);
      } else {
        console.warn("No points data found.");
      }
    } catch (error) {
      console.error("Failed to load points:", error);
      showAlert("Failed to load points. Please check your connection.");
    }
  };

  // Function to load task statuses from the backend
  const loadTaskStatus = (data: any) => {
    // Log data to verify structure
    console.log("User data:", data);

    const updatedTaskStatus: { [key: string]: "not_started" | "completed" } = {
      // Predefined tasks
      task1: data.data.task1 === "Done" ? "completed" : "not_started", // Join Lions TG channel
      task2: data.data.task2 === "Done" ? "completed" : "not_started", // Connect TON wallet
      X: data.data.X === "Done" ? "completed" : "not_started", // Follow Lions on X
      task7: data.data.task7 === "Done" ? "completed" : "not_started", // Follow Our CEO on X
      youtube: data.data.youtube === "Done" ? "completed" : "not_started", // Subscribe To Lions YT
      task14: data.data.task14 === "Done" ? "completed" : "not_started", // Subscribe To Our CEO YT
      task10: data.data.task10 === "Done" ? "completed" : "not_started", // Invite 1 Friend
      task11: data.data.task11 === "Done" ? "completed" : "not_started", // Invite 5 Friends
      task12: data.data.task12 === "Done" ? "completed" : "not_started", // Invite 10 Friends
      task17: data.data.task17 === "Done" ? "completed" : "not_started" // Make TON Great Again
    };

    setTaskStatus((prevStatus) => ({
      ...prevStatus,
      ...updatedTaskStatus
    }));

    // Set refertotal as a numeric value
    const refertotalValue = parseInt(data.data.Refertotal, 10);
    setRefertotal(isNaN(refertotalValue) ? 0 : refertotalValue);
  };

  // Function to mark task as completed and reward points
  const saveTaskCompletion = async (
    taskKey: string,
    column: string,
    reward: number
  ) => {
    const initData = window.Telegram.WebApp.initData || "";

    try {
      const response = await fetch(
        "https://lionsbackend.lionsgangbot.com/update_user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": initData
          },
          body: JSON.stringify({ UserId: userID, [column]: "Done" })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }

      setTaskStatus((prevState) => ({
        ...prevState,
        [taskKey]: "completed"
      }));

      setPoints((prevPoints) => prevPoints + reward);
      showAlert(`Thank you! You have earned ${reward} Lions.`);
    } catch (error) {
      console.error(`Failed to complete task ${taskKey}:`, error);
      showAlert(
        "An error occurred while completing the task. Please try again later."
      );
    }
  };

  // Function to extract chat ID from a Telegram link
  const extractChatId = (link: string): string => {
    const parts = link.split("/");
    const lastPart = parts[parts.length - 1];
    return "@" + lastPart;
  };

  // Function to handle Telegram-related tasks (e.g., joining a channel)
  const handleTelegramTaskClick = async (taskKey: string, link: string) => {
    window.open(link, "_blank");

    const chatId = extractChatId(link);
    const userId = userID;

    setTaskStatus((prevState) => ({
      ...prevState,
      [taskKey]: "loading"
    }));

    setTimeout(async () => {
      const initData = window.Telegram.WebApp.initData || "";

      try {
        const response = await fetch(
          `https://lionsbackend.lionsgangbot.com/check_telegram_status?user_id=${userId}&chat_id=${chatId}`,
          {
            headers: {
              "X-Telegram-Init-Data": initData
            }
          }
        );
        const data = await response.json();

        if (data.status === "1") {
          setTaskStatus((prevState) => ({
            ...prevState,
            [taskKey]: "claimable"
          }));
        } else {
          setTaskStatus((prevState) => ({
            ...prevState,
            [taskKey]: "not_started"
          }));
          showAlert("Not found, please try again.");
        }
      } catch (error) {
        console.error("Error checking Telegram status:", error);
        setTaskStatus((prevState) => ({
          ...prevState,
          [taskKey]: "not_started"
        }));
        showAlert("An error occurred. Please try again.");
      }
    }, 6000); // 6 seconds delay
  };

  // Function to handle generic task clicks (e.g., following on X)
  const handleTaskClick = (taskKey: string, link: string) => {
    window.open(link, "_blank");

    setTaskStatus((prevState) => ({
      ...prevState,
      [taskKey]: "loading"
    }));

    setTimeout(() => {
      setTaskStatus((prevState) => ({
        ...prevState,
        [taskKey]: "claimable"
      }));
    }, 5000); // 5 seconds delay
  };

  // Function to handle claiming a task's reward
  const handleTaskClaim = (taskKey: string, column: string, reward: number) => {
    saveTaskCompletion(taskKey, column, reward);
  };

  // Function to handle connecting the TON wallet task
  const handleConnectWalletTask = () => {
    if (address) {
      // Wallet is already connected, reward the user instantly
      saveTaskCompletion("task2", "task2", 1000);
    } else {
      // Wallet is not connected, initiate the connection process
      setConnectingForTask("task2"); // Set the task we're connecting for
      tonConnectUI.connectWallet(); // Trigger the wallet connection UI
      // The reward will be handled in the onStatusChange useEffect upon successful connection
    }
  };

  /**
   * Updated handleInviteFriendsClick:
   * - Accepts required number of friends.
   * - Checks if user's refertotal meets the requirement.
   * - Rewards if condition is met; else shows "Not enough users".
   */
  const handleInviteFriendsClick = async (
    taskKey: string,
    column: string,
    reward: number,
    requiredFriends: number
  ) => {
    if (refertotal < requiredFriends) {
      showAlert("Not Enough Friends");
      return;
    }

    const initData = window.Telegram.WebApp.initData || "";

    try {
      // Update task status in the backend
      const response = await fetch(
        "https://lionsbackend.lionsgangbot.com/update_user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": initData
          },
          body: JSON.stringify({ UserId: userID, [column]: "Done" })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }

      // Update task status locally
      setTaskStatus((prevState) => ({
        ...prevState,
        [taskKey]: "completed"
      }));

      // Reward points
      setPoints((prevPoints) => prevPoints + reward);

      // Optionally, update refertotal if needed
      // Here, you might want to subtract the requiredFriends from refertotal
      // to prevent multiple claims for the same friends.
      // Adjust this logic based on your application's requirements.
      setRefertotal((prev) => prev - requiredFriends); // Deduct the required friends from refertotal

      showAlert(
        `Congratulations! You have completed the Invite ${requiredFriends} Friend${
          requiredFriends > 1 ? "s" : ""
        } task and earned ${reward} Lions.`
      );
    } catch (error) {
      console.error(`Failed to complete ${taskKey} task:`, error);
      showAlert(
        "An error occurred while completing the task. Please try again later."
      );
    }
  };

  // Function to handle fetched tasks (additional tasks)
  const handleFetchedTaskClick = (task: any) => {
    // Check if task is already completed
    if (taskStatus[task.taskid.toString()] === "completed") {
      return; // Do nothing if task is completed
    }

    // Use the link provided by the task to open in a new tab or default to "#"
    const taskLink = task.tasklink || "#";
    window.open(taskLink, "_blank");

    // Set task status to "loading"
    setTaskStatus((prevState) => ({
      ...prevState,
      [task.taskid.toString()]: "loading"
    }));

    // Simulate an asynchronous operation to make the task claimable
    setTimeout(() => {
      setTaskStatus((prevState) => ({
        ...prevState,
        [task.taskid.toString()]: "claimable"
      }));
    }, 5000); // Adjust the delay as needed
  };

  // Function to handle claiming fetched tasks' rewards
  const handleFetchedTaskClaim = async (task: any) => {
    try {
      const initData = window.Telegram.WebApp.initData || "";

      // First API call: Mark task as done
      const markDoneResponse = await fetch(
        "https://lionsbackend.lionsgangbot.com/mark_task_done",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": initData
          },
          body: JSON.stringify({
            userid: userID,
            taskid: task.taskid
          })
        }
      );

      const markDoneData = await markDoneResponse.json();

      if (!markDoneResponse.ok) {
        console.log(
          "Warning: Failed to mark task as done. Proceeding with increasing points."
        );
      } else if (
        !markDoneData.success &&
        markDoneData.message !== "Task marked as done for existing user" &&
        markDoneData.message !== "Task already marked as done"
      ) {
        console.log(
          "Warning: Task already marked as done or other non-critical issue."
        );
      }

      // Second API call: Increase total points (totalgot)
      const increasePointsResponse = await fetch(
        "https://lionsbackend.lionsgangbot.com/increase_totalgot",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": initData
          },
          body: JSON.stringify({
            UserId: userID,
            Amount: task.taskreward
          })
        }
      );

      const increasePointsData = await increasePointsResponse.json();

      if (
        !increasePointsResponse.ok ||
        !increasePointsData.totalgot ||
        !increasePointsData.message.includes("Total got updated successfully")
      ) {
        throw new Error(
          "Failed to increase points. Backend response indicates failure."
        );
      }

      // Update task status to completed if successful
      setTaskStatus((prevStatus) => ({
        ...prevStatus,
        [task.taskid.toString()]: "completed"
      }));

      // Update user's points
      setPoints(increasePointsData.totalgot);

      // Show success alert
      showAlert(
        `You have earned ${task.taskreward} Lions. Your total is now ${increasePointsData.totalgot} Lions.`
      );
    } catch (error) {
      // Enhanced error message for debugging
      console.error("Failed to claim task:", error);
      showAlert(
        "An error occurred while claiming the task. Please try again later."
      );

      // Set task status back to not started only if increasing points failed
      setTaskStatus((prevStatus) => ({
        ...prevStatus,
        [task.taskid.toString()]: "not_started"
      }));
    }
  };

  // Function to check daily reward status
  const checkDailyRewardStatus = async () => {
    try {
      const initData = window.Telegram.WebApp.initData || "";
      const response = await fetch(
        "https://lionsbackend.lionsgangbot.com/gamer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": initData
          },
          body: JSON.stringify({ GamerId: userID })
        }
      );
      if (response.ok) {
        const data = await response.json();
        const startime = data.data.startime;
        if (startime === 0 || startime === null) {
          // Show the daily reward page
          setDailyRewardAvailable(true);
        } else {
          const now = Math.floor(Date.now() / 1000); // Unix time in seconds
          const startDate = new Date(startime * 1000);
          const currentDate = new Date(now * 1000);
          if (
            startDate.getFullYear() !== currentDate.getFullYear() ||
            startDate.getMonth() !== currentDate.getMonth() ||
            startDate.getDate() !== currentDate.getDate()
          ) {
            // Different day, show the daily reward page
            setDailyRewardAvailable(true);
          } else {
            // Same day, don't show the daily reward page
            setDailyRewardAvailable(false);
          }
        }
      } else {
        console.error("Failed to fetch gamer data");
        setDailyRewardAvailable(false);
      }
    } catch (error) {
      console.error("Error fetching gamer data:", error);
      setDailyRewardAvailable(false);
    }
  };

  // Effect to fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      const initData = window.Telegram.WebApp.initData || "";

      try {
        const response = await fetch(
          `https://lionsbackend.lionsgangbot.com/get_user_tasks?userid=${userID}`,
          {
            headers: {
              "X-Telegram-Init-Data": initData
            }
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.status}`);
        }

        const data = await response.json();
        if (data) {
          if (data.task_details) {
            setFetchedTasks(data.task_details);
          }

          // Handle completed tasks
          let completedTasks: number[] = [];
          if (data.completed_tasks) {
            if (Array.isArray(data.completed_tasks)) {
              completedTasks = data.completed_tasks.map((id: any) =>
                parseInt(id, 10)
              );
            } else if (typeof data.completed_tasks === "string") {
              completedTasks = data.completed_tasks
                .split(",")
                .map((id: string) => parseInt(id, 10))
                .filter((id: number) => !isNaN(id));
            } else if (typeof data.completed_tasks === "number") {
              completedTasks = [data.completed_tasks];
            }
          }

          // Initialize task status for fetched tasks
          const newTaskStatus: { [key: string]: "not_started" | "completed" } =
            {};
          data.task_details.forEach((task: any) => {
            newTaskStatus[task.taskid.toString()] = completedTasks.includes(
              task.taskid
            )
              ? "completed"
              : "not_started";
          });

          setTaskStatus((prevStatus) => ({
            ...prevStatus,
            ...newTaskStatus
          }));
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        showAlert("Failed to fetch tasks. Please check your connection.");
      }
    };

    if (userID) {
      fetchTasks();
    }
  }, [userID]);

  // Initial preload effect: Load points and daily reward status
  useEffect(() => {
    const preloadPages = async () => {
      if (userID) {
        console.log(`Loading points and reward status for user ID: ${userID}`);
        await loadPoints(userID);
        await checkDailyRewardStatus();

        setTimeout(() => {
          if (!showOverlayPage && dailyRewardAvailable) {
            console.log("Daily reward available, displaying reward page.");
            setShowDailyReward(true);
          }
          setLoading(false); // Hide loading screen after delay
          console.log("Loading complete, hiding loading screen.");
        }, 2000); // 2-second delay
      } else {
        console.log("No userID set, skipping data preload.");
        setLoading(false);
      }
    };

    preloadPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userID, showOverlayPage, dailyRewardAvailable]);

  // Function to render tasks based on the selected segment
  const renderTasks = () => {
    if (taskSegment === "LIONS") {
      return (
        <>
          <div className="mt-6">
            {/* New Transaction Task at the Top */}
            <TaskItem
              icon={tonIcon}
              title="Make TON Great Again"
              reward={10000}
              status={taskStatus["task17"] || "not_started"}
              onClick={() => handleTransactionClick(10000)}
              onClaim={() => handleTaskClaim("task17", "task17", 10000)}
            />

            <TaskItem
              icon={<BiLogoTelegram />}
              title="Join Telegram channel"
              reward={1000}
              status={taskStatus["task1"] || "not_started"}
              onClick={() =>
                handleTelegramTaskClick(
                  "task1",
                  "https://t.me/lionsgang_channel"
                )
              }
              onClaim={() => handleTaskClaim("task1", "task1", 1000)}
            />

            {/* Task 7: Follow our CEO on X */}
            <TaskItem
              icon={<BsTwitterX />}
              title="Follow on X"
              reward={1000}
              status={taskStatus["task7"] || "not_started"}
              onClick={() =>
                handleTaskClick("task7", "https://x.com/Lions_Telegram")
              }
              onClaim={() => handleTaskClaim("task7", "task7", 1000)}
            />

            {/* Task 14: Subscribe To Our CEO YT */}
            <TaskItem
              icon={<FaYoutube />}
              title="Subscribe to YouTube channel"
              reward={1000}
              status={taskStatus["task14"] || "not_started"}
              onClick={() =>
                handleTaskClick("task14", "https://www.youtube.com/@Lions_Gang")
              }
              onClaim={() => handleTaskClaim("task14", "task14", 1000)}
            />

            {/* Task 2: Connect TON wallet */}
            <TaskItem
              icon={<FaWallet />}
              title="Connect TON wallet"
              reward={3000}
              status={taskStatus["task2"] || "not_started"}
              onClick={handleConnectWalletTask} // Updated onClick handler
              onClaim={() => handleTaskClaim("task2", "task2", 3000)}
            />

            {/* Task 10: Invite 1 Friend */}
            <TaskItem
              icon={<TfiGift />}
              title="Invite 1 Friend"
              reward={1000}
              status={taskStatus["task10"] || "not_started"}
              onClick={() =>
                handleInviteFriendsClick(
                  "task10",
                  "task10",
                  1000,
                  1 // Required friends for this task
                )
              }
              requiredFriends={1}
              onClaim={() => handleTaskClaim("task10", "task10", 1000)}
            />

            {/* Task 11: Invite 5 Friends */}
            <TaskItem
              icon={<TfiGift />}
              title="Invite 5 Friends"
              reward={5000}
              status={taskStatus["task11"] || "not_started"}
              onClick={() =>
                handleInviteFriendsClick(
                  "task11",
                  "task11",
                  5000,
                  5 // Required friends for this task
                )
              }
              requiredFriends={5}
              onClaim={() => handleTaskClaim("task11", "task11", 5000)}
            />

            {/* Task 12: Invite 10 Friends */}
            <TaskItem
              icon={<TfiGift />}
              title="Invite 10 Friends"
              reward={10000}
              status={taskStatus["task12"] || "not_started"}
              onClick={() =>
                handleInviteFriendsClick(
                  "task12",
                  "task12",
                  10000,
                  10 // Required friends for this task
                )
              }
              requiredFriends={10}
              onClaim={() => handleTaskClaim("task12", "task12", 10000)}
            />
          </div>
        </>
      );
    } else if (taskSegment === "additional") {
      return (
        <div className="mt-6 px-4">
          {/* Dynamically Fetched Tasks */}
          {fetchedTasks.length > 0 ? (
            fetchedTasks.map((task) => (
              // Rendering fetched tasks with dynamic icon and fallback
              <TaskItem
                key={task.taskid}
                icon={task.taskimage} // Provide a fallback icon if necessary
                title={task.tasktitle}
                reward={task.taskreward}
                status={taskStatus[task.taskid.toString()] || "not_started"}
                onClick={() => handleFetchedTaskClick(task)}
                onClaim={() => handleFetchedTaskClaim(task)}
              />
            ))
          ) : (
            // Coming Soon Placeholder
            <TaskItem title="Coming Soon.." />
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative flex justify-center min-h-screen bg-black">
      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          {/* Main Content */}
          <div className="relative pt-4 md:pt-16 w-full text-white font-bold flex flex-col max-w-xl">
            {activePage === "home" && (
              <>
                <div className="z-10 pb-20 px-2">
                  {/* Top Box: Smaller Size and Different Shape */}
                  <div className="relative flex flex-col items-center pb-8 pt-4">
                    <div className="absolute right-10 bottom-24 animate-pulse">
                      <img
                        src={Logo}
                        alt="Ghost"
                        className="w-16 md:w-20 h-16 md:h-20 opacity-100"
                      />
                    </div>
                    <div className="absolute left-10 bottom-24 animate-pulse">
                      <img
                        src={Logo}
                        alt="Ghost"
                        className="w-16 md:w-20 h-16 md:h-20 opacity-100"
                      />
                    </div>

                    <img src={Logo} alt="Token Logo" className="w-32 h-32" />

                    {/* Points Display */}
                    <p className="text-2xl mt-2 text-white">
                      {points.toLocaleString()} LIONS
                    </p>
                  </div>

                  {/* Enhanced Segment Switcher */}
                  <div className="flex justify-center mb-4 mt-2">
                    <div className="flex bg-gray-800 rounded-xl overflow-hidden shadow-lg w-full max-w-md">
                      <button
                        className={`flex-1 py-2 px-4 text-center whitespace-nowrap text-sm sm:text-base transition-all duration-300 ${
                          taskSegment === "LIONS"
                            ? "bg-white text-black"
                            : "text-gray-400 hover:bg-black hover:text-white"
                        }`}
                        onClick={() => setTaskSegment("LIONS")}
                      >
                        Lions Tasks
                      </button>
                      <button
                        className={`flex-1 py-2 px-4 text-center whitespace-nowrap text-sm sm:text-base transition-all duration-300 ${
                          taskSegment === "additional"
                            ? "bg-white text-black"
                            : "text-gray-400 hover:bg-black hover:text-white"
                        }`}
                        onClick={() => setTaskSegment("additional")}
                      >
                        Additional Tasks
                      </button>
                    </div>
                  </div>

                  {/* Render Tasks Based on Selected Segment */}
                  {renderTasks()}
                </div>
              </>
            )}

            {/* Other Pages */}
            {activePage === "friends" && <FriendsPage />}
            {activePage === "leaderboard" && <Leaderboard />}
            {activePage === "wallet" && <Airdrop address={address || ""} />}
          </div>

          {/* Navbar */}
          {activePage !== "game" && (
            <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full md:max-w-xl bg-black flex justify-around items-center z-50 text-xs">
              <div
                className={`nav-item flex flex-col items-center text-[#c0c0c0] ${
                  activePage === "home" ? "text-white" : ""
                } w-1/4 p-3 rounded-t-2xl transition-colors duration-300`}
                onClick={() => setActivePage("home")}
              >
                <IoHome size={20} />
                <p className="text-xs">Home</p>
              </div>

              <div
                className={`nav-item flex flex-col items-center text-[#c0c0c0] ${
                  activePage === "leaderboard" ? " text-white" : ""
                } w-1/4 p-3 rounded-t-2xl transition-colors duration-300`}
                onClick={() => setActivePage("leaderboard")}
              >
                <FaRankingStar size={20} />
                <p className="text-xs">Leaderboard</p>
              </div>

              <div
                className={`nav-item flex flex-col items-center text-[#c0c0c0] ${
                  activePage === "friends" ? " text-white" : ""
                } w-1/4 p-3 rounded-t-2xl transition-colors duration-300`}
                onClick={() => setActivePage("friends")}
              >
                <FaUserFriends size={20} />
                <p className="text-xs">Friends</p>
              </div>

              <div
                className={`nav-item flex flex-col items-center text-[#c0c0c0] ${
                  activePage === "wallet" ? " text-white" : ""
                } w-1/4 p-3 rounded-t-2xl transition-colors duration-300`}
                onClick={() => setActivePage("wallet")}
              >
                <TfiGift size={20} />
                <p className="text-xs">Airdrop</p>
              </div>
            </div>
          )}

          {/* Render OverlayPage first if user is added */}
          {showOverlayPage && (
            <OverlayPage closeOverlay={closeOverlay} userAdded={userAdded} />
          )}
          {/* Render DailyReward after OverlayPage is closed */}
          {showDailyReward && (
            <DailyReward onClose={() => setShowDailyReward(false)} />
          )}

          {/* Modal for Alerts */}
          {modalMessage && (
            <Modal message={modalMessage} onClose={closeModal} />
          )}
          <Toaster />
        </>
      )}
    </div>
  );
};

export default App;
