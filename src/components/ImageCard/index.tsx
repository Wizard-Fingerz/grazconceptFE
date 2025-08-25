import { Card, CardContent } from "@mui/material";

export const ImageCard = ({ title }: { title: string }) => (
  <Card
    sx={{
      borderRadius: 1,
      overflow: 'hidden',
      boxShadow: 2,
      cursor: 'pointer',
      height: { xs: 120, sm: 140, md: 150 },
      display: 'flex',
      alignItems: 'stretch',
    }}
  >
    <CardContent
      sx={{
        height: '100%',
        width: '100%',
        minHeight: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url('https://source.unsplash.com/400x200/?airplane,travel')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
        p: 0,
      }}
    >
      {title}
    </CardContent>
  </Card>
);