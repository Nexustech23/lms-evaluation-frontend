"use client";
import React, { useState, useEffect, useContext, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa"
import {
  IconEye,
  IconEyeOff,
  IconUpload,
  IconX,
  IconCheck,
  IconPencil,
} from "@tabler/icons-react";
import { AuthContext } from "@/app/AuthContext";

// ─── ImageKit Upload Helper ────────────────────────────────────────────────────
async function uploadToImageKit(file, folder = "institutes") {
  const authRes = await fetch(
    `/api/imagekit-auth`,
    { credentials: "include" }
  );
  if (!authRes.ok) throw new Error("Failed to get ImageKit auth params");
  const { token, expire, signature } = await authRes.json();

  const body = new FormData();
  body.append("file", file);
  body.append("fileName", `${Date.now()}_${file.name}`);
  body.append("folder", folder);
  body.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY);
  body.append("signature", signature);
  body.append("expire", expire);
  body.append("token", token);

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "ImageKit upload failed");
  }
  return (await res.json()).url;
}

// ─── ImageUploadField ──────────────────────────────────────────────────────────
const ImageUploadField = ({ label, name, folder = "institutes", existingUrl = "" }) => {
  const [preview, setPreview] = useState(existingUrl || null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(existingUrl || "");
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef(null);

  // Sync when existingUrl arrives after API fetch
  useEffect(() => {
    if (existingUrl) {
      setPreview(existingUrl);
      setUploadedUrl(existingUrl);
    }
  }, [existingUrl]);

  const handleFile = async (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadToImageKit(file, folder);
      setUploadedUrl(url);
    } catch (err) {
      setUploadError(err.message);
      setPreview(existingUrl || null);
      setUploadedUrl(existingUrl || "");
    } finally {
      setUploading(false);
    }
  };

  const clear = () => {
    setPreview(null);
    setUploadedUrl("");
    setUploadError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input type="hidden" name={name} value={uploadedUrl} />

      {preview ? (
        <div className="relative inline-block rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <img src={preview} alt="preview" className="h-28 w-auto object-cover" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center gap-2">
            {uploading && (
              <span className="bg-white/90 text-xs text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Uploading…
              </span>
            )}
            {uploadedUrl && !uploading && (
              <span className="bg-green-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <IconCheck size={12} /> Saved
              </span>
            )}
          </div>
          {/* Clear */}
          <button
            type="button"
            onClick={clear}
            className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow hover:bg-red-50 transition"
          >
            <IconX size={14} className="text-red-500" />
          </button>
          {/* Re-upload */}
          <label className="absolute bottom-1 right-1 bg-white/90 rounded-full p-1 shadow cursor-pointer hover:bg-orange-50 transition">
            <IconUpload size={13} className="text-orange-500" />
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-colors group">
          <IconUpload size={22} className="text-gray-400 group-hover:text-orange-400 transition-colors mb-1" />
          <span className="text-xs text-gray-500 group-hover:text-orange-500">Click to upload</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      )}

      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
    </div>
  );
};

// ─── Reusable Field ────────────────────────────────────────────────────────────
const Field = ({ label, name, type = "text", placeholder, required, defaultValue, children }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children ?? (
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition"
      />
    )}
  </div>
);

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label, description }) => (
  <div className="border border-gray-100 rounded-xl px-4 py-3 bg-gray-50/50">
    <label className="inline-flex items-center gap-3 cursor-pointer select-none w-full">
      <div className="relative shrink-0">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-orange-500" : "bg-gray-200"}`} />
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      {checked && (
        <span className="text-xs bg-orange-100 text-orange-600 font-medium px-2 py-0.5 rounded-full">
          Enabled
        </span>
      )}
    </label>
  </div>
);

