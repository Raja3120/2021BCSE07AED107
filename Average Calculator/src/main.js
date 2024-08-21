const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;
const windowSize = 10;
const numberStorage = {};

app.get('/numbers/:numberId', async (req, res) => {
  const numberId = req.params.numberId;
  const apiUrl = getApiUrlForNumberId(numberId);
  const numbersFromApi = await getNumbersFromApi(apiUrl);
  const previousWindowState = getPreviousWindowState(numberId);
  const currentWindowState = updateWindowState(numbersFromApi, numberId);
  const average = calculateAverage(currentWindowState);

  res.json({
    previousWindowState,
    currentWindowState,
    numbersFromApi,
    average: average.toFixed(2),
  });
});

const getApiUrlForNumberId = (numberId) => {
  switch (numberId) {
    case 'p':
      return 'http://20.244.56.144/test/primes';
    case 'T':
      return 'http://20.244.56.144/test/fibo';
    case 'e':
      return 'http://20.244.56.144/test/even';
    case 'r':
      return 'http://20.244.56.144/test/rand';
    default:
      throw new Error(`Invalid numberId: ${numberId}`);
  }
};

const getNumbersFromApi = async (apiUrl) => {
  try {
    const response = await axios.get(apiUrl, { timeout: 500 });
    return response.data.numbers;
  } catch (error) {
    console.error(`Error fetching numbers from API: ${error}`);
    return [];
  }
};

const getPreviousWindowState = (numberId) => {
  return numberStorage[numberId] || [];
};

const updateWindowState = (numbers, numberId) => {
  const currentState = getPreviousWindowState(numberId);
  const newState = [...currentState, ...numbers];
  if (newState.length > windowSize) {
    newState.shift();
  }
  numberStorage[numberId] = newState;
  return newState;
};

const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((acc, num) => acc + num, 0) / numbers.length;
};

app.listen(port, () => {
  console.log(`Average Calculator running port ${port}`);
});