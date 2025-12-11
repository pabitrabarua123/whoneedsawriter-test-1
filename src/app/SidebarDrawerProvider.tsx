"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useDisclosure } from "@chakra-ui/react";

type SidebarDrawerContextType = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
};

const SidebarDrawerContext = createContext<SidebarDrawerContextType | undefined>(undefined);

export const SidebarDrawerProvider = ({ children }: { children: ReactNode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onToggle = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  };

  return (
    <SidebarDrawerContext.Provider value={{ isOpen, onOpen, onClose, onToggle }}>
      {children}
    </SidebarDrawerContext.Provider>
  );
};

export const useSidebarDrawer = () => {
  const context = useContext(SidebarDrawerContext);
  if (context === undefined) {
    throw new Error("useSidebarDrawer must be used within a SidebarDrawerProvider");
  }
  return context;
};

