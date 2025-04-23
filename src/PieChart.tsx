import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Grid } from '@mui/material';

interface Summary {
  spent: number;
  owed: number;
  categorySpent: {
    [category: string]: number;
  };
}

interface Props {
  summary: { [key: string]: Summary };
}

const PieChart: React.FC<Props> = React.memo(({ summary }) => {
  const getCategoryData = (user: string) => {
    return Object.entries(summary[user].categorySpent).map(
      ([category, amount]) => ({
        name: category,
        value: amount.toFixed(2),
      })
    );
  };

  const dsData = getCategoryData('DS');
  const ktData = getCategoryData('KT');

  const commonOptions = {
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        label: {
          color: 'white', // Set the label color to white
        },
        emphasis: {
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
        },
      },
    ],
  };

  const dsOption = {
    ...commonOptions,
    title: {
      text: `DS Total Spend: ${summary.DS.spent.toFixed(2)} SGD`,
      left: 'center',
    },
    series: [
      {
        ...commonOptions.series[0],
        name: 'Spend by Category',
        data: dsData,
      },
    ],
  };

  const ktOption = {
    ...commonOptions,
    title: {
      text: `KT Total Spend: ${summary.KT.spent.toFixed(2)} SGD`,
      left: 'center',
    },
    series: [
      {
        ...commonOptions.series[0],
        name: 'Spend by Category',
        data: ktData,
      },
    ],
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <ReactECharts
          option={dsOption}
          style={{ width: '100%', height: '400px' }}
        />
      </Grid>
      <Grid item xs={12}>
        <ReactECharts
          option={ktOption}
          style={{ width: '100%', height: '400px' }}
        />
      </Grid>
    </Grid>
  );
});

export default PieChart;
