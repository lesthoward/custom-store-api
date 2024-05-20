import Joi from 'joi';
import { CreateDatatableTypes } from '../controllers/datatable.controllers';

const validCreateDatatableTypes: CreateDatatableTypes[] = [
    'save_customer_configurations',
];
export const createDatatableSchema = Joi.object({
    unique_id: Joi.string().required().max(120),
    type: Joi.string()
        .valid(...validCreateDatatableTypes)
        .required(),
});
