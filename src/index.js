/**
 * Created by Andy on 8/25/2017.
 */

import express from 'express';
import userModule from 'atp-user';

const app = express();

app.get('/', (req, res) => {
    res.send('ATP REST server');
});

app.use('/users', userModule);

app.listen(3000,  () => {
    console.log('REST server listening on port 3000!');
});
