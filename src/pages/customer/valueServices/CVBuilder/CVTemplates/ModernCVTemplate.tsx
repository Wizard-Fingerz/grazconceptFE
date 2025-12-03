import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Chip, Divider, Drawer, Button, IconButton,
    Select, MenuItem, InputLabel, FormControl, Stack
} from "@mui/material";
import { useAuth } from "../../../../../context/AuthContext";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

type ModernCVTemplateProps = {
    cv: any,
    colors?: {
        accentColor?: string,
        subtleBg?: string,
        darkerText?: string,
        mutedText?: string,
        faintText?: string,
        skillBg?: string,
        languageBg?: string,
        skillColor?: string,
        languageColor?: string,
        boxShadow?: string,
        headerShadow?: string,
        cardBg?: string,
        gradeColor?: string,
        publicationLink?: string,
    },
    fontFamily?: string,
    onThemeChange?: (newColors: any, newFont?: string) => void
};

const DEFAULT_COLORS = {
    accentColor: "#2563eb",
    subtleBg: "#f8fafc",
    darkerText: "#0f172a",
    mutedText: "#64748b",
    faintText: "#94a3b8",
    skillBg: "#eff6ff",
    languageBg: "#dbeafe",
    skillColor: "#2563eb",
    languageColor: "#0369a1",
    boxShadow: "0 2px 28px 0 #dbeafe",
    headerShadow: "0 4px 24px 0 #cbd5e1",
    cardBg: "#fff",
    gradeColor: "#16a34a",
    publicationLink: "#2563eb"
};

// Note: The default font must match exactly one of the FONT_OPTIONS values!
const DEFAULT_FONT = '"Inter", sans-serif';

const FONT_OPTIONS = [
    { label: "Inter", value: '"Inter", sans-serif' },
    { label: "Nunito", value: '"Nunito", sans-serif' },
    { label: "Segoe UI", value: '"Segoe UI", Arial, sans-serif' },
    { label: "Arial", value: 'Arial, sans-serif' },
    { label: "Roboto", value: '"Roboto", sans-serif' },
    { label: "Georgia", value: '"Georgia", serif' },
];

const COLOR_KEYS = [
    { key: "accentColor", label: "Accent Color" },
    { key: "subtleBg", label: "Subtle Background" },
    { key: "darkerText", label: "Primary Text" },
    { key: "mutedText", label: "Muted Text" },
    { key: "faintText", label: "Faint Text" },
    { key: "skillBg", label: "Skill Background" },
    { key: "languageBg", label: "Language Background" },
    { key: "skillColor", label: "Skill Text" },
    { key: "languageColor", label: "Language Text" },
    { key: "boxShadow", label: "Box Shadow (CSS)" },
    { key: "headerShadow", label: "Header Shadow (CSS)" },
    { key: "cardBg", label: "Card Background" },
    { key: "gradeColor", label: "Grade Color" },
    { key: "publicationLink", label: "Link Color" },
];

