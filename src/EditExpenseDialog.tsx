import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Avatar,
  MenuItem,
  TextField,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  DialogActions,
  Button,
} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import {
  categoryToIconMap,
  CURRENCIES,
  Item,
  NAMES,
  RADIO_OPTIONS,
} from './constansts';
import Dudu from './dudu.jpg';
import Bubu from './bubu.jpg';
import { API_URL } from './constants';

interface EditExpenseDialogProps {
  item: Item;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: () => void;
}

const EditExpenseDialog: React.FC<EditExpenseDialogProps> = ({
  item,
  open,
  setOpen,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Item>(item);

  const handleChange = (
    field: keyof Item,
    value: string | number | { seconds: number; nanoseconds: number }
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${API_URL}/update-item`, formData);
      setOpen(false);
      onSubmit();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle>Edit Item</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel id="paidBy-label">Paid by</InputLabel>
          <Select
            labelId="paidBy-label"
            value={formData.paidBy}
            onChange={e => handleChange('paidBy', e.target.value)}
            renderValue={selected => (
              <Chip
                label={selected}
                avatar={<Avatar alt="" src={selected === 'DS' ? Dudu : Bubu} />}
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

        <FormControl fullWidth margin="normal">
          <InputLabel id="currency-label">Currency</InputLabel>
          <Select
            labelId="currency-label"
            value={formData.currency}
            onChange={e => handleChange('currency', e.target.value)}
          >
            {CURRENCIES.map(currency => (
              <MenuItem key={currency} value={currency}>
                {currency}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <TextField
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={e => handleChange('amount', Number(e.target.value))}
          />
        </FormControl>

        <FormControl fullWidth margin="normal">
          <FormLabel id="payment-label">Payment</FormLabel>
          <RadioGroup
            value={formData.payment}
            onChange={e => handleChange('payment', e.target.value)}
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

        <FormControl fullWidth margin="normal">
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            value={formData.category}
            onChange={e => handleChange('category', e.target.value)}
            renderValue={selected => (
              <span>
                {categoryToIconMap[selected as keyof typeof categoryToIconMap]}{' '}
                {selected}
              </span>
            )}
          >
            {Object.keys(categoryToIconMap).map(category => (
              <MenuItem key={category} value={category}>
                {categoryToIconMap[category as keyof typeof categoryToIconMap]}{' '}
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <TextField
            label="Description"
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="warning">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditExpenseDialog;
