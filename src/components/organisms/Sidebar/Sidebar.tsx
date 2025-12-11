import React from "react";
import { Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { Routes } from "../../../data/routes";
import { AccountMenu } from "@/components/AccountMenu/AccountMenu";
import { useSession } from "next-auth/react";
import { useMobile } from "@/hooks/useMobile";
import { MenuLabel, SidebarMenuItems } from "./SidebarMenuItems";
import { DarkModeSwitch } from "@/components/DarkModeSwitch/DarkModeSwitch";
import { useColorModeValues } from "@/hooks/useColorModeValues";
import { usePathname } from "next/navigation";

export const sidebarWidth = "80px";
export const sidebarWidthMobile = "240px"; // Wider sidebar for mobile with text labels

type SideBarProps = {
  currentPage: Routes;
  onClose?: () => void;
};

export const SideBar: React.FC<SideBarProps> = ({ currentPage, onClose }) => {
  const isMobile = useMobile();
  const { borderColor } = useColorModeValues();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [loadingRoute, setLoadingRoute] = React.useState<Routes | string>("");

  // Clear loading state when pathname changes
  React.useEffect(() => {
    setLoadingRoute("");
  }, [pathname]);

  // Use wider sidebar on mobile, narrow on desktop
  const width = isMobile ? sidebarWidthMobile : sidebarWidth;
  // When inside Drawer, use relative positioning instead of fixed
  const position = isMobile ? "relative" : "fixed";
  const zIndex = isMobile ? undefined : "9999"; // Let Drawer handle z-index on mobile

  return (
    <Flex
      h="100vh"
      minW={width}
      maxW={width}
      flexDirection="column"
      position={position}
      top="0"
      bottom="auto"
      left="0"
      marginInlineStart={"0 !important"}
      zIndex={zIndex}
    >
      <SidebarMenuItems
        currentPage={currentPage}
        loadingRoute={loadingRoute}
        onMenuItemClick={setLoadingRoute}
        onClose={onClose}
        isMobile={isMobile}
      />
    </Flex>
  );
};
