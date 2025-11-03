import React, { useState, useEffect, useCallback } from "react";
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
    Pagination,
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

type FaqApiResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    num_pages: number;
    page_size: number;
    current_page: number;
    results: FAQ[];
};

const KnowledgeBasePage: React.FC = () => {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [count, setCount] = useState<number>(0);
    const [numPages, setNumPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);

    // categorization states
    const [selectedTab, setSelectedTab] = useState<string>("All");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [expandedIndex, setExpandedIndex] = useState<number | false>(false);

    // Fetch FAQs from API (paginated)
    const fetchFaqs = useCallback(
        async ({
            page = 1,
            tab = selectedTab,
            search = searchTerm
        }: { page?: number; tab?: string; search?: string }) => {
            setLoading(true);
            try {
                let queryParts: string[] = [];
                if (page) queryParts.push(`page=${page}`);
                if (tab && tab !== "All") queryParts.push(`category=${encodeURIComponent(tab)}`);
                if (search && search.trim()) queryParts.push(`search=${encodeURIComponent(search.trim())}`);
                const queryString = queryParts.length ? "?" + queryParts.join("&") : "";
                const response = await api.get(`/app/faq-articles/${queryString}`);
                const data: FaqApiResponse = response.data;

                if (data && Array.isArray(data.results)) {
                    setFaqs(
                        data.results.map(faq => ({
                            ...faq,
                            category: faq.category || "Other",
                        }))
                    );
                    setCount(data.count ?? data.results.length);
                    setNumPages(data.num_pages || 1);
                } else {
                    setFaqs([]);
                    setCount(0);
                    setNumPages(1);
                }
            } catch {
                setFaqs([]);
                setCount(0);
                setNumPages(1);
            } finally {
                setLoading(false);
            }
        },
        [selectedTab, searchTerm]
    );

    // Make sure to trigger API call on selectedTab, searchTerm, or currentPage change
    useEffect(() => {
        fetchFaqs({ page: currentPage, tab: selectedTab, search: searchTerm });
        setExpandedIndex(false); // Collapse all accordions on reload
    }, [selectedTab, searchTerm, currentPage, fetchFaqs]);

    // Handlers
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleExpand = (idx: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedIndex(isExpanded ? idx : false);
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        setSelectedTab(newValue);
        setCurrentPage(1);
        setExpandedIndex(false);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setCurrentPage(1);
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
        setExpandedIndex(false);
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
                {/* Count Display */}
                <Typography variant="subtitle2" sx={{ color: "#9B670E", fontWeight: 500, mb: 1 }}>
                    {loading
                        ? "Loading count..."
                        : (count === 1
                            ? "1 article found"
                            : `${count} articles found`)
                    }
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
                    onClick={handleClearSearch}
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
            ) : faqs.length === 0 ? (
                <Typography sx={{ color: "#b17820", py: 5, textAlign: "center" }}>
                    No articles or questions found. Try another search term.
                </Typography>
            ) : (
                <Box>
                    {faqs.map((faq, idx) => (
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

                    {(numPages > 1) && (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: 4,
                                mb: 2,
                            }}
                        >
                            <Pagination
                                count={numPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default KnowledgeBasePage;
