import { Box, Button, Typography } from "@mui/material";

// Reusable VacationCard component
export interface VacationCardProps {
    image: string;
    title: string;
    price: number | string;
    description: string;
    buttonText?: string;
    currency?: string;
    onButtonClick?: () => void;
  }
  
  export const VacationCard: React.FC<VacationCardProps> = ({
    image,
    title,
    price,
    description,
    buttonText = "Book now",
    onButtonClick,
    currency,
  }) => (
    <Box
      sx={{
        flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" },
        minWidth: { xs: "100%", sm: 260, md: 280 },
        maxWidth: { xs: "100%", sm: 340, md: 360 },
      }}
    >
      <Box
        component="div"
        sx={{
          borderRadius: 1,
          boxShadow: 3,
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        <img
          src={image}
          alt={title}
          style={{ width: "100%", borderRadius: 6, display: "block" }}
        />
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" mt={2}>
            {title}
          </Typography>
          <Typography color="primary" fontWeight="bold">
          {currency} {price} per seat
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
          <Box
            sx={{
              mt: 2,
              borderRadius: 10,
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              className="bg-[#f5ebe1] text-black shadow-sm rounded-xl normal-case mt-4 md:mt-0"
              sx={{
                width: "100%",
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 16,
                py: 1.5,
                boxShadow: "none",
                mt: 0,
              }}
              onClick={onButtonClick}
            >
              {buttonText}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
  