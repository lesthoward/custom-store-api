import express, { Router } from 'express';
import {
    createDatatableHandler,
    createStoreHandler,
    deleteStoreHandler,
    getStoreHandler,
} from '../controllers/stores.controllers';
import {
    deleteConfigurationHandler,
    getConfigurationById,
    getCustomerConfigHandler,
    saveCustomerConfigHandler,
} from '../controllers/datatables.controllers';

const router: Router = express.Router();

router.get('/store/:storeId', getStoreHandler);
router.post('/datatable', createDatatableHandler);
router.post('/store', createStoreHandler);
router.delete('/store', deleteStoreHandler);
router.post('/customer_configurations', saveCustomerConfigHandler);
router.get('/customer_configurations', getCustomerConfigHandler);
router.get('/configuration', getConfigurationById);
router.delete('/customer_configurations', deleteConfigurationHandler);

export { router as threekitRoutes };
