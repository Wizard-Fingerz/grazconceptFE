import { Card, CardContent, Box, Typography } from "@mui/material";

export const ImageCard = ({
  title,
  image,
  onClick,
}: {
  title: string;
  image: string;
  onClick?: () => void;
}) => (
  <Card
    sx={{
      borderRadius: 1,
      overflow: 'hidden',
      boxShadow: 2,
      cursor: 'pointer',
      height: { xs: 120, sm: 140, md: 150 },
      display: 'flex',
      alignItems: 'stretch',
      position: 'relative',
      minHeight: 100,
      p: 0,
    }}
    onClick={onClick}
  >
    {/* Use an actual <img> tag for better image rendering */}
    {image ? (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        <img
          src={image}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </Box>
    ) : (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#e0e0e0',
          zIndex: 1,
        }}
      />
    )}
    <CardContent
      sx={{
        position: 'relative',
        zIndex: 2,
        height: '100%',
        width: '100%',
        minHeight: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 0,
        background: 'rgba(0,0,0,0.35)',
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          color: '#fff',
          fontWeight: 700,
          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
          textAlign: 'center',
          width: '100%',
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          px: 2,
        }}
      >
        {title}
      </Typography>
    </CardContent>
  </Card>
);