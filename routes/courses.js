const Joi = require("joi");
const express = require('express');

const router = express.Router();

let courses = [
  {id: 1, name: 'Course 1'},
  {id: 2, name: 'Course 2'},
  {id: 3, name: 'Course 3'},
];

router.get(
  '/',
  (request, response) => {
    response.send(courses);
  }
);

router.get(
  '/:id',
  (request, response) => {
    const course =
      courses.find(course => course.id === parseInt(request.params.id));
    if (!course) return response.status(404).json({error: 'Course not found.'});
    response.send(course);
  }
);

router.post(
  '/',
  (request, response) => {
    const {error, value} = validateCourse(request.body);
    let errors = {errors: []};
    if (error) {
      for (let i = 0; i < error.details.length; i++) {
        errors.errors.push(error.details[i].message);
      }
      return response.status(400).send(errors);
    }
    
    const course = {id: courses.length + 1, ...value};
    courses.push(course);
    response.send(course).status(201);
  }
);

router.put(
  '/',
  (request, response) => {
    const course =
      courses.find(course => course.id === parseInt(request.params.id));
    if (!course) return response.status(404).json({error: 'Course not found.'})
    
    const validation = validateCourse(request.body);
    let errors = {errors: []};
    if (validation.error) {
      for (let i = 0; i < validation.error.details.length; i++) {
        errors.errors.push(validation.error.details[i].message);
      }
      return response.status(400).send(errors);
    }
    
    Object.assign(course, {...course, ...validation.value});
    response.send(course);
  }
);

router.delete(
  '/:id',
  (request, response) => {
    const course =
      courses.find(course => course.id === parseInt(request.params.id));
    if (!course) return response.status(404).json({error: 'Course not found.'});
    
    const index = courses.indexOf(course);
    courses.splice(index, 1);
    
    response.json(course);
  }
);

function validateCourse(course) {
  const schema = Joi.object({
    name: Joi.string().lowercase().min(3).required()
      .options({convert: false, abortEarly: false})
      .messages({
        'string.empty': `Name should not be empty.`,
        'string.min': `Name should be at least {#limit} characters long.`,
        'string.lowercase': `All letters in the name should be in lowercase.`,
        'any.required': `Name is required.`
      })
  });
  return schema.validate(course);
}

module.exports = router;