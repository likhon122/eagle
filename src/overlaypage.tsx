import React, { useEffect, useRef, useState } from "react";
import { useUser } from "./UserContext";
import { Logo } from "./images";
import checkboxImage from "./images/check.png";

interface OverlayPageProps {
  closeOverlay: () => void;
  userAdded?: boolean; // Made optional
}

const OverlayPage: React.FC<OverlayPageProps> = ({
  closeOverlay,
  userAdded
}) => {
  const { userID, isStar, setPoints } = useUser();

  const [completed, setCompleted] = useState([false, false, false, false]);
  const [tickVisible, setTickVisible] = useState([false, false, false, false]);
  const [showFinalPage, setShowFinalPage] = useState(false);
  const [showFinalPage2, setShowFinalPage2] = useState(false);
  const [showFinalPage3, setShowFinalPage3] = useState(false);
  const [yearsAgo, setYearsAgo] = useState(1);
  const [totalReward, setTotalReward] = useState(0);

  const [isDataFetched, setIsDataFetched] = useState(false);
  const isFetching = useRef(false);

  const fetchYearsAgo = async () => {
    if (isFetching.current) {
      return;
    }
    isFetching.current = true;
    try {
      const initData = window.Telegram?.WebApp?.initData || "";
      if (!initData) {
        console.error("Telegram initData is missing");
        return;
      }

      const url = `https://lionsbackend.lionsgangbot.com/get_creation_month_count?userid=${userID}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Init-Data": initData
        }
      });

      if (response.ok) {
        const data = await response.json();
        setYearsAgo(data.years);
        setIsDataFetched(true);

        const additionalReward = isStar ? 250 : 0;
        const totalCalculatedReward = data.reward + additionalReward;

        setTotalReward(totalCalculatedReward);
        setPoints(() => totalCalculatedReward);

        // Update user's totalgot
        await fetch("https://lionsbackend.lionsgangbot.com/update_user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": initData
          },
          body: JSON.stringify({
            UserId: userID,
            totalgot: totalCalculatedReward
          })
        });
      }
    } catch (error) {
      const err = error as any;
      console.error("API call error:", err.message);
    }
  };

  useEffect(() => {
    if (userAdded && !isFetching.current) {
      fetchYearsAgo();
    }
  }, [userAdded]);

  useEffect(() => {
    if (isDataFetched) {
      completed.forEach((_, index) => {
        setTimeout(() => {
          setCompleted((prev) => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
          });

          setTimeout(() => {
            setTickVisible((prev) => {
              const updated = [...prev];
              updated[index] = true;
              return updated;
            });

            if (index === completed.length - 1) {
              setTimeout(() => {
                setShowFinalPage(true);
              }, 1000);
            }
          }, 1000);
        }, index * 2000);
      });
    }
  }, [isDataFetched]);

  // finalPage3
  const FinalPage3 = () => {
    return (
      <div
        className="fixed inset-0 flex flex-col justify-between items-center "
        style={{
          backgroundColor: "black",
          minHeight: "100vh",
          color: "white",
          textAlign: "center",
          padding: "0 16px",
          zIndex: 99999999999
        }}
      >
        {/* Top Text */}
        <div className="mt-8">
          
        </div>

        {/* Central Reward Display */}
        <div className="flex flex-col items-center">
          <div className="text-[4.5rem] font-extrabold leading-none text-white">
            {totalReward}
          </div>
          <div className="flex items-center justify-center">
            <img src={Logo} alt="logo" className="w-[40px] h-[40px]" />
            <p className="text-2xl ml-2 text-white">Earned</p>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="mb-6 text-center">
          <p>Keep an eye on the calendar</p>

          <p className="mt-4">⏰ Act fast before this offer ends!</p>
          <p>Let’s Drive together to the Next MoonShot 🚀</p>
          <p>"Don't waste the Opportunity Again!"</p>
        </div>

        {/* Claim Button */}
        <button
          onClick={() => {
            console.log("Claim button clicked");
            closeOverlay();
          }}
          className="px-6 py-3 bg-black text-white rounded-full text-lg font-semibold mb-8 border-gray-300 border"
          style={{ width: "80%" }}
        >
          Claim
        </button>
      </div>
    );
  };

  // finalPage2
  const FinalPage2 = () => {
    return (
      <div
        className="fixed inset-0 flex flex-col justify-between items-center"
        style={{
          backgroundColor: "black",
          minHeight: "100vh",
          color: "white",
          textAlign: "center",
          padding: "0 16px",
          zIndex: 9999999999999
        }}
      >
        {/* Three Lines at the Top */}
        <div className="mt-20 flex justify-center items-center space-x-2">
          <div
            style={{
              height: "4px",
              backgroundColor: "gray",
              width: "50px"
            }}
          ></div>
          <div
            style={{
              height: "4px",
              backgroundColor: "white",
              width: "80px"
            }}
          ></div>
          <div
            style={{
              height: "4px",
              backgroundColor: "gray",
              width: "50px"
            }}
          ></div>
        </div>

        {/* Top Text */}
        <div className="-mt-10">
          <h1 className="text-2xl font-bold text-white">You are a legend!</h1>
          {/* Conditionally render based on the value of 'isStar' */}
          {isStar ? (
            <p className="text-base mt-1">Telegram star!!</p>
          ) : (
            <p className="text-base mt-1"></p>
          )}
        </div>

        {/* Central Image */}
        <div className="flex flex-col items-center -mt-20">
          <img src={Logo} alt="Logo" height={250} width={250} />
        </div>

        {/* Continue Button */}
        <button
          onClick={() => setShowFinalPage3(true)}
          className="px-6 py-3 bg-[black] text-white rounded-full text-lg font-semibold mb-8 border-gray-300 border"
          style={{ width: "80%" }}
        >
          Continue
        </button>
      </div>
    );
  };

  // finalPage
  const FinalPage = () => {
    return (
      <div
        className="fixed inset-0 flex flex-col justify-between items-center"
        style={{
          backgroundColor: "black",
          minHeight: "100vh",
          color: "white",
          textAlign: "center",
          padding: "0 16px",
          zIndex: 9999999999
        }}
      >
        {/* Three Lines at the Top */}
        <div className="mt-20 flex justify-center items-center space-x-2">
          <div
            style={{
              height: "4px",
              backgroundColor: "white",
              width: "50px"
            }}
          ></div>
          <div
            style={{
              height: "4px",
              backgroundColor: "gray",
              width: "80px"
            }}
          ></div>
          <div
            style={{
              height: "4px",
              backgroundColor: "gray",
              width: "50px"
            }}
          ></div>
        </div>

        {/* Top Text */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-white">Legendary status!</h1>
          <p className="text-base mt-1">You've joined Telegram</p>
        </div>

        {/* Central Large Text */}
        <div className="flex flex-col items-center">
          <div className="text-[4.5rem] font-extrabold leading-none text-white">
            {yearsAgo}
          </div>
          <p className="text-2xl mt-1 text-white">years ago</p>
        </div>

        {/* Bottom Text */}
        <div className="mb-6">
          <p className="text-xs">Your account number is #{userID}.</p>
          <p className="text-xs mt-1">🔥</p>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => setShowFinalPage2(true)}
          className="px-6 py-3  bg-black text-white rounded-full text-lg font-semibold mb-8 border-gray-300 border"
          style={{ width: "80%" }}
        >
          Continue
        </button>
      </div>
    );
  };

  if (showFinalPage3) {
    return <FinalPage3 />;
  }

  if (showFinalPage2) {
    return <FinalPage2 />;
  }

  if (!showFinalPage) {
    return <FinalPage />;
  }

  // Main page content (original content)
  return (
    <div className="z-50 fixed inset-0 bg-black flex flex-col justify-start items-center font-poppins">
      {/* Animation and checklist page */}
      <div className="relative text-center text-white w-80">
        <h1 className="text-4xl font-extrabold mt-[10vh] mb-32 text-white">
          Checking your account
        </h1>

        {/* List of checks */}
        <div className="space-y-4 mt-2">
          {[
            "Account Age Verified",
            "Activity Level Analyzed",
            "Telegram Premium Checked",
            "OG Status Confirmed"
          ].map((text, index) => (
            <div
              key={index}
              className="flex flex-col items-start justify-between bg-transparent py-1"
            >
              <div className="flex justify-between w-full">
                <span className="text-lg font-semibold text-white">{text}</span>
                {tickVisible[index] && (
                  <img src={checkboxImage} alt="Checked" className="w-6 h-6" />
                )}
              </div>
              <div className="w-full h-[4px] bg-transparent mt-1">
                <div
                  className={`h-full bg-white transition-width duration-1000 ease-linear ${
                    completed[index] ? "w-full" : "w-0"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverlayPage;
