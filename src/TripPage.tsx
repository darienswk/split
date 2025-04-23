import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Grid,
  Container,
  Box,
  Typography,
  Avatar,
  Card,
  CardActionArea,
  CircularProgress,
} from '@mui/material';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import { API_URL } from './constants';

interface Trip {
  id: string;
  trip_id: string;
  name: string;
}

const header = (
  <Grid item container xs={12} mt={1}>
    <Grid item xs={12} pl={12}>
      <Box
        component="img"
        src={
          process.env.PUBLIC_URL +
          '/gifs/dudu-bubu-riding-bikes-happy-together.gif'
        }
        alt="Bubu Dudu GIF"
      />
    </Grid>
    <Grid item xs={12} pl={11}>
      <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
        Trips🛫
      </Typography>
    </Grid>
  </Grid>
);

const TripPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/trips`);
        setTrips(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  if (trips === null) {
    return (
      <Container>
        <Grid container spacing={2}>
          {header}
          <Grid item xs={12} ml={20}>
            <CircularProgress />
          </Grid>
        </Grid>
      </Container>
    );
  }

  const handleClick = (tripId: string): void => {
    window.open(`/split/#/${tripId}`, '_self'); // Opens URL in a new tab
  };

  return (
    <Container>
      <Grid container spacing={2}>
        {header}
        <Grid item container xs={12} spacing={2}>
          {trips.map(trip => (
            <Grid item xs={12} key={trip.id}>
              <Card
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 1,
                  borderRadius: 2,
                  height: '100px',
                }}
                onClick={() => handleClick(trip.trip_id)}
              >
                <CardActionArea
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '100px',
                    paddingLeft: 1,
                    paddingRight: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      marginRight: 2,
                    }}
                  >
                    <CardTravelIcon />
                  </Avatar>
                  <Typography variant="h6">{trip.name}</Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Container>
  );
};

export default TripPage;
