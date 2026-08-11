import {
    Box,
    Chip,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";


export default function SemesterTranscriptTable({ semester, color = "#c7003d" }) {
    return (
        <Paper
            variant="outlined"
            sx={{
                mb: 3,
                overflow: "hidden",
                borderRadius: "16px",
                border: "1px solid #e4e8ee",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
            }}
        >
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1.5}
                sx={{ p: { xs: 2, sm: 2.5 }, backgroundColor: "#fff8fa", borderBottom: "1px solid #f2d5dd" }}
            >
                <Box>
                    <Typography variant="h6" fontWeight={800}>Semester {semester.semester}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Subject marks, relative grades and calculated credit points
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Chip label={`${semester.totalCredits} Credits`} size="small" variant="outlined" />
                    <Chip label={`TGPA ${semester.tgpa}`} size="small" sx={{ color: "#ffffff", backgroundColor: color, fontWeight: 750 }} />
                </Stack>
            </Stack>

            <TableContainer>
                <Table size="small" sx={{ minWidth: 760 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                            <TableCell sx={{ fontWeight: 750 }}>Subject</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 750 }}>Credits</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 750 }}>Marks</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 750 }}>Grade</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 750 }}>Grade Point</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 750 }}>Credit Points</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {semester.subjects.map((subject) => (
                            <TableRow key={subject.subject} hover>
                                <TableCell sx={{ fontWeight: 650 }}>{subject.subject}</TableCell>
                                <TableCell align="center">{subject.credits}</TableCell>
                                <TableCell align="center">{subject.marks}</TableCell>
                                <TableCell align="center">
                                    <Chip label={subject.grade} size="small" sx={{ minWidth: 48, color, backgroundColor: "#fff0f4", fontWeight: 800 }} />
                                </TableCell>
                                <TableCell align="center">{subject.gradePoint}</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700 }}>{subject.creditPoints}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
                    gap: 1,
                    p: 2,
                    borderTop: "1px solid #e4e8ee",
                    backgroundColor: "#f8fafc",
                }}
            >
                {[
                    ["Total Credits", semester.totalCredits],
                    ["Credit Points", semester.totalCreditPoints],
                    ["TGPA", semester.tgpa],
                    ["Cumulative CGPA", semester.cgpa],
                ].map(([label, value]) => (
                    <Box key={label} sx={{ p: 1.25, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                        <Typography variant="h6" fontWeight={800}>{value}</Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
}
