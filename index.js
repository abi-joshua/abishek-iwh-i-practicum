const express = require('express');
const axios = require('axios');
const app = express();
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS || '';

// ROUTE 1 - Homepage: fetch custom object (Pets) data and render
app.get('/', async (req, res) => {
  const petsUrl = 'https://api.hubapi.com/crm/v3/objects/pets?properties=pet_name,pet_type';
  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    'Content-Type': 'application/json'
  };
  try {
    const resp = await axios.get(petsUrl, { headers });
    const data = resp.data.results;
    res.render('homepage', { title: 'Pets | HubSpot Custom Objects', data });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching pets data');
  }
});

// ROUTE 2 - GET form to create or update a Pet
app.get('/update-pet', async (req, res) => {
  const id = req.query.id;
  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    'Content-Type': 'application/json'
  };
  try {
    let petData = null;
    if (id) {
      const petUrl = `https://api.hubapi.com/crm/v3/objects/pets/${id}?properties=pet_name,pet_type`;
      const resp = await axios.get(petUrl, { headers });
      petData = resp.data;
    }
    res.render('updates', { title: 'Update Pet | HubSpot Custom Objects', petData });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading update form');
  }
});

// ROUTE 3 - POST form to create or update Pet data, then redirect to homepage
app.post('/update-pet', async (req, res) => {
  const { pet_name, pet_type, id } = req.body;
  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    'Content-Type': 'application/json'
  };
  const petData = {
    properties: {
      pet_name,
      pet_type
    }
  };
  try {
    if (id) {
      const updateUrl = `https://api.hubapi.com/crm/v3/objects/pets/${id}`;
      await axios.patch(updateUrl, petData, { headers });
    } else {
      const createUrl = 'https://api.hubapi.com/crm/v3/objects/pets';
      await axios.post(createUrl, petData, { headers });
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving pet data');
  }
});

// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));
