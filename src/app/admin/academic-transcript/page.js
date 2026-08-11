"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Container,
    Divider,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    BookOpen,
    Download,
    FileCheck2,
    FileSpreadsheet,
    GraduationCap,
    Printer,
    Search,
    UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/ui/Navbar";
import { AuthContext } from "@/app/AuthContext";
import SemesterTranscriptTable from "./components/SemesterTranscriptTable";


const fieldStyles = {
    "& .MuiOutlinedInput-root": {
        backgroundColor: "#ffffff",
        borderRadius: "10px",
    },
};


export default function AcademicTranscript() {
    const { user } = useContext(AuthContext);
    const color = user?.color || "#c7003d";
    const [schools, setSchools] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [hasDepartment, setHasDepartment] = useState(true);
    const [batches, setBatches] = useState([]);
    const [studentId, setStudentId] = useState("");
    const [transcript, setTranscript] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState({
        school: "",
        programme: "",
        department: "",
        batch: "",
    });

    useEffect(() => {
        axios
            .get("/api/schools", { params: { page: 1, limit: 0 }, withCredentials: true })
            .then((response) => setSchools(response.data.schools || []))
            .catch(() => toast.error("Failed to load schools"));
    }, []);

    const transcriptSummary = useMemo(() => {
        const semesters = transcript?.semesters || [];
        return {
            semesterCount: semesters.length,
            totalCredits: semesters.reduce(
                (total, semester) => total + Number(semester.totalCredits || 0),
                0,
            ),
            finalCGPA: transcript?.finalCGPA ?? "—",
        };
    }, [transcript]);

    const clearTranscript = () => {
        setTranscript(null);
        setError("");
    };

    const handleSchool = async (schoolId) => {
        setSelected({ school: schoolId, programme: "", department: "", batch: "" });
        setProgrammes([]);
        setDepartments([]);
        setBatches([]);
        clearTranscript();
        if (!schoolId) return;
        try {
            const response = await axios.get(`/api/programmes/${schoolId}`, {
                params: { page: 1, limit: 0 },
                withCredentials: true,
            });
            setProgrammes(response.data.programmes || []);
        } catch {
            toast.error("Failed to load programmes");
        }
    };

    const handleProgramme = async (programmeId) => {
        setSelected((previous) => ({ ...previous, programme: programmeId, department: "", batch: "" }));
        setDepartments([]);
        setBatches([]);
        clearTranscript();
        if (!programmeId) return;
        try {
            const response = await axios.get(`/api/departments/${programmeId}`, {
                params: { page: 1, limit: 0 },
                withCredentials: true,
            });
            const realDepartments = (response.data.departments || []).filter(
                (department) => department.id !== null && department.department_name !== null,
            );
            setHasDepartment(realDepartments.length > 0);
            if (realDepartments.length) {
                setDepartments(realDepartments);
            } else {
                const batchResponse = await axios.get("/api/batches", {
                    params: { page: 1, limit: 0, programme_id: programmeId },
                    withCredentials: true,
                });
                setBatches(batchResponse.data.batches || []);
            }
        } catch {
            toast.error("Failed to load departments");
        }
    };

    const handleDepartment = async (departmentId) => {
        setSelected((previous) => ({ ...previous, department: departmentId, batch: "" }));
        setBatches([]);
        clearTranscript();
        if (!departmentId) return;
        try {
            const response = await axios.get("/api/batches", {
                params: { page: 1, limit: 0, department_id: departmentId },
                withCredentials: true,
            });
            setBatches(response.data.batches || []);
        } catch {
            toast.error("Failed to load batches");
        }
    };

    const handleSearch = async () => {
        const normalizedStudentId = studentId.trim();
        if (!selected.batch || !normalizedStudentId) {
            toast.error("Please select a batch and enter a Student ID");
            return;
        }
        setLoading(true);
        setError("");
        setTranscript(null);
        try {
            const response = await axios.get(
                `/api/transcript/${encodeURIComponent(normalizedStudentId)}`,
                {
                    params: { batch_id: selected.batch },
                    withCredentials: true,
                },
            );
            setTranscript(response.data);
        } catch (requestError) {
            setError(requestError?.response?.data?.error || "Unable to load the academic transcript");
        } finally {
            setLoading(false);
        }
    };

    const handlePrintTranscript = () => window.print();

    const handleExportExcel = async () => {
        if (!selected.batch) {
            toast.error("Please select a batch before exporting");
            return;
        }
        const normalizedStudentId = studentId.trim();
        setExporting(true);
        try {
            const response = await axios.get("/api/transcript/export/excel", {
                params: {
                    batch_id: selected.batch,
                    ...(normalizedStudentId && { student_id: normalizedStudentId }),
                },
                responseType: "blob",
                withCredentials: true,
            });
            const disposition = response.headers["content-disposition"] || "";
            const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
            const fallbackFilename = normalizedStudentId
                ? `academic_transcript_${normalizedStudentId.replace(/\s+/g, "_")}.xlsx`
                : "batch_academic_transcripts.xlsx";
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = filenameMatch?.[1] || fallbackFilename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(
                normalizedStudentId
                    ? "Student transcript Excel downloaded"
                    : "Batch transcript Excel downloaded",
            );
        } catch (requestError) {
            let message = "Unable to export academic transcript Excel";
            const responseData = requestError?.response?.data;
            if (responseData instanceof Blob) {
                try {
                    const errorBody = JSON.parse(await responseData.text());
                    message = errorBody.error || message;
                } catch {
                    message = "Unable to export academic transcript Excel";
                }
            } else if (responseData?.error) {
                message = responseData.error;
            }
            toast.error(message);
        } finally {
            setExporting(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!transcript) return;
        setDownloading(true);
        try {
            const response = await axios.get(
                `/api/transcript/${encodeURIComponent(transcript.studentId)}/pdf`,
                {
                    params: { batch_id: selected.batch },
                    responseType: "blob",
                    withCredentials: true,
                },
            );
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = `academic_transcript_${transcript.studentId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (requestError) {
            toast.error(requestError?.response?.data?.error || "Unable to download transcript PDF");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: color }}>
            <Navbar title="Academic Transcript" />
            <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
                <Card
                    variant="outlined"
                    sx={{
                        p: { xs: 2, sm: 3 },
                        mb: 3,
                        border: "1px solid #f1c4d0",
                        borderRadius: "16px",
                        boxShadow: "0 12px 35px rgba(76, 5, 29, 0.08)",
                        "@media print": { display: "none" },
                    }}
                >
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={2}
                        sx={{ mb: 3 }}
                    >
                        <Stack direction="row" spacing={1.75} alignItems="center">
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: "14px",
                                    color,
                                    backgroundColor: "#fff0f4",
                                }}
                            >
                                <GraduationCap size={25} />
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight={750}>Student Academic Transcript</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Find a student using the exact ID imported from the transcript workbook.
                                </Typography>
                            </Box>
                        </Stack>
                        <Chip
                            icon={<FileCheck2 size={16} />}
                            label="Imported transcript records"
                            variant="outlined"
                            sx={{ borderColor: "#efb2c2", backgroundColor: "#fff8fa" }}
                        />
                    </Stack>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, minmax(0, 1fr))",
                                lg: hasDepartment
                                    ? "repeat(4, minmax(0, 1fr))"
                                    : "repeat(3, minmax(0, 1fr))",
                            },
                            gap: 2,
                            p: { xs: 2, sm: 2.5 },
                            border: "1px solid #f4d4dc",
                            borderRadius: "14px",
                            backgroundColor: "#fff9fb",
                        }}
                    >
                        <TextField select fullWidth label="School" value={selected.school} onChange={(event) => handleSchool(event.target.value)} sx={fieldStyles}>
                            <MenuItem value="">Select School</MenuItem>
                            {schools.map((school) => <MenuItem key={school.id} value={school.id}>{school.school_name}</MenuItem>)}
                        </TextField>
                        <TextField select fullWidth label="Programme" value={selected.programme} disabled={!selected.school} onChange={(event) => handleProgramme(event.target.value)} sx={fieldStyles}>
                            <MenuItem value="">Select Programme</MenuItem>
                            {programmes.map((programme) => <MenuItem key={programme.id} value={programme.id}>{programme.programme_name}</MenuItem>)}
                        </TextField>
                        {hasDepartment && (
                            <TextField select fullWidth label="Department" value={selected.department} disabled={!selected.programme} onChange={(event) => handleDepartment(event.target.value)} sx={fieldStyles}>
                                <MenuItem value="">Select Department</MenuItem>
                                {departments.map((department) => <MenuItem key={department.id} value={department.id}>{department.department_name}</MenuItem>)}
                            </TextField>
                        )}
                        <TextField
                            select
                            fullWidth
                            label="Batch"
                            value={selected.batch}
                            disabled={hasDepartment ? !selected.department : !selected.programme}
                            onChange={(event) => {
                                setSelected((previous) => ({ ...previous, batch: event.target.value }));
                                clearTranscript();
                            }}
                            sx={fieldStyles}
                        >
                            <MenuItem value="">Select Batch</MenuItem>
                            {batches.map((batch) => <MenuItem key={batch.id} value={batch.id}>{batch.batch_name}</MenuItem>)}
                        </TextField>
                    </Box>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                md: "minmax(0, 1fr) auto auto",
                            },
                            gap: 1.5,
                            mt: 2,
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Student ID"
                            placeholder="Example: Student 1"
                            value={studentId}
                            onChange={(event) => {
                                setStudentId(event.target.value);
                                clearTranscript();
                            }}
                            onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                            sx={fieldStyles}
                            helperText="Leave Student ID blank to export the complete batch. Enter an ID to export one student."
                            InputProps={{
                                startAdornment: <UserRound size={19} color="#7b8794" style={{ marginRight: 10 }} />,
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSearch}
                            disabled={loading || !selected.batch || !studentId.trim()}
                            startIcon={!loading && <Search size={18} />}
                            sx={{
                                minWidth: { md: 210 },
                                minHeight: 56,
                                px: 3,
                                borderRadius: "10px",
                                backgroundColor: color,
                                fontWeight: 700,
                                boxShadow: "none",
                            }}
                        >
                            {loading ? <CircularProgress size={22} color="inherit" /> : "Search Transcript"}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleExportExcel}
                            disabled={exporting || !selected.batch}
                            startIcon={!exporting && <FileSpreadsheet size={18} />}
                            sx={{
                                minWidth: { md: 210 },
                                minHeight: 56,
                                px: 3,
                                borderRadius: "10px",
                                borderColor: color,
                                color,
                                fontWeight: 700,
                            }}
                        >
                            {exporting
                                ? "Exporting..."
                                : studentId.trim()
                                    ? "Export Student Excel"
                                    : "Export Batch Excel"}
                        </Button>
                    </Box>
                </Card>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>{error}</Alert>}

                {!transcript && !loading && !error && (
                    <Card
                        variant="outlined"
                        sx={{
                            p: { xs: 3, md: 5 },
                            textAlign: "center",
                            border: "1px solid #f1c4d0",
                            borderRadius: "16px",
                            boxShadow: "0 12px 35px rgba(76, 5, 29, 0.06)",
                        }}
                    >
                        <Box
                            sx={{
                                width: 72,
                                height: 72,
                                display: "grid",
                                placeItems: "center",
                                mx: "auto",
                                mb: 2,
                                borderRadius: "20px",
                                color,
                                backgroundColor: "#fff0f4",
                            }}
                        >
                            <BookOpen size={34} />
                        </Box>
                        <Typography variant="h6" fontWeight={750}>Search for a student transcript</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 3 }}>
                            Transcript results become available after a faculty member confirms a subject-wise Excel import.
                        </Typography>
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="center"
                            divider={<Divider orientation="vertical" flexItem />}
                            spacing={{ xs: 1.5, md: 3 }}
                        >
                            {[
                                [FileSpreadsheet, "1", "Import workbook"],
                                [FileCheck2, "2", "Confirm calculation"],
                                [Search, "3", "Search Student ID"],
                            ].map(([Icon, number, label]) => (
                                <Stack key={number} direction="row" spacing={1} alignItems="center" justifyContent="center">
                                    <Box sx={{ color }}><Icon size={18} /></Box>
                                    <Typography variant="body2"><strong>{number}.</strong> {label}</Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Card>
                )}

                {transcript && (
                    <Box id="academic-transcript-print-area">
                        <Card
                            variant="outlined"
                            sx={{
                                p: { xs: 2.5, sm: 3.5 },
                                mb: 3,
                                borderRadius: "16px",
                                border: "1px solid #e4e8ee",
                                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                            }}
                        >
                            <Stack
                                direction={{ xs: "column", md: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", md: "center" }}
                                spacing={2}
                            >
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Box sx={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: "12px", color, backgroundColor: "#fff0f4" }}>
                                        <GraduationCap size={24} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight={800}>Academic Transcript</Typography>
                                        <Typography variant="body2" color="text.secondary">Verified semester-wise academic record</Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={1.25} sx={{ "@media print": { display: "none" } }}>
                                    <Button variant="outlined" startIcon={<Printer size={17} />} onClick={handlePrintTranscript} sx={{ borderColor: color, color }}>
                                        Print
                                    </Button>
                                    <Button variant="contained" startIcon={<Download size={17} />} onClick={handleDownloadPdf} disabled={downloading} sx={{ backgroundColor: color, boxShadow: "none" }}>
                                        {downloading ? "Downloading..." : "Download PDF"}
                                    </Button>
                                </Stack>
                            </Stack>

                            <Divider sx={{ my: 3 }} />

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
                                    gap: 2,
                                }}
                            >
                                {[
                                    ["Student Name", transcript.studentName],
                                    ["Student ID", transcript.studentId],
                                    ["School", transcript.school],
                                    ["Programme", transcript.programme],
                                    ["Department", transcript.department || "—"],
                                    ["Batch", transcript.batch],
                                ].map(([label, value]) => (
                                    <Box key={label} sx={{ p: 1.75, borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #edf0f4" }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={650}>{label}</Typography>
                                        <Typography variant="body1" fontWeight={700} sx={{ mt: 0.25 }}>{value || "—"}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
                                    gap: 1.5,
                                    mt: 2.5,
                                }}
                            >
                                {[
                                    ["Semesters", transcriptSummary.semesterCount],
                                    ["Total Credits", transcriptSummary.totalCredits],
                                    ["Final CGPA", transcriptSummary.finalCGPA],
                                ].map(([label, value]) => (
                                    <Box key={label} sx={{ p: 2, borderRadius: "12px", color: label === "Final CGPA" ? "#ffffff" : "#172033", backgroundColor: label === "Final CGPA" ? color : "#fff4f7", border: label === "Final CGPA" ? "none" : "1px solid #f5ccd6" }}>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>{label}</Typography>
                                        <Typography variant="h5" fontWeight={800}>{value}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Card>

                        {transcript.semesters.map((semester) => (
                            <SemesterTranscriptTable key={semester.semester} semester={semester} color={color} />
                        ))}
                    </Box>
                )}
            </Container>
        </div>
    );
}
