'use client';
import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import { AuthContext } from "@/app/AuthContext";

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  const { setUser } = useContext(AuthContext);

  const [userProfile, setUserProfile] = useState({
    fullName: "", email: "", profileImage: { url: defaultAvatar }, sessions: [], faculty_profile: null
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [error, setError] = useState("");
  const [successMessages, setSuccessMessages] = useState({ profile: "", edit: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editForm, setEditForm] = useState({
    fullName: "",
    designation: "",
    employee_code: "",
    experience_years: "",
    joining_date: "",
    qualification: "",
    specialization: "",
  });

  const [passwordStrength, setPasswordStrength] = useState({
    length: false, upper: false, lower: false, number: false, special: false
  });

  useEffect(() => { fetchUserProfile(); }, []);

  useEffect(() => {
    if (userProfile.fullName) {
      setEditForm({
        fullName: userProfile.fullName || "",
        designation: userProfile.faculty_profile?.designation || "",
        employee_code: userProfile.faculty_profile?.employee_code || "",
        experience_years: userProfile.faculty_profile?.experience_years ?? "",
        joining_date: userProfile.faculty_profile?.joining_date
          ? userProfile.faculty_profile.joining_date.split("T")[0]
          : "",
        qualification: userProfile.faculty_profile?.qualification || "",
        specialization: userProfile.faculty_profile?.specialization || "",
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.fullName.trim()) { setError("Name cannot be empty"); return; }
    try {
      setIsSubmitting(true);
      await axios.put(
        `/api/profile`,
        {
          fullName: editForm.fullName.trim(),
          designation: editForm.designation,
          employee_code: editForm.employee_code,
          experience_years: editForm.experience_years !== "" ? Number(editForm.experience_years) : undefined,
          joining_date: editForm.joining_date,
          qualification: editForm.qualification,
          specialization: editForm.specialization,
        },
        { withCredentials: true }
      );
      setSuccessMessages({ ...successMessages, edit: "Profile updated successfully!" });
      setUserProfile(prev => ({
        ...prev,
        fullName: editForm.fullName,
        faculty_profile: { ...prev.faculty_profile, ...editForm }
      }));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    if (!Object.values(passwordStrength).every(Boolean)) { setError("Password doesn't meet requirements"); setIsSubmitting(false); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { setError("Passwords don't match"); setIsSubmitting(false); return; }
    try {
      await axios.put(
        `/api/profile/change-password`,
        { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
        { withCredentials: true }
      );
      setSuccessMessages({ ...successMessages, password: "Password changed successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordStrength({ length: false, upper: false, lower: false, number: false, special: false });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const uploadToImageKit = async (file, folder) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) { setError("Only JPG, PNG, WEBP allowed"); return null; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB"); return null; }
    const authRes = await axios.get(`/api/imagekit-auth`, { withCredentials: true });
    const { token, expire, signature } = authRes.data;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", `${folder}_${Date.now()}_${file.name}`);
    formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY);
    formData.append("signature", signature);
    formData.append("expire", expire);
    formData.append("token", token);
    formData.append("folder", `/${folder}`);
    const uploadRes = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
    return { url: uploadRes.data.url, fileId: uploadRes.data.fileId };
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const result = await uploadToImageKit(file, "avatars");
      if (result) {
        await axios.put(`/api/profile`, { profileImage: result }, { withCredentials: true });
        setUserProfile(prev => ({ ...prev, profileImage: result }));
        setSuccessMessages(prev => ({ ...prev, profile: "Profile picture updated!" }));
      }
    } catch (err) {
      setError("Failed to upload profile picture");
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

  const inputCls = "w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300";
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

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: user?.color }}>
        <Navbar title="User Profile" />
        <div className="flex flex-1 items-center justify-center p-6 mt-20">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: user?.color }}>
      <Navbar title="User Profile" />

      <div className="p-6 w-[600px] mx-auto">
        <div className="bg-white rounded-xl w-full shadow-xl overflow-hidden">

          {/* Tab Navigation */}
          <div className="flex border-b">
            {["profile", "edit", "password"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 text-sm font-semibold capitalize transition ${activeTab === tab
                  ? "bg-orange-50 border-b-2"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                style={activeTab === tab ? { color: user?.color, borderBottomColor: user?.color } : {}}
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

                <div className="flex flex-col items-center py-6">
                  <div className="relative group">
                    <img
                      src={userProfile.profileImage?.url || defaultAvatar}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-4 shadow-lg object-cover"
                      style={{ borderColor: user?.color ? `${user.color}33` : '#fed7aa' }}
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
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-gray-800">{userProfile.fullName || "User"}</h2>
                  <p className="text-gray-500 text-sm mt-1">{userProfile.email}</p>

                  {userProfile.faculty_profile?.designation && (
                    <span
                      className="mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: user?.color ? `${user.color}1a` : '#fff7ed', color: user?.color }}
                    >
                      {userProfile.faculty_profile.designation}
                      {userProfile.faculty_profile.specialization && ` · ${userProfile.faculty_profile.specialization}`}
                    </span>
                  )}
                </div>

                {userProfile.faculty_profile && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: "Employee Code", value: userProfile.faculty_profile.employee_code },
                      { label: "Qualification", value: userProfile.faculty_profile.qualification },
                      { label: "Experience", value: userProfile.faculty_profile.experience_years != null ? `${userProfile.faculty_profile.experience_years} yrs` : null },
                      { label: "Joining Date", value: userProfile.faculty_profile.joining_date ? new Date(userProfile.faculty_profile.joining_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null },
                    ].map(item => item.value && (
                      <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                        <p className="text-sm text-gray-700 font-semibold mt-0.5 truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}

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
                {successMessages.edit && <Alert type="success" message={successMessages.edit} />}

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</p>

                <div>
                  <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                  <input
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Prem Nath"
                  />
                </div>

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-2">Faculty Details</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Designation</label>
                    <input
                      value={editForm.designation}
                      onChange={e => setEditForm({ ...editForm, designation: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. Assistant Professor"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Employee Code</label>
                    <input
                      value={editForm.employee_code}
                      onChange={e => setEditForm({ ...editForm, employee_code: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. PM101"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Qualification</label>
                    <input
                      value={editForm.qualification}
                      onChange={e => setEditForm({ ...editForm, qualification: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. PhD"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Specialization</label>
                    <input
                      value={editForm.specialization}
                      onChange={e => setEditForm({ ...editForm, specialization: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. Guru"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Experience (Years)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.experience_years}
                      onChange={e => setEditForm({ ...editForm, experience_years: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Joining Date</label>
                    <input
                      type="date"
                      value={editForm.joining_date}
                      onChange={e => setEditForm({ ...editForm, joining_date: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60"
                  style={{ backgroundColor: user?.color }}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}

            {/* ===== PASSWORD TAB ===== */}
            {activeTab === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-5">
                {error && <Alert type="error" message={error} />}
                {successMessages.password && <Alert type="success" message={successMessages.password} />}

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Change Password</p>

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

                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1">
                      {Object.values(passwordStrength).map((valid, i) => (
                        <div
                          key={i}
                          className="flex-1 h-1.5 rounded-full transition-colors"
                          style={{ backgroundColor: valid ? user?.color || '#4ade80' : '#e5e7eb' }}
                        />
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
                        <p key={key} className={`text-xs flex items-center gap-1 ${passwordStrength[key] ? "" : "text-gray-400"}`}
                          style={passwordStrength[key] ? { color: user?.color } : {}}>
                          {passwordStrength[key] ? "✓" : "·"} {label}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

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
                    className="flex-1 py-2.5 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60"
                    style={{ backgroundColor: user?.color }}
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