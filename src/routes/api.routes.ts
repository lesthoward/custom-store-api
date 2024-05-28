import express, { Router } from 'express';
import {
    createDatatableHandler,
    createStoreHandler,
    deleteStoreHandler,
    getStoreHandler,
} from '../controllers/api.controllers';

const router: Router = express.Router();

router.get('/store/:storeId', getStoreHandler);
router.post('/datatable', createDatatableHandler);
router.post('/store', createStoreHandler);
router.delete('/store', deleteStoreHandler);

export { router as threekitRoutes };
