const express = require('express');
const Joi = require('joi');
const logger = require('logger');
const authenticator = require('authenticator');

const app = express();

app.use(express.json());
app.use(logger);
app.use(authenticator);

let courses = [
    {id: 1, name: 'Course 1'},
    {id: 2, name: 'Course 2'},
    {id: 3, name: 'Course 3'},
];

app.get(
    '/',
    (request, response) => {
        response.send('<h1>index.js</h1>');
    }
);

app.get(
    '/api/courses',
    (request, response) => {
        response.send(courses);
    }
);

app.get(
    '/api/posts/:year/:month',
    (request, response) => {
        response.send(request.query);
    }
);

app.get(
    '/api/courses/:id',
    (request, response) => {
        const course =
            courses.find(course => course.id === parseInt(request.params.id));
        if (!course) return response.status(404).json({error: 'Course not found.'});
        response.send(course);
    }
);

app.post(
    '/api/courses',
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

app.put(
    '/api/courses/:id',
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

        // course.name = request.body.name;
        // course = {...course, ...validation.value}; /* This reassigns the local variable 'course'. It doesn't modify
        //                                               the original array element. It's reassigning the reference to
        //                                               a new reference, thus, the original reference is lost.
        //                                             */
        Object.assign(course, {...course, ...validation.value});
        response.send(course);
    }
);

app.delete(
    '/api/courses/:id',
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

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port ${port}...`));