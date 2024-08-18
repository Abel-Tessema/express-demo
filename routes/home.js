const express = require('express');

const router = express.Router();

router.get(
  '/',
  (request, response) => {
    response.render(
      'index',
      {title: 'My Express App', message: 'Yahallo!'}
    );
  }
);

module.exports = router;