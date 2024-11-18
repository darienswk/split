import axios from 'axios';
import { Grid, Typography, Container, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, FormControlLabel, FormLabel, Radio, RadioGroup, Button, Card, CardHeader, IconButton, Chip, Avatar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ListItemIcon, ListItemText, Box } from "@mui/material";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttractionsIcon from '@mui/icons-material/Attractions';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FlightIcon from '@mui/icons-material/Flight';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import HotelIcon from '@mui/icons-material/Hotel';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

import Dudu from "./dudu.jpg";
import Bubu from "./bubu.jpg";
import PieChart from './PieChart';

const categoryToIconMap = {
    "General": <ReceiptIcon />,
    "Dining": <RestaurantIcon />,
    "Transport": <LocalTaxiIcon />,
    "Shopping": <ShoppingBagIcon />,
    "Attractions": <AttractionsIcon />,
    "Accommodation": <HotelIcon />,
    "Flights": <FlightIcon />,
};

const API_URL = "https://split-server-t63h.onrender.com";
// const API_URL = "http://localhost:5000";

const convertTimestampToDate = (timestamp: { seconds: number, nanoseconds: number }): Date => {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
};

const NAMES = [
    "DS", "KT"
];

const RADIO_OPTIONS = ["Split equally", "Owed full amount", "Tracking"];

const CURRENCIES = ["MYR", "SGD"];

interface Item {
    id: string;
    createdAt: { seconds: number, nanoseconds: number };
    paidBy: string;
    currency: string;
    amount: number;
    description: string;
    payment: string;
    category: keyof typeof categoryToIconMap;
}

interface Summary {
    spent: number;
    owed: number;
    categorySpent: {
        [category: string]: number;
    }
}


