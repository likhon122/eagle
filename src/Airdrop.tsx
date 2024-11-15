import React from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import "./App.css";
import { Logo } from "./images";

interface AirdropProps {
  address: string; // address prop is required as a string
}

const Airdrop: React.FC<AirdropProps> = ({ address }) => {
  const [tonConnectUI] = useTonConnectUI();

  return (
    <div className="w-full px-4 text-white md:h-[93.7vh] font-bold flex flex-col max-w-xl">
      <div className="w-full text-white font-bold flex flex-col max-w-xl">
        <div className="relative flex items-center justify-center flex-col mx-auto mb-4">
          <img src={Logo} alt="lion image" className="w-32 h-32" />
          <h3 className="text-xl font-[900] italic text-center mt-6">
            CONNECT YOUR WALLET AND EXPLORE MORE...
          </h3>
        </div>

        <div
          onClick={() => {
            if (address) {
              tonConnectUI.disconnect(); // Disconnect wallet if address exists
            } else {
              tonConnectUI.connectWallet(); // Prompt to connect if no address
            }
          }}
          className="flex cursor-pointer justify-around items-center gap-4 w-full mt-5 py-3 bg-gray-600/30 text-white border-[2px] border-gray-300/30 rounded-full"
        >
          {address ? (
            "Disconnect Wallet"
          ) : (
            <div className="flex items-center justify-center gap-4">
              <span className="inline-block w-4 mr-3 mb-1">
                <svg
                  fill="white"
                  height="20px"
                  width="20px"
                  version="1.1"
                  id="Layer_1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 512 512"
                  xmlSpace="preserve"
                >
                  {/* SVG Path Data */}
                  <g>
                    <g>
                      <path
                        d="M361.739,278.261c-27.664,0-50.087,22.423-50.087,50.087s22.423,50.087,50.087,50.087H512V278.261H361.739z
                           M361.739,345.043c-9.22,0-16.696-7.475-16.696-16.696s7.475-16.696,16.696-16.696s16.696,7.475,16.696,16.696
                          S370.96,345.043,361.739,345.043z"
                      />
                    </g>
                  </g>
                  <g>
                    <g>
                      <path
                        d="M361.739,244.87h83.478v-50.087c0-27.619-22.468-50.087-50.087-50.087H16.696C7.479,144.696,0,152.174,0,161.391v333.913
                          C0,504.521,7.479,512,16.696,512H395.13c27.619,0,50.087-22.468,50.087-50.087v-50.087h-83.478
                          c-46.032,0-83.478-37.446-83.478-83.478C278.261,282.316,315.707,244.87,361.739,244.87z"
                      />
                    </g>
                  </g>
                  <g>
                    <g>
                      <path
                        d="M461.913,144.696h-0.158c10.529,13.973,16.854,31.282,16.854,50.087v50.087H512v-50.087
                          C512,167.164,489.532,144.696,461.913,144.696z"
                      />
                    </g>
                  </g>
                  <g>
                    <g>
                      <path
                        d="M478.609,411.826v50.087c0,18.805-6.323,36.114-16.854,50.087h0.158C489.532,512,512,489.532,512,461.913v-50.087H478.609
                          z"
                      />
                    </g>
                  </g>
                  <g>
                    <g>
                      <path d="M273.369,4.892c-6.521-6.521-17.087-6.521-23.609,0l-14.674,14.674l91.74,91.738h52.956L273.369,4.892z" />
                    </g>
                  </g>
                  <g>
                    <g>
                      <path d="M173.195,4.892c-6.521-6.522-17.086-6.522-23.608,0L43.174,111.304h236.435L173.195,4.892z" />
                    </g>
                  </g>
                </svg>
              </span>
              <h3 className="text-[14px]">Connect Wallet</h3>
            </div>
          )}
        </div>

        <div className="mt-7 flex items-center justify-center text-center flex-col gap-2">
          <h1
            className="font-extrabold not-italic"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            Coming soon...
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Airdrop;
