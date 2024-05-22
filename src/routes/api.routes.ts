import express, { Router } from 'express';
import {
    createDatatableHandler,
    createStoreHandler,
    getStoreHandler,
} from '../controllers/api.controllers';

const router: Router = express.Router();

router.get('/store/:storeId', getStoreHandler);
router.post('/create-datatable', createDatatableHandler);
router.post('/create-store', createStoreHandler);

export { router as threekitRoutes };
