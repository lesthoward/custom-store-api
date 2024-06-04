import Joi from 'joi';
import { CreateDatatableTypes } from '../controllers/stores.controllers';

const validCreateDatatableTypes: CreateDatatableTypes[] = [
    'save_customer_configurations',
];

export const saveCustomerConfigSchema = Joi.object({
    storeId: Joi.string().required().max(120),
    picture: Joi.string(),
    id: Joi.string().required().max(120),
    name: Joi.string().required().max(120),
    data: Joi.required(),
    customerId: Joi.string().required().max(120),
});

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

export const deleteStoreSchema = Joi.object({
    storeId: Joi.string().required().max(120),
});

export const getCustomerConfigSchema = Joi.object({
    storeId: Joi.string().required().max(120),
});
