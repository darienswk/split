import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttractionsIcon from '@mui/icons-material/Attractions';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FlightIcon from '@mui/icons-material/Flight';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import HotelIcon from '@mui/icons-material/Hotel';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

export const NAMES = ['DS', 'KT'];

export const RADIO_OPTIONS = ['Split equally', 'Owed full amount', 'Tracking'];

export const CURRENCIES = ['KRW', 'MYR', 'SGD'];

export const categoryToIconMap = {
  General: <ReceiptIcon />,
  Dining: <RestaurantIcon />,
  Transport: <LocalTaxiIcon />,
  Shopping: <ShoppingBagIcon />,
  Attractions: <AttractionsIcon />,
  Accommodation: <HotelIcon />,
  Flights: <FlightIcon />,
};

export interface Item {
  id: string;
  createdAt: { seconds: number; nanoseconds: number };
  paidBy: string;
  currency: string;
  amount: number;
  description: string;
  payment: string;
  category: keyof typeof categoryToIconMap;
  trip_id: string;
}

export interface Summary {
  spent: number;
  owed: number;
  categorySpent: {
    [category: string]: number;
  };
}
