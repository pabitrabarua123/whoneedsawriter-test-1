"use client";

import TeamSwitcher from "./components/team-switcher";
import { UserNav } from "./components/user-nav";
import { User } from "@prisma/client";
import {useContext} from "react";
import { UserContext, UserContextType } from "@/app/customProviders/UserProvider";
import { PricingPopupContext } from "@/app/PricingPopupProvider";
import { useMobile } from "@/hooks/useMobile";
import { IconButton, useColorModeValue } from "@chakra-ui/react";
import { TbMenu2 } from "react-icons/tb";
import { useSidebarDrawer } from "@/app/SidebarDrawerProvider";

const DashboardHeader = () => {
  const isMobile = useMobile();
  const { user, isLoading, error } = useContext(UserContext) as UserContextType;
  const totalCredits = ((user as User)?.freeCredits || 0) + ((user as User)?.monthyBalance || 0) + ((user as User)?.lifetimeBalance || 0);
  
  const { onOpen: onPricingPopupOpen } = useContext(PricingPopupContext);
  const buttonColor = useColorModeValue("whiteAlpha.600", "whiteAlpha.600");
  
  // Get drawer state from context (will be undefined if not in provider, which is fine)
  const drawerState = useSidebarDrawer();

  const topPosition = '0';

    return (
      <div className="border-b" style={{
          backgroundColor: '#080a0f80', 
          height: '68px', 
          position: 'fixed', 
          top: topPosition, 
          left: 0, 
          right: 0, 
          backdropFilter: 'blur(8px)'
        }}>
        <div className="flex h-[100%] items-center px-4">
          {isMobile && drawerState && (
            <IconButton
              icon={<TbMenu2 size="20px" color="#eef2f7" />}
              aria-label="Open menu"
              variant="ghost"
              color="transparent"
              border="1px solid #ffffff14"
              borderRadius="8px"
              bg="linear-gradient(135deg, #121722, var(--panel-2, #151923))"
              size="sm"
              onClick={drawerState.onOpen}
              mr={3}
              style={{ minWidth: '36px', width: '36px', height: '36px' }}
            />
          )}
          {/* <TeamSwitcher /> */}
          <div className="ml-auto flex items-center space-x-4">
            {/* Credits Section */}
            <div className={`credits-header flex items-center bg-[#151923] rounded-full px-4 py-2 ${isMobile ? 'mr-2' : 'mr-4'} border border-[#ffffff14]`}>
              <span className="text-[#a9b1c3] text-sm mr-2">Credits:</span>
              <span className="text-white font-medium text-sm mr-2">
                {isLoading ? "..." : totalCredits.toFixed(1)}
              </span>
             
                <button 
                 onClick={() => onPricingPopupOpen()}
                 className="buy-more-btn ml-3 bg-[transparent] text-[#eef2f7] hover:bg-[#13161b] border border-[#ffffff14] text-xs font-medium px-3 py-2 rounded-full transition-colors" style={{boxShadow: '0 10px 30px rgba(0,0,0,.35)'}}>
                  Buy More
                </button>
           
            </div>
            <div data-tour="user-nav">
              <UserNav />
            </div>
          </div>
        </div>
      </div>
    )
}

export default DashboardHeader;