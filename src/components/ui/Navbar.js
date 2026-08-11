"use client";
import React, { useContext } from "react";
import Link from "next/link";
import { AuthContext } from "@/app/AuthContext";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function Navbar({ title,style }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
     <header
  className="text-white p-4 flex justify-between items-center"
  style={style}
>
        <h1 className="text-xl font-bold">{title}</h1>
      </header>
    );
  }

  return (
    <header className="text-white p-4 flex justify-between items-center" style={{backgroundColor: user?.color}}>
      <div className="flex items-center space-x-4">
        {user?.logo_url&&
        <img
          key={user?.logo_url}
          src={
            user?.logo_url
              ? `${user.logo_url}?t=${Date.now()}`
              : ""
          }
          alt="Institute Logo"
          width={50}
          height={50}
          className="h-12 w-auto rounded-full"
        />
        }
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center justify-between">
       {/* LOCALE SWITCHER */}
          {open && (
            <div className="flex-shrink-0 px-2 py-1 border-gray-100">
              <LocaleSwitcher showLabel />
            </div>
          )}
          {!open && (
            <div className="flex-shrink-0 flex justify-center py-1 border-t border-gray-100">
              <LocaleSwitcher />
            </div>
          )}
      <img
        src="/pics/Logo6.png"
        alt="Logo 2"
        width={50}
        height={50}
        className="h-16 w-auto rounded-xl"
      />
      </div>
     
    </header>
  );
}