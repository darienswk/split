import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Grid,
  Typography,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Button,
  Card,
  CardHeader,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import React, { useEffect, useState, useMemo } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import Dudu from './dudu.jpg';
import Bubu from './bubu.jpg';
import PieChart from './PieChart';
import { API_URL } from './constants';
import {
  CURRENCIES,
  Item,
  NAMES,
  RADIO_OPTIONS,
  Summary,
  categoryToIconMap,
} from './constansts';
import EditExpenseDialog from './EditExpenseDialog';
import { conversion } from './conversion';

const convertTimestampToDate = (timestamp: {
  seconds: number;
  nanoseconds: number;
}): Date => {
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
};

const HomePage: React.FC = () => {
  const { id } = useParams();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [data, setData] = useState<null | Item[]>(null);
  const [paidBy, setPaidby] = useState('');
  const [currency, setCurreny] = useState(CURRENCIES[0]);
  const [amount, setAmount] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [payment, setPayment] = useState(RADIO_OPTIONS[0]);
  const [category, setCategory] = useState('General');
  const [refetchToggle, setRefetchToggle] = useState(false);
  const [summary, setSummary] = useState<{ [key: string]: Summary }>({
    DS: { spent: 0, owed: 0, categorySpent: {} },
    KT: { spent: 0, owed: 0, categorySpent: {} },
  });
  const [conversionRates, setConversionRates] = useState<{
    [currency: string]: number;
  } | null>(null);

  const handleEditOpen = (item: Item) => {
    setEditItem(item);
    setEditDialogOpen(true);
  };

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
  };

  const onCurrencyChange = (event: SelectChangeEvent): void => {
    setCurreny(event.target.value as string);
  };

  const handleChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value as string);
  };

  const onAmountChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void => {
    setAmount(Number(event.target.value));
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void => {
    setDescription(event.target.value);
  };

  const handlePaymentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setPayment((event.target as HTMLInputElement).value);
  };

  const onEditSubmit = (): void => {
    setRefetchToggle(toggle => !toggle);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    // Add form submission logic here
    const newItem = {
      paidBy,
      currency,
      amount: amount ?? 0,
      description,
      payment,
      category,
      trip_id: id,
    };

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
    if (data === null) {
      return;
    }

    const EXCHANGE_RATE = conversionRates?.[currency] ?? 1;
    const calculateSummary = () => {
      const summary: { [key: string]: Summary } = {
        DS: { spent: 0, owed: 0, categorySpent: {} },
        KT: { spent: 0, owed: 0, categorySpent: {} },
      };

      data.forEach(item => {
        const { paidBy, amount, payment, currency, category } = item;
        const cost = currency === 'SGD' ? amount : amount / EXCHANGE_RATE;

        if (payment === 'Tracking') {
          summary[paidBy].spent += cost;
          summary[paidBy].categorySpent[category] =
            (summary[paidBy].categorySpent[category] || 0) + cost;
        } else if (payment === 'Split equally') {
          const halfCost = cost / 2;

          summary['DS'].spent += halfCost;
          summary['DS'].categorySpent[category] =
            (summary['DS'].categorySpent[category] || 0) + halfCost;

          summary['KT'].spent += halfCost;
          summary['KT'].categorySpent[category] =
            (summary['KT'].categorySpent[category] || 0) + halfCost;

          const otherUser = paidBy === 'DS' ? 'KT' : 'DS';
          summary[otherUser].owed += halfCost;
        } else if (payment === 'Owed full amount') {
          const otherUser = paidBy === 'DS' ? 'KT' : 'DS';

          summary[otherUser].owed += cost;
          summary[otherUser].spent += cost;
          summary[otherUser].categorySpent[category] =
            (summary[otherUser].categorySpent[category] || 0) + cost;
        }
      });

      setSummary(summary);
    };

    calculateSummary();
  }, [data, conversionRates, currency]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/payments/${id}`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchConversionRates = async () => {
      try {
        const response = await axios.get(`${API_URL}/exchange-rates`);
        setConversionRates(response.data);
      } catch (error) {
        setConversionRates(conversion);
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    fetchConversionRates();
  }, [id, refetchToggle, conversionRates]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/payments/${itemToDelete}`);
      // fetch again
      const response = await axios.get(`${API_URL}/payments/${id}`);
      setData(response.data);
    } catch (error) {
      console.error('Error deleting/fetching document: ', error);
    }
    handleClose();
  };

  const pieChart = useMemo(() => <PieChart summary={summary} />, [summary]);

  if (data === null) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
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
                  renderValue={selected => (
                    <Chip
                      key={selected}
                      label={selected}
                      avatar={
                        <Avatar alt="" src={selected === 'DS' ? Dudu : Bubu} />
                      }
                    />
                  )}
                >
                  {NAMES.map(name => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth>
                <InputLabel id="currency">Currency</InputLabel>
                <Select
                  value={currency}
                  label="Currency"
                  onChange={onCurrencyChange}
                  required
                >
                  {CURRENCIES.map(name => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={9}>
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
            <Grid item xs={12}>
              <FormControl>
                <FormLabel id="repayment">Payment</FormLabel>
                <RadioGroup
                  value={payment}
                  name="repayment"
                  onChange={handlePaymentChange}
                >
                  {RADIO_OPTIONS.map(option => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  value={category}
                  onChange={handleChange}
                  label="Category"
                  renderValue={selected => (
                    <Box display="flex" alignItems="center">
                      {
                        categoryToIconMap[
                          selected as keyof typeof categoryToIconMap
                        ]
                      }
                      <span style={{ marginLeft: 8 }}>
                        {selected as string}
                      </span>
                    </Box>
                  )}
                >
                  {Object.entries(categoryToIconMap).map(([key, Icon]) => (
                    <MenuItem key={key} value={key}>
                      <ListItemIcon>{Icon}</ListItemIcon>
                      <ListItemText primary={key} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
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
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
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
          <Grid item xs={12}>
            {summary.DS.owed > summary.KT.owed ? (
              <Typography>
                DS owes KT: {(summary.DS.owed - summary.KT.owed).toFixed(2)} SGD
              </Typography>
            ) : (
              <Typography>
                KT owes DS: {(summary.KT.owed - summary.DS.owed).toFixed(2)} SGD
              </Typography>
            )}
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            mt: 2,
            maxHeight: '400px',
            overflowY: 'auto',
            p: 2,
          }}
        >
          {data.map((item, index) => (
            <Card key={index} sx={{ mt: 1, mb: 2, width: '100%' }}>
              <CardHeader
                avatar={
                  <Avatar>
                    {
                      categoryToIconMap[
                        item.category as keyof typeof categoryToIconMap
                      ]
                    }
                  </Avatar>
                }
                title={`${item.description}: ${item.currency} ${item.amount}`}
                subheader={`[${item.payment}] Paid by: ${item.paidBy} on ${convertTimestampToDate(item.createdAt).toLocaleString('en-GB')}`}
                action={
                  item.description !== 'First Test [Cannot be deleted]' ? (
                    <>
                      <IconButton
                        aria-label="edit"
                        onClick={() => handleEditOpen(item)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleClickOpen(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  ) : null
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
        <DialogTitle id="alert-dialog-title">{'Confirm Deletion'}</DialogTitle>
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
      {editItem && (
        <EditExpenseDialog
          onSubmit={onEditSubmit}
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          item={editItem}
        />
      )}
    </Container>
  );
};

export default HomePage;
