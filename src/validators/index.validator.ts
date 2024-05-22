import Joi from 'joi';
import { CreateDatatableTypes } from '../controllers/api.controllers';

const validCreateDatatableTypes: CreateDatatableTypes[] = [
    'save_customer_configurations',
];
export const createDatatableSchema = Joi.object({
    storeId: Joi.string().required().max(120),
    type: Joi.string()
        .valid(...validCreateDatatableTypes)
        .required(),
});

export const updateDatatableSchema = Joi.object({
    storeId: Joi.string().required().max(120),
    storeName: Joi.string().required().max(120),
});

export const getStoreSchema = Joi.object({
    storeId: Joi.string().required().max(120),
});