// Defensive null/undefined check for color palette input
function getPaletteHex(color: any) {
    // Defensive: Only extract color hex, for palette, handle if not a valid color
    if (!color || typeof color !== "string") return "#000000";
    let hexMatch = color.match(/#(?:[A-Fa-f0-9]{3}){1,2}/);
    if (hexMatch) return hexMatch[0];
    let rgbMatch = color.match(/rgb[a]?\((.*?)\)/);
    if (rgbMatch) {
        const parts = rgbMatch[1].split(",").map((p) => parseInt(p.trim(), 10));
        if (parts.length >= 3) {
            let hex = "#";
            for (let i = 0; i < 3; i++) {
                hex += ("0" + Math.max(0, Math.min(parts[i], 255)).toString(16)).slice(-2);
            }
            return hex;
        }
    }
    // fallback
    return "#000000";
}

const ModernCVTemplate = ({
    cv,
    colors = {},
    fontFamily = DEFAULT_FONT,
    onThemeChange
}: ModernCVTemplateProps) => {
    const { user } = useAuth();

    // --- Two state sets: (1) staged edits (shown in UI), 
    // (2) saved, used for actual rendering and prop updates ---
    const [drawerOpen, setDrawerOpen] = useState(false);

    // The *applied* theme (what is shown and saved, and updated when drawer closes or new theme comes via props etc)
    const [appliedTheme, setAppliedTheme] = useState(() => ({ ...DEFAULT_COLORS, ...(colors ?? {}) }));
    const [appliedFont, setAppliedFont] = useState(fontFamily || DEFAULT_FONT);

    // The *temporary* theme, allows live updating while editing
    const [tempTheme, setTempTheme] = useState(() => ({ ...DEFAULT_COLORS, ...(colors ?? {}) }));
    const [tempFont, setTempFont] = useState(fontFamily || DEFAULT_FONT);

    // Always use-applied theme when rendering; use temp theme only in sidebar
    const themeColors = appliedTheme;
    const currentFont = appliedFont;

    // Watch for incoming changes from parent (like template switching, or initial load)
    useEffect(() => {
        setAppliedTheme(_theme => ({ ...DEFAULT_COLORS, ...(colors ?? {}) }));
        setTempTheme({ ...DEFAULT_COLORS, ...(colors ?? {}) });
    }, [colors]);

    useEffect(() => {
        setAppliedFont(fontFamily || DEFAULT_FONT);
        setTempFont(fontFamily || DEFAULT_FONT);
    }, [fontFamily]);

    // When sidebar opened, stage the working theme/font
    useEffect(() => {
        if (drawerOpen) {
            setTempTheme(appliedTheme ?? { ...DEFAULT_COLORS });
            setTempFont(appliedFont || DEFAULT_FONT);
        }
    }, [drawerOpen, appliedTheme, appliedFont]);

    // When sidebar closed, commit changes (save temp edits into applied)
    const handleDrawerClose = useCallback(() => {
        setDrawerOpen(false);
        setAppliedTheme(tempTheme ?? { ...DEFAULT_COLORS });
        setAppliedFont(tempFont || DEFAULT_FONT);
        if (onThemeChange) onThemeChange(tempTheme, tempFont);
    }, [tempTheme, tempFont, onThemeChange]);

    // Save on Escape inside drawer (note: commented out CMD+Enter in original, keeping that logic unchanged)
    useEffect(() => {
        if (!drawerOpen) return;
        function handleKey(e: KeyboardEvent) {
            if (e.code === "Escape") {
                setDrawerOpen(false);
            }
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [drawerOpen]);

    // Defensive array cast helper to ensure not reading .length of null/undefined
    function arr(val: any): any[] {
        return Array.isArray(val) ? val : (val ? [val] : []);
    }
    function cap(s: string) {
        return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
    }

    const sectionSpace = { mt: 5, mb: 2.5 };
    const nameFont = {
        fontWeight: 800,
        fontSize: { xs: "2rem", sm: "2.8rem" },
        lineHeight: 1,
        letterSpacing: ".5px",
        textTransform: "uppercase",
        color: themeColors?.darkerText,
        fontFamily: currentFont
    };
    const labelText = {
        color: themeColors?.accentColor,
        fontWeight: 700,
        letterSpacing: 1.2,
        mb: 1,
        fontSize: "1.20rem",
        fontFamily: currentFont
    };

    // Guard all possible cv or cv.personal state accesses
    const getPersonal = () => {
        if (!cv) return {
            fullName: user?.full_name || "",
            email: user?.email || "",
            phone: user?.phone_number || "",
            address: user?.address || "",
            country: user?.country || "",
            summary: "",
            photo: user?.profile_picture_url || null,
        };
        if (cv.personal) {
            return {
                fullName: cv.personal.fullName || cv.personal.full_name || user?.full_name || "",
                email: cv.personal.email || user?.email || "",
                phone: cv.personal.phone || user?.phone_number || "",
                address: cv.personal.address || user?.address || "",
                country: cv.personal.country || user?.country || "",
                summary: cv.summary || cv.personal.summary || "",
                photo: cv.personal.photo || cv.photo || user?.profile_picture_url || null,
            };
        } else {
            return {
                fullName: cv.fullName || cv.full_name || user?.full_name || "",
                email: cv.email || user?.email || "",
                phone: cv.phone || user?.phone_number || "",
                address: cv.address || user?.address || "",
                country: cv.country || user?.country || "",
                summary: cv.summary || "",
                photo: cv.photo || user?.profile_picture || null,
            };
        }
    };
    const personal = getPersonal();

    function renderPhoto(photo: any) {
        if (!photo) return null;
        let src = typeof photo === "string" && photo ? photo : null;
        if (!src) return null;
        return (
            <Box
                sx={{
                    borderRadius: "40%",
                    overflow: "hidden",
                    width: 110,
                    height: 110,
                    border: `3px solid ${themeColors?.accentColor}`,
                    boxShadow: themeColors?.headerShadow,
                    mb: 1,
                    background: themeColors?.cardBg,
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

    function renderContactField(label: string, value: string) {
        return (
            <Typography
                sx={{
                    fontSize: "1rem",
                    color: themeColors?.darkerText,
                    fontWeight: 500,
                    mr: 3,
                    mb: { xs: 0.6, sm: 0 },
                    fontFamily: currentFont
                }}
            >
                <span style={{
                    fontWeight: 700,
                    color: themeColors?.accentColor,
                    letterSpacing: "0.5px",
                    marginRight: 8,
                    textTransform: "uppercase",
                    fontFamily: currentFont
                }}>{label}:</span> {value}
            </Typography>
        );
    }

    function formatEduDate(start: any, end: any) {
        let s = (start === null || start === undefined) ? "" : String(start);
        let e = (end === null || end === undefined) ? "" : String(end);
        return s && e && s !== e ? `${s} – ${e}` : s || e;
    }
    function formatXpDate(xp: any) {
        if (!xp) return "";
        const sm = xp.start_month || xp.startMonth;
        const sy = xp.start_year || xp.startYear;
        const em = xp.end_month || xp.endMonth;
        const ey = xp.end_year || xp.endYear;
        let start = [sm, sy].filter(Boolean).join(" ");
        let end = xp.current ? "Present" : [em, ey].filter(Boolean).join(" ");
        return start && end ? `${start} – ${end}` : start || end;
    }

    // Color and Font Sidebar UI
    function renderThemeSidebar() {
        // Defensive: avoid accessing .value on undefined/null
        const isDrawerOpen = Boolean(drawerOpen);
        return (
            <Drawer
                anchor="right"
                open={isDrawerOpen}
                onClose={handleDrawerClose}
                sx={{
                    zIndex: 1700,
                    "& .MuiDrawer-paper": {
                        width: { xs: "96vw", sm: 360 },
                        px: 3,
                        pb: 4,
                        pt: 0.5,
                        background: "#f5f7fa",
                        boxSizing: "border-box",
                    }
                }}
                ModalProps={{
                    container: typeof window !== "undefined"
                        ? (document?.querySelector?.('#modal-root') || undefined)
                        : undefined,
                }}
            >
                <Box display="flex" alignItems="center" justifyContent="space-between" mt={2} mb={2}>
                    <Typography variant="h6" fontWeight={700} fontFamily={tempFont}>
                        Edit Theme
                    </Typography>
                    <IconButton aria-label="Close editing" onClick={handleDrawerClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Font Family Picker */}
                <FormControl fullWidth sx={{ mb: 2.7 }}>
                    <InputLabel id="font-family-select-label" sx={{ fontFamily: tempFont }}>Font Family</InputLabel>
                    <Select
                        labelId="font-family-select-label"
                        value={typeof tempFont === "string" ? tempFont : DEFAULT_FONT}
                        label="Font Family"
                        onChange={(e) => setTempFont(typeof e.target.value === "string" ? e.target.value : DEFAULT_FONT)}
                        sx={{ fontFamily: tempFont }}
                        MenuProps={{
                            anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left"
                            },
                            transformOrigin: {
                                vertical: "top",
                                horizontal: "left"
                            },
                            container: typeof window !== "undefined"
                                ? (document?.querySelector?.('#modal-root') || undefined)
                                : undefined,
                            disablePortal: true,
                            PaperProps: {
                                style: {
                                    zIndex: 2002
                                }
                            }
                        }}
                    >
                        {FONT_OPTIONS.map((opt) => (
                            <MenuItem key={opt.label} value={opt.value} style={{ fontFamily: opt.value }}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Color Pickers */}
                <Typography variant="subtitle1" fontWeight={700} fontFamily={tempFont} mt={1} mb={.6}>
                    Colors
                </Typography>
                <Stack spacing={2}>
                    {COLOR_KEYS.map((col) => {
                        const colKey = col.key as keyof typeof DEFAULT_COLORS;
                        let colValue = (tempTheme && typeof tempTheme === "object" && Object.prototype.hasOwnProperty.call(tempTheme, col.key))
                            ? tempTheme[colKey]
                            : DEFAULT_COLORS[colKey];

                        // Default/fallback if value is null or undefined
                        if (colValue === undefined || colValue === null) {
                            colValue = DEFAULT_COLORS[colKey];
                        }

                        // For text fields, always use a string
                        const showValue = typeof colValue === "string" ? colValue : (
                            colValue !== undefined && colValue !== null ? String(colValue) : ""
                        );

                        return (
                            <Box key={col.key} display="flex" alignItems="center" gap={2}>
                                <Typography sx={{
                                    fontWeight: 500,
                                    fontFamily: tempFont,
                                    minWidth: 128,
                                    fontSize: 14
                                }}>{col.label}</Typography>
                                {(col.key.includes("Shadow")) ?
                                    <input
                                        type="text"
                                        value={showValue}
                                        style={{
                                            flexGrow: 1,
                                            padding: "4px 7px",
                                            border: "1px solid #dde",
                                            borderRadius: 4,
                                            fontFamily: tempFont,
                                            fontSize: 14,
                                        }}
                                        onChange={e => {
                                            setTempTheme(prev => ({
                                                ...prev,
                                                [col.key]: e.target.value
                                            }));
                                        }}
                                    />
                                    :
                                    <input
                                        type="color"
                                        value={getPaletteHex(showValue)}
                                        style={{
                                            width: 36,
                                            height: 28,
                                            border: "none",
                                            background: "none",
                                        }}
                                        onChange={e => {
                                            setTempTheme(prev => ({
                                                ...prev,
                                                [col.key]: e.target.value
                                            }));
                                        }}
                                    />
                                }
                                <input
                                    type="text"
                                    value={showValue}
                                    style={{
                                        minWidth: 110,
                                        fontFamily: tempFont,
                                        fontSize: 12,
                                        marginLeft: 4,
                                    }}
                                    onChange={e =>
                                        setTempTheme(prev => ({
                                            ...prev,
                                            [col.key]: e.target.value
                                        }))
                                    }
                                />
                            </Box>
                        );
                    })}
                </Stack>
                <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 4, fontFamily: tempFont, fontWeight: 700 }}
                    onClick={() => {
                        setTempTheme({ ...DEFAULT_COLORS });
                        setTempFont(DEFAULT_FONT);
                    }}
                >
                    Reset to Default
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2, fontFamily: tempFont, fontWeight: 700 }}
                    onClick={handleDrawerClose}
                >
                    Save & Apply Theme
                </Button>
            </Drawer>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                background: themeColors?.subtleBg,
                px: { xs: 0, sm: 2 },
                py: { xs: 2, sm: 4 },
                boxSizing: "border-box"
            }}
        >
            {/* Sidebar Edit Button */}
            <Box
                sx={{
                    position: "absolute",
                    right: { xs: 18, sm: 42 },
                    top: { xs: 14, sm: 38 },
                    zIndex: 1500,
                }}
            >
                <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setDrawerOpen(true)}
                    sx={{
                        background: themeColors?.accentColor,
                        color: "#fff",
                        fontFamily: currentFont,
                        fontWeight: 700,
                        fontSize: 15,
                        px: 2,
                        boxShadow: "0 2px 14px #aac3ff29",
                        "&:hover": { background: "#234fcf" }
                    }}
                >
                    Theme
                </Button>
            </Box>
            {renderThemeSidebar()}

            {/* The main CV */}
            <Box
                sx={{
                    fontFamily: currentFont,
                    background: themeColors?.cardBg,
                    color: themeColors?.darkerText,
                    px: { xs: 1, sm: 4 },
                    py: { xs: 2.5, sm: 4.5 },
                    maxWidth: 780,
                    width: "100%",
                    borderRadius: 3,
                    boxShadow: themeColors?.boxShadow,
                    minHeight: "84vh",
                    my: "auto",
                    marginLeft: { xs: 0, sm: 3 },
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        borderBottom: `.19rem solid ${themeColors?.accentColor}`,
                        pb: 3,
                        mb: 4,
                        gap: { xs: 2.5, sm: 4 }
                    }}
                >
                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                        {renderPhoto(personal.photo)}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{
                            ...nameFont,
                            color: themeColors?.darkerText,
                            fontFamily: currentFont
                        }}>
                            {personal.fullName || "Full Name"}
                        </Typography>
                        {personal.summary && (
                            <Typography
                                sx={{
                                    fontSize: "1.15rem",
                                    fontWeight: 400,
                                    color: themeColors?.mutedText,
                                    mt: 1,
                                    mb: 0.25,
                                    letterSpacing: ".01em",
                                    fontFamily: currentFont
                                }}
                            >
                                {personal.summary}
                            </Typography>
                        )}
                    </Box>
                </Box>
                {/* Contact */}
                <Box
                    sx={{
                        display: "flex",
                        gap: { xs: 1, sm: 4 },
                        mb: 3,
                        flexWrap: "wrap",
                        pl: { xs: 0.2, sm: 2 }
                    }}
                >
                    {personal.email && renderContactField("Email", personal.email)}
                    {personal.phone && renderContactField("Phone", personal.phone)}
                    {personal.address && renderContactField("Address", personal.address)}
                    {personal.country && renderContactField("Country", personal.country)}
                </Box>
                {/* --- Sections --- */}

                {/* Education */}
                {arr(cv?.education).length > 0 && (
                    <Box sx={sectionSpace}>
                        <Typography sx={{
                            ...labelText,
                            color: themeColors?.accentColor,
                            fontFamily: currentFont
                        }}>Education</Typography>
                        <Divider flexItem sx={{ my: 1.2, mb: 2, borderColor: themeColors?.subtleBg }} />
                        <Box>
                            {arr(cv?.education).map((ed: any, idx: number) => (
                                <Box
                                    key={ed?.id || ((ed?.institution ?? "") + (ed?.degree ?? "") + idx)}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: { xs: "stretch", sm: "flex-start" },
                                        mb: 2.6,
                                        flexDirection: { xs: "column", sm: "row" },
                                    }}
                                >
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            fontWeight="bold"
                                            fontSize="1.11rem"
                                            sx={{
                                                color: themeColors?.darkerText,
                                                mb: .1,
                                                letterSpacing: .02,
                                                fontFamily: currentFont
                                            }}
                                        >
                                            {ed?.degree}
                                            {ed?.field && (
                                                <span style={{ fontWeight: 400, color: themeColors?.mutedText, fontFamily: currentFont }}>
                                                    {` in ${ed.field}`}
                                                </span>
                                            )}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: ".98rem",
                                                color: themeColors?.accentColor,
                                                fontWeight: 500,
                                                mb: .3,
                                                fontFamily: currentFont
                                            }}
                                        >
                                            {ed?.institution}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: themeColors?.faintText,
                                                fontSize: ".92rem",
                                                fontWeight: 400,
                                                mb: 0.9,
                                                fontFamily: currentFont
                                            }}
                                        >
                                            {formatEduDate(ed?.start_year ?? ed?.startYear, ed?.end_year ?? ed?.endYear)}
                                            {ed?.grade && (
                                                <>{" | "}Grade: <b style={{ color: themeColors?.gradeColor, fontFamily: currentFont }}>{ed.grade}</b></>
                                            )}
                                        </Typography>
                                        {ed?.description && (
                                            <Typography
                                                sx={{
                                                    fontSize: ".97rem",
                                                    color: themeColors?.mutedText,
                                                    whiteSpace: "pre-line",
                                                    fontFamily: currentFont
                                                }}>
                                                {ed.description}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Experience */}
                {arr(cv?.experience).length > 0 && (
                    <Box sx={sectionSpace}>
                        <Typography sx={{
                            ...labelText,
                            color: themeColors?.accentColor,
                            fontFamily: currentFont
                        }}>Experience</Typography>
                        <Divider flexItem sx={{ my: 1.2, mb: 2, borderColor: themeColors?.subtleBg }} />
                        <Box>
                            {arr(cv?.experience).map((xp: any, idx: number) => (
                                <Box
                                    key={xp?.id || ((xp?.organization ?? "") + (xp?.position ?? "") + idx)}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: { xs: "stretch", sm: "flex-start" },
                                        flexDirection: { xs: "column", sm: "row" },
                                        mb: 2.6
                                    }}
                                >
                                    <Box flex={1}>
                                        <Typography
                                            fontWeight="bold"
                                            fontSize="1.12rem"
                                            sx={{
                                                color: themeColors?.darkerText,
                                                mb: .12,
                                                letterSpacing: .02,
                                                fontFamily: currentFont
                                            }}
                                        >
                                            {xp?.position}
                                            <span style={{ fontWeight: 400, color: themeColors?.accentColor, fontFamily: currentFont }}>
                                                {"  "}@ {xp?.organization}
                                            </span>
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: themeColors?.faintText,
                                                fontSize: ".98rem",
                                                fontWeight: 500,
                                                mb: 0.9,
                                                fontFamily: currentFont
                                            }}
                                        >
                                            {formatXpDate(xp)}{xp?.location && <>{" | "}<span style={{ color: themeColors?.mutedText, fontFamily: currentFont }}>{xp.location}</span></>}
                                        </Typography>
                                        {xp?.description && (
                                            <Typography
                                                sx={{
                                                    fontSize: ".97rem",
                                                    color: themeColors?.mutedText,
                                                    whiteSpace: "pre-line",
                                                    fontFamily: currentFont
                                                }}>
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
                {arr(cv?.certifications).length > 0 && (
                    <Box sx={sectionSpace}>
                        <Typography sx={{
                            ...labelText,
                            color: themeColors?.accentColor,
                            fontFamily: currentFont
                        }}>Certifications</Typography>
                        <Divider flexItem sx={{ my: 1.2, mb: 2, borderColor: themeColors?.subtleBg }} />
                        <Box>
                            {arr(cv?.certifications).map((c: any, idx: number) => (
                                <Box key={c?.id || ((c?.name ?? "") + idx)} sx={{ mb: 1.8 }}>
                                    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                                        <Typography fontWeight={700} fontSize="1.08rem" sx={{ color: themeColors?.accentColor, fontFamily: currentFont }}>
                                            {c?.name}
                                        </Typography>
                                        {c?.issuer && (
                                            <Typography fontSize={14} sx={{ color: themeColors?.darkerText, fontWeight: 500, ml: .5, fontFamily: currentFont }}>
                                                {c.issuer}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography fontSize={14} sx={{ color: themeColors?.faintText, mb: .25, fontFamily: currentFont }}>
                                        {(c?.issue_month || c?.issueMonth || "")}
                                        {(c?.issue_year || c?.issueYear) && <> {c.issue_year || c.issueYear}</>}
                                    </Typography>
                                    {c?.description && (
                                        <Typography fontSize={14} sx={{ color: themeColors?.mutedText, whiteSpace: "pre-line", fontFamily: currentFont }}>
                                            {c.description}
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Skills */}
                {arr(cv?.skills).length > 0 && (
                    <Box sx={sectionSpace}>
                        <Typography sx={{
                            ...labelText,
                            color: themeColors?.accentColor,
                            fontFamily: currentFont
                        }}>Skills</Typography>
                        <Divider flexItem sx={{ my: 1.2, mb: 2, borderColor: themeColors?.subtleBg }} />
                        <Box sx={{ display: "flex", gap: 1.1, flexWrap: "wrap", mt: 1.3, mb: 2 }}>
                            {arr(cv?.skills).map((s: any, idx: number) => (
                                <Chip
                                    key={
                                        typeof s === "string"
                                            ? s
                                            : (s?.skill ?? idx)
                                    }
                                    label={typeof s === "string" ? s : (s?.skill ?? "")}
                                    sx={{
                                        background: themeColors?.skillBg,
                                        color: themeColors?.skillColor,
                                        fontWeight: 600,
                                        fontSize: 15,
                                        boxShadow: "none",
                                        letterSpacing: 0.14,
                                        borderRadius: 2,
                                        px: 2,
                                        py: .7,
                                        fontFamily: currentFont
                                    }}
                                    size="medium"
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Languages */}
                {arr(cv?.languages).length > 0 && (
                    <Box sx={sectionSpace}>
                        <Typography sx={{
                            ...labelText,
                            color: themeColors?.accentColor,
                            fontFamily: currentFont
                        }}>Languages</Typography>
                        <Divider flexItem sx={{ my: 1.2, mb: 2, borderColor: themeColors?.subtleBg }} />
                        <Box sx={{ display: "flex", gap: 1.1, flexWrap: "wrap", mt: 1.3, mb: 2 }}>
                            {arr(cv?.languages).map((l: any, idx: number) => (
                                <Chip
                                    key={l?.id || l?.name || idx}
                                    label={
                                        <span style={{ fontFamily: currentFont }}>
                                            {l?.name}
                                            {l?.proficiency && (
                                                <span style={{
                                                    color: themeColors?.mutedText,
                                                    fontWeight: 400,
                                                    marginLeft: "0.38em",
                                                    fontFamily: currentFont
                                                }}>
                                                    ({cap(l.proficiency)})
                                                </span>
                                            )}
                                        </span>
                                    }
                                    sx={{
                                        background: themeColors?.languageBg,
                                        color: themeColors?.languageColor,
                                        fontWeight: 600,
                                        fontSize: 15,
                                        borderRadius: 2,
                                        px: 2,
                                        py: .7,
                                        fontFamily: currentFont
                                    }}
                                    size="medium"
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Publications */}
                {arr(cv?.publications).length > 0 && (
                    <Box sx={sectionSpace}>
                        <Typography sx={{
                            ...labelText,
                            color: themeColors?.accentColor,
                            fontFamily: currentFont
                        }}>Publications</Typography>
                        <Divider flexItem sx={{ my: 1.2, mb: 2, borderColor: themeColors?.subtleBg }} />
                        <Box>
                            {arr(cv?.publications).map((p: any, idx: number) => (
                                <Box key={p?.id || ((p?.title ?? "") + idx)} sx={{ mb: 1.7 }}>
                                    <Typography fontWeight={700} fontSize="1rem" sx={{ color: themeColors?.accentColor, fontFamily: currentFont }}>
                                        {p?.title}
                                        {p?.year && (
                                            <span style={{ color: themeColors?.faintText, fontWeight: 400, fontFamily: currentFont }}>
                                                {" "}({p.year})
                                            </span>
                                        )}
                                    </Typography>
                                    {p?.journal && (
                                        <Typography fontSize={14} sx={{ color: themeColors?.darkerText, fontWeight: 500, fontFamily: currentFont }}>
                                            {p.journal}
                                        </Typography>
                                    )}
                                    {p?.link && (
                                        <Typography fontSize={14} sx={{
                                            color: themeColors?.publicationLink,
                                            textDecoration: "underline",
                                            wordBreak: "break-all",
                                            fontFamily: currentFont
                                        }}>
                                            <a href={/^https?:\/\//.test(p.link) ? p.link : `https://${p.link}`}
                                               target="_blank"
                                               rel="noopener noreferrer"
                                               style={{ color: "inherit", fontFamily: currentFont }}>
                                                {p.link}
                                            </a>
                                        </Typography>
                                    )}
                                    {p?.description && (
                                        <Typography fontSize={14} sx={{ color: themeColors?.mutedText, whiteSpace: "pre-line", fontFamily: currentFont }}>
                                            {p.description}
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Footer / Date */}
                {(cv?.created_at) && (
                    <Divider sx={{ mt: 7, mb: 2, borderColor: themeColors?.subtleBg }} />
                )}
                {(cv?.created_at || cv?.updated_at) && (
                    <Box sx={{
                        textAlign: "right",
                        color: themeColors?.faintText,
                        fontSize: 13,
                        pr: { xs: 0, sm: 1 },
                        fontFamily: currentFont
                    }}>
                        Last updated: {(() => {
                            const raw = cv?.updated_at || cv?.created_at;
                            try {
                                return raw ? new Date(raw).toLocaleDateString() : "";
                            } catch {
                                return "";
                            }
                        })()}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ModernCVTemplate;
