"use client";

import React, { useState, useEffect, useContext } from "react";
import { Sidebar, SidebarBody } from "../components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { getSidebarLinks, ROLES } from "./constants/SidebarLinks";
import { IconUserCircle, IconChevronDown } from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AuthContext } from "@/app/AuthContext";
import { useTranslations } from "next-intl";

/** Convert hex + 0–1 alpha → rgba(...) */
function withAlpha(hex = "#ff7f10", alpha = 1) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Darken a hex color by mixing it toward black (amount 0–1) */
function darkenColor(hex = "#ff7f10", amount = 0.35) {
  const h = hex.replace("#", "");
  const r = Math.max(
    0,
    Math.floor(parseInt(h.substring(0, 2), 16) * (1 - amount)),
  );
  const g = Math.max(
    0,
    Math.floor(parseInt(h.substring(2, 4), 16) * (1 - amount)),
  );
  const b = Math.max(
    0,
    Math.floor(parseInt(h.substring(4, 6), 16) * (1 - amount)),
  );
  return `rgb(${r}, ${g}, ${b})`;
}

export function SidebarDemo({ children }) {
  const { user, loading } = useContext(AuthContext);
  const pathname = usePathname();
  const isExamPage =
    pathname.includes("/mocktest/test-yourself/");
  const router = useRouter();
  const t = useTranslations("sidebar");
  const [open, setOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  const color = user?.color || "#ff7f10";
  const role = user?.role;
  const PROFILE_ROUTES = {
    [ROLES.SUPER_ADMIN]: "/super-admin/profile",
    [ROLES.INSTITUTE_ADMIN]: "/admin/profile",
    [ROLES.FACULTY]: "/faculty/profile",
    [ROLES.INSTITUTE_STUDENT]: "/institute-student/profile",
    [ROLES.TUTOR]: "/tutor/profile",
    [ROLES.TUTOR_STUDENT]: "/student/profile",
    [ROLES.SELF_LEARNER]: "/self-learner/profile",
  };

  const profileHref = PROFILE_ROUTES[role] || "/profile";

  const links = getSidebarLinks(role, user, t);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarExpanded");
    if (saved !== null) setOpen(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarExpanded", JSON.stringify(open));
  }, [open]);

  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ backgroundColor: withAlpha(color, 0.15) }}
      >
        <Spinner color={color} />
      </div>
    );
  }



  // ✅ startsWith so /faculty/evaluate-answer-script/some-id still matches
  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/");
  const isChildActive = (children) =>
    children?.some((child) => isActive(child.href));

  // Auto-open dropdown whose child matches current path
  useEffect(() => {
    links.forEach((link, idx) => {
      if (link.children && isChildActive(link.children)) {
        setOpenDropdown(idx);
      }
    });
  }, [pathname]);

  return (
    <div
      className="flex flex-col md:flex-row w-full h-screen overflow-hidden"
      style={{ backgroundColor: withAlpha(color, 0.12) }}
    >
      {!isExamPage && (
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="bg-white flex flex-col h-full overflow-visible">
            <div className="flex-shrink-0">
              <Logo open={open} toggleSidebar={() => setOpen(!open)} />
            </div>

            <div className="flex-1 overflow-y-auto px-2 mt-4">
              {links.map((link, idx) => {
                const isDropdown = !!link?.children;
                const childActive = isChildActive(link?.children);
                const isOpen = openDropdown === idx;
                const active = !isDropdown && isActive(link?.href);

                if (isDropdown) {
                  const highlighted = childActive || isOpen;

                  return (
                    <div key={idx}>
                      {/* Dropdown trigger */}
                      <div
                        onClick={() => {
                          if (!isOpen && link?.defaultHref)
                            router.push(link?.defaultHref);
                          setOpenDropdown(isOpen ? null : idx);
                        }}
                        className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-colors"
                        style={
                          highlighted
                            ? { backgroundColor: color, color: "#fff" }
                            : { color: darkenColor(color) }
                        }
                        onMouseEnter={(e) => {
                          if (!highlighted)
                            e.currentTarget.style.backgroundColor = withAlpha(
                              color,
                              0.1,
                            );
                        }}
                        onMouseLeave={(e) => {
                          if (!highlighted)
                            e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {React.cloneElement(link.icon, {
                            className: "h-6 w-6",
                            style: {
                              color: highlighted ? "#fff" : darkenColor(color),
                            },
                          })}
                          {open && (
                            <span className="font-bold text-sm">
                              {link.label}
                            </span>
                          )}
                        </div>

                        <IconChevronDown
                          className={cn(
                            "h-5 w-5 transition-transform duration-200",
                            isOpen && "rotate-180",
                          )}
                          style={{
                            color: highlighted ? "#fff" : darkenColor(color),
                          }}
                        />
                      </div>

                      {/* Child links */}
                      {isOpen && (
                        <div className="mt-1 ml-3 space-y-1 p-2">
                          {link?.children.map((child, i) => {
                            const cActive = isActive(child?.href);
                            return (
                              <Link
                                key={i}
                                href={child?.href}
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-all duration-150"
                                style={
                                  cActive
                                    ? {
                                      backgroundColor: withAlpha(color, 0.12),
                                      color: color,
                                      fontWeight: 600,
                                    }
                                    : {
                                      backgroundColor: "#fff",
                                      color: darkenColor(color),
                                    }
                                }
                                onMouseEnter={(e) => {
                                  if (!cActive)
                                    e.currentTarget.style.backgroundColor =
                                      withAlpha(color, 0.08);
                                }}
                                onMouseLeave={(e) => {
                                  if (!cActive)
                                    e.currentTarget.style.backgroundColor =
                                      "#fff";
                                }}
                              >
                                {child.icon &&
                                  React.cloneElement(child.icon, {
                                    className: "h-4 w-4",
                                    style: {
                                      color: cActive ? color : darkenColor(color),
                                    },
                                  })}
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Regular link
                return (
                  <Link
                    key={idx}
                    href={link?.href}
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors"
                    style={
                      active
                        ? { backgroundColor: color, color: "#fff" }
                        : { color: darkenColor(color) }
                    }
                    onMouseEnter={(e) => {
                      if (!active)
                        e.currentTarget.style.backgroundColor = withAlpha(
                          color,
                          0.1,
                        );
                    }}
                    onMouseLeave={(e) => {
                      if (!active)
                        e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {React.cloneElement(link.icon, {
                      className: "h-6 w-6",
                      style: { color: active ? "#fff" : darkenColor(color) },
                    })}
                    {open && (
                      <span className="font-bold text-sm">{link.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Profile */}
            <div className="px-2 py-2">
              <Link
                href={profileHref}
                className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors"
                style={{ color: darkenColor(color) }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = withAlpha(color, 0.1))
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <IconUserCircle
                  className="h-6 w-6"
                  style={{ color: darkenColor(color) }}
                />
                {open && (
                  <span className="font-bold text-sm">{t("userProfile")}</span>
                )}
              </Link>
            </div>
          </SidebarBody>
        </Sidebar>
      )}

      <div
        className={`overflow-y-auto ${isExamPage ? "w-full" : "flex-1"
          }`}
      >
        {children}
      </div>
    </div>
  );
}

export const Logo = ({ toggleSidebar, open }) => (
  <div className="w-full flex justify-center">
    <button onClick={toggleSidebar} className="w-full py-2">
      {!open ? (
        <img src="/pics/Logo7.png" className="h-8 w-20 object-contain" />
      ) : (
        <div className="w-full px-2">
          <img src="/pics/Logo7.png" className="w-full object-cover" />
        </div>
      )}
    </button>
  </div>
);