// ─── Skeleton Loader ───────────────────────────────────────────────────────────
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const FormSkeleton = () => (
  <div className="space-y-8">
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const Register = () => {
  const searchParams = useSearchParams();
  const instituteId = searchParams.get("institute"); 
  const isEditMode = Boolean(instituteId);
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedRole, setSelectedRole] = useState(isEditMode ? "institute" : null);
  const [showPassword, setShowPassword] = useState(false);
  const [hasCOAccess, setHasCOAccess] = useState(false);
  const [hasQPGAccess, setHasQPGAccess] = useState(false);
  const [hasMyCareerGuruAccess, setHasMyCareerGuruAccess] = useState(false);
  const [is_active, setIs_active] = useState(true);
  const [color, setColor] = useState("#FF7F10");
  const [accountData, setAccountData] = useState(null);
  const [instituteData, setInstituteData] = useState(null);
  const [tokenLimit, setTokenLimit] = useState(null); // { gemini, claude } | null = unlimited
  const [tokenUsage, setTokenUsage] = useState(null);
  const [geminiLimitInput, setGeminiLimitInput] = useState("");
  const [claudeLimitInput, setClaudeLimitInput] = useState("");

  const { user } = useContext(AuthContext);

  // Auto-dismiss alerts
  useEffect(() => {
    if (!error && !success) return;
    const t = setTimeout(() => { setError(""); setSuccess(""); }, 4000);
    return () => clearTimeout(t);
  }, [error, success]);

  // Fetch institute data in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchInstitute = async () => {
      setIsFetching(true);
      try {
        const res = await fetch(
          `/api/institute/${instituteId}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch institute details");
        const data = await res.json();

        // Adapt to your API shape:
        // Expected: { user: { fullName, email }, institute: { ... }, hasCOAccess }
        // Fallback: flat object
        const u = data.user ?? data;
        const inst = data.institute ?? data;

        setAccountData({
          fullName: u.fullName ?? u.full_name ?? "",
          email: u.email ?? "",
        });
        setColor(inst.color ?? "#FF7F10");
        setInstituteData({
          institute_name: inst.institute_name ?? "",
          short_name: inst.short_name ?? "",
          institute_code: inst.institute_code ?? "",
          phone: inst.phone ?? "",
          website: inst.website ?? "",
          address_line1: inst.address_line1 ?? "",
          address_line2: inst.address_line2 ?? "",
          city: inst.city ?? "",
          state: inst.state ?? "",
          country: inst.country ?? "",
          pincode: inst.pincode ?? "",
          affiliation: inst.affiliation ?? "",
          accreditation: inst.accreditation ?? "",
          established_year: inst.established_year ?? "",
          logo_url: inst.logo_url ?? "",
          banner_url: inst.banner_url ?? "",
          description: inst.description ?? "",
        });
        
        setHasCOAccess(data.hasCOAccess ?? inst.hasCOAccess ?? false);
        setHasQPGAccess(data.hasQPGAccess ?? inst.hasQPGAccess ?? false);
        setHasMyCareerGuruAccess(data.hasMyCareerGuruAccess ?? inst.hasMyCareerGuruAccess ?? false);
        setIs_active(inst.is_active ?? true);

        // token_limit is absent entirely for institutes onboarded before
        // this feature existed — that means unlimited, not zero.
        setTokenLimit(inst.token_limit ?? null);
        setTokenUsage(inst.token_usage ?? null);
        setGeminiLimitInput(inst.token_limit?.gemini ?? "");
        setClaudeLimitInput(inst.token_limit?.claude ?? "");
      } catch (err) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchInstitute();
  }, [instituteId]);

  const roleOptions =
    user?.role === 1
      ? [
        { value: "superadmin", label: "Super Admin" },
        { value: "institute", label: "Institute" },
      ]
      : [];

  // Submit — create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.target);

    const institutePayload = {
      institute_name: formData.get("institute_name"),
      short_name: formData.get("short_name"),
      institute_code: formData.get("institute_code"),
      phone: formData.get("phone"),
      website: formData.get("website"),
      address_line1: formData.get("address_line1"),
      address_line2: formData.get("address_line2"),
      city: formData.get("city"),
      state: formData.get("state"),
      country: formData.get("country"),
      pincode: formData.get("pincode"),
      affiliation: formData.get("affiliation"),
      accreditation: formData.get("accreditation"),
      established_year: formData.get("established_year"),
      logo_url: formData.get("logo_url"),
      banner_url: formData.get("banner_url"),
      description: formData.get("description"),
      is_active:is_active,
    };

    try {
      if (isEditMode) {
        // Blank input = "leave as-is", so only send a limit if the
        // superadmin actually typed a value into that field.
        if (geminiLimitInput !== "") {
          institutePayload.gemini_token_limit = parseInt(geminiLimitInput, 10);
        }
        if (claudeLimitInput !== "") {
          institutePayload.claude_token_limit = parseInt(claudeLimitInput, 10);
        }

        // PUT /institute/:id
        const res = await fetch(
          `/api/institute/${instituteId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ hasCOAccess, hasQPGAccess, hasMyCareerGuruAccess,   institute: {
    ...institutePayload,
    color,
  } }),
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Update failed");
        setSuccess("Institute updated successfully!");
        router.back(-1)
      } else {
        // POST /register
        const payload = {
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          password: formData.get("password"),
          role: formData.get("role"),
        };
        if (payload.role === "institute") {
          payload.hasCOAccess = hasCOAccess;
          payload.hasQPGAccess = hasQPGAccess;
          payload.hasMyCareerGuruAccess = hasMyCareerGuruAccess;
          payload.institute =  {
    ...institutePayload,
    color, 
  };

        }

        const res = await fetch(`/api/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Registration failed");
        setSuccess("Account created successfully!");
        e.target.reset();
        setSelectedRole(null);
        setHasCOAccess(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ff7f10]" >
      <Navbar title={"Account"} />

      {isEditMode && (
        <div className="mb-4">
          <button
            onClick={() => router.push("/super-admin/billing")}
            className="flex items-center gap-2 mb-4 px-4 ml-6 py-2 text-sm bg-white text-orange-500 rounded hover:bg-orange-100"
          >
            <FaArrowLeft />
            Back
          </button>
        </div>
      )}


      <div className=" mx-auto px-6 mx-4 py-10">
        {/* Header */}
        <div className="mb-8">
          {isEditMode && (
            <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-600 font-medium px-2.5 py-1 rounded-full mb-2">
              <IconPencil size={11} /> Edit Mode
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEditMode ? "Edit Institute Account" : "Create New Account"}
          </h1>
          <p className="text-sm text-gray-50 mt-1">
            {isEditMode
              ? `Editing institute · ID: ${instituteId}`
              : "Fill in the details below to register a new user."}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            <IconX size={16} />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
            <IconCheck size={16} />
            {success}
          </div>
        )}

        {/* Skeleton while loading */}
        {isFetching ? (
          <FormSkeleton />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Account Details (create mode only) ── */}
            {!isEditMode && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Account Details</h2>
                </div>
                <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Full Name" name="fullName" placeholder="John Doe" required />
                  <Field label="Email" name="email" type="email" placeholder="john@example.com" required />

                  <Field label="Password" name="password" required>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        required
                        className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </button>
                    </div>
                  </Field>

                  <Field label="Role" name="role" required>
                    <select
                      name="role"
                      required
                      onChange={(e) => {
                        setSelectedRole(e.target.value);
                        setHasCOAccess(false);
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition"
                    >
                      <option value="">Select Role</option>
                      {roleOptions.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {/* ── Institute Details (edit mode always, create mode only when role=2) ── */}
            {(isEditMode || selectedRole === "institute") && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Institute Details</h2>
                </div>
                <div className="px-6 py-5 space-y-6">

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Institute Name" name="institute_name" placeholder="ABC University" required defaultValue={instituteData?.institute_name} />
                    <Field label="Short Name" name="short_name" placeholder="ABCU" defaultValue={instituteData?.short_name} />
                    <Field label="Institute Code" name="institute_code" placeholder="ABCU001" defaultValue={instituteData?.institute_code} />
                    <Field label="Phone" name="phone" type="tel" placeholder="+91 00000 00000" defaultValue={instituteData?.phone} />
                    <Field label="Website" name="website" type="url" placeholder="https://example.edu" defaultValue={instituteData?.website} />
                    <Field label="Established Year" name="established_year" type="number" placeholder="2000" defaultValue={instituteData?.established_year} />
                    <Field label="Affiliation" name="affiliation" placeholder="XYZ University" defaultValue={instituteData?.affiliation} />
                    <Field label="Accreditation" name="accreditation" placeholder="NAAC A+" defaultValue={instituteData?.accreditation} />
                  </div>

                  {/* Address */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Address</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <Field label="Address Line 1" name="address_line1" placeholder="Street / Building" defaultValue={instituteData?.address_line1} />
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Address Line 2" name="address_line2" placeholder="Area / Landmark (optional)" defaultValue={instituteData?.address_line2} />
                      </div>
                      <Field label="City" name="city" placeholder="Mumbai" defaultValue={instituteData?.city} />
                      <Field label="State" name="state" placeholder="Maharashtra" defaultValue={instituteData?.state} />
                      <Field label="Country" name="country" placeholder="India" defaultValue={instituteData?.country} />
                      <Field label="Pincode" name="pincode" placeholder="400001" defaultValue={instituteData?.pincode} />
                    </div>
                  </div>

                  {/* Media */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Media</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <ImageUploadField
                        label="Logo"
                        name="logo_url"
                        folder="institutes/logos"
                        existingUrl={instituteData?.logo_url ?? ""}
                      />
                      <ImageUploadField
                        label="Banner"
                        name="banner_url"
                        folder="institutes/banners"
                        existingUrl={instituteData?.banner_url ?? ""}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      placeholder="Brief description about the institute…"
                      defaultValue={instituteData?.description ?? ""}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition resize-none"
                    />
                  </div>
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    Theme Color
  </label>

  <div className="flex items-center gap-3">
    {/* Color Picker */}
    <input
      type="color"
      value={color}
      onChange={(e) => setColor(e.target.value)}
      className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
    />

    {/* Hex Input */}
    <input
      type="text"
      value={color}
      onChange={(e) => setColor(e.target.value)}
      className="px-3 py-2 text-sm border border-gray-200 rounded-lg w-32"
      placeholder="#FF7F10"
    />

  </div>
</div>
                  {/* Token Limits (edit mode only — new institutes get the default automatically) */}
                  {isEditMode && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        AI Token Limits
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Gemini Token Limit</label>
                          <input
                            type="number"
                            min="0"
                            value={geminiLimitInput}
                            onChange={(e) => setGeminiLimitInput(e.target.value)}
                            placeholder="Unlimited"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition"
                          />
                          <p className="text-xs text-gray-400">
                            Used so far: {(tokenUsage?.gemini?.total_tokens ?? 0).toLocaleString()}
                            {tokenLimit?.gemini != null && ` of ${tokenLimit.gemini.toLocaleString()}`}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Claude Token Limit</label>
                          <input
                            type="number"
                            min="0"
                            value={claudeLimitInput}
                            onChange={(e) => setClaudeLimitInput(e.target.value)}
                            placeholder="Unlimited"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition"
                          />
                          <p className="text-xs text-gray-400">
                            Used so far: {(tokenUsage?.claude?.total_tokens ?? 0).toLocaleString()}
                            {tokenLimit?.claude != null && ` of ${tokenLimit.claude.toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Leave a field blank to keep its current setting. An empty limit means unlimited usage.
                        Setting a new value replaces the total limit — it does not reset tokens already used.
                      </p>
                    </div>
                  )}

                  {/* CO Access */}
                  <Toggle
                    checked={hasCOAccess}
                    onChange={(e) => setHasCOAccess(e.target.checked)}
                    label="CO Access"
                    description="Grant Course Outcome access to this institute account"
                  />
                  {/* Question Paper Generate Access */}
                  <Toggle
                    checked={hasQPGAccess}
                    onChange={(e) => setHasQPGAccess(e.target.checked)}
                    label="Question Paper Generate Access"
                    description="Grant Question Paper Generate access to this institute account"
                  />
                  {/* MyCareerGuru Access */}
                  <Toggle
                    checked={hasMyCareerGuruAccess}
                    onChange={(e) => setHasMyCareerGuruAccess(e.target.checked)}
                    label="MyCareerGuru Access"
                    description="Allow this institute to enable MyCareerGuru per school for its students"
                  />
                     {/*Deactivate university as well as all faculty under it*/}
                  <Toggle
                    checked={is_active}
                    onChange={(e) => setIs_active(e.target.checked)}
                    label="Active status"
                    description="Grant Permission to Log In all users under this institute"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-orange-300 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {isEditMode ? "Saving Changes…" : "Creating Account…"}
                </>
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;