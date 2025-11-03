import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Tabs,
    Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import api from "../../../../services/api";

// FAQ category definitions
const FAQ_CATEGORIES = [
    { label: "All", value: "All" },
    { label: "Work/Interview", value: "Work/Interview" },
    { label: "Study", value: "Study" },
    { label: "Investment", value: "Investment" },
    { label: "Citizenship", value: "Citizenship" },
    { label: "Other", value: "Other" },
];

// FAQ item type
type FAQ = {
    id?: number | string;
    question: string;
    answer: string;
    category?: string;
};

const KnowledgeBasePage: React.FC = () => {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    // categorization states
    const [selectedTab, setSelectedTab] = useState("All");
    const [expandedIndex, setExpandedIndex] = useState<number | false>(false);

    // Fetch FAQs from API
    useEffect(() => {
        setLoading(true);
        api
            .get("/faq-articles", { withCredentials: true })
            .then((response) => {
                let data = response.data;
                // Make sure every FAQ has a category ("Other" if not)
                if (Array.isArray(data)) {
                    const cleaned = data.map((faq) => ({
                        ...faq,
                        category: faq.category || "Other",
                    }));
                    setFaqs(cleaned);
                } else {
                    setFaqs([]);
                }
            })
            .catch(() => {
                // You might want to show a toast here
                setFaqs([]);
            })
            .finally(() => setLoading(false));
    }, []);

    // Filter FAQs based on selected tab and search
    const getFilteredFaqs = () => {
        let categoryFaqs =
            selectedTab === "All"
                ? faqs
                : faqs.filter((faq) => (faq.category || "Other") === selectedTab);

        if (searchTerm.trim()) {
            categoryFaqs = categoryFaqs.filter(
                ({ question, answer }) =>
                    question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    answer.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return categoryFaqs;
    };

    const filteredFaqs = getFilteredFaqs();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleExpand = (idx: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedIndex(isExpanded ? idx : false);
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        setSelectedTab(newValue);
        setExpandedIndex(false); // Collapse all accordions when changing tab
    };

    return (
        <Box
            sx={{
                px: { xs: 1, sm: 2, md: 4 },
                py: { xs: 1, sm: 2 },
                width: "100%",
                maxWidth: 1400,
                mx: "auto",
            }}
        >
            <CustomerPageHeader>
                <Typography variant="h4" className="font-bold mb-2">
                    Knowledge Base & FAQs
                </Typography>
                <Typography variant="body1" className="text-gray-700 mb-4">
                    Find answers to the most common questions and get support for your account, applications, and more.
                </Typography>
            </CustomerPageHeader>

            <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                aria-label="FAQ categories"
                sx={{
                    mb: 2,
                    borderBottom: 1,
                    borderColor: "divider",
                    minHeight: "40px",
                }}
                variant="scrollable"
                scrollButtons="auto"
            >
                {FAQ_CATEGORIES.map((cat) => (
                    <Tab
                        key={cat.value}
                        label={cat.label}
                        value={cat.value}
                        sx={{ minWidth: 120, fontWeight: 600, textTransform: "none" }}
                    />
                ))}
            </Tabs>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <TextField
                    value={searchTerm}
                    onChange={handleSearchChange}
                    size="small"
                    placeholder="Search questions, topics, or keywords..."
                    sx={{ width: { xs: "100%", sm: 400 } }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton edge="end" disabled>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    variant="text"
                    sx={{ ml: 2 }}
                    onClick={() => setSearchTerm("")}
                    disabled={!searchTerm}
                >
                    Clear
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading FAQs...</Typography>
                </Box>
            ) : filteredFaqs.length === 0 ? (
                <Typography sx={{ color: "#b17820", py: 5, textAlign: "center" }}>
                    No articles or questions found. Try another search term.
                </Typography>
            ) : (
                <Box>
                    {filteredFaqs.map((faq, idx) => (
                        <Accordion
                            expanded={expandedIndex === idx}
                            onChange={handleExpand(idx)}
                            key={faq.id ?? idx}
                            sx={{ mb: 2, borderRadius: 2, boxShadow: "none", border: "1px solid #ecd5a0" }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight={600}>{faq.question}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>{faq.answer}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default KnowledgeBasePage;
