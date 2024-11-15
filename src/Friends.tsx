import React, { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { useUser } from "./UserContext";
import { Logo, LogoBackgroundRemove } from "./images";

const FriendsPage: React.FC = () => {
  const { userID, setPoints } = useUser();
  const [friends, setFriends] = useState<
    Array<{ Username: string; totalgot: number }>
  >([]);
  const [modalMessage, setModalMessage] = useState<string | null>(null); // Modal state
  const FRIEND_REWARD = 1000; // Points reward per new friend
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const inviteModalRef = useRef<HTMLDivElement | null>(null);

  console.log(friends);

  // Invitation link
  const invitationLink = `https://t.me/Lionssstestbot/Lions?startapp=${encodeURIComponent(
    userID
  )}`;

  const handleInvite = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(invitationLink)}`,
      "_blank"
    );
  };

  const setupInvitationLinkCopy = () => {
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = invitationLink; // Set the value to the invitation link
    document.body.appendChild(tempTextArea); // Add it to the document
    tempTextArea.select(); // Select the text inside the text area
    document.execCommand("copy"); // Execute the copy command
    document.body.removeChild(tempTextArea); // Remove the temporary text area from the document
    showModal("Invitation link copied to clipboard!");
  };

  const showModal = (message: string) => {
    setModalMessage(message);
  };

  const closeModal = () => {
    setModalMessage(null);
  };

  // Function to update the `referrewarded` count
  const updateReferrewarded = async (newReferrewardedCount: number) => {
    const initData = window.Telegram.WebApp.initData || ""; // Get initData from Telegram WebApp
    try {
      await fetch("https://lionsbackend.lionsgangbot.com/update_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Init-Data": initData // Add initData to headers
        },
        body: JSON.stringify({
          UserId: userID,
          referrewarded: newReferrewardedCount.toString()
        })
      });
      console.log("referrewarded updated to", newReferrewardedCount);
    } catch (error) {
      console.error("Failed to update referrewarded:", error);
    }
  };

  // Logic to fetch friends and handle rewarding
  const fetchFriends = async () => {
    const initData = window.Telegram.WebApp.initData || ""; // Get initData from Telegram WebApp
    try {
      const response = await fetch(
        `https://lionsbackend.lionsgangbot.com/get_invitations?UserId=${userID}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-Telegram-Init-Data": initData // Add initData to headers
          }
        }
      );
      const data = await response.json();

      if (data) {
        const invitations = data.invitations || [];
        const totalFriendsCount = invitations.length;
        const referrewardedCount = data.referrewarded
          ? parseInt(data.referrewarded, 10)
          : 0;

        setFriends(invitations); // Update state with friends data

        // Store friends' names in localStorage
        localStorage.setItem(`friends_${userID}`, JSON.stringify(invitations));

        if (totalFriendsCount > referrewardedCount) {
          const newUnrewardedFriends = totalFriendsCount - referrewardedCount;
          const rewardPoints = newUnrewardedFriends * FRIEND_REWARD;

          setPoints((prevPoints) => prevPoints + rewardPoints);
          showModal(
            `You have earned ${rewardPoints} points for inviting ${newUnrewardedFriends} new friends!`
          );

          // Update the user's referrewarded count
          await updateReferrewarded(totalFriendsCount);
        }
      } else {
        // No data returned
        setFriends([]);
        localStorage.removeItem(`friends_${userID}`); // Clear localStorage if no friends
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  // Fetch friends data on component load
  useEffect(() => {
    if (userID) {
      // Load friends from localStorage
      const localFriends = localStorage.getItem(`friends_${userID}`);
      if (localFriends) {
        setFriends(JSON.parse(localFriends));
      }

      // Fetch friends from the database
      fetchFriends();
    } else {
      console.log("UserID not available");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userID]);

  // const demoFriends = [
  //   { name: "TahmindIbne", coin: 45 },
  //   { name: "Raju", coin: 143 },
  //   { name: "Sanju", coin: 150 },
  // ];

  return (
    <div className="relative flex justify-center min-h-screen pb-20 ">
      <div className="w-full max-w-xl flex flex-col justify-between md:justify-center">
        {/* Header Section */}
        <div className="text-white flex items-center justify-center flex-col text-center mt-3">
          <h1 className="text-[32px] font-bold font-sans text-[Poppins] leading-10">
            Invite friends
          </h1>
          <h1 className="text-[32px] font-bold font-sans text-[Poppins]  leading-10">
            and get more DOGS
          </h1>
        </div>

        <div className="flex items-center justify-center mt-2 relative">
          {/* <LiaWolfPackBattalion className="text-[170px] text-black" /> */}
          <img src={Logo} alt="lion image " className="w-32 h-32" />
          <div className="absolute  right-20  opacity-[0.5] z-40">
            <img src={LogoBackgroundRemove} alt="Ghost" className="w-20 h-20" />
          </div>
          <div className="absolute  right-[34px]  opacity-[0.4] z-30">
            <img src={LogoBackgroundRemove} alt="Ghost" className="w-16 h-16" />
          </div>
          <div className="absolute left-20 opacity-[0.5] z-40">
            <img src={LogoBackgroundRemove} alt="Ghost" className="w-20 h-20" />
          </div>
          <div className="absolute left-[34px] opacity-[0.4] z-30">
            <img src={LogoBackgroundRemove} alt="Ghost" className="w-16 h-16" />
          </div>
        </div>

        {/* Friends */}

        <div>
          <div className="pb-2">
            <h2 className="text-white mx-6 text-[25px] text-[Poppins] font-sans font-semibold">
              {friends?.length} Friends
            </h2>
          </div>
          {friends?.length > 0 ? (
            <div className="mx-6 flex flex-col gap-2 ">
              {friends?.map((friend, index) => {
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between text-white px-2 py-2 border border-gray-300/30  rounded-lg"
                  >
                    <div className="flex items-center">
                      <div
                        className={`${
                          friend?.Username.startsWith("T")
                            ? "bg-green-600"
                            : friend?.Username.startsWith("A")
                            ? "bg-orange-600"
                            : friend?.Username.startsWith("R")
                            ? "bg-blue-700"
                            : "bg-gray-400"
                        } rounded-full w-10 h-10 flex items-center justify-center`}
                      >
                        <h1 className="font-[Poppins] font-semibold text-[Poppins] text-white">
                          {friend?.Username.slice(0, 2).toUpperCase()}
                        </h1>
                      </div>
                      <h2 className="text-[20px] text-sm text-[Poppins]font-sans font-semibold ml-2">
                        {friend?.Username}
                      </h2>
                    </div>
                    <div className="text-[20px] font-sans font-semibold text-white">
                      <span className="text-[20px] font-[Poppins] font-semibold">
                        +1000
                      </span>
                      <span className="text-[20px] text-md">LIONS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white text-center ">No friends invited yet.</p>
          )}
        </div>

        {/* Buttons */}

        <div className="flex items-center justify-center  mb-3 mt-5">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="text-white bg-gray-400/30 border-white/20 border w-[86%] py-1 rounded-lg text-[20px] font-sans "
          >
            Invite Friends
          </button>
        </div>
      </div>

      {/* Modal Component */}
      {modalMessage && <Modal message={modalMessage} onClose={closeModal} />}

      {isInviteModalOpen && (
        <div
          ref={inviteModalRef}
          style={{
            backdropFilter: "blur(64px)",
            border: "1px solid #FFFFFF33",
            background: "black"
          }}
          className={`fixed  left-1/2 transform -translate-x-1/2  md:max-w-xl bg-black bg-opacity-50  justify-around  z-50 text-xs bottom-0 flex flex-col items-center animate-bounce-once   w-full  transition-transform duration-700 ease-in-out pb-24 ${
            isInviteModalOpen
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-full opacity-0 scale-95"
          } text-white p-6 rounded-t-lg shadow-lg`}
        >
          <div className="space-y-3 w-full flex flex-col items-center">
            <div
              className="flex items-center w-full  justify-between p-2 rounded-lg "
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.24)",
                backdropFilter: "blur(20px)"
              }}
            >
              <div className=" flex items-center justify-center z-50 w-full">
                <div className=" text-white  rounded-lg w-full">
                  <div className="flex justify-between items-center mb-4 w-full">
                    <h2 className="text-lg font-semibold text-end w-[60%]">
                      Invite friends
                    </h2>
                    <button
                      onClick={() => setIsInviteModalOpen(false)}
                      className="text-gray-400 hover:text-gray-300 w-[20%] text-2xl"
                    >
                      &times;
                    </button>
                  </div>
                  <button
                    className="w-full bg-gray-400/30 text-white py-2 rounded-lg mb-4"
                    onClick={setupInvitationLinkCopy}
                  >
                    Copy invite link
                  </button>
                  <button
                    className="w-full bg-gray-400/30 text-white  py-2 rounded-lg "
                    onClick={handleInvite}
                  >
                    Share invite link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
