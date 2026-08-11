'use client';
import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import { AuthContext } from "@/app/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { LOCALE_COOKIE_NAME } from "@/i18n/config";

const UserProfile = () => {
  const router = useRouter();
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  const { setUser } = useContext(AuthContext);

  const [userProfile, setUserProfile] = useState({
    fullName: "", email: "", profileImage: { url: defaultAvatar }, sessions: [], institute_profile: null
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [error, setError] = useState("");
  const [successMessages, setSuccessMessages] = useState({ profile: "", edit: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({ logo: false, banner: false });
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const { user ,isLoading} = useContext(AuthContext);
  const [editForm, setEditForm] = useState({
    fullName: "",
    institute_name: "", short_name: "", website: "",
    address_line1: "", city: "", state: "", country: "", pincode: "",
    affiliation: "", accreditation: "", established_year: "", logo_url: "", banner_url: ""
  });

  const [passwordStrength, setPasswordStrength] = useState({
    length: false, upper: false, lower: false, number: false, special: false
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile.fullName) {
      setEditForm({
        fullName: userProfile.fullName || "",
        institute_name: userProfile.institute_profile?.institute_name || "",
        short_name: userProfile.institute_profile?.short_name || "",
        website: userProfile.institute_profile?.website || "",
        address_line1: userProfile.institute_profile?.address_line1 || "",
        city: userProfile.institute_profile?.city || "",
        state: userProfile.institute_profile?.state || "",
        country: userProfile.institute_profile?.country || "",
        pincode: userProfile.institute_profile?.pincode || "",
        affiliation: userProfile.institute_profile?.affiliation || "",
        accreditation: userProfile.institute_profile?.accreditation || "",
        established_year: userProfile.institute_profile?.established_year || "",
        logo_url: userProfile.institute_profile?.logo_url || "",
        banner_url: userProfile.institute_profile?.banner_url || "",
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (error || Object.values(successMessages).some(m => m)) {
      const t = setTimeout(() => {
        setError("");
        setSuccessMessages({ profile: "", edit: "", password: "" });
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [error, successMessages]);

  useEffect(() => {
    setError("");
    setSuccessMessages({ profile: "", edit: "", password: "" });
  }, [activeTab]);

  const fetchUserProfile = async () => {
    try {
      // const token = localStorage.getItem('token');
      // if (!token) { router.push('/'); return; }
      const res = await axios.get(`/api/profile`, { withCredentials: true });
      setUserProfile({
        ...res.data,
        sessions: res.data.sessions || [],
        profileImage: res.data.profileImage || { url: defaultAvatar, fileId: null }
      });
    } catch (err) {
      setError("Failed to load profile. Please try again.");
      if (err.response?.status === 401) router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const uploadToImageKit = async (file, folder) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) { toast.error("Only JPG, PNG, WEBP allowed"); return null; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return null; }

    const authRes = await axios.get(
      `/api/imagekit-auth`,
      { withCredentials: true }
    );
    const { token, expire, signature } = authRes.data;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", `${folder}_${Date.now()}_${file.name}`);
    formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY);
    formData.append("signature", signature);
    formData.append("expire", expire);
    formData.append("token", token);
    formData.append("folder", `/${folder}`);

    const uploadRes = await axios.post(
      "https://upload.imagekit.io/api/v1/files/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return uploadRes.data.url;
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(u => ({ ...u, logo: true }));
      const url = await uploadToImageKit(file, "logos");
      if (url) { setEditForm(f => ({ ...f, logo_url: url })); toast.success("Logo uploaded"); }
    } catch { toast.error("Logo upload failed"); }
    finally { setUploading(u => ({ ...u, logo: false })); if (logoInputRef.current) logoInputRef.current.value = ""; }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(u => ({ ...u, banner: true }));
      const url = await uploadToImageKit(file, "banners");
      if (url) { setEditForm(f => ({ ...f, banner_url: url })); toast.success("Banner uploaded"); }
    } catch { toast.error("Banner upload failed"); }
    finally { setUploading(u => ({ ...u, banner: false })); if (bannerInputRef.current) bannerInputRef.current.value = ""; }
  };

  /* ================= UPDATE PROFILE ================= */

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.fullName.trim()) { toast.error("Name cannot be empty"); return; }
    try {
      setIsSubmitting(true);
      await axios.put(
        `/api/profile`,
        {
          fullName: editForm.fullName.trim(),
          institute_name: editForm.institute_name,
          short_name: editForm.short_name,
          website: editForm.website,
          address_line1: editForm.address_line1,
          city: editForm.city,
          state: editForm.state,
          country: editForm.country,
          pincode: editForm.pincode,
          affiliation: editForm.affiliation,
          accreditation: editForm.accreditation,
          established_year: editForm.established_year,
          logo_url: editForm.logo_url,
          banner_url: editForm.banner_url,   // ✅ fixed: was missing
        },
        { withCredentials: true }
      );
      toast.success("Profile updated successfully!");
      setUserProfile(prev => ({
        ...prev,
        fullName: editForm.fullName,
        institute_profile: { ...prev.institute_profile, ...editForm }
      }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= PASSWORD ================= */

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (name === "newPassword") {
      setPasswordStrength({
        length: value.length >= 8,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    if (!Object.values(passwordStrength).every(Boolean)) { toast.error("Password doesn't meet requirements"); setIsSubmitting(false); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error("Passwords don't match"); setIsSubmitting(false); return; }
    try {
      await axios.put(
        `/api/profile/change-password`,
        { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
        { withCredentials: true }
      );
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordStrength({ length: false, upper: false, lower: false, number: false, special: false });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const url = await uploadToImageKit(file, "avatars");
      if (url) {
        const result = { url, fileId: null };
        await axios.put(`/api/profile`, { profileImage: result }, { withCredentials: true });
        setUserProfile(prev => ({ ...prev, profileImage: result }));
        setSuccessMessages(prev => ({ ...prev, profile: "Profile picture updated!" }));
      }
    } catch (err) {
      setError("Failed to upload profile picture. Please try again.");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`/api/logout`, { method: "POST", credentials: "include" });
      setUser(null);
      router.push("/");
    } catch (e) { console.log(e); }
  };

  /* ================= HELPERS ================= */

  const inputCls = `w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color?"focus:ring-green-300":"focus:ring-orange-300"}`;
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  const EyeIcon = ({ show, onToggle }) => (
    <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
      {show ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  const Alert = ({ type, message }) => (
    <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${type === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`}>
      {type === "error" ? "⚠️" : "✅"} {message}
    </div>
  );

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen" style={{backgroundColor: user?.color || "#ff7f10"}}>
        <Navbar title="User Profile" />
        <div className="flex flex-1 items-center justify-center p-6 mt-20">
          <Spinner />
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen" style={{backgroundColor: user?.color || "#ff7f10"}}>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Navbar title="User Profile" />

      <div className="p-6 max-w-2xl mx-auto">

        {/* ===== CARD ===== */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">

          {/* Tab Navigation */}
          <div className="flex border-b">
            {["profile", "edit", "password"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 text-sm font-semibold c/apitalize transition
                  ${activeTab === tab
                    ? `border-b-2 ${user?.color?"bg-green-50":"bg-orange-50"}`
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                  style={{color: user?.color || "#ff7f10", borderColor: user?.color || "#ff7f10"}}
              >
                {tab === "profile" ? "👤 Profile" : tab === "edit" ? "✏️ Edit" : "🔒 Password"}
              </button>
            ))}
          </div>

          <div className="p-6 min-h-[500px]">

            {/* ===== PROFILE TAB ===== */}
            {activeTab === "profile" && (
              <div className="flex flex-col h-full">
                {successMessages.profile && <Alert type="success" message={successMessages.profile} />}

                {/* Avatar */}
                <div className="flex flex-col items-center py-6">
                  <div className="relative group">
                    <img
                      src={userProfile.profileImage?.url || defaultAvatar}
                      alt="Profile"
                      className={`w-24 h-24 rounded-full border-4 ${user?.color?"border-green-100":"border-orange-100"} shadow-lg object-cover`}
                      onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {uploadingAvatar ? (
                        <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white`} />
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-gray-800">{userProfile.fullName || "User"}</h2>
                  <p className="text-gray-500 text-sm mt-1">{userProfile.email}</p>

                  {/* Institute badge */}
                  {userProfile.institute_profile?.short_name && (
                    <span className={`mt-2 px-3 py-1 ${user?.color?"bg-green-100":"bg-orange-100"} rounded-full text-xs font-semibold`} style={{color: user?.color || "#ff7f10"}}>
                      {userProfile.institute_profile.short_name} · {userProfile.institute_profile.city}
                    </span>
                  )}
                </div>

                {/* Info cards */}
                {userProfile.institute_profile && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: "Affiliation", value: userProfile.institute_profile.affiliation },
                      { label: "Accreditation", value: userProfile.institute_profile.accreditation },
                      { label: "Est. Year", value: userProfile.institute_profile.established_year },
                      { label: "Website", value: userProfile.institute_profile.website },
                    ].map(item => item.value && (
                      <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                        <p className="text-sm text-gray-700 font-semibold mt-0.5 truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sessions */}
                {userProfile.sessions?.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active Sessions</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userProfile.sessions.map((session, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border">
                          <div>
                            <p className="text-sm font-medium text-gray-700">{session.device} · {session.browser}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(session.lastActive).toLocaleString()}
                              {session.current && " · Current"}
                            </p>
                          </div>
                          {!session.current && (
                            <button onClick={() => handleLogoutSession(session.sessionId)} className="text-xs text-red-500 hover:text-red-700 font-medium">
                              Logout
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto">
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}

            {/* ===== EDIT TAB ===== */}
            {activeTab === "edit" && (
              <form onSubmit={handleProfileUpdate} className="space-y-5">

                {error && <Alert type="error" message={error} />}

                {/* Account */}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</p>

                <div>
                  <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                  <input
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Lucknow University"
                  />
                </div>

                {/* Institute Info */}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-2">Institute Details</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Institute Name</label>
                    <input value={editForm.institute_name} onChange={e => setEditForm({ ...editForm, institute_name: e.target.value })} className={inputCls} placeholder="e.g. Lucknow University" />
                  </div>
                  <div>
                    <label className={labelCls}>Short Name</label>
                    <input value={editForm.short_name} onChange={e => setEditForm({ ...editForm, short_name: e.target.value })} className={inputCls} placeholder="e.g. LU" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Affiliation</label>
                    <input value={editForm.affiliation} onChange={e => setEditForm({ ...editForm, affiliation: e.target.value })} className={inputCls} placeholder="e.g. UGC" />
                  </div>
                  <div>
                    <label className={labelCls}>Accreditation</label>
                    <input value={editForm.accreditation} onChange={e => setEditForm({ ...editForm, accreditation: e.target.value })} className={inputCls} placeholder="e.g. A+++" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Established Year</label>
                    <input type="number" value={editForm.established_year} onChange={e => setEditForm({ ...editForm, established_year: e.target.value })} className={inputCls} placeholder="e.g. 2000" />
                  </div>
                  <div>
                    <label className={labelCls}>Website</label>
                    <input value={editForm.website} onChange={e => setEditForm({ ...editForm, website: e.target.value })} className={inputCls} placeholder="https://..." />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Address</label>
                  <input value={editForm.address_line1} onChange={e => setEditForm({ ...editForm, address_line1: e.target.value })} className={inputCls} placeholder="Street address" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>City</label>
                    <input value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} className={inputCls} placeholder="e.g. Lucknow" />
                  </div>
                  <div>
                    <label className={labelCls}>State</label>
                    <input value={editForm.state} onChange={e => setEditForm({ ...editForm, state: e.target.value })} className={inputCls} placeholder="e.g. Uttar Pradesh" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Country</label>
                    <input value={editForm.country} onChange={e => setEditForm({ ...editForm, country: e.target.value })} className={inputCls} placeholder="e.g. India" />
                  </div>
                  <div>
                    <label className={labelCls}>Pincode</label>
                    <input value={editForm.pincode} onChange={e => setEditForm({ ...editForm, pincode: e.target.value })} className={inputCls} placeholder="e.g. 226008" />
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className={labelCls}>Institute Logo</label>
                  <div
                    onClick={() => !uploading.logo && logoInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition
                      ${uploading.logo ? `${user?.color?"border-green-300 bg-green-50":"border-orange-300 bg-orange-50"} cursor-not-allowed` : `border-gray-300 ${user?.color?"hover:border-green-400 hover:bg-green-50":"hover:border-orange-400 hover:bg-orange-50"}`}`}
                  >
                    {uploading.logo ? (
                      <div className="flex items-center justify-center gap-2 py-1">
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor: user?.color || "#ff7f10"}}/>
                        <span className="text-sm" style={{color:user?.color || "#f97316"}}>Uploading...</span>
                      </div>
                    ) : editForm.logo_url ? (
                      <div className="flex items-center gap-3">
                        <img src={editForm.logo_url} alt="logo" className="h-12 w-12 object-contain rounded border" onError={e => e.target.style.display = "none"} />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-700">Logo uploaded ✓</p>
                          <p className="text-xs text-gray-400">Click to replace</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-1">
                        <p className="text-xl mb-1">🖼️</p>
                        <p className="text-sm text-gray-500 font-medium">Click to upload logo</p>
                        <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP · Max 5MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoUpload} />
                  {editForm.logo_url && !uploading.logo && (
                    <button type="button" onClick={() => setEditForm(f => ({ ...f, logo_url: "" }))} className="mt-1 text-xs text-red-500 hover:text-red-700">
                      ✕ Remove logo
                    </button>
                  )}
                </div>

                {/* Banner Upload */}
                <div>
                  <label className={labelCls}>Institute Banner</label>
                  <div
                    onClick={() => !uploading.banner && bannerInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition
                      ${uploading.banner ? `${user?.color?"border-green-300 bg-green-50":"border-orange-300 bg-orange-50"} cursor-not-allowed` : `border-gray-300 ${user?.color?"hover:border-green-400 hover:bg-green-50":"hover:border-orange-400 hover:bg-orange-50"}`}`}
                  >
                    {uploading.banner ? (
                      <div className="flex items-center justify-center gap-2 py-1">
                        <div className="w-4 h-4 border-2 border-[#ff7f10] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm" style={{color:user?.color || "#f97316"}}>Uploading...</span>
                      </div>
                    ) : editForm.banner_url ? (
                      <div>
                        <img src={editForm.banner_url} alt="banner" className="w-full h-24 object-cover rounded-lg border" onError={e => e.target.style.display = "none"} />
                        <p className="text-xs text-gray-400 mt-1">Click to replace</p>
                      </div>
                    ) : (
                      <div className="py-1">
                        <p className="text-xl mb-1">🌄</p>
                        <p className="text-sm text-gray-500 font-medium">Click to upload banner</p>
                        <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP · Max 5MB · Recommended 1200×300</p>
                      </div>
                    )}
                  </div>
                  <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleBannerUpload} />
                  {editForm.banner_url && !uploading.banner && (
                    <button type="button" onClick={() => setEditForm(f => ({ ...f, banner_url: "" }))} className="mt-1 text-xs text-red-500 hover:text-red-700">
                      ✕ Remove banner
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || uploading.logo || uploading.banner}
                  className="w-full py-2.5 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-60"
                  style={{backgroundColor: user?.color || "#ff7f10"}}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}

            {/* ===== PASSWORD TAB ===== */}
            {activeTab === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-5">

                {error && <Alert type="error" message={error} />}

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Change Password</p>

                {/* Current Password */}
                <div>
                  <label className={labelCls}>Current Password</label>
                  <div className="relative">
                    <input
                      type={showPass.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={inputCls + " pr-10"}
                      placeholder="Enter current password"
                      required
                      disabled={isSubmitting}
                    />
                    <EyeIcon show={showPass.current} onToggle={() => setShowPass(p => ({ ...p, current: !p.current }))} />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className={labelCls}>New Password</label>
                  <div className="relative">
                    <input
                      type={showPass.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={inputCls + " pr-10"}
                      placeholder="Enter new password"
                      required
                      disabled={isSubmitting}
                    />
                    <EyeIcon show={showPass.new} onToggle={() => setShowPass(p => ({ ...p, new: !p.new }))} />
                  </div>

                  {/* Strength bars */}
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1">
                      {Object.values(passwordStrength).map((valid, i) => (
                        <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${valid ? "bg-green-400" : "bg-gray-200"}`} />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                      {[
                        ["length", "8+ characters"],
                        ["upper", "Uppercase letter"],
                        ["lower", "Lowercase letter"],
                        ["number", "Number"],
                        ["special", "Special character"],
                      ].map(([key, label]) => (
                        <p key={key} className={`text-xs flex items-center gap-1 ${passwordStrength[key] ? "text-green-500" : "text-gray-400"}`}>
                          {passwordStrength[key] ? "✓" : "·"} {label}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={labelCls}>Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPass.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`${inputCls} pr-10 ${passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                          ? "border-red-400 focus:ring-red-300"
                          : passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword
                            ? "border-green-400 focus:ring-green-300"
                            : ""
                        }`}
                      placeholder="Confirm new password"
                      required
                      disabled={isSubmitting}
                    />
                    <EyeIcon show={showPass.confirm} onToggle={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))} />
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !Object.values(passwordStrength).every(Boolean)}
                    className={`flex-1 py-2.5 text-white rounded-lg text-sm font-semibold ${user?.color?"hover:bg-green-600":"hover:bg-orange-600"} transition disabled:opacity-60`}
                    style={{backgroundColor: user?.color || "#ff7f10"}}
                  >
                    {isSubmitting ? "Updating..." : "Change Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ===== LOGOUT MODAL ===== */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
            <div className="p-6">
              <div className="text-center mb-4">
                <p className="text-4xl mb-2">🚪</p>
                <h3 className="text-lg font-bold text-gray-800">Confirm Logout</h3>
                <p className="text-gray-500 text-sm mt-1">Are you sure you want to log out?</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;