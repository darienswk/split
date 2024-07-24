import axios from 'axios';
import { Grid, Typography, Container, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, FormControlLabel, FormLabel, Radio, RadioGroup, Button, Card, CardHeader, IconButton, Chip, Avatar } from "@mui/material";
import React, { useEffect, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import Dudu from "./dudu.jpg";
import Bubu from "./bubu.jpg";

const API_URL = "https://split-server-t63h.onrender.com";

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
}

interface Summary {
    spent: number;
    owed: number;
}


const HomePage: React.FC = () => {
    const [data, setData] = useState<Item[]>([]);
    const [paidBy, setPaidby] = useState("");
    const [currency, setCurreny] = useState(CURRENCIES[0]);
    const [amount, setAmount] = useState<number | null>(null);
    const [description, setDescription] = useState("");
    const [payment, setPayment] = useState(RADIO_OPTIONS[0]);
    const [summary, setSummary] = useState<{ [key: string]: Summary }>({
        DS: { spent: 0, owed: 0 },
        KT: { spent: 0, owed: 0 },
    });


    const handlePaidByChange = (event: SelectChangeEvent): void => {
        setPaidby(event.target.value as string);
    }

    const onCurrencyChange = (event: SelectChangeEvent): void => {
        setCurreny(event.target.value as string);
    }

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
        const newItem = { paidBy, currency, amount: amount ?? 0, description, payment };

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
        const calculateSummary = () => {
            const summary: { [key: string]: Summary } = {
                DS: { spent: 0, owed: 0 },
                KT: { spent: 0, owed: 0 },
            };

            data.forEach(item => {
                const { paidBy, amount, payment, currency } = item;
                const cost = currency === "SGD" ? amount : amount / 3.45;

                if (payment === 'Tracking') {
                    summary[paidBy].spent += cost;
                } else if (payment === 'Split equally') {
                    // if split both spent same amount
                    summary["DS"].spent += cost / 2;
                    summary["KT"].spent += cost / 2;
                    const otherUser = paidBy === 'DS' ? 'KT' : 'DS';
                    summary[otherUser].owed += cost / 2;
                } else if (payment === 'Owed full amount') {
                    // other user owes and spends the cost
                    const otherUser = paidBy === 'DS' ? 'KT' : 'DS';
                    summary[otherUser].owed += cost;
                    summary[otherUser].spent += cost;
                }
            });

            setSummary(summary);
        };

        calculateSummary();
    }, [data]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_URL}/payments`)
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/payments/${id}`);
            // fetch again
            const response = await axios.get(`${API_URL}/payments`)
            setData(response.data);
        } catch (error) {
            console.error('Error deleting/fetching document: ', error);
        }
    };

    if (data.length === 0) {
        return <p>Loading...</p>;
    }


    return <Container>
        <Grid container spacing={3}>
            <Grid item xs={12} pl={2}>
                <Typography>This app is in beta</Typography>
            </Grid>
            <form onSubmit={handleSubmit}>
                <Grid item xs={12} container spacing={2} mt={2} pl={2}>
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
            <Grid item xs={12}>
                <Typography variant="h6">Summary</Typography>
                <Typography>DS spent: {summary.DS.spent.toFixed(2)} SGD</Typography>
                <Typography>DS owes: {summary.DS.owed.toFixed(2)} SGD</Typography>
                <Typography>KT spent: {summary.KT.spent.toFixed(2)} SGD</Typography>
                <Typography>KT owes: {summary.KT.owed.toFixed(2)} SGD</Typography>
                <br />
                {summary.DS.owed > summary.KT.owed ? <Typography>DS owes KT: {(summary.DS.owed - summary.KT.owed).toFixed(2)} SGD</Typography> : <Typography>KT owes DS: {(summary.KT.owed - summary.DS.owed).toFixed(2)} SGD</Typography>
                }
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
                            title={`${item.description}: ${item.currency} ${item.amount}`}
                            subheader={`[${item.payment}] Paid by: ${item.paidBy} on ${convertTimestampToDate(item.createdAt).toLocaleString("en-GB")}`}
                            action={
                                item.description !== "First Test [Cannot be deleted]" ?
                                    <IconButton
                                        aria-label="delete"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton> : null
                            }
                        />
                    </Card>
                ))}
            </Grid>
        </Grid>
    </Container>
};

export default HomePage;