const HomePage: React.FC = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [data, setData] = useState<Item[]>([]);
    const [paidBy, setPaidby] = useState("");
    const [currency, setCurreny] = useState(CURRENCIES[0]);
    const [amount, setAmount] = useState<number | null>(null);
    const [description, setDescription] = useState("");
    const [payment, setPayment] = useState(RADIO_OPTIONS[0]);
    const [category, setCategory] = useState("General");
    const [summary, setSummary] = useState<{ [key: string]: Summary }>({
        DS: { spent: 0, owed: 0, categorySpent: {} },
        KT: { spent: 0, owed: 0, categorySpent: {} },
    });
    const [conversionRates, setConversionRates] = useState<{ [currency: string]: number } | null>(null);

    // For filtering
    const [selectedChart, setSelectedChart] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedPiece, setSelectedPiece] = useState<{ chart: string; category: string } | null>(null);

    const handleSetSelectedChart = useCallback((chart: string) => {
        setSelectedChart(chart);
    }, []);

    const handleSetSelectedCategory = useCallback((category: string) => {
        setSelectedCategory(category);
    }, []);

    const handleSetSelectedPiece = useCallback((piece: { chart: string; category: string } | null) => {
        setSelectedPiece(piece);
    }, []);


    const handleClickOpen = (itemId: string) => {
        setDialogOpen(true);
        setItemToDelete(itemId);
    };

    const handleClose = () => {
        setDialogOpen(false);
        setItemToDelete(null);
    };


    const handlePaidByChange = (event: SelectChangeEvent): void => {
        setPaidby(event.target.value as string);
    }

    const onCurrencyChange = (event: SelectChangeEvent): void => {
        setCurreny(event.target.value as string);
    }

    const handleChange = (event: SelectChangeEvent) => {
        setCategory(event.target.value as string);
    };

    const onAmountChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        setAmount(Number(event.target.value));
    };

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        setDescription(event.target.value);
    };

    const handlePaymentChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setPayment((event.target as HTMLInputElement).value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        // Add form submission logic here
        const newItem = { paidBy, currency, amount: amount ?? 0, description, payment, category };

        if (amount !== null && amount < 0) {
            return;
        }

        try {
            await axios.post(`${API_URL}/payments`, { newItem });

        } catch (error) {
            console.error('Error adding document: ', error);
        }
        event.preventDefault();
    };

    useEffect(() => {
        // TODO: update for all currencies
        const MYR_EXCHANGE_RATE = conversionRates?.["MYR"] ?? 3.38;
        const calculateSummary = () => {
            const summary: { [key: string]: Summary } = {
                DS: { spent: 0, owed: 0, categorySpent: {} },
                KT: { spent: 0, owed: 0, categorySpent: {} },
            };

            data.forEach(item => {
                const { paidBy, amount, payment, currency, category } = item;
                const cost = currency === "SGD" ? amount : amount / MYR_EXCHANGE_RATE;

                if (payment === 'Tracking') {
                    summary[paidBy].spent += cost;
                    summary[paidBy].categorySpent[category] = (summary[paidBy].categorySpent[category] || 0) + cost;
                } else if (payment === 'Split equally') {
                    const halfCost = cost / 2;

                    summary["DS"].spent += halfCost;
                    summary["DS"].categorySpent[category] = (summary["DS"].categorySpent[category] || 0) + halfCost;

                    summary["KT"].spent += halfCost;
                    summary["KT"].categorySpent[category] = (summary["KT"].categorySpent[category] || 0) + halfCost;

                    const otherUser = paidBy === 'DS' ? 'KT' : 'DS';
                    summary[otherUser].owed += halfCost;
                } else if (payment === 'Owed full amount') {
                    const otherUser = paidBy === 'DS' ? 'KT' : 'DS';

                    summary[otherUser].owed += cost;
                    summary[otherUser].spent += cost;
                    summary[otherUser].categorySpent[category] = (summary[otherUser].categorySpent[category] || 0) + cost;
                }
            });

            setSummary(summary);
        };

        calculateSummary();
    }, [data, conversionRates]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_URL}/payments`)
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const fetchConversionRates = async () => {
            try {
                const response = await axios.get(`${API_URL}/exchange-rates`)
                setConversionRates(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
        fetchConversionRates();
    }, []);

    const handleDelete = async () => {
        try {
            await axios.delete(`${API_URL}/payments/${itemToDelete}`);
            // fetch again
            const response = await axios.get(`${API_URL}/payments`)
            setData(response.data);
        } catch (error) {
            console.error('Error deleting/fetching document: ', error);
        }
        handleClose();
    };

    const pieChart = useMemo(() => <PieChart
        summary={summary}
        selectedChart={selectedChart}
        setSelectedChart={handleSetSelectedChart}
        selectedCategory={selectedCategory}
        setSelectedCategory={handleSetSelectedCategory}
        selectedPiece={selectedPiece}
        setSelectedPiece={handleSetSelectedPiece}
    />, [handleSetSelectedCategory, handleSetSelectedChart, handleSetSelectedPiece, selectedCategory, selectedChart, selectedPiece, summary]);

    if (data.length === 0) {
        return <p>Loading...</p>;
    }

    return <Container>
        <Grid container spacing={3}>
            <Grid item xs={12} pl={2}>
                <Typography>This app is in beta</Typography>
            </Grid>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2} mt={2} pl={2}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel id="paidBy">Paid by</InputLabel>
                            <Select
                                value={paidBy}
                                label="Paid by"
                                onChange={handlePaidByChange}
                                required
                                renderValue={(selected) => <Chip key={selected} label={selected} avatar={<Avatar alt="" src={selected === "DS" ? Dudu : Bubu} />} />}
                            >
                                {
                                    NAMES.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3} >
                        <FormControl fullWidth>
                            <InputLabel id="currency">Currency</InputLabel>
                            <Select
                                value={currency}
                                label="Currency"
                                onChange={onCurrencyChange}
                                required
                            >
                                {
                                    CURRENCIES.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={9} >
                        <FormControl fullWidth>
                            <TextField
                                label="Amount"
                                type="number"
                                value={amount}
                                onChange={onAmountChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                required
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} >
                        <FormControl>
                            <FormLabel id="repayment">Payment</FormLabel>
                            <RadioGroup
                                value={payment}
                                name="repayment"
                                onChange={handlePaymentChange}
                            >
                                {RADIO_OPTIONS.map(option => <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                                )}
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} >
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel id="category-select-label">Category</InputLabel>
                            <Select
                                labelId="category-select-label"
                                id="category-select"
                                value={category}
                                onChange={handleChange}
                                label="Category"
                                renderValue={(selected) => (
                                    <Box display="flex" alignItems="center">
                                        {categoryToIconMap[selected as keyof typeof categoryToIconMap]}
                                        <span style={{ marginLeft: 8 }}>{selected as string}</span>
                                    </Box>
                                )}
                            >
                                {Object.entries(categoryToIconMap).map(([key, Icon]) => (
                                    <MenuItem key={key} value={key}>
                                        <ListItemIcon>
                                            {Icon}
                                        </ListItemIcon>
                                        <ListItemText primary={key} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} >
                        <FormControl fullWidth>
                            <TextField
                                value={description}
                                onChange={handleDescriptionChange}
                                required
                                label="Description"
                            />
                        </FormControl>
                    </Grid>
                    <Grid item>
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </form>
            <br />
            <Grid item container xs={12} spacing={1}>
                <Grid item xs={12}>
                    <Typography variant="h6">Summary</Typography>
                </Grid>
                <Grid item xs={12}>
                    {pieChart}
                </Grid>
                {/* <Grid item xs={12}>
                    {summary.DS.owed > summary.KT.owed ? <Typography>DS owes KT: {(summary.DS.owed - summary.KT.owed).toFixed(2)} SGD</Typography> : <Typography>KT owes DS: {(summary.KT.owed - summary.DS.owed).toFixed(2)} SGD</Typography>}
                </Grid> */}
            </Grid>
            <Grid item xs={12}>
                <Typography>
                    Selected Chart: {selectedChart}, Selected Category: {selectedCategory}
                </Typography>
            </Grid>
            <Grid item xs={12}
                sx={{
                    mt: 2,
                    maxHeight: "400px",
                    overflowY: 'auto',
                    p: 2
                }}
            >
                {data.map((item, index) => (
                    <Card key={index} sx={{ mt: 1, mb: 2, width: "100%" }}>
                        <CardHeader
                            avatar={
                                <Avatar>
                                    {categoryToIconMap[item.category as keyof typeof categoryToIconMap]}
                                </Avatar>
                            }
                            title={`${item.description}: ${item.currency} ${item.amount}`}
                            subheader={`[${item.payment}] Paid by: ${item.paidBy} on ${convertTimestampToDate(item.createdAt).toLocaleString("en-GB")}`}
                            action={
                                item.description !== "First Test [Cannot be deleted]" ?
                                    <IconButton
                                        aria-label="delete"
                                        onClick={() => handleClickOpen(item.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton> : null
                            }
                        />
                    </Card>
                ))}
            </Grid>
        </Grid>
        {/* Deletion Dialog */}
        <Dialog
            open={dialogOpen}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this item?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="warning">
                    Cancel
                </Button>
                <Button onClick={handleDelete} color="primary" autoFocus>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    </Container>
};

export default HomePage;