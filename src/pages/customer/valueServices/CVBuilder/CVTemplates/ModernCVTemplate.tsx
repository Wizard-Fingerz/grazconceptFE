import { Box, Typography, Chip } from "@mui/material";

// ModernCVTemplate: A clean, modern CV PDF template for print/export.
// Props: { cv: object }
const ModernCVTemplate = ({ cv }: { cv: any }) => {
    // Helper to get array or empty array, for safety on missing/undefined.
    function arr(val: any): any[] {
        return Array.isArray(val) ? val : [];
    }
    // Helper: capitalize
    function cap(s: string) {
        return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
    }

    // Some inline color, border, line
    const accentColor = "#3B82F6";
    const sectionSpace = { mt: 4, mb: 2 };
    const nameFont = { fontWeight: 700, fontSize: "2.4rem", lineHeight: 1.1 };
    const labelText = { color: accentColor, fontWeight: 600, letterSpacing: 1, mb: 0.5 };

    const getPersonal = () => {
        // Support both "personal" and root fields (legacy data).
        return cv.personal
            ? {
                  fullName: cv.personal.fullName || cv.personal.full_name || "",
                  email: cv.personal.email || "",
                  phone: cv.personal.phone || "",
                  address: cv.personal.address || "",
                  country: cv.personal.country || "",
                  summary: cv.summary || cv.personal.summary || "",
                  photo: cv.personal.photo || cv.photo || null,
              }
            : {
                  fullName: cv.fullName || cv.full_name || "",
                  email: cv.email || "",
                  phone: cv.phone || "",
                  address: cv.address || "",
                  country: cv.country || "",
                  summary: cv.summary || "",
                  photo: cv.photo || null,
              };
    };
    const personal = getPersonal();

    // Helper for photo rendering
    function renderPhoto(photo: any) {
        if (!photo) return null;
        // If photo is a string, treat as an URL/base64. Otherwise skip.
        let src = typeof photo === "string" && photo ? photo : null;
        if (!src) return null;
        return (
            <Box
                sx={{
                    borderRadius: "50%",
                    overflow: "hidden",
                    width: 110,
                    height: 110,
                    boxShadow: 2,
                    border: `3px solid ${accentColor}`,
                    mb: 1,
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt="Profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                fontFamily: '"Nunito", Arial, sans-serif',
                background: "#fff",
                color: "#16213e",
                px: { xs: 2, sm: 5 },
                py: { xs: 2, sm: 4 },
                maxWidth: 790,
                minHeight: "80vh",
            }}
        >
            {/* Header: Name + Photo */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    borderBottom: `3.5px solid ${accentColor}`,
                    pb: 2,
                    mb: 2,
                }}
            >
                {personal.photo && (
                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                        {renderPhoto(personal.photo)}
                    </Box>
                )}
                <Box>
                    <Typography sx={nameFont} color="primary">
                        {personal.fullName || "Full Name"}
                    </Typography>
                    <Typography
                        sx={{
                            fontStyle: "italic",
                            fontSize: "1.05rem",
                            fontWeight: 500,
                            color: "#475569",
                            mt: 0.5,
                        }}
                    >
                        {personal.summary || "Professional / Academic Summary"}
                    </Typography>
                </Box>
            </Box>

            {/* Sidebar Contact */}
            <Box
                sx={{
                    display: "flex",
                    gap: 4,
                    mb: 1,
                    flexWrap: "wrap",
                }}
            >
                {personal.email && (
                    <Typography sx={{ color: "#334155", fontSize: "1.07rem" }}>
                        <strong>Email:</strong> {personal.email}
                    </Typography>
                )}
                {personal.phone && (
                    <Typography sx={{ color: "#334155", fontSize: "1.07rem" }}>
                        <strong>Phone:</strong> {personal.phone}
                    </Typography>
                )}
                {personal.address && (
                    <Typography sx={{ color: "#334155", fontSize: "1.07rem" }}>
                        <strong>Address:</strong> {personal.address}
                    </Typography>
                )}
                {personal.country && (
                    <Typography sx={{ color: "#334155", fontSize: "1.07rem" }}>
                        <strong>Country:</strong> {personal.country}
                    </Typography>
                )}
            </Box>

            {/* Education Section */}
            {arr(cv.education).length > 0 && (
                <Box sx={sectionSpace}>
                    <Typography sx={labelText} variant="h6">
                        EDUCATION
                    </Typography>
                    <Box>
                        {arr(cv.education).map((ed: any) => (
                            <Box
                                key={ed.id || ed.institution + ed.degree}
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    mb: 2,
                                }}
                            >
                                <Box>
                                    <Typography fontWeight={600} fontSize="1.12rem">
                                        {ed.degree} {ed.field && <>in {ed.field}</>}{" "}
                                        <span style={{ color: accentColor, fontWeight: 400 }}>
                                            @ {ed.institution}
                                        </span>
                                    </Typography>
                                    <Typography sx={{ color: "#475569" }} fontSize="1.03rem">
                                        {ed.start_year || ed.startYear || ""}{" "}
                                        {ed.end_year || ed.endYear ? (
                                            <> - {ed.end_year || ed.endYear}</>
                                        ) : null}
                                        {ed.grade && (
                                            <> | <span style={{ fontWeight: 500 }}>Grade:</span> {ed.grade}</>
                                        )}
                                    </Typography>
                                    {ed.description && (
                                        <Typography sx={{ color: "#64748b" }}>
                                            {ed.description}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Experience Section */}
            {arr(cv.experience).length > 0 && (
                <Box sx={sectionSpace}>
                    <Typography sx={labelText} variant="h6">
                        EXPERIENCE
                    </Typography>
                    <Box>
                        {arr(cv.experience).map((xp: any) => (
                            <Box
                                key={xp.id || xp.organization + xp.position}
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    mb: 2,
                                }}
                            >
                                <Box>
                                    <Typography fontWeight={600} fontSize="1.12rem">
                                        {xp.position}{" "}
                                        <span style={{ color: accentColor, fontWeight: 400 }}>
                                            @ {xp.organization}
                                        </span>
                                    </Typography>
                                    <Typography sx={{ color: "#475569" }} fontSize="1.03rem">
                                        {xp.start_month || xp.startMonth || ""}{" "}
                                        {xp.start_year || xp.startYear || ""}
                                        {(xp.end_month || xp.endMonth || xp.end_year || xp.endYear) && (
                                            <>
                                                {" "}
                                                -{" "}
                                                {xp.current
                                                    ? "Present"
                                                    : `${xp.end_month || xp.endMonth || ""} ${xp.end_year || xp.endYear || ""}`}
                                            </>
                                        )}
                                        {xp.location && <> | {xp.location}</>}
                                    </Typography>
                                    {xp.description && (
                                        <Typography sx={{ color: "#64748b" }}>
                                            {xp.description}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Certifications */}
            {arr(cv.certifications).length > 0 && (
                <Box sx={sectionSpace}>
                    <Typography sx={labelText} variant="h6">
                        CERTIFICATIONS
                    </Typography>
                    <Box>
                        {arr(cv.certifications).map((c: any) => (
                            <Box key={c.id || c.name} sx={{ mb: 1.4 }}>
                                <Typography fontWeight={600}>
                                    {c.name} {c.issuer && <span style={{ color: "#6366F1", fontWeight: 400 }}>({c.issuer})</span>}
                                </Typography>
                                <Typography fontSize={14} sx={{ color: "#94a3b8" }}>
                                    {c.issue_month || c.issueMonth || ""} {c.issue_year || c.issueYear || ""}
                                </Typography>
                                {c.description && (
                                    <Typography fontSize={14} sx={{ color: "#64748b" }}>
                                        {c.description}
                                    </Typography>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Skills */}
            {arr(cv.skills).length > 0 && (
                <Box sx={sectionSpace}>
                    <Typography sx={labelText} variant="h6">
                        SKILLS
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1, mb: 2 }}>
                        {arr(cv.skills).map((s: any) => (
                            <Chip
                                key={typeof s === "string" ? s : s.skill}
                                label={typeof s === "string" ? s : s.skill}
                                sx={{
                                    background: "#e0e7ff",
                                    color: "#3730a3",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    letterSpacing: 0.2,
                                }}
                                size="medium"
                            />
                        ))}
                    </Box>
                </Box>
            )}

            {/* Languages */}
            {arr(cv.languages).length > 0 && (
                <Box sx={sectionSpace}>
                    <Typography sx={labelText} variant="h6">
                        LANGUAGES
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap", mt: 1, mb: 2 }}>
                        {arr(cv.languages).map((l: any) => (
                            <Chip
                                key={l.id || l.name}
                                label={`${l.name}${l.proficiency ? ` (${cap(l.proficiency)})` : ""}`}
                                sx={{
                                    background: "#bbf7d0",
                                    color: "#065f46",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    letterSpacing: 0.2,
                                }}
                                size="medium"
                            />
                        ))}
                    </Box>
                </Box>
            )}

            {/* Publications */}
            {arr(cv.publications).length > 0 && (
                <Box sx={sectionSpace}>
                    <Typography sx={labelText} variant="h6">
                        PUBLICATIONS
                    </Typography>
                    <Box>
                        {arr(cv.publications).map((p: any) => (
                            <Box key={p.id || p.title} sx={{ mb: 1.4 }}>
                                <Typography fontWeight={600}>
                                    {p.title}{" "}
                                    {p.year && (
                                        <span style={{ color: "#475569", fontWeight: 400 }}>
                                            ({p.year})
                                        </span>
                                    )}
                                </Typography>
                                {p.journal && (
                                    <Typography fontSize={14} sx={{ color: "#4F46E5" }}>
                                        {p.journal}
                                    </Typography>
                                )}
                                {p.link && (
                                    <Typography fontSize={14} sx={{ color: "#2563eb", textDecoration: "underline" }}>
                                        <a href={p.link} target="_blank" rel="noopener noreferrer">
                                            {p.link}
                                        </a>
                                    </Typography>
                                )}
                                {p.description && (
                                    <Typography fontSize={14} sx={{ color: "#64748b" }}>
                                        {p.description}
                                    </Typography>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Footer / Date */}
            {cv.created_at && (
                <Box sx={{ mt: 8, textAlign: "right", color: "#64748b", fontSize: 14 }}>
                    Last updated: {new Date(cv.updated_at || cv.created_at).toLocaleDateString()}
                </Box>
            )}
        </Box>
    );
};

export default ModernCVTemplate;